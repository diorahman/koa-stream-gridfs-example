var app = require ('./app');
var fs = require ('fs');
var request = require ('supertest');
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var db = new mongo.Db('test', new mongo.Server("127.0.0.1", 27017), { safe : false });
var gridfs, id;

function createFile(done){
  var writeStream = gfs.createWriteStream({ filename : 'balabala', mode : 'w'});
  fs.createReadStream('./app.js').pipe(writeStream);
  writeStream.on('error', done);
  writeStream.on('close', function(file){
    done(null, file);
  });
}

function removeFile(done){
  gfs.remove({ _id : id }, done);
}

function prepare(done){
  db.open(function(err){
    if (err) {
      db.close();
      return done(err);
    }
    gfs = Grid(db, mongo);
    createFile(function(err, file){
      if (err) return done(err);
      id = file._id;
      // unshift in the gfs
      app.middleware.unshift(function * (next){
        this.gfs = gfs;
        yield next;
      })
      done();
    });
  });
}

function cleanup(done){
  removeFile(done);
}

before (prepare);
after (cleanup);

describe('Read a gfs file', function(){
  it ('read the file', function(done){
    request.agent(app.listen())
    .get('/' + id)
    .expect (200)
    .end(function(err, res){
      done(err);
    })
  });  
})