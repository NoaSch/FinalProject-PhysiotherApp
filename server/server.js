let express	=	require("express");
let multer	=	require('multer');
const fs = require('fs');
let path = require('path');
let Promise = require('promise');
let MediaConverter = require("html5-media-converter");
let app=express();
let Mp4Convert = require('mp4-convert');
let ffmpeg = require('ffmpeg');
let Connection = require('tedious').Connection;
let Request = require('tedious').Request;
let squel = require("squel");
let sql = require('./DButils');
let moment = require('moment');
let cors = require('cors');
let bodyParser = require('body-parser');
let passwordValidator = require('password-validator');
let nodemailer = require('nodemailer');
let crypto = require('crypto');

var pushpad = require('pushpad');

var project = new pushpad.Pushpad({
    authToken: '9ab7ab5e151578b7dd49a76550957a3f',
    projectId: 5527
});
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
//var path2;
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.listen(4000,function(){
    console.log("Working on port 4000");
});


let storage	=	multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        //callback(null, file.fieldname + '-' + Date.now()+"."+path.extname(file.originalname));
        callback(null,Date.now() + file.originalname);
    }
});

let upload = multer({ storage : storage}).single('file');
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

//generates random string of characters i.e salt
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,length);   /** return required number of characters */
};

//hash password with sha256.
var sha256 = function(password, salt){
    var hash = crypto.createHmac('sha256', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

//return hashed password
function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha256(userpassword, salt);
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);
};


//add new user and password
function insertToUsers(username,password,isPhysio) {

    return new Promise(function (resolve, reject) {
        console.log("enter create program");
        let salt = genRandomString(16);
        /** Gives us salt of length 16 */
        let passwordData = sha256(password, salt);
        let newPass = passwordData.passwordHash;
        let newsalt = passwordData.salt;
        console.log('Passwordhash = ' + newPass);
        console.log('nSalt = ' + newsalt);
        let query = (
            squel.insert()
                .into("[dbo].[users]")
                .set("[username]", username)
                .set("[password]", newPass)
                .set("[salt]", newsalt)
                .set("[isPhysio]", isPhysio)

                .toString()
        );
        console.log(query);
        sql.Insert(query).then(function (ans) {
            //res.send(ans);
            resolve(ans);
        }).catch(function (err) {
            console.log(err);
            reject(err);
        })
    });
};


//check if the user's password is correct
app.post('/api/validate', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    let query = (
        squel.select()
            .from("users")
            .where("username = ?", username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length == 0) {

                // var pathes = ans[0].path.toString();
                res.json({err: "שם משתמש או סיסמא לא נכונים"})
            }
            else {
                            let dbSalt = ans[0].salt;
                            console.log(dbSalt);

                            let passwordData = sha256(password, dbSalt);
                            if (passwordData.passwordHash == ans[0].password) {
                                //res.json({success: "הצלחה"});
                                if (ans[0].isPhysio) {
                                    console.log("physio");
                                    let query2 = (
                                        squel.select()
                                            .from("physiotherapists")
                                            .where("username = ?", username)
                                            .toString()
                                    );
                                    sql.Select(query2)
                                        .then(function (ansP) {
                                            ansP[0].isPhysio = ans[0].isPhysio;
                                            insertToLog(username).then(function(ans3)
                                            {
                                                res.send(ansP);

                                            }).catch(function (err1) {
                                                console.log(err1);
                                                res.json({err: "שגיאה"})
                                            }).catch(function (err1) {
                                                console.log(err1);
                                                res.json({err: "שם משתמש או סיסמא לא נכונים"})
                                            })
                                        });

                                }
                                else if (username == 'admin') {

                                    insertToLog(username).then(function(ans3) {

                                        res.send(ans);
                                    }).catch(function (err1) {
                                        console.log(err1);
                                        res.json({err: "שגיאה"})})

                                }
                                else {
                                    let query3 = (
                                        squel.select()
                                            .from("patients")
                                            .where("username = ?", username)
                                            .toString()
                                    );
                                    sql.Select(query3)
                                        .then(function (ansP2) {
                                            ansP2[0].isPhysio = ans[0].isPhysio;
                                            insertToLog(username).then(function (ans3) {

                                                res.send(ansP2);
                                            }).catch(function (err3) {
                                                res.json({err: "שגיאה"})
                                            })
                                        }).catch(function (err2) {
                                        console.log(err2);
                                        res.json({err: "שם משתמש או סיסמא לא נכונים"})
                                    });

                                }
                            }
                            else {
                                res.json({err: "שם משתמש או סיסמא לא נכונים"});
                            }

                        }

                    }).catch(function (reason) {
                    console.log(reason);
                    res.json({err: "שם משתמש או סיסמא לא נכונים"});

                })

});

//radd new program to patient
app.post('/api/createPrgram', function (req, res) {
    console.log("enter create program");
    let _physioUsername = req.body.physio;
    let _patientUsername = req.body.patient;
    let _date = req.body.date;
    let _progTitle = req.body.title;
    console.log(_progTitle);
    let query = (
        squel.insert()
            .into("[dbo].[designated_programs]")
            .set("[prog_title]",_progTitle)
            .set("[patient_username]",_patientUsername)
            .set("[physiotherapist_username]",_physioUsername)
            .set("[date]",_date)
            .toString()
    );
    console.log(query);
    sql.Insert(query).then(function (ans){
        //res.send(ans);
        res.send(ans);
    }).catch(function (err) {
        console.log("Error in inset: " + err);
        res.send(err);}
    )
});

//add new exercise with video to the DB
app.post('/upload', function(req, res) {
    console.log("enter to upload");
    console.log("in upload");

    upload(req, res, function (err) {
        let pat_username = null;
        if (err) {
            console.log(err);
            res.json({error_code: 1, err_desc: err});
            return;
        }
        let query3 = (
            squel.select()
                .from("media_bank")
                .where("title = ?", req.body.videoName)
                .toString()
        );
        sql.Select(query3).then(function (ans) {
            if (ans.length != 0) {
                res.json({error_code: 1, err_desc: "name exist"})

            }
            else {
                let query4 = (
                    squel.select()
                        .field("patient_username")
                        .from("designated_programs")
                        .where("prog_id = ?", req.body.prog_id)
                        .toString()
                );
                sql.Select(query4).then(function (ans) {
                    pat_username = ans[0].pat_username;
                    if (req.file.mimetype == "video/quicktime") {
                        console.log(req.body.time);

                        let newPath = changeToMP4Extention(req.file.path);
                        convertTomp4(req.file.path, newPath)
                        // insertVideoToDB(new_Path,prog_id,exetitle,tInWeek,nSets,nRepeats,dur,breakBet)
                            .then(insertVideoToDB(false, newPath, req.body.prog_id, req.body.exeTitle, req.body.onTime, req.body.timeInWeek, req.body.timeInDay, req.body.nSets, req.body.nRepeats, req.body.setDuration, req.body.setDurationUnits, req.body.break, req.body.breakUnits, req.body.description, req.body.tags, req.body.videoName))
                            .then(function (ans) {
                               // let content = "הוקצה לך תרגיל חדש";
                               // sendNotification(pat_username,content);
                                res.json({error_code: 0, err_desc: null})
                            })
                            .catch(function (err) {
                                res.json({error_code: 1, err_desc: err})
                            })
                    }
                    else {
                        console.log(req.body.timeInWeek);
                        //insertVideoToDB(req.file.path)
                        insertVideoToDB(false, req.file.path, req.body.prog_id, req.body.exeTitle, req.body.onTime, req.body.timeInWeek, req.body.timeInDay, req.body.nSets, req.body.nRepeats, req.body.setDuration, req.body.setDurationUnits, req.body.break, req.body.breakUnits, req.body.description, req.body.tags, req.body.videoName)
                            .then(function (ans) {
                                //let content = "הוקצה לך תרגיל חדש";
                                //sendNotification(pat_username,content);
                                res.json({error_code: 0, err_desc: null})
                            }).catch(function (err) {
                            res.json({error_code: 1, err_desc: err})
                        });
                    }
                }).catch(function (err) {
                    res.json({error_code: 1, err_desc: err})
                })
            }
            //res.json({error_code:0,err_desc:null});
//        insertVideoToDB(req.file.path);
        }).catch(function (err) {
            res.json({error_code: 1, err_desc: err})
        })
    })


});

