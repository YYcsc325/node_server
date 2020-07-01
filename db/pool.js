const mysql = require("mysql");
var pool = mysql.createPool({
    host:'127.0.0.1',
    port:8889,
    user:'root',
    password:'root',
    database:'loginList',
    connectionLimit:15,//最多几个链接 
    multipleStatements:true //能执行多条sql语句
})
module.exports = pool;