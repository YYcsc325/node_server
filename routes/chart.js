var express = require('express');
var router = express.Router();
var app = express();
var pool = require("../db/pool");//引入数据池

//拖拽显示
router.get('/getData',function(req,res,next){
    var sql = `select * from userchart`;//给它取个别名
    pool.query(sql,(err,result)=>{
        if(err)throw err;
        console.log(result);
        res.json(result);
    })
})
//点击显示
router.get('/showData',function(req,res,next){
    var uid = req.query.uid;
    console.log(uid);
    var sql = `select * from getData where uid=?`;//给它取个别名
    pool.query(sql,[uid],(err,result)=>{
        if(err)throw err;
        console.log(result);
        res.json(result);
    })
})
module.exports = router;