//add new exercise without a video
app.post('/uploadNoVideo', function(req, res2) {
    console.log("enter to uploadNoVideo");
    insertVideoToDB(req.body.bank,req.body.path,req.body.prog_id,req.body.exeTitle,req.body.onTime,req.body.timeInWeek,req.body.timeInDay,req.body.nSets,req.body.nRepeats,req.body.setDuration,req.body.setDurationUnits,req.body.break,req.body.breakUnits,req.body.description,null,null).then(function(ans){
       // let content = "הוקצה לך תרגיל חדש";
        //sendNotification(pat_username,content);
        res2.json({error_code:0,err_desc:null})
    }).catch(function(err){
        res2.send(err)
    })
});

//updates exerccise's details
app.post('/updateEXE', function(req, res) {
    let onTime = 0;
    let exe_id = req.body.exe_id;
    if (req.body.onTime == true) {
        onTime = 1;
    }
    let exe_title = req.body.exe_title;
    let timeInWeek = req.body.timeInWeek;
    let timeInDay = req.body.timeInDay;
    let nSets = req.body.nSets;
    let nRepeats = req.body.nRepeats;
    let setDuration = req.body.setDuration;
    let setDurationUnits = req.body.setDurationUnits;
    let breakBet = req.body.break;
    let breakUnits = req.body.breakUnits;
    let description = req.body.description;
    let pat_name = null;
    let phy_name = null;
    let pat_username = null;
    let phy_username = null;
    let pat_mail = null;
    let content = null;
    let title = null;
    let date = moment().format('YYYY-MM-DD HH:mm:ss');
    if (typeof nRepeats === 'undefined' || !nRepeats || nRepeats == "null") {
        nRepeats = null;
    }
    if (typeof setDuration === 'undefined' || !setDuration || setDuration == "null") {
        setDuration = null;
    }
    if (typeof setDurationUnits === 'undefined' || !setDurationUnits || setDurationUnits == "null") {
        setDurationUnits = null;
    }
    if (typeof breakBet === 'undefined' || !breakBet || breakBet == 'null') {
        breakBet = null;
    }

    let query = (
        squel.update()
            .table("designated_exercises")
            .set("[onTime]", onTime)
            .set("[time_in_week]", timeInWeek)
            .set("[time_in_day]", timeInDay)
            .set("[num_sets]", nSets)
            .set("[num_repeats]", nRepeats)
            .set("[set_duration]", setDuration)
            .set("[set_duration_units]", setDurationUnits)
            .set("[break_between_sets]", breakBet)
            .set("[break_between_sets_units]", breakUnits)
            .set("[description]", description)
            .where("exe_id =?",exe_id)
            .toString()
    );
    console.log(query);
    sql.Update(query).then(function (ans){

        //let query = "select patient_username, physiotherapist_username from designated_programs where prog_id = (select prog_id from designated_exercises where exe_id =" + exe_id+")";
        let queryNames = (
            squel.select()
                .from("designated_programs")
                .field("patient_username")
                .field("physiotherapist_username")
                .where("prog_id = ?", squel.select().field('prog_id').from('designated_exercises').where("exe_id = ?",exe_id))
                .toString()
        );
        console.log(queryNames);
        sql.Select(queryNames).then(function (ans) {
                    pat_username = ans[0].patient_username;
                    phy_username = ans[0].physiotherapist_username;
                     content = "התרגיל " + exe_title + " עודכן במערכת פיזיותר";
                     sendNotification(pat_username,content);
                     //title = "תרגיל במערכת פיזיותר עודכן";
                     //genNextCorId().then(function (anscor){
        //InsertMessage(anscor,pat_username,phy_username,date,title,content,"update").then(function (ansIn){
                         //res.json({error_code: 0, err_desc: null})
                     //}).catch(function(err){
                    //res.json({error_code: 1, err_desc: err.desc})
                     //})
    }).catch(function(err){
                     res.json({error_code: 1, err_desc: err.desc})
    })}).catch(function(err){
                    res.json({error_code: 1, err_desc: err.desc})
            })
});

//upload new video to the bank
app.post('/uploadToBank', function(req, res) {
    console.log("enter to upload to bank");

    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        let query3 = (
            squel.select()
                .from("media_bank")
                .where("title = ?", req.body.title)
                .toString()
        );
        sql.Select(query3).then(function (ans) {
            if (ans.length != 0) {
                res.json({error_code: 1, err_desc: "name exist"})

            }
            else {
                if (req.file.mimetype == "video/quicktime") {

                    let newPath = changeToMP4Extention(req.file.path);
                    convertTomp4(req.file.path, newPath)
                    // insertVideoToDB(new_Path,prog_id,exetitle,tInWeek,nSets,nRepeats,dur,breakBet)
                        .then(insertToBankDB(newPath, req.body.title, req.body.tags))
                        .then(function (ans) {
                            //res.send("Done WithConvert!!!!")
                            res.json({error_code: 0, err_desc: null})
                        })
                        .catch(function (err) {
                            res.json({error_code: 1, err_desc: err})
                        })
                }
                else {
                    //insertVideoToDB(req.file.path)
                    insertToBankDB(req.file.path, req.body.title, req.body.tags)
                        .then(function (ans) {
                            res.json({error_code: 0, err_desc: null})
                        }).catch(function (err) {
                        res.json({error_code: 1, err_desc: err})
                    });
                }
            }
            //res.json({error_code:0,err_desc:null});
//        insertVideoToDB(req.file.path);
        }).catch(function (err) {
            res.json({error_code: 1, err_desc: err})
        })
    })


});

//insert new message to the DB
function InsertMessage(cor_id,to,from,date,title,content,type) {
    return new Promise(function(resolve,reject) {
        let _toName = "";
        let _fromName = "";
        getFullname(to).then(function (ansTo) {
            _toName = ansTo[0];
            getFullname(from)
                .then(function (ansFrom) {
                    _fromName = ansFrom[0];
                    console.log("ans2");
                    let query = (
                        squel.insert()
                            .into("[dbo].[messages]")
                            .set("[correspondence_id]", cor_id)
                            .set("[to_first_name]", _toName.first_name)
                            .set("[to_last_name]", _toName.last_name)
                            .set("[to_username]", to)
                            .set("[from_username]", from)
                            .set("[from_first_name]", _fromName.first_name)
                            .set("[from_last_name]", _fromName.last_name)
                            .set("[date]", date)
                            .set("[title]", title)
                            .set("[msg_content]", content)
                            .set("[type]", type)
                            .set("[was_read]", 0)

                            .toString()
                    );
                    console.log("query");
                    sql.Insert(query).then(function (ans) {
                        if(type == "new" || type == "rep" ||type == "update") {
                            let to_full = _fromName.first_name + " " + _fromName.last_name;
                            if(type != "update") {
                                title = "התקבלה הודעה במערכת פיזיותר מאת: " + to_full;
                                content = "נא היכנס למערכת על מנת לצפות בתוכן ההודעה";
                            }
                            //sendMailToUser(_toName.mail, title, content).then(function (ans2) {
                                //res.send(ans);
                                resolve(ans);

                           /* }).catch(function (err) {
                                console.log("Error in inset: " + err);
                                reject(err);
                            })*/
                        }

                        else {
                            resolve(ans);
                        }
                    }).catch(function (err) {
                        console.log("Error in inset: " + err);
                        reject(err);
                    })}).catch(function (err) {
                console.log("Error in inset: " + err);
                reject(err);
            })})})

};

