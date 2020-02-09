var express = require("express");
var http = require("http");
var app = express();
var server = http.createServer(app);
// var favicon = require("serve-favicon");            //icon图表在转化
var morgan = require("morgan");                       //需要npm 
var fs = require('fs');
var compression = require("compression");             //压缩文件
var bodyParser = require("body-parser");              //npm i body-parser
var cookieParser = require("cookie-parser");
// var mongoose = require('mongoose');
var cors = require("cors");//跨域的


// 连接MongoDB数据库     mongoDB         开启的时候给他打开
// mongoose.connect('mongodb://127.0.0.1:27017/db_demo');

// mongoose.connection.on("connected", function () {     //监听数据库连接成功
//   console.log("MongoDB connected success.")
// });

// mongoose.connection.on("error", function () {
//   console.log("MongoDB connected fail.")
// });

// mongoose.connection.on("disconnected", function () {
//   console.log("MongoDB connected disconnected.")
// });



app.use(cookieParser());
app.use(compression())//体积压缩的中间件,只要发送的文件都被压缩了
//记录日志信息
//记录日志的信息   combined common dev short tiny
// app.use(morgan('combined'))
// app.use(morgan(':method:status:url'))//可以自定义哪些信息
var writeStream = fs.createWriteStream(__dirname+'/logs/morgan.txt');//这样是记录 所有的
app.use(morgan(':method:status:url',{stream:writeStream}))
//解析body中传来的数据，post请求的数据，下面两个解析了不同的提交方式，一个是表单提交，一个是对象
app.use(bodyParser.urlencoded({extended:false}));     //需要单独限制，引入到单独js文件app改为router      
app.use(bodyParser.json())  //解析传过来的是个json对象转成json字符串

app.use(cors({           //跨域请求设置,前台使用了跨域代理这边就不用写了
    origin:'*',          //允许所有的请求           Access-control-Allow-origin:"*"   可以写固定地址'http://www.baidu.com'
    credentials:true,    //允许携带seccion   Access-control-Allow-credentials
}))

//中间件,指向静态资源文件
app.use(express.static(__dirname+'/static'));



// 登录拦截
// app.use(function(req,res,next){
//      if(req.cookies.userId){ 
//          next();             //已经有这个id说明登录了，放行
//      }else{
//          if(req.originalUrl == '/users/login' || req.originalUrl == '/users/logout' || req.path == '/goods/list'){//req.path参数都不获取，只获取地址
//                 next()       //没登录的情况，可以点登录或登出
//          }else{
//              res.json({
//                  status:'10001',
//                  msg:'当前未登录',
//                  result:''
//              })
//          }
//      }
// })


server.listen(3000,()=>{
    console.log("open");
})


//路由部分
var cart = require('./routes/cart');
var goods = require('./routes/goods');
var product = require('./routes/product');
var user = require('./routes/user');
var users = require('./routes/users');
var chart = require('./routes/chart');


// 引入到相对应的模块处
app.use('/cart',cart);
app.use('/goods',goods);
app.use('/product',product);
app.use('/user',user);
app.use('/users',users);
app.use('/chart',chart);