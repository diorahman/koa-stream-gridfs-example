var koa = require ('koa');
var app = koa();

// GET /:id
app.use(function * (){
  this.body = this.gfs.createReadStream({ _id : this.path.substr(1)});
});

module.exports = app;