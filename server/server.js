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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//var path2;
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.listen(4000,function(){
    console.log("Working on port 4000");
});

/*let config = {
    server: '192.168.1.15',
    userName: 'sa',
    password: 'Admin1!',
    database: 'physiotherDB',
   options:{
        instanceName:"PHYSIOTHER", // I've also tried LOCALDB#219A131B
       database: 'physiotherDB'
    },
    port : 1433
};*/
//let sql = require("mssql");
/*let connection = new Connection(config);
console.log("before connect");

connection.on('connect', function (err) {
    if (err) {
        console.log(err)
    }
    console.log("commmmksdgkjfdgkjfhg;");
    /*app.get('/', function (req, res) {

        res.send("Connected to DB.");
    });*/

    let storage	=	multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './uploads');
        },
        filename: function (req, file, callback) {
            //callback(null, file.fieldname + '-' + Date.now()+"."+path.extname(file.originalname));
            callback(null,Date.now() + file.originalname);
        }
    });
    app.get('/test', function (req, res) {

        console.log("in test:")
       /* let query = (
            squel.select()
                .from("videos")
                .toString()
        );*/
       let query = "select * from videos";
        sql.Select(query)
            .then(function (ans) {
                console.log("in ans")
                //var curr_path = ans[0].path.toString();
                res.send(ans);
            }).catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
    });
    //let upload = multer({ storage : storage}).single('userPhoto');
    let upload = multer({ storage : storage}).single('file');
    app.get('/',function(req,res){
        res.sendFile(__dirname + "/index.html");
    });

    app.post('/api/photo',function(req,res){
        //upload = multer({ storage : storage}).single('userPhoto');
        //upload = multer({ storage : storage}).single('file');
        console.log("enter to photo");
        upload(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.");
            }
            if (typeof req.file === 'undefined')
                return res.end("No file");
            // res.end("File is uploaded");
            console.log(req.file.filename);
            ////add to DB
            if(req.file.mimetype == "video/quicktime")
            {
                let newPath = changeToMP4Extention(req.file.path);
                convertTomp4(req.file.path,newPath)
                    .then(insertVideoToDB(newPath))
                    .then(function(ans){
                        res.send("Done WithConvert!!!!")
                    })
                    .catch(function(err){
                        res.send(err)
                    })
            }
            else {
                insertVideoToDB(req.file.path)
                    .then(function(ans){
                        res.send("DoneWithOutConvert")}).catch(function (err) {
                    reject(err)});
            }
        });

    });
///newwwww

//reateProgram
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

app.post('/upload', function(req, res) {
console.log("enter to upload");
    console.log("in upload");

    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            res.json({error_code: 1, err_desc: err});
            return;
        }
        if (req.file.mimetype == "video/quicktime") {
            console.log(req.body.time);

            let newPath = changeToMP4Extention(req.file.path);
            convertTomp4(req.file.path, newPath)
            // insertVideoToDB(new_Path,prog_id,exetitle,tInWeek,nSets,nRepeats,dur,breakBet)
                .then(insertVideoToDB(newPath, req.body.prog_id, req.body.exeTitle, req.body.onTime, req.body.timeInWeek,req.body.timeInDay, req.body.nSets, req.body.nRepeats, req.body.setDuration,req.body.setDurationUnits, req.body.break,req.body.breakUnits, req.body.description))
                .then(function (ans) {
                    //res.send("Done WithConvert!!!!")
                    res.json({error_code: 0, err_desc: null})
                })
                .catch(function (err) {
                    res.send(err)
                })
        }
        else {
            console.log(req.body.timeInWeek);
            //insertVideoToDB(req.file.path)
            insertVideoToDB(req.file.path, req.body.prog_id, req.body.exeTitle, req.body.onTime, req.body.timeInWeek,req.body.timeInDay, req.body.nSets, req.body.nRepeats, req.body.setDuration,req.body.setDurationUnits, req.body.break,req.body.breakUnits, req.body.description)
                .then(function (ans) {
                    res.json({error_code: 0, err_desc: null})
                }).catch(function (err) {
                reject(err)
            });
        }
        //res.json({error_code:0,err_desc:null});
//        insertVideoToDB(req.file.path);
    })

});


