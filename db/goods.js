var mongoose = require('mongoose')//引入mongoose
var Schema = mongoose.Schema;//表模型

var produtSchema = new Schema({//整个调出去
  "productId":{type:String},
  "productName":String,
  "salePrice":Number,
  "checked":String,
  "productNum":Number,
  "productImage":String//商品图片
});

module.exports = mongoose.model('Good',produtSchema);
