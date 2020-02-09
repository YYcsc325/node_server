var express = require('express');
var router = express.Router();
var Goods = require('../db/goods');//这边先引入定义好的数据集

//查询商品列表数据
router.get('/list',function(req,res,next){
    let page = parseInt(req.query.page);
    let pageSize = parseInt(req.query.pageSize);
    let priceLevel = req.query.priceLevel;//用于价格分页查询
    let sort = req.query.sort;
    let skip = (page-1) * pageSize;
    let priceGt = '',priceLte = '';
    let param = {};
    if(priceLevel != 'all'){
       switch(priceLevel){
         case '0': priceGt = 0;priceLte = 100;break;
         case '1': priceGt = 100;priceLte = 500;break;
         case '2': priceGt = 500;priceLte = 1000;break;
         case '3': priceGt = 1000;priceLte = 5000;break;
       }
       param = {//价格区间的计算地区
         salePrice:{
           $gt:priceGt,
           $lte:priceLte
         }
       }
    }
    let goodsModel = Goods.find(param).skip(skip).limit(pageSize);//返回值调用方法进行排序,skip是跳过几条，显示几条
    goodsModel.sort({'salePrice':sort});//对价格进行排序,sort为1为升序，-1为降序
    goodsModel.exec(function(err,doc){//在当前数据集下查找
      if(err){
          res.json({
            status:'1',
            msg:err.message
          })
      }else{
        res.json({
          status:'0',
          mag:'',
          result:{
            count:doc.length,//doc就是查出来的列表集合
            list:doc
          }
        })
      }
    })
})
//加入到购物车
router.post("/addCart",(req,res,next)=>{
     let userId = '100000077';
     let productId = req.body.productId;
     let User = require('../db/user');//导入定义
     User.findOne({userId:userId},function(err,userDoc){//先查有没有这个用户，判断用户是否存在
       if(err){
         res.json({
           status:"1",
           msg:err.message
         })
       }else{
              console.log("userDoc"+userDoc);
                if(userDoc){//如果存在当前用户的的购物车列表
                  let goodsItem = '';//进来一开始都默认为空
                  userDoc.cartList.forEach(function(item){
                    if(item.productId == productId){//如果已经这个对应的商品了
                      goodsItem = item;//把这个商品存一下
                      item.productNum ++;   //商品数量++
                    }
                  })
                if(goodsItem){//相当于数据发生了变动,如果有新的添加
                    userDoc.save(function(err2,doc2){//存入数据库，把当前信息
                      if(err2){
                        res.json({
                          status:"1",
                          msg:err2.message
                        })
                      }else{
                          res.json({
                            status:'0',
                            msg:'',
                            result:'suc'
                          })
                      }
                    })
              }else{
                  Goods.findOne({productId:productId},function(err1,doc1){//在查对应用户的对应商品，如果没有需要从新插入
                    if(err1){
                      res.json({
                        status:"1",
                        msg:err1.message
                      })
                    }else{
                      if(doc1){
                        doc1.productNum = 1;//选中产品数量
                        doc1.checked = 1;//选中状态
                        userDoc.cartList.push(doc1);//在当前用户的购物车下插入这条信息
                        userDoc.save(function(err2,doc2){//存入数据库
                          if(err2){
                            res.json({
                              status:"1",
                              msg:err2.message
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
               }
           }
        }
     })
})
module.exports = router;