app.post('/uploadNoVideo', function(req, res2) {
    console.log("enter to uploadNoVideo");
    insertVideoToDB(req.body.path,req.body.prog_id,req.body.exeTitle,req.body.onTime,req.body.timeInWeek,req.body.timeInDay,req.body.nSets,req.body.nRepeats,req.body.setDuration,req.body.setDurationUnits,req.body.break,req.body.breakUnits,req.body.description).then(function(ans){
        res2.json({error_code:0,err_desc:null})
    }).catch(function(err){
            res2.send(err)
        })
    });



app.post('/uploadToBank', function(req, res) {
    console.log("enter to upload to bank");

    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }
        if (req.file.mimetype == "video/quicktime") {

            let newPath = changeToMP4Extention(req.file.path);
            convertTomp4(req.file.path, newPath)
            // insertVideoToDB(new_Path,prog_id,exetitle,tInWeek,nSets,nRepeats,dur,breakBet)
                .then(insertToBankDB(newPath, req.body.title))
                .then(function (ans) {
                    //res.send("Done WithConvert!!!!")
                    res.json({error_code: 0, err_desc: null})
                })
                .catch(function (err) {
                    res.send(err)
                })
        }
        else {
            //insertVideoToDB(req.file.path)
            insertToBankDB(req.file.path, req.body.title,req.body.tags)
                .then(function (ans) {
                    res.json({error_code: 0, err_desc: null})
                }).catch(function (err) {
                reject(err)
            });
        }
        //res.json({error_code:0,err_desc:null});
//        insertVideoToDB(req.file.path);
    })

});

//setPatientFeedback
app.post('/api/setPatientFeedback', function (req, res) {
    let createDate = req.body.date;
    let pat_username = req.body.patUsername;
    let exe = req.body.exe;
    let succ_Level = req.body.succLvl;
    let painLVvl = req.body.painLVvl;
    let nSucc = req.body.nSucc;
    //get the physiotherapist
    let query = (
        squel.select()
            .from("patients")
            .field("physiotherapist_username")
            .where("username = ?", pat_username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
                let physio_username = ans[0].physiotherapist_username;
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

                // var pathes = ans[0].path.toString();
                res.send(ansInsert);
                ///create message for the physiotherpaist

            }).catch(function (reason) {
                console.log(reason);
                res.send(reason);
            })
        }).catch(function (reason2) {
        console.log(reason2);
        res.send(reason2);
    });
});

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

app.get('/api/video/:id', function(req, res){
        console.log("enter to video");
        let id = req.params.id;
        let query = (
            squel.select()
                .from("videos")
                .field("path")
                .where("id = ?", id)
                .toString()
        );
        sql.Select(query)
            .then(function (ans) {
                console.log("enter to return select");

                let curr_path = ans[0].path.toString();
                if(curr_path.endsWith('.mp4')) {
                    //path2 = curr_path;
                    showVideo(curr_path,req,res).then(function(ans){console.log("showVideo" + curr_path)})
                }
            }).catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
    });



    app.get('/api/GetAllVideosPathes', function (req, res) {
        console.log("enter to all video");
        let query = (
            squel.select()
                .from("videos")
                .field("id")
                .field("path")
                .toString()
        );
        sql.Select(query)
            .then(function (ans) {
                console.log("videos came back from the DB");

               // var pathes = ans[0].path.toString();
                res.send(ans);

            }).catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
    });

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


    app.get('/api/testUsers', function (req, res) {
        console.log("enter test users");
        let query = (
            squel.select()
                .from("Users")
                .field("username")
                .toString()
        );
        sql.Select(query)
            .then(function (ans) {
                console.log("users came back from the DB");

                // var pathes = ans[0].path.toString();
                res.send(ans);

            }).catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
    });

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


