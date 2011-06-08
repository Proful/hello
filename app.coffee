express = require("express")
redis = require("redis")

redis_client = redis.createClient()

app = module.exports = express.createServer()
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(__dirname + "/public")

app.configure "development", ->
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

app.configure "production", ->
  app.use express.errorHandler()

app.get "/songs", (req,res) ->
  render_now = false
  redis_client.get "global:nextSongId", (err,reply) ->
    songs=[]
    for uid in [1..reply]
      console.log uid
      redis_client.get "uid:"+uid+":songname",(err1,reply1) ->
        console.log reply1
        songs[uid] = reply1
        console.log songs.length
        if songs.length is reply
          console.log "Songs: " + songs
          res.render "songs", title: "Listing of all the songs",song_name: songs

app.get "/", (req, res) ->
  res.render "index", title: "Excellent Song Suggest"

app.post "/", (req, res) ->
  redis_client.incr "global:nextSongId", (err,reply) ->
    console.log "song id: " + reply
    redis_client.set "songname:"+req.body.song.name+":id",reply,redis.print
    redis_client.set "uid:"+reply+":songname",req.body.song.name,redis.print

  title= "Song posted sucessfully"
  res.render "new", song_name: req.body.song.name,title: title

app.listen 3000
console.log "Express server listening on port %d", app.address().port
