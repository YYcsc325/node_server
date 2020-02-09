var express = require('express');
var router = express.Router();
var app = express();
var pool = require("../db/pool");//引入数据池
//对post参数进行解释的模块
// var queryString = require("querystring");//queryString大写需要安装一个npm i queryString
router.get("/data",function(req,res){
    var sql = `select uname from echartsone`;
    pool.query(sql,function(err,result){
        console.log(result);
        if(err)throw err;
        res.json(result);
    })
})
router.get("/updatedata",function(req,res){
    var msg = req.query.uname;
    var sql = `update echartsone set uname=? where uid=2`;
    pool.query(sql,[msg],function(err,result){
        if(err)throw err;
        if(result.affectedRows > 0){
            res.json({"code":1,"msg":"修改成功"})
        }else{
            res.json({"code":0,"msg":"修改失败"})
        }
    })
})
router.get("/listefwewdwdwd",(req,res)=>{
    var pno = parseInt(req.query.pno);//转成数字，拿到的是字符串
    var pageSize = parseInt(req.query.pageSize);
    if(!pno){ pno = 1;}
    if(!pageSize){pageSize=10}
    var reg = /^[0-9]{1,}$/;
    if(!reg.test(pno)){
        res.json({"code":-1,"msg":"页码格式有误"});
        return;
    }
    if(!reg.test(pageSize)){
        res.json({"code":-1,"msg":"页大小格式有误"});
        return;
    }
    //结果对象   并发操作谁先返回不知道，但是当前这个请求内的progress为100时才进行发送,一个get请求只能返回一次json
    var output = {pno:pno,pageSize:pageSize};
    var progress = 0;
    //5.4:创建二个sql  总记录数  当前页内容
    var sql = ` SELECT count(uid) as c FROM xz_user `;
    pool.query(sql,(err,result)=>{
        if(err)throw err;
        var pageCount = Math.ceil(result[0].c/pageSize);
        output.pageCount = pageCount;
        progress+=50;//因为每次异步请求时候返回是不确定的，所以给个变量当变量等于100的时候臻和诚一条语句进行发送
        if(progress==100){
            res.json(output);
        }
    });
    var offset = (pno-1)*pageSize;//算出每次请求的页数
    var sql = ` SELECT uid,uname,phone,email,upwd,user_name,upwd FROM xz_user LIMIT ?,? `;
    pool.query(sql,[offset,pageSize],(err,result)=>{
        if(err)throw err;
        output.data = result;
        progress+=50;//因为每次异步请求时候返回是不确定的，所以给个变量当变量等于100的时候臻和诚一条语句进行发送
        if(progress==100){
            res.json(output);
        }
    });
    //5.4:发送并且创建结果对象
});
module.exports = router;