app.post('/api/authenticate', function (req, res) {
    console.log("Login");
    let _username = req.body.username;
    let _password = req.body.password;

    let query = (
        squel.select()
            .field("isPhysio")
            .from("users")
            .where("username = ?", _username)
            .where("password = ?", _password)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length === 0) {
                res.json({err:"wrong user or pasword "});
                return;
            }
           // res.json({success:"login"});
            if(ans[0].isPhysio)
            {
                console.log("physio");
                let query2 = (
                    squel.select()
                        .from("physiotherapists")
                        .where("username = ?", _username)
                        .toString()
                );
                sql.Select(query2)
                    .then(function (ansP) {
                        ansP[0].isPhysio = ans[0].isPhysio;
                        res.send(ansP);
                    }).catch(function (err1) {
                    console.log(err1);
                    res.send(err1);
                });

            }
            else if(_username == 'admin')
            {
                res.send(ans);

            }
            else{
                let query3 = (
                    squel.select()
                        .from("patients")
                        .where("username = ?", _username)
                        .toString()
                );
                sql.Select(query3)
                    .then(function (ansP2) {
                        ansP2[0].isPhysio = ans[0].isPhysio;
                        res.send(ansP2);
                    }).catch(function (err2) {
                    console.log(err2);
                    res.send(err2);
                });


            }}).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })});




app.post('/api/register', function (req, res) {
    console.log("register");
    let _username = req.body.username;
    let _password = req.body.password;
    let _firstName = req.body.firstName;
    let _lastName = req.body.lastName;
    let _physio_username = req.body.physiotherapist_username;
    let _phone= parseInt(req.body.phone);
    let _mail = req.body.mail;
    let _isPhysio = 0;
    if(req.body.isPhysio === true)
    {
        _isPhysio = 1;
    }
    let query = (
        squel.select()
            .from("users")
            .where("username = ?", _username)
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            if (ans.length === 0) {//the username not exist
                let queryInsert = (//insert to the users table
                    squel.insert()
                        .into("[dbo].[users]")
                        .set("[username]",_username)
                        .set("[password]",_password)
                        .set("[isPhysio]",_isPhysio)
                        .toString()
                );
                console.log(query);
                sql.Insert(queryInsert).then(function(ansUsers){//insert to pyisio or patient
                if(_isPhysio === 1)
                {
                    let queryInsertPhysio = (//insert to the users table
                        squel.insert()
                            .into("[dbo].[physiotherapists]")
                            .set("[username]",_username)
                            .set("[first_name]",_firstName)
                            .set("[last_name]",_lastName)
                            .set("[mail]",_mail)
                            .set("[phone]",_phone)
                            .toString()
                    );
                    console.log(queryInsertPhysio);
                    sql.Insert(queryInsertPhysio).then(function (ansIn) {
                        res.send(ansIn);
                    })
                }
                    else
                    {
                        let queryInsertPatient = (//insert to the users table
                            squel.insert()
                                .into("[dbo].[patients]")
                                .set("[username]",_username)
                                .set("[first_name]",_firstName)
                                .set("[last_name]",_lastName)
                                .set("[physiotherapist_username]",_physio_username)
                                //.set("[mail]",_mail)
                                //.set("[phone]",_phone)
                                .toString()
                        );
                        console.log(queryInsertPatient);
                        sql.Insert(queryInsertPatient).then(function (ansIn) {
                            res.send(ansIn);
                        })
                    }
                })
            }
            else
            {
                res.json({err:"username exists"});
            }
            // res.json({success:"login"});
          //  res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});

app.post('/api/getProgramExe', function (req, res) {
    console.log("enter test users");
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


app.post('/api/getBank', function (req, res) {
    console.log("enter toGet bank");
    let query = (
        squel.select()
            .from("media_bank")
            .toString()
    );
    sql.Select(query)
        .then(function (ans) {
            console.log("video came back from the DB");
            // var pathes = ans[0].path.toString();
            res.send(ans);

        }).catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});


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

///maybe change to post
app.post('/api/mediaPost', function(req, res){
    console.log("enter to video");
    //let curr_path = "uploads/"+req.body.path;
    let curr_path = req.body.path;
    showVideo(curr_path,req,res).then(function(ans){
        console.log("showVideo" + curr_path)})
        .catch(function (reason) {
        console.log(reason);
        res.send(reason);
    })
});
///maybe change to post
app.get('/api/mediaGet/:path', function(req, res){
    console.log("enter to mediaGet");
    ///switch the /
    //let currPath = req.params.path;
    //let newPath = currPath.replace('\\', '/');
    //console.log("before: " + currPath);
    //console.log("after: " + newPath);
    let curr_path ="uploads/"+req.params.path;
    //let curr_path = req.params.path;
    //let curr_path = req.body.path;
    showVideo(curr_path,req,res).then(function(ans){
        console.log("showVideo" + curr_path)})
        .catch(function (reason) {
            console.log(reason);
            res.send(reason);
        })
});
app.delete('/api/deleteProg', function(req, res) {
    var prog_id = req.body.prog_id;
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
                    res.send(ans);

                }).catch(function (err) {
                console.log("Error in delete: " + err)
                res.send(err);
            })

        }).catch(function (err) {
        console.log("Error in delete: " + err)
        res.send(err);
    });
});

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

    function insertVideoToDB(new_Path,prog_id,exetitle,onTime,tInWeek,tInDay,nSets,nRepeats,dur,durUnits,breakBet,breakBetUnits,description){
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
            let query = (
                squel.insert()
                    .into("[dbo].[designated_exercises]")
                    .set("[prog_id]",prog_id)
                    .set("[title]",exetitle)
                    .set("[date]",date)
                    .set("[onTime]",onTime)
                    .set("[time_in_week]",tInWeek)
                    .set("[time_in_day]",tInDay)
                    .set("[num_sets]",nSets)
                    .set("[num_repeats]",nRepeats)
                    .set("[set_duration]",dur)
                    .set("[set_duration_units]",durUnits)
                    .set("[break_between_sets]",breakBet)
                    .set("[break_between_sets_units]",breakBetUnits)
                    .set("[media_path]", currPath)
                    .set("[description]",description)
                    .toString()
            );
            console.log(query);
            sql.Insert(query).then(function (res) {
                //res.send(ans);
                resolve(res);
            }).catch(function (err) {
                console.log("Error in inset: " + err)
                reject(err)})
        })
    };




