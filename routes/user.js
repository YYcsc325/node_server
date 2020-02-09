var express = require('express');
var router = express.Router();
var app = express();
var request = require('request');//模拟发送请求的
var pool = require("../db/pool");//引入数据池

//登录的验证
router.post("/login",function(req,res){
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    //正则表达式验证
    var reg = /^[0-9a-z]{3,12}$/;
    if(!reg.test(uname)){
        res.write("<h1>用户名格式不正确，请重试</h1>");
        res.end();
        return;
    }
    if(!reg.test(upwd)){
        res.write("<h1>密码格式不正确</h1>");
        res.end();
        return;
    }
    var sql = ` select * from echartslogin where uname=? and upwd = ? `;
    //这边那要查询总数，取个别名，删除和插入可以查看影响的行数，登陆要看查询到的条数
    pool.query(sql,[uname,upwd],function(err,result){
        if(err)throw err;
        if(result[0]){           
            // res.cookie('xinxi',{        可以存一个对象信息
            //     'uid':result[0].uid,
            //     'uname':result[0].uname
            // }, {
            //     path: '/',
            //     maxAge: 1000*60*60
            // })
            res.cookie("uid",result[0].uid,{
                path:'/',
                maxAge:1000*60*60
            })  
            res.cookie("uname",result[0].uname,{
                path:'/',
                maxAge:1000*60*60
            })            
            res.json({status:'0',msg:'登录成功',token:'333',result:result[0].uname});           
        }else{
            res.json({status:'1',msg:'登录失败'})
        }
    })
})
//确认登录验证
router.get('/checkLogin',function(req,res,next){
    if(req.cookies.uid){
        res.json({
          status:'0',
          msg:'',
          result:req.cookies.uid || ''
        });
    }else{
      res.json({
        status:'1',
        msg:'未登录',
        result:''
      });
    }
})
// 退出登录
router.post('/logout',function(req,res,next){
    // res.cookie('xinxi',{
    //     'uid':'',
    //     'uname':''
    // },{//把cookie内的userId清空,为了Git登录把用户名也清了
    //     path:'/',   
    //     maxAge:-1
    // })
    res.cookie('uid',"",{//把cookie内的uId清空
        path:'/',
        maxAge:-1
    })
    res.json({
        status:'0',
        msg:'',
        result:''
    })
})
//github的验证登录
router.post('/gitlogin', function(req, res, next) {
    
    var code = req.body.code;//这个code是一开始点击界面跳转的时候进行获取的
    var githubConfig = {
        // 客户ID
        client_ID: '325af0ec1b0d1e18d869',
        // 客户密匙
        client_Secret: 'baa0ae2263af685579f808ce126666a6b9b9ec9d',
        // 获取 access_token
        access_token_url: 'https://github.com/login/oauth/access_token',
        //获取用户信息
        user_info_url: 'https://api.github.com/user?'
    }
    if (code == '') {
        res.end(JSON.stringify({
            msg: '请传入正确的参数',
            status: 103
        }));
        return;
    }
    //代替用户去请求一些公开抛出的数据
    request({
        method:'post',
        url: githubConfig.access_token_url,
        form: {//提交一个的对象
            client_id: githubConfig.client_ID,
            client_secret: githubConfig.client_Secret,
            code: code
        }},
        function(error, response, body){
            // var rest = response.body.split('&')[0].split('=')[1];//解析出token
            // console.log(body);
            if (!error && response.statusCode == 200) {
                var urlStr = githubConfig.user_info_url + body;//请求的地址加上参数
                request({
                        url: urlStr,
                        headers: {
                            'User-Agent': 'YYcsc325'//这里写上自己的git用户名
                        }
                    },
                    function(error, response, resbody){
                        if (!error) {
                            res.cookie("uname",JSON.parse(resbody).login,{
                                path:'/',
                                maxAge:1000*60*60
                            })
                            res.cookie("uid",JSON.parse(resbody).id,{
                                path:'/',   //放在根目录下
                                maxAge:1000*60*60      //这代表一个小时后过期，毫秒计算
                            })
                            res.end(JSON.stringify({//可以写成res.json,经典错误当res返回数据是，不能有变量重名
                                msg: '获取成功',
                                status: 100,
                                data: JSON.parse(resbody)
                            }));
                        }else{
                            res.end(JSON.stringify({
                                msg: '获取用户信息失败',
                                status: 102
                            }));
                        }
                    }
                )
            }else{
                res.end(JSON.stringify({
                    msg: '获取用户信息失败',
                    status: 101
                }));
            }
        }
    )
})

module.exports = router;