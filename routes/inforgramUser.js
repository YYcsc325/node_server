var express = require('express');
var router = express.Router();
var app = express();
var request = require('request');//模拟发送请求的
var pool = require("../db/pool");//引入数据池

router.get('/user', (req, res) => {
    const email = req.query.email;
    const passWord = req.query.passWord;
    let sql = `select * from  userInformation where email=? and password=?`;
    pool.query(sql, [email, passWord], (err,result) => {
        if(err) throw err;
        if(result.length){
            res.json({
                result: {
                    ...result[0],
                    login: true
                },
                code: 200,
                success: true
            });
        }else{
            res.json({
                code: 0,
                success: false
            })
        }
    })
})

module.exports = router;