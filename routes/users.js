var express = require('express');
var router = express.Router();
var User = require('../db/user');//这边先引入定义好的数据集,全部定义好了
require('./../util/util')//定义在data的prototype上的
//登录验证
router.post('/login',function(req,res,next){
    let param = {
        userName:req.body.userName,
        userPwd:req.body.userPwd+''//数据库定义必须是个字符串
    }
    User.findOne(param,function(err,result){//find内必须是个对象
        if(err){
            res.json({
                status:'1',
                msg:err.message
            })
        }else{
            if(result){//如果查找到一条数据
                //请求成功设置cookie,先要装一个
                res.cookie("userId",result.userId,{
                       path:'/',   //放在根目录下
                       maxAge:1000*60*60      //这代表一个小时后过期，毫秒计算
                })
                res.cookie("userName",result.userName,{
                    path:'/',
                    maxAge:1000*60*60
                })
                //存入session内,所有信息都存入，请求的session会话内
                // req.session.user = result;
                res.json({
                    status:'0',
                    msg:'',
                    result:{//把用户名返回出去
                        userName:result.userName
                    }
                })
            }else{
                res.json({
                    status:'1',
                    msg:"用户名密码错误"
                })
            }   
        }
    })
})
//登出验证
router.post('/logout',function(req,res,next){
     res.cookie('userId',"",{//把cookie内的userId清空
         path:'/',
         maxAge:-1
     })
     res.json({
         status:'0',
         msg:'',
         result:''
     })
})
//校验   要使用req.session 要安装 express-session
//一般设置cookie的存储时间，已经登陆过之后就不必在此登录
router.get("/checkLogin", function (req,res,next) {
    if(req.cookies.userId){
        res.json({
          status:'0',
          msg:'',
          result:req.cookies.userName || ''
        });
    }else{
      res.json({
        status:'1',
        msg:'未登录',
        result:''
      });
    }
  });
  //查询当前用户购物车的总数量，服务vuex
router.get('/getCartCount',function(req,res,next){
      if(req.cookies && req.cookies.userId){
          var userId = req.cookies.userId;
          User.findOne({userId:userId},function(err,doc){
              if(err){
                  res.json({
                      status:'1',
                      msg:err.message,
                      result:''
                  })
              }else{
                  var cartList = doc.cartList;
                  var cartCount = 0;//计算商品总数量的变量
                  cartList.map(function(item){
                      cartCount += parseInt(item.productNum);
                  })
                  res.json({
                      status:'0',
                      msg:'',
                      result:cartCount
                  })
              }
          })
      }
  })
  //查询当前用户的购物车数据
router.get('/cartList',function(req,res,next){
      var userId = req.cookies.userId;//在登录状态下，获取用户ID
      User.findOne({userId:userId},function(err,doc){
          if(err){
              res.json({
                  status:'1',
                  msg:err.message,
                  result:''
              })
          }else{
              if(doc){
                  res.json({
                      status:'0',
                      msg:'',
                      result:doc.cartList
                  })
              }
          }
      })
  })
  //购物车删除
router.post('/cartDel',function(req,res,next){
      var userId = req.cookies.userId;//找到用户ID
      var productId = req.body.productId;//找到商品ID
      User.update({
          userId:userId//更新
      },{
          $pull:{//把这个元素给它干掉的方法
              'cartList':{
                  'productId':productId
                }
            }//就是找到对应用户ID下的对应商品列表下的ID进行删除
      },function(err,doc){
          if(err){
              res.json({
                 status:'1',
                 msg:err.message,
                 result:''
              })
          }else{
              res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
              })
          }
      })
  })
  //添加购物车商品数量
router.post('/cartEdit',function(req,res,next){//一切都是基于用户ID进行的，首先都拿用户的ID
    var userId = req.cookies.userId;
    var productId = req.body.productId;
    var productNum = req.body.productNum;
    var checked = req.body.checked;
    User.updateMany(//更新用户信息，根据用户信息和商品id去改数量,老的update已经放弃了，要么updateMany(多个),要么updateOne
        {'userId':userId,'cartList.productId':productId},//找到对应ID下的对应商品修改哪些东西
        {
         "cartList.$.productNum":productNum,//需要添加的内容
         "cartList.$.checked":checked,
        },
        function(err,doc){
            if(err){
                res.json({
                   status:'1',
                   msg:err.message,
                   result:''
                })
            }else{
                res.json({
                    status:'0',
                    msg:'',
                    result:'suc'
                })
            }
        }
    )
  })
  //用户checked状态
router.post('/editCheckAll',function(req,res,next){
      var userId = req.cookies.userId;
      var checkAll = req.body.checkAll?'1':'0';//true存1false存0
      User.findOne({userId:userId},function(err,user){
            if(err){
                res.json({
                status:'1',
                msg:err.message,
                result:''
                })
            }else{
                if(user){//如果查到有返回的用户,进行遍历他的cartList，给状态赋值
                    user.cartList.forEach((item)=>{
                        item.checked = checkAll;
                    })
                    user.save(function(err1,doc){//保存
                        if(err1){
                            res.json({
                               status:'1',
                               msg:err1.message,
                               result:''
                            })
                        }else{
                            res.json({
                                status:'0',
                                msg:'',
                                result:'suc'
                            })
                        }
                    })
                }
        
            }
      })
  })
  //获取用户的地址列表
