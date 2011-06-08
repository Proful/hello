(function() {
  var app, express, redis, redis_client;
  express = require("express");
  redis = require("redis");
  redis_client = redis.createClient();
  app = module.exports = express.createServer();
  app.configure(function() {
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express.static(__dirname + "/public"));
  });
  app.configure("development", function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.configure("production", function() {
    return app.use(express.errorHandler());
  });
  app.get("/songs", function(req, res) {
    var render_now;
    render_now = false;
    return redis_client.get("global:nextSongId", function(err, reply) {
      var songs, uid, _results;
      songs = [];
      _results = [];
      for (uid = 1; 1 <= reply ? uid <= reply : uid >= reply; 1 <= reply ? uid++ : uid--) {
        console.log(uid);
        _results.push(redis_client.get("uid:" + uid + ":songname", function(err1, reply1) {
          console.log(reply1);
          songs[uid] = reply1;
          console.log(songs.length);
          if (songs.length === reply) {
            console.log("Songs: " + songs);
            return res.render("songs", {
              title: "Listing of all the songs",
              song_name: songs
            });
          }
        }));
      }
      return _results;
    });
  });
  app.get("/", function(req, res) {
    return res.render("index", {
      title: "Excellent Song Suggest"
    });
  });
  app.post("/", function(req, res) {
    var title;
    redis_client.incr("global:nextSongId", function(err, reply) {
      console.log("song id: " + reply);
      redis_client.set("songname:" + req.body.song.name + ":id", reply, redis.print);
      return redis_client.set("uid:" + reply + ":songname", req.body.song.name, redis.print);
    });
    title = "Song posted sucessfully";
    return res.render("new", {
      song_name: req.body.song.name,
      title: title
    });
  });
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}).call(this);