function insertToBankDB(new_Path,title,tags){
    return new Promise(function(resolve,reject) {
        let currPath = null;
        //let date = moment().format('YYYY-MM-DD hh:mm:ss');
        if(typeof new_Path != 'undefined') {
            currPath = new_Path.replace('uploads\\', '');
            console.log("before: " + new_Path);
            console.log("after: " + currPath);
        }
        let query = (
            squel.insert()
                .into("[dbo].[media_bank]")
                .set("[title]",title)
                .set("[media_path]", currPath)
                .set("tag0",tags[0])
                .set("tag1",tags[1])
                .set("tag2",tags[2])
                .toString()
        );
        console.log(query);
        sql.Insert(query).then(function (res) {
            //res.send(ans);
            resolve(res);
        }).catch(function (err) {
            console.log("Error in inset: " + err)
            reject(err)})
    })
};


function insertVideoToDBbackup(new_Path){
    return new Promise(function(resolve,reject) {
        let date = moment().format('YYYY-MM-DD hh:mm:ss');
        let query = (
            squel.insert()
                .into("[dbo].[videos]")
                .set("[id]", date)
                .set("[path]", new_Path)
                .toString()
        );
        sql.Insert(query).then(function (res) {
            //res.send(ans);
            resolve(res);
        }).catch(function (err) {
            cosole.log("Error in inset: " + err)
            reject(err)})
    })
};

    function changeToMP4Extention(path)
    {
        let idx = path.indexOf(".MOV");
        let withoutExt = path.substring(0, idx);
        let new_path = withoutExt + ".mp4";
        return new_path;
    }

    function showVideo (path2,req,res){
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