router.get('/addressList',function(req,res,next){
      var userId = req.cookies.userId;
      User.findOne({userId:userId},function(err,doc){
            if(err){
                res.json({
                    status:'1',
                    msg:err.message,
                    result:''
                })
            }else{
                res.json({
                    status:'0',
                    msg:'',
                    result:doc.addressList
                })
            }
      })
  })
  //修改默认地址
router.post('/setDefault',function(req,res,next){
    var userId = req.cookies.userId;
    var addressId = req.body.addressId;
    if(!addressId){//判断前端有无传递过来ID
        res.json({
            status:'1003',
            msg:'addrsssId is null',
            result:''
        })
    }else{
            User.findOne({userId:userId},function(err,doc){
                    if(err){
                        res.json({
                        status:'1',
                        msg:err.message,
                        result:''
                        })
                    }else{
                        var addressList = doc.addressList;
                        addressList.forEach((item)=>{//遍历这个地址,找到前台传过来的ID把对应状态改成ture
                              if(item.addressId == addressId){
                                  item.isDefault = true;
                              }else{
                                  item.isDefault = false;
                              }
                        })
                        doc.save(function(err1,doc1){//保存一下数据
                            if(err){
                                res.json({
                                    status:'1',
                                    msg:err1.message,
                                    result:''
                                 })
                            }else{
                                res.json({
                                    status:'0',
                                    msg:'',
                                    result:''
                                 })
                            }
                        })
                    }
            })
       }
    
  })
  //删除用户地址确认框
router.post('/delAddress',function(req,res,next){
    var userId = req.cookies.userId;
    var addressId = req.body.addressId;
    User.update({//根据用户的ID删除地址列表上的对应的地址
        userId:userId
    },{
        $pull:{
            'addressList':{
                'addressId':addressId
            }
        }
    },function(err,doc){
          if(err){
              res.json({
                  status:'1',
                  msg:err.message,
                  result:''
              })
          }else{
              res.json({
                  status:'0',
                  msg:'',
                  result:''
              })
          }
    })
  })
  //订单支付接口
router.post('/payMent',function(req,res,next){
      var userId = req.cookies.userId;
      var orderTotal = req.body.orderTotal;
      var addressId = req.body.addressId;
      User.findOne({userId:userId},function(err,doc){
          if(err){
              res.json({
                  status:'1',
                  msg:err.message,
                  result:''
              })
          }else{
              var address = "";
              var goodsList = [];
              //获取当前用户的地址信息
              doc.addressList.forEach((item)=>{
                  if(addressId == item.addressId){
                      address = item;
                  }
              })
              //获取用户购物车的购买商品
              doc.cartList.forEach((item)=>{
                  if(item.checked == '1'){//打钩的
                      goodsList.push(item);
                  }
              })
              //生成订单的ID(orderId)，利用插件util
              var platform = '622';//这个是平台码
              var r1 = Math.floor(Math.random()*10);
              var r2 = Math.floor(Math.random()*10);
              var sysDate = new Date().Format('yyyyMMddhhmmss')//生成时间
              var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')//订单创建时间
              var orderId = platform + r1 + sysDate + r2;  //最先生成的是平台给的一个状态码，加上一些系统的时间   
              //创建用户的订单详情
              var order = {
                  orderId:orderId,//订单的ID
                  orderTotal:orderTotal,//订单总金额，参数中拿
                  addressInfo:address,//地址信息
                  goodsList:goodsList,//商品的列表
                  orderStatus:'1',//订单状态
                  createDate:createDate//创建时间
              }
              doc.orderList.push(order);
              doc.save(function(err1,doc1){
                   if(err){
                        res.json({
                            status:'1',
                            msg:err.message,
                            result:''
                        })
                   }else{
                        res.json({
                            status:'0',
                            msg:'',
                            result:{
                                orderId:order.orderId,
                                orderTotal:order.orderTotal
                            }
                        })
                   }
              })
          }
      })
  })
  //根据订单的ID查询订单的信息
router.get('/orderDetail',function(req,res,next){
      var userId = req.cookies.userId;
      var orderId = req.query.orderId;//拿到订单的ID,
      User.findOne({userId:userId},function(err,result){
          if(err){
              res.json({
                  status:'1',
                  msg:err.message,
                  result:''
              })
          }else{
              var orderList = result.orderList;//获取返回值，获取订单列表
              if(orderList.length > 0){
                var orderTotal = '';
                orderList.forEach((item)=>{
                    if(item.orderId == orderId){//如果遍历出来的ID==地址栏上传来的orderId
                         orderTotal = item.orderTotal
                    }
                });
                if(orderTotal > 0){//订单总金额要大于0
                    res.json({
                        status:'0',
                        msg:'',
                        result:{
                            orderId:orderId,
                            orderTotal:orderTotal
                        }
                    })
                }else{
                    res.json({
                        status:'12002',
                        msg:'无此订单',
                        result:''
                    })
                }
              }else{
                  res.json({
                      status:'12001',
                      msg:'当前用户未创建订单',
                      result:''
                  })
              }
          }
      })
  })
module.exports = router;