//add new message to the DB
app.post('/api/sendMessage', function (req, res) {
    let _isNew = req.body.isNew;
    let _to = req.body.to;
    let _from = req.body.from;
    let _date = moment().format('YYYY-MM-DD HH:mm:ss');
    let _orig_cor_id = parseInt(req.body.cor_id);
    let _title = req.body.msgtitle;
    let _content = req.body.content;
    let notifi_content = "";
    let from_name = "";
    let new_cor_id="";
    getFullname(_from).then(function (ansFull) {
        from_name = "" + ansFull[0].first_name + " " + ansFull[0].last_name;
        if (_isNew == true) {
            genNextCorId().then(function (ans) {
                new_cor_id = ans;
                InsertMessage(new_cor_id, _to, _from, _date, _title, _content, "new").then(function (ans) {
                    notifi_content = "התקבלה הודעה חדשה מאת " + from_name;
                    sendNotification(_to, notifi_content);
                    //sendMailToUser(ansPhysio[0].mail,"התקבלה הודעה במערכת פיזיותר מאת: " + patient_name, "נא היכנס למערכת על מנת לצפות בתוכן ההודעה").then(function (ans2) {
                    res.send(ans);
                    /*}).catch(function (err) {
                     console.log("Error in inset: " + err);
                     res.send(err);
                     })*/

                }).catch(function (err) {
                    console.log("Error in inset: " + err);
                    res.send(err);
                })
            })
        }
        else {
            //getFullname(_from).then(function (ansFull){
            //from_name = ""+ ansFull[0].first_name + " " + ansFull[0].last_name;
            InsertMessage(_orig_cor_id, _to, _from, _date, _title, _content, "rep").then(function (ans) {
                notifi_content = "התקבלה הודעה חדשה מאת " + from_name;
                sendNotification(_to, notifi_content);
                res.send(ans)
            }).catch(function (err) {
                console.log("Error in inset: " + err);
                res.send(err);
            })
        }
    }).catch(function (err) {
        console.log("Error in inset: " + err);
        res.send(err);
    })
});

//get next free correspondence id
function genNextCorId() {
    return new Promise(function (resolve, reject) {
        let query = "select Max(correspondence_id) from dbo.messages";
        sql.Select(query)
            .then(function (ans) {
                if(ans[0][''] == null)
                {
                    resolve(1);
                }
                else {
                    console.log("old: " + ans[0]['']);
                    let new_cor_id = parseInt(ans[0][''], 10) + 1;
                    resolve(new_cor_id);
                }
            }).catch(function (err) {
            reject(err);
        })
    });
}


//store the patient's feedback
app.post('/api/setPatientFeedback', function (req, res) {
    let createDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let pat_username = req.body.patUsername;
    let exe = req.body.exe;
    let succ_Level = req.body.succLvl;
    let painLVvl = req.body.painLVvl;
    let nSucc = req.body.nSucc;
    let physio_username = null;
    let patient_name = null;

    if (typeof nSucc == 'undefined' || nSucc == "null" || nSucc == null) {
        nSucc = null;
    }
    //get the physiotherapist
    let query = (
        squel.select()
            .from("patients")
            .field("physiotherapist_username")
            .field("first_name")
            .field("last_name")
            .where("username = ?", pat_username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            patient_name = ""+ans[0].first_name +" " + ans[0].last_name;
            physio_username = ans[0].physiotherapist_username;
            let queryInsert = (
                squel.insert()
                    .into("[dbo].[patients_feedback]")
                    .set("[date]", createDate)
                    .set("[exe_id]", exe.exe_id)
                    .set("[prog_id]", exe.prog_id)
                    .set("[patient_username]", pat_username)
                    .set("[physio_username]", physio_username)
                    .set("[succ_level]", succ_Level)
                    .set("[TotalNum]", exe.time_in_day)
                    .set("[succ_num]", nSucc)
                    .set("[pain_level]", painLVvl)
                    .toString()
            );

            console.log(query);
            sql.Insert(queryInsert).then(function (ansInsert) {//insert to pyisio or patient;
                //send feedback message
                genNextCorId().then(function (ansCor) {
                    new_cor_id = ansCor;
                    let new_title = "פידבק על ביצוע: " + exe.title;
                    let _content = "מידת הצלחת הביצוע: ";
                    _content = _content + succ_Level + ","
                    if (nSucc != null) {
                        _content = _content + " תרגולים שבוצעו בהצלחה: " + nSucc + "/" + exe.time_in_day;
                    }
                    _content = _content + " , רמת הכאב: " + painLVvl;
                    InsertMessage(new_cor_id, physio_username, pat_username, createDate, new_title, _content, "feedback").then(function (ans) {
                        //get the physio mail
                        let query = (
                            squel.select()
                                .from("physiotherapists")
                                .field("mail")
                                .where("username = ?", physio_username)
                                .toString()
                        );
                        sql.Select(query)
                            .then(function (ansPhysio) {
                               /* sendMailToUser(ansPhysio[0].mail,"התקבל פידבק מאת:  " + patient_name, _content).then(function (ans2) {
                                    res.send(ans2);
                                }).catch(function (err) {
                                    console.log("Error in send: " + err);
                                    res.send(err);
                                })*/
                                let notifi_content = "התקבל פידבק מאת " + patient_name;
                                sendNotification(physio_username,notifi_content);
                                res.send(ansPhysio);
                            }).catch(function (err) {
                            console.log("Error in inset: " + err);
                            res.send(err);
                        })
                    }).catch(function (err2) {
                        console.log("Error in inset: " + err2);
                        res.send(err2);
                    })
                }).catch(function (reason) {
                    console.log(reason);
                    res.send(reason);
                })
            }).catch(function (reason2) {
                console.log(reason2);
                res.send(reason2);
            });
        }).catch(function (reason2) {
        console.log(reason2);
        res.send(reason2);
    })
});

