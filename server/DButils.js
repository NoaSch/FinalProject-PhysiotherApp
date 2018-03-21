/**
 * Created by NOA-PC on 11/29/2017.
 */
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

let config = {
 //server: '192.168.1.48',
    //server: '132.73.201.132',
   //server: '132.73.197.59',
    server: '192.168.1.15',
   // server: '192.168.43.106',
    // server: '137.72.67.106',
 userName: 'sa',
 password: 'Admin1!',
 database: 'physiotherDB',
 options:{
 instanceName:"PHYSIOTHER",
 database: 'physiotherDB'
 },
 port : 1433
 };

exports.Select = function(query) {
    console.log(query);
    return new Promise(function(resolve,reject) {
        let connection = new Connection(config);
        var ans = [];
        var properties = [];
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connectionSelect on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
            dbReq.on('row', function (row) {
                var item = {};
                for (i=0; i<row.length; i++) {
                    item[properties[i]] = row[i].value;
                }
                ans.push(item);
            });

            dbReq.on('requestCompleted', function () {
                console.log('request Completed: '+ dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                connection.close();
                resolve(ans);

            });
            connection.execSql(dbReq);
        });
    });
};

exports.Insert = function(query) {
    console.log('Adding rows to the Table...');
    console.log(query);
        return new Promise(function (resolve, reject) {
        let connection = new Connection(config);
            connection.on('connect', function(err) {
                if (err) {
                    console.error('error connecting: ' + err.message);
                    reject(err);
                }
                console.log('connectionInsert on');
                var req = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err);
            }
        });

        req.on('requestCompleted', function () {
            connection.close();
            resolve(true);
        });

        connection.execSql(req);
    });
});
};



exports.Delete = function(query) {
    console.log('Removing rows from the Table...');
    console.log(query);

    return new Promise(function (resolve, reject) {

        let connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection Delete on');

        var req = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err);
            }
        });

        req.on('requestCompleted', function () {
            connection.close();
            resolve(true);
        });

            connection.execSql(req);
        });
    });
};

exports.Update = function(query) {
    console.log('Changing rows in the Table...');
    console.log(query);

    return new Promise(function (resolve, reject) {
        let connection = new Connection(config);
        connection.on('connect', function(err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection update on');
        var req = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err);
            }
        });

        req.on('requestCompleted', function () {
            resolve(true);
        });

        connection.execSql(req);
    });
    });
};



