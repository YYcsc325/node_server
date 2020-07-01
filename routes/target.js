var express = require('express');
var router = express.Router();
// var morgan = require("morgan");//需要npm 记录日志需要
// var fs = require('fs');
var queryString = require("querystring");//queryString大写需要安装一个npm i queryString 对post参数进行解释的模块
var pool = require("../db/pool");//引入数据池

//这里可以设置保安队长，队请求进行拦截和过滤,use的中间件都有next放不放行功能
//也可以放在主入口文件中


//记录日志信息     可以单独记录
// app.use(morgan(':method:status:url'))//可以自定义哪些信息
// var writeStream = fs.createWriteStream(__dirname+'/morgan.txt');
// router.use(morgan('combined',{stream:writeStream}))

router.get('/one',(req,res)=>{
    console.log(req.url)
    console.log(req.method)
    console.log(req.query)
    console.log(req.body) //    /post请求才有
    console.log(req.params)//   /传参才有
    var sql = `select * from xz_user`;
    pool.query(sql,(err,result)=>{
        if(err)throw err;
        res.json(result);
    })
})
router.post('/two',(req,res)=>{
    var name = req.body;
    console.log(name);
    res.send("成功");
})
router.post('/three',(req,res)=>{
    req.on("data",(m)=>{
        console.log("11");
        console.log(m.toString());
        var str = m.toString();             //先转换成字符串
        var obj = queryString.parse(str);   //在转为对象模式
        console.log(obj);
    })
    res.send("我拿到参数了");
})
// router.get("/three",(req,res)=>{
//     res.sendfile(__dirname+"../static/text.html");//用到router选文件只能往下面跳了,总是在routes这个文件目录下，因为__dirname
// })
router.get("/four/:id",(req,res)=>{
    var di = req.params.id;
    if(di == 123){
        res.send("你好啊");
    }
})
router.get('/remove',(req,res)=>{//同时执行两条sql语句，但是在数据池得配置
    var sql1 = `select * from xz_index_product;`;//两条sql语句要加;
    var sql2 = `select * from xz_user`;
    pool.query(sql1+sql2,(err,result)=>{    //result返回的是一个数据[0]是第一条的[1]是第二条的 
        console.log(result);
        if(err){
            res.send("出错啦")
        }else{
            res.json(result[1][0].uname);
        }
    })
})
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