//get program id and date and patient user's name
app.post('/api/getEXEidByDateAndPat', function (req, res) {
    console.log("enter test users");
    let _patientUsername = req.body.patUsername;
    let _createDate = req.body.createDate;

    let query = (
        squel.select()
            .from("designated_programs")
            .field("prog_id")
            .where("patient_username = ?", _patientUsername)
            .where("date = ?", _createDate)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("program came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});


//get all the therapist details
app.get('/api/GetAllTherapists', function (req, res) {
    console.log("enter to all video");
    let query = (
        squel.select()
            .from("physiotherapists")
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("physios came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});


//get all patient's programs
app.post('/api/getUserPrograms', function (req, res) {
    console.log("enter test users");
    let _username = req.body.username;
    let query = (
        squel.select()
            .from("designated_programs")
            .where("patient_username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("program came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//get the patients of given physiotherapist
    app.post('/api/getPhysioPatients', function (req, res) {
    console.log("enter get physio users");
    let _physioUsername = req.body.physio;
    let query = (
        squel.select()
        //.field("username")
            .from("patients")
            .where("physiotherapist_username = ?", _physioUsername)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            //console.log("program came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//gets all the patient's details
app.post('/api/getPatientDetails', function (req, res) {
    let _username = req.body.username;
    let query = (
        squel.select()
            .from("patients")
            .where("username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            //console.log("program came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//change user's details
app.post('/api/updateUserDetails', function (req, res) {

    upload(req, res, function (err) {
        let _file = req.file;

        //let _newFilePath = _file.path.replace('uploads\\', '');
        let _username = req.body.username;
        let _firstName = req.body.firstName;
        let _lastName = req.body.lastName;
        let _phone = parseInt(req.body.phone);
        let _mail = req.body.mail;
        if (_file != null) {
            let _newFilePath = _file.path.replace('uploads\\', '');
            let queryInsertPatient = (
                squel.update()
                    .table("patients")
                    .set("[first_name]", _firstName)
                    .set("[last_name]", _lastName)
                    .set("[mail]", _mail)
                    .set("[phone]", _phone)
                    .set("[pic_url]", _newFilePath)
                    .where("username = ?", _username)
                    .toString());
            sql.Update(queryInsertPatient).then(function (ansIn) {
                res.send(ansIn);
            }).catch(function (err) {
                res.json({err: err});
            })


        }
        else {

            let queryInsertPatient = (
                squel.update()
                    .table("patients")
                    .set("[first_name]", _firstName)
                    .set("[last_name]", _lastName)
                    .set("[mail]", _mail)
                    .set("[phone]", _phone)
                    .where("username = ?", _username)
                    .toString());
            sql.Update(queryInsertPatient).then(function (ansIn) {
                res.send(ansIn);
            }).catch(function (err) {
                res.json({err: err});
            })
        }
    });

});

//add new user to the system
app.post('/api/register', function (req, res) {
    let _isPhysio = 0;
    console.log("register");
    let _username = req.body.username;
    let _password = req.body.password;
    let _firstName = req.body.firstName;
    let _lastName = req.body.lastName;
    let _physio_username = req.body.physiotherapist_username;
    let _phone = parseInt(req.body.phone);
    let _mail = req.body.mail;
    let _file = req.file;
    let _age = req.body.age;
    let _diagnosis = req.body.diagnosis;
    if (req.body.isPhysio === true) {
        _isPhysio = 1;
    }

    if (_isPhysio === 1) {
        let query = (
            squel.select()
                .from("users")
                .where("username = ?", _username)
                .toString()
        );
        sql.Select(query)
            .then(function (ans) {
                if (ans.length === 0) {//the username not exist
                    //check mail
                    let querymail = (
                        squel.select()
                            .from("physiotherapists")
                            .where("mail = ?", _mail)
                            .toString()
                    );
                    sql.Select(querymail)
                        .then(function (ansmail) {
                            if(ansmail.length === 0) {
                                insertToUsers(_username, _password, _isPhysio)
                                    .then(function (ansUsers) {
                                        let queryInsertPhysio = (//insert to the users table
                                            squel.insert()
                                                .into("[dbo].[physiotherapists]")
                                                .set("[username]", _username)
                                                .set("[first_name]", _firstName)
                                                .set("[last_name]", _lastName)
                                                .set("[mail]", _mail)
                                                .set("[phone]", _phone)
                                                .toString()
                                        );
                                        console.log(queryInsertPhysio);
                                        sql.Insert(queryInsertPhysio).then(function (ansIn) {
                                            res.send(ansIn);
                                        }).catch(function (err) {
                                            res.json({err: err});
                                        })
                                    }).catch(function (err) {
                                    res.json({err: err});
                                })
                            }
                            else
                            {
                                res.json({err: "mail exists"});
                            }
                        }).catch(function (err) {
                        res.json({err: err});
                    })
                }
                else {
                    res.json({err: "username exists"});

                }
            }).catch(function (err) {
            res.json({err: err});

        })
    }
    else {

        ///the username not exist

        upload(req, res, function (err) {

            if (err) {
                res.json({err: err});
                return;
            }
            _username = req.body.username;
            _password = req.body.password;
            _firstName = req.body.firstName;
            _lastName = req.body.lastName;
            _physio_username = req.body.physiotherapist_username;
            _phone = parseInt(req.body.phone);
            _mail = req.body.mail;
            _file = req.file;
            _age = req.body.age;
            _diagnosis = req.body.diagnosis;
            let _newFilePath = null;
            if(_file != null)
            {
                _newFilePath = _file.path.replace('uploads\\', '');

            }
            let query = (
                squel.select()
                    .from("users")
                    .where("username = ?", req.body.username)
                    .toString()
            );
            sql.Select(query)
                .then(function (ans) {
                    if (ans.length === 0) {
                        let querymail = (
                            squel.select()
                                .from("patients")
                                .where("mail = ?", _mail)
                                .toString()
                        );
                        sql.Select(querymail)
                            .then(function (ansmail) {
                                if (ansmail.length === 0) {
                                    insertToUsers(_username, _password, 0).then(function (ansUsers) {
                                        queryInsertPatient = (//insert to the users table
                                            squel.insert()
                                                .into("[dbo].[patients]")
                                                .set("[username]", _username)
                                                .set("[first_name]", _firstName)
                                                .set("[last_name]", _lastName)
                                                .set("[physiotherapist_username]", _physio_username)
                                                .set("[mail]", _mail)
                                                .set("[phone]", _phone)
                                                .set("[age]", _age)
                                                .set("[diagnosis]", _diagnosis)
                                                .set("[pic_url]", _newFilePath)
                                                //.set("[mail]",_mail)
                                                //.set("[phone]",_phone)
                                                .toString()
                                        );
                                        console.log(queryInsertPatient);
                                        sql.Insert(queryInsertPatient).then(function (ansIn) {
                                            res.send(ansIn);
                                        }).catch(function (err) {
                                            res.json({err: err});
                                        })
                                    }).catch(function (err) {
                                        res.json({err: err});
                                    })

                                }
                                else {
                                    res.json({err: "mail exists"});

                                }
                            }).catch(function (err) {
                            res.json({err: err});
                        })
                    }
                    else {
                        res.json({err: "username exists"});

                    }
                }).catch(function (err) {
                res.json({err: err});

            })

        })
    }
});

//register user without a picture
app.post('/api/registerNoPhoto', function (req, res) {
    let _isPhysio = 0;
    console.log("register");
    let _username = req.body.username;
    let _password = req.body.password;
    let _firstName = req.body.firstName;
    let _lastName = req.body.lastName;
    let _physio_username = req.body.physiotherapist_username;
    let _phone = parseInt(req.body.phone);
    let _mail = req.body.mail;
    let _file = req.file;
    let _age = req.body.age;
    let _diagnosis = req.body.diagnosis;

    let _newFilePath = null;
    if(_file != null)
    {
        _newFilePath = _file.path.replace('uploads\\', '');

    }
    let query = (
        squel.select()
            .from("users")
            .where("username = ?", req.body.username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length === 0) {
                let querymail = (
                    squel.select()
                        .from("patients")
                        .where("mail = ?", _mail)
                        .toString()
                );
                sql.Select(querymail)
                    .then(function (ansmail) {
                        if (ansmail.length === 0) {
                            insertToUsers(_username, _password, _isPhysio).then(function (ansUsers) {
                                let queryInsertPatient = (//insert to the users table
                                    squel.insert()
                                        .into("[dbo].[patients]")
                                        .set("[username]", _username)
                                        .set("[first_name]", _firstName)
                                        .set("[last_name]", _lastName)
                                        .set("[physiotherapist_username]", _physio_username)
                                        .set("[mail]", _mail)
                                        .set("[phone]", _phone)
                                        .set("[age]", _age)
                                        .set("[diagnosis]", _diagnosis)
                                        .set("[pic_url]", null)
                                        //.set("[mail]",_mail)
                                        //.set("[phone]",_phone)
                                        .toString()
                                );
                                console.log(queryInsertPatient);
                                sql.Insert(queryInsertPatient).then(function (ansIn) {
                                    res.send(ansIn);
                                }).catch(function (err) {
                                    res.json({err: err});
                                })
                            }).catch(function (err) {
                                res.json({err: err});
                            })

                        }
                        else {
                            res.json({err: "mail exists"});

                        }
                    }).catch(function (err) {
                    res.json({err: err});
                })
            }

            else {
                res.json({err: "username exists"});

            }
        }).catch(function (err) {
        res.json({err: err});

    })

});

//get the exercises inside a given program
app.post('/api/getProgramExe', function (req, res) {
    console.log("enter getProgramExe");
    let _prog_id = req.body.prog_id;
    let query = (
        squel.select()
            .from("designated_exercises")
            .where("prog_id = ?", _prog_id)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("exe came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//add new tag to the tags list
app.post('/api/addTagToBank', function (req, res) {
    let tag = req.body.tag;
    ////check the date!!!!!!//
    let query = (
        squel.select()
            .from("tags")
            .where("tag = ?", tag)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length == 0) {
                //insert new tag
                let queryInsert = (//insert to the users table
                    squel.insert()
                        .into("[dbo].[tags]")
                        .set("[tag]", tag)
                        .toString()
                );
                sql.Insert(queryInsert).then(function (ansIn) {
                    res.json({error_code: 0, err_desc: null})
                }).catch(function (err) {
                    res.json({error_code: 2, err_desc: err})
                })
            }
            else {
                res.json({error_code: 1, err_desc: "exist"})
            }
        }).catch(function (err) {
        res.json({error_code: 2, err_desc: err})
    })

});

//validate that user's temp pass is equal to the temp pass that is stored in the DB
app.post('/api/validateTempPass', function (req, res) {
    let userTemp= req.body.tempPass;
    let username = req.body.username;
    ////check the date!!!!!!//
    let query = (
        squel.select()
            .from("tempPass")
            .where("username = ?", username)
            .where("temp_pass = ?", userTemp)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if(ans.length == 0)
            {
                res.json({"status": "expired"});
            }
            //res.json({"status": "valid"});
            else {
                if (checkdiff(ans[0].time)) {
                    res.json({"status": "valid"});
                }
                else {
                    res.json({"status": "expired"});

                }
            }

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//update user's password
app.post('/api/updatePassword', function (req, res) {
    ///change to hash pass
    //username,pass
    let _username = req.body.username;
    let _newPass = req.body.newPass;
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha256(_newPass, salt);
    let query = (
        squel.select()
            .field("username")
            .from("users")
            .where("username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if(ans.length == 0)
            {
                res.json({"status": "usernotfound"});
            }
            //res.json({"status": "valid"});
            else {
                let query = (squel.update()
                    .table("users")
                    .set("password", passwordData.passwordHash)
                    .set("salt",passwordData.salt)
                    .where("username = ?",_username)
                    .toString());
                sql.Update(query)
                    .then(function (ans) {
                        res.json({"status":"update"});
                    }).catch(function (err){
                    res.json({"error":err});
                })
            }}).catch(function (err){
        res.json({"error":err});
    })

});

//update user's password
app.post('/api/updateNewPassword', function (req, res) {
    //username,pass
    let _username = req.body.username;
    let _newPass = req.body.newPass;
    let _oldPass = req.body.oldPass;

    let query = (
        squel.select()
            .from("users")
            .where("username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if(ans.length == 0)
            {
                res.json({"status": "wrong"});
            }
            //res.json({"status": "valid"});
            else {
                //check oldPadss
                if(sha256(_oldPass,ans[0].salt).passwordHash == ans[0].password)
                {
                    let hashedPass = sha256(_newPass, ans[0].salt).passwordHash;
                    let query = (squel.update()
                        .table("users")
                        .set("password", hashedPass)
                        .where("username = ?",_username)
                        .toString());
                    sql.Update(query)
                        .then(function (ans) {
                            res.json({"status": "update"});
                        }).catch(function (err){
                        res.json({"error":err});
                    })
                }
                else
                {
                    res.json({"status": "wrong"});
                }

            }

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//check the difference between two times
function checkdiff(dbTime)
{
    var now = new Date();
    //let now = moment().format('YYYY-MM-DD hh:mm:ss');

    var difference = now - dbTime;
    difference = difference /1000/60-600;
    if(difference <= 60)
    {
        return true;
    }
    return false;
};



//check if user's have a temp pass
function  checkIfTempExist(username) {
    return new Promise(function(resolve,reject) {
        let query = (
            squel.select()
                .from("tempPass")
                .where("username = ?", username)
                .toString()
        );
        sql.Select(query)
            .then(function (ans) {
                if(ans.length == 0 )
                {
                    resolve("notExist");
                }
                else {
                    resolve("exist");
                }

            }).catch(function (reason) {
            console.log(reason);
            reject(reason);
        })
    })
}


function sendMailToUser(mail, subject,message) {
    return new Promise(function(resolve,reject) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'physiotherapp@gmail.com',
                pass: 'Physio123#'
            }
        });

        //let message =  "סיסמתך הזמנית היא: " + r.toString()+"\n שים לב הסיסמא תקפה לשעה";
        console.log(message);
        let mailOptions = {
            from: 'physiotherapp@gmail.com',
            to: mail,
            subject: subject,
            text: message
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject("error");
            } else {
                console.log('Email sent: ' + info.response);
                resolve("send");
            }
        });
        return mailOptions;
    })
}


//send mail to user
function sendMail(mailOptions, mail, r) {
    return new Promise(function(resolve,reject) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'physiotherapp@gmail.com',
                pass: 'Physio123#'
            }
        });

        let message =  "סיסמתך הזמנית היא: " + r.toString()+"\n שים לב הסיסמא תקפה לשעה";
        console.log(message);
        mailOptions = {
            from: 'physiotherapp@gmail.com',
            to: mail,
            subject: 'סיסמא זמנית',
            text: message
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject("error");
            } else {
                console.log('Email sent: ' + info.response);
                resolve("send");
            }
        });
        return mailOptions;
    })
}


//send mail by google account
function sendMail(mailOptions, mail, r) {
    return new Promise(function(resolve,reject) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'physiotherapp@gmail.com',
                pass: 'Physio123#'
            }
        });

        let message =  "סיסמתך הזמנית היא: " + r.toString()+"\n שים לב הסיסמא תקפה לשעה";
        console.log(message);
        mailOptions = {
            from: 'physiotherapp@gmail.com',
            to: mail,
            subject: 'סיסמא זמנית',
            text: message
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject("error");
            } else {
                console.log('Email sent: ' + info.response);
                resolve("send");
            }
        });
        return mailOptions;
    })
}

//get the user's temp pass
app.post('/api/getTempPass', function (req, res) {
    console.log("enter toGet tempPass");
    let _username = req.body.username;
    let date = moment().format('YYYY-MM-DD hh:mm:ss');
    //let date = Date();
    var mailOptions = null;
    let mail = null;
    let query = (
        squel.select()
            .from("patients")
            .field("mail")
            .where("username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ansPat) {
                if(ansPat.length == 0) {
                    let query2 = (
                        squel.select()
                            .from("physiotherapists")
                            .field("mail")
                            .where("username = ?", _username)
                            .toString()
                    );
                    //check if the
                    sql.Select(query2).then(function (ansPhy) {
                        if (ansPhy.length == 0) {

                            res.json({err_desc: "mail not found"});

                        }
                        else {
                            mail = ansPhy[0].mail;
                            console.log(mail);
                            let r = Math.floor(Math.random() * 100000000);
                            console.log(r);
                            checkIfTempExist(_username).then(function (existAns){
                                if (existAns == "exist") {
                                    let queryUpdate = (squel.update()
                                            .table("tempPass")
                                            .set("[time]", date)
                                            .set("[temp_pass]", r)
                                            .where("username = ?", _username)
                                            .toString()
                                    );
                                    console.log(queryUpdate);
                                    sql.Update(queryUpdate).then(function (ansIn) {
                                        mailOptions = sendMail(mailOptions, mail, r).then(function (ans) {
                                            res.json({success: 1});
                                        }).catch(function (err) {
                                            res.send(err);
                                        })
                                        //res.send(ansIn);
                                    })
                                }
                                else {
                                    let querInsertTemp = (
                                        squel.insert()
                                            .into("[dbo].[tempPass]")
                                            .set("[username]", _username)
                                            .set("[time]", date)
                                            .set("[temp_pass]", r)
                                            .toString()
                                    );
                                    console.log(querInsertTemp);
                                    sql.Insert(querInsertTemp).then(function (ansIn) {
                                        mailOptions = sendMail(mailOptions, mail, r).then(function (ans) {
                                            res.json({success: 1});
                                        }).catch(function (err) {
                                            res.send(err);
                                        })
                                        //res.send(ansIn);
                                    })
                                }
                            })
                        }
                    }).catch(function (reason) {
                        console.log(reason);
                        res.send(reason);
                    });
                    //}
                }
                else {
                    mail = ansPat[0].mail;
                    console.log(mail);
                    let r = Math.floor(Math.random()*100000000);
                    console.log(r);
                    //inset to the db
                    checkIfTempExist(_username).then(function (existAns){
                        if(existAns == "exist")
                        {
                            let queryUpdate = (squel.update()
                                    .table("tempPass")
                                    .set("[time]", date)
                                    .set("[temp_pass]", r)
                                    .where("username = ?",_username)
                                    .toString()
                            );
                            console.log(queryUpdate);
                            sql.Update(queryUpdate).then(function (ansIn) {
                                mailOptions = sendMail(mailOptions, mail, r).then(function(ans){
                                    res.json({success: 1});
                                }).catch(function(err)
                                {
                                    res.send(err);
                                })
                                //res.send(ansIn);
                            })
                        }
                        else {
                            let querInsertTemp = (
                                squel.insert()
                                    .into("[dbo].[tempPass]")
                                    .set("[username]", _username)
                                    .set("[time]", date)
                                    .set("[temp_pass]", r)
                                    .toString()
                            );
                            console.log(querInsertTemp);
                            sql.Insert(querInsertTemp).then(function (ansIn) {
                                mailOptions = sendMail(mailOptions, mail, r).then(function(ans){
                                    res.json({success: 1});
                                }).catch(function(err)
                                {
                                    res.send(err);
                                })
                                //res.send(ansIn);
                            }).catch(function(err){res.send(err)})

                        }
                    })
                }

            }
            //}
        ).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })

    //send mail to the user


});




//update messages that read by patient
app.post('/api/updateReadMessagePatient', function (req, res) {


    let _username = req.body.username;
    let queryUpdate = (
        squel.update()
            .table("messages")
            .set("[was_read]", 1)
            .where("to_username = ?", _username)
            .toString());
    sql.Update(queryUpdate).then(function (ansIn) {
        res.send(ansIn);
    }).catch(function (err) {
        res.json({err: err});
    })
});
//update that physiotherapist read messages from certain patient
app.post('/api/updateReadMessagePhysio', function (req, res) {
    let _physio = req.body.physio;
    let _patient = req.body.patient;
    let queryUpdate = (
        squel.update()
            .table("messages")
            .set("[was_read]", 1)
            .where("to_username = ?", _physio)
            .where("from_username = ?", _patient)

            .toString());
    sql.Update(queryUpdate).then(function (ansIn) {
        res.send(ansIn);
    }).catch(function (err) {
        res.json({err: err});
    })
});

//get all message of a given correspondence
function getMessageOfCorrespondence(element) {
    return new Promise(function(resolve,reject) {
        let _cor_id = element.correspondence_id;
        let query3 = (
            squel.select()
            //  .field("Min(date)","max_date")
                .from("messages")
                .where("correspondence_id = ?", _cor_id)
                .order("date", false)
                .toString()
        );
        sql.Select(query3)
            .then(function (ansQ) {
                //res.send(ans);
                console.log(ansQ);
                resolve(ansQ);
            }).catch(function (reason) {
                reject(reason);
            }
        )
    })};

//get the messages of a gicen correspondence
app.post('/api/getMessageByCorrespondence', function (req, res) {
    let _cor_id = req.body.cor_id;
    let query = (
        squel.select()
        //  .field("Min(date)","max_date")
            .from("messages")
            .where("correspondence_id = ?", _cor_id)
            .order("date",false)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});


//get all messages between two users
app.post('/api/getAllMessagesBetweenTwo', function (req, res) {
    let user1 = req.body.user1;
    let user2 = req.body.user2;

    let query = (
        squel.select()
            .from("messages")
            .where(squel.expr().and("to_username = ?", user1).or("from_username = ?", user1))
            .where(squel.expr().and("to_username = ?", user2).or("from_username = ?", user2))
            .order("date", false)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//get the inbox and outbox messaes of user
app.post('/api/getAllMessagesOfUser', function (req, res) {
    let _username = req.body.username;
    let query = (
        squel.select()
            .from("messages")
            //.where("to_username = ?", _username)
            .where(squel.expr().and("to_username = ?", _username).or("from_username = ?", _username))
            .order("date", false)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length == 0) {
                res.send(ans);

            }
            else
            {
                let query2 = (
                    squel.select()
                        .from("messages")
                        //.where("to_username = ?", _username)
                        .where("to_username = ?", _username)
                        .where("was_read = ?", 0)
                        .toString()
                );
                console.log(query2);
                sql.Select(query2)
                    .then(function (ans2) {
                        let size = ans2.length;
                        ans[0].notRead = size;
                        res.send(ans);

                    }).catch(function (reason) {
                    console.log(reason);
                    res.send(reason);

                })
            }
        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })

});
//get number of unreaded messages by specific user
app.post('/api/getNumNewMessages', function (req, res) {
    let _username = req.body.username;
            let query = (
                squel.select()
                    .from("messages")
                    //.where("to_username = ?", _username)
                    .where("to_username = ?", _username)
                    .where("was_read = ?", 0)
                    .toString()
            );
            console.log(query);
            sql.Select(query)
                .then(function (ans2) {
                    let size = ans2.length;
                    let ans = {};
                    ans[0] = size;
                    res.send(ans);

                }).catch(function (reason) {
                console.log(reason);
                res.send(reason);

            })
});

//get the un read messages between physiotherapist and certain patient
app.post('/api/getNumNewMessagesPhysio', function (req, res) {
    let _username = req.body.username;
    let _patient = req.body.patient;
    let query = (
        squel.select()
            .from("messages")
            //.where("to_username = ?", _username)
            .where("to_username = ?", _username)
            .where("from_username = ?", _patient)
            .where("was_read = ?", 0)
            .toString()
    );
    console.log(query);
    sql.Select(query)
        .then(function (ans2) {
            let size = ans2.length;
            let ans = {};
            ans[0] = size;
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);

    })
});

//get exercise's full details by exe_id
app.post('/api/getExeDetails', function (req, res) {
    console.log("enter test users");
    let _exe_id = req.body.exe_id;
    let query = (
        squel.select()
            .from("designated_exercises")
            .where("exe_id = ?", _exe_id)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("exe came back from the DB");

            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

//get all videos that are tagged by at least one of the given tags
app.post('/api/getAllMediaByTags', function (req, res) {
    console.log("getByTas");
    let tags = req.body.tags;
    let query = (
        squel.select()
            .from("media_bank")
            .where("title IN ?",  squel.select().field('title').from('media_tags').where("tag IN ?",tags).distinct()).order("title", true).toString()
    );
    sql.Select(query)
        .then(function (ans) {
            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.json({error_code: 1, err_desc: reason});

    })
});

///get a video or picure by given path
app.get('/api/mediaGet/:path', function(req, res){
    console.log("enter to mediaGet");
    let curr_path ="uploads/"+req.params.path;

    showFile(curr_path,req,res).then(function(ans){
        console.log("showVideo" + curr_path)})
        .catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
});

//get the user pic's url
app.get('/api/getPic/:path', function(req, res){
    let curr_path ="uploads/"+req.params.path;

    showFile(curr_path,req,res).then(function(ans){
        console.log("pic" + curr_path)})
        .catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
});
//delete an exercise from the system
app.delete('/api/deleteExe', function(req, res) {
    var exe_id = req.body.exe_id;
    let queryFeed = (
        squel.delete()
            .from("[dbo].[patients_feedback]")
            .where("exe_id = ?", exe_id)
            .toString()
    );
    sql.Delete(queryFeed).then(function(ansFeedback)
    {
        let query = (
            squel.delete()
                .from("[dbo].[designated_exercises]")
                .where("exe_id = ?", exe_id)
                .toString()
        );
        sql.Delete(query)
            .then(function (ans) {

                        res.json({error_code: 0, err_desc: null});

                    }).catch(function (err) {
                    console.log("Error in delete: " + err)
                    res.json({error_code: 1, err_desc: err});
                })
    }).catch(function (err) {
        console.log("Error in delete: " + err)
        res.json({error_code: 1, err_desc: err});
    });
});

//delete a program from the db
app.delete('/api/deleteProg', function(req, res) {
    var prog_id = req.body.prog_id;
    let queryFeed = (
        squel.delete()
            .from("[dbo].[patients_feedback]")
            .where("prog_id = ?", prog_id)
            .toString()
    );
    sql.Delete(queryFeed).then(function(ansFeedback)
    {
        let query = (
            squel.delete()
                .from("[dbo].[designated_exercises]")
                .where("prog_id = ?", prog_id)
                .toString()
        );
        sql.Delete(query)
            .then(function (ans) {
                let query2 = (
                    squel.delete()
                        .from("[dbo].[designated_programs]")
                        .where("prog_id = ?", prog_id)
                        .toString()
                );
                sql.Delete(query2)
                    .then(function (ans) {
                        res.json({error_code: 0, err_desc: null});

                    }).catch(function (err) {
                    console.log("Error in delete: " + err)
                    res.json({error_code: 1, err_desc: err});
                })

            }).catch(function (err) {
            console.log("Error in delete: " + err)
            res.json({error_code: 1, err_desc: err});
        });
    }).catch(function (err) {
        console.log("Error in delete: " + err)
        res.json({error_code: 1, err_desc: err});
    });
});

//get all the tags n
app.get('/api/getTags', function (req, res) {

    let query = "select * from tags order by tag ASC";
    sql.Select(query)
        .then(function (ans) {
            //var curr_path = ans[0].path.toString();
            res.send(ans);
        }).catch(function (reason) {
        console.log(reason);
        res.json({error_code: 1, err_desc: reason});

    })
});

//convert video to mp4
function convertTomp4(input,output) {
    console.log("enter to covert");
    return new Promise(function(resolve,reject) {
        let ans = [];
        let convert = new Mp4Convert(input, output);
        convert.on('ffprobeCommand', function(cmd) {
            console.log('Command', cmd);
        });
        convert.on('ffprobeOutput', function(json) {
            console.log('ffprobe output');
        });
        convert.on('progress', function(p) {
            console.log('Progress', p);
        });
        convert.on('done', function() {
            console.log('DoneConvert');
            ans.push("doneConvert");
            resolve(ans);
        });
        convert.start();

    });
}

//add exercise to the DB
function insertDesignatedExercise(prog_id, exetitle, date, onTime, tInWeek, tInDay, nSets, nRepeats, dur, durUnits, breakBet, breakBetUnits, currPath, description) {
    return new Promise (function(resolve,reject) {
        let query = (
            squel.insert()
                .into("[dbo].[designated_exercises]")
                .set("[prog_id]", prog_id)
                .set("[title]", exetitle)
                .set("[date]", date)
                .set("[onTime]", onTime)
                .set("[time_in_week]", tInWeek)
                .set("[time_in_day]", tInDay)
                .set("[num_sets]", nSets)
                .set("[num_repeats]", nRepeats)
                .set("[set_duration]", dur)
                .set("[set_duration_units]", durUnits)
                .set("[break_between_sets]", breakBet)
                .set("[break_between_sets_units]", breakBetUnits)
                .set("[media_path]", currPath)
                .set("[description]", description)
                .toString()
        );
        console.log(query);
        sql.Insert(query).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            console.log("Error in inset: " + err)
            reject(err)
        })
    })
};

//add exercise vith video to the DB
function insertVideoToDB(isBank,new_Path,prog_id,exetitle,onTime,tInWeek,tInDay,nSets,nRepeats,dur,durUnits,breakBet,breakBetUnits,description,tags,videoName){
    return new Promise(function(resolve,reject) {
        let currPath = null;
        let date = moment().format('YYYY-MM-DD hh:mm:ss');
        if(typeof new_Path != 'undefined' && new_Path!="null" && new_Path!= null) {
            currPath = new_Path.replace('uploads\\', '');
            console.log("before: " + new_Path);
            console.log("after: " + currPath);
        }
        if (typeof nRepeats === 'undefined' || !nRepeats || nRepeats=="null") { nRepeats = null};
        if (typeof dur === 'undefined' || !dur || dur == "null") { dur = null};
        if (typeof durUnits === 'undefined' || !durUnits || durUnits == "null") { durUnits = null};
        if (typeof breakBet === 'undefined' || !breakBet ||breakBet=='null' ) { breakBet = null};
        // if (typeof nRepeats === 'undefined' || !nRepeats) { nRepeats = null};

        if(currPath == null || isBank == true)
        {
            insertDesignatedExercise(prog_id, exetitle, date, onTime, tInWeek, tInDay, nSets, nRepeats, dur, durUnits, breakBet, breakBetUnits, currPath, description).then(function(ans){
                resolve(ans);
            }).catch(function(err)
            {
                reject(err);
            })

        }
        else {
            //res.send(ans);
            ////insert to bank
            insertToBankDB(currPath,videoName,tags).then(function (ansBank) {
                insertDesignatedExercise(prog_id, exetitle, date, onTime, tInWeek, tInDay, nSets, nRepeats, dur, durUnits, breakBet, breakBetUnits, currPath, description).then(function(ans){
                    resolve(ans);
                }).catch(function (errbank) {
                    console.log("Error in insetBank: " + errbank)
                    reject(errbank)
                })
            }).catch(function (err) {
                console.log("Error in inset: " + err)
                reject(err)})
        }
    })
};

//get user's full name by username
function getFullname(username){
    return new Promise(function(resolve,reject) {
        let ans = [];
        //let date = moment().format('YYYY-MM-DD hh:mm:ss');
        let query = (
            squel.select()
                .from("patients")
                .field("first_name")
                .field("last_name")
                .field("mail")
                .where("username = ?", username)
                .toString()
        );
        sql.Select(query)
            .then(function (ansPat) {
                if (ansPat.length == 0) {
                    let query2 = (
                        squel.select()
                            .from("physiotherapists")
                            .field("first_name")
                            .field("last_name")
                            .field("mail")
                            .where("username = ?", username)
                            .toString()
                    );
                    //check if the
                    sql.Select(query2).then(function (ansPhy) {
                        if (ansPhy.length == 0) {

                            reject({err_desc: "user not found"});

                        }
                        else {
                            resolve(ansPhy)
                        }
                    }).catch(function (reason) {
                        console.log(reason);
                        reject(reason);
                    });
                    //}
                }
                else {
                    resolve(ansPat);
                }
            }).catch(function (err) {
            res.send(err)
        })
    })

};

//insert viseo to the video's bank
function insertToBankDB(new_Path,title,tags) {
    return new Promise(function (resolve, reject) {
        let currPath = null;
        //let date = moment().format('YYYY-MM-DD hh:mm:ss');
        if (typeof new_Path != 'undefined') {
            currPath = new_Path.replace('uploads\\', '');
            console.log("before: " + new_Path);
            console.log("after: " + currPath);
        }
        let queryCheck = (
            squel.select()
                .from("media_bank")
                .where("title = ?", title)
                .toString()
        );
        sql.Select(queryCheck).then(function (ans) {
            if (ans.length == 0) {
                let query = (
                    squel.insert()
                        .into("[dbo].[media_bank]")
                        .set("[title]", title)
                        .set("[media_path]", currPath)
                        .toString()
                );
                console.log(query);
                sql.Insert(query).then(function (res) {
                    //res.send(ans);
                    //add all tags
                    tags.forEach(function (element) {
                        let query = (
                            squel.insert()
                                .into("[dbo].[media_tags]")
                                .set("[title]", title)
                                .set("[tag]", element.tag)
                                .toString()
                        );
                        console.log(query);
                        sql.Insert(query).then(function (res) {
                            console.log(element);
                        }).catch(function (err) {
                            console.log("Error in inset: " + err);
                            reject(err);
                        })
                    })
                }).then(function (res) {
                    resolve(res);
                })
                    .catch(function (err) {
                        console.log("Error in inset: " + err)
                        reject(err)
                    })
            }
            else {
                reject("השם קיים בחר שם חדש");
            }
        })
    });
};

//save the time that user's loged in to the system
function insertToLog(username){
    return new Promise(function(resolve,reject) {
        let date = moment().format('YYYY-MM-DD HH:mm:ss');
        let query = (
            squel.insert()
                .into("[dbo].[log]")
                .set("[username]", username)
                .set("[date]", date)
                .toString()
        );
        sql.Insert(query).then(function (res) {
            //res.send(ans);
            resolve(res);
        }).catch(function (err) {
            console.log("Error in inset: " + err)
            reject(err)})
    })
};

//convert mov to mp4
function changeToMP4Extention(path)
{
    let idx = path.indexOf(".MOV");
    let withoutExt = path.substring(0, idx);
    let new_path = withoutExt + ".mp4";
    return new_path;
};

//return the file
function showFile(path2,req,res){
    return new Promise(function(resolve,reject) {
        console.log("enter to show video");
        //const path2 = 'uploads/test22.mp4'
        const stat = fs.statSync(path2)
        const fileSize = stat.size
        const range = req.headers.range
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1

            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path2, {start, end})
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head)
            file.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path2).pipe(res)
        }
        resolve("DoneChange Ext");
    })
}

app.post('/api/getDetForNoticfication', function (req, res) {
    let _username = req.body.username;
    let isPhysio = req.body.isPhysio;
    let query = null;
    let _mail = null;
    if(isPhysio == 1)
    {
        query = (
            squel.select()
                .from("physiotherapists")
                .field("mail")
                .where("username = ?", _username)
                .toString()
        );
    }
    else
    {
         query = (
            squel.select()
                .from("patients")
                .field("mail")
                .where("username = ?", _username)
                .toString()
        );
    }
    sql.Select(query)
        .then(function (ans){
            _mail = ans[0].mail;
            //calc the signature for the mail
            let sig = calcSig(_mail);
            ans[0].sig = sig;
            res.send(ans);
        }).catch(function(err){
            res.json({error_code: 1, err_desc: err.message});
        }
            )
});

app.get('/api/testN', function (req, res) {
    sendNotification("u1","הייה מה קורה");
    res.json({"error_code": 0});
    /*var notification = new pushpad.Notification({
        project: project,
        body: 'התקבלה הודעה חדשה', // max 120 characters
        title: 'physiotherApp', // optional, defaults to your project name, max 30 characters
        targetUrl: 'http://132.72.23.155:3000', // optional, defaults to your project website
        //iconUrl: 'http://example.com/assets/icon.png', // optional, defaults to the project icon
        //imageUrl: 'http://example.com/assets/image.png', // optional, an image to display in the notification content
        ttl: 604800, // optional, drop the notification after this number of seconds if a device is offline
        requireInteraction: true, // optional, prevent Chrome on desktop from automatically closing the notification after a few seconds
        //customData: '123', // optional, a string that is passed as an argument to action button callbacks
        // optional, add some action buttons to the notification
        // see https://pushpad.xyz/docs/action_buttons
        starred: true, // optional, bookmark the notification in the Pushpad dashboard (e.g. to highlight manual notifications)
        // optional, use this option only if you need to create scheduled notifications (max 5 days)
        // see https://pushpad.xyz/docs/schedule_notifications
        sendAt: new Date(Date.UTC(2016, 7 - 1, 25, 10, 9)), // 2016-07-25 10:09 UTC
        // optional, add the notification to custom categories for stats aggregation
        // see https://pushpad.xyz/docs/monitoring
        //customMetrics: ['examples', 'another_metric'] // up to 3 metrics per notification
    });

    // deliver to a user
    getFullname("u1").then(function (ans) {
        notification.deliverTo(ans[0].mail, function (err, result) {
            //console.log(calcSig("noasch4@gmail.com"));
            res.send(result);
        })
    }).catch(function(err){
        res.json({error_code: 1, err_desc: err.message});
    }
    )*/
});





function calcSig(input)
{
    return project.signatureFor(input)

}


function sendNotification(username,content)
{
    var notification = new pushpad.Notification({
        project: project,
        body: content, // max 120 characters
        title: 'physiotherApp', // optional, defaults to your project name, max 30 characters
        //targetUrl: 'http://132.72.23.155:3000', // optional, defaults to your project website
        targetUrl: 'http://192.168.1.15:3000',
        //iconUrl: 'http://example.com/assets/icon.png', // optional, defaults to the project icon
        //imageUrl: 'http://example.com/assets/image.png', // optional, an image to display in the notification content
        ttl: 604800, // optional, drop the notification after this number of seconds if a device is offline
        requireInteraction: true, // optional, prevent Chrome on desktop from automatically closing the notification after a few seconds
        //customData: '123', // optional, a string that is passed as an argument to action button callbacks
        // optional, add some action buttons to the notification
        // see https://pushpad.xyz/docs/action_buttons
        /*actions: [
         {
         title: 'My Button 1', // max length is 20 characters
         targetUrl: 'http://example.com/button-link', // optional
         icon: 'http://example.com/assets/button-icon.png', // optional
         action: 'myActionName' // optional
         }
         ],*/
        starred: true, // optional, bookmark the notification in the Pushpad dashboard (e.g. to highlight manual notifications)
        // optional, use this option only if you need to create scheduled notifications (max 5 days)
        // see https://pushpad.xyz/docs/schedule_notifications
        sendAt: new Date(Date.UTC(2016, 7 - 1, 25, 10, 9)), // 2016-07-25 10:09 UTC
        // optional, add the notification to custom categories for stats aggregation
        // see https://pushpad.xyz/docs/monitoring
        //customMetrics: ['examples', 'another_metric'] // up to 3 metrics per notification
    });

    // deliver to a user
    getFullname(username).then(function (ans) {
        notification.deliverTo(ans[0].mail, function (err, result) {
            //console.log(calcSig("noasch4@gmail.com"));
            console.log(result);
        })
    }).catch(function(err){
        console.log("error" + err.message);
        }
    )
}


/*
 var notification = new pushpad.Notification({
 project: project,
 body: 'Hello world!', // max 120 characters
 title: 'Website Name', // optional, defaults to your project name, max 30 characters
 targetUrl: 'http://example.com', // optional, defaults to your project website
 iconUrl: 'http://example.com/assets/icon.png', // optional, defaults to the project icon
 imageUrl: 'http://example.com/assets/image.png', // optional, an image to display in the notification content
 ttl: 604800, // optional, drop the notification after this number of seconds if a device is offline
 requireInteraction: true, // optional, prevent Chrome on desktop from automatically closing the notification after a few seconds
 customData: '123', // optional, a string that is passed as an argument to action button callbacks
 // optional, add some action buttons to the notification
 // see https://pushpad.xyz/docs/action_buttons
 actions: [
 {
 title: 'My Button 1', // max length is 20 characters
 targetUrl: 'http://example.com/button-link', // optional
 icon: 'http://example.com/assets/button-icon.png', // optional
 action: 'myActionName' // optional
 }
 ],
 starred: true, // optional, bookmark the notification in the Pushpad dashboard (e.g. to highlight manual notifications)
 // optional, use this option only if you need to create scheduled notifications (max 5 days)
 // see https://pushpad.xyz/docs/schedule_notifications
 sendAt: new Date(Date.UTC(2016, 7 - 1, 25, 10, 9)), // 2016-07-25 10:09 UTC
 // optional, add the notification to custom categories for stats aggregation
 // see https://pushpad.xyz/docs/monitoring
 customMetrics: ['examples', 'another_metric'] // up to 3 metrics per notification
 });

 // deliver to a user
 notification.deliverTo(user1, function(err, result));

 */


