const app = require('express')();
var SpotifyWebApi = require('spotify-web-api-node');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var config = require('./config.json');
const fs = require('fs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/socket.io/index.html');
  });

var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(config.token);
spotifyApi.setRefreshToken(config.RefreshToken);
spotifyApi.setClientId(config.ClientId);
spotifyApi.setClientSecret(config.ClientSecret);

setInterval(() => {
    spotifyApi.getMyCurrentPlaybackState()
        .then((data) => {
            io.emit('upd', data)
        }, function(err) {
            console.log(err.body.error)
            if(err.body.error.message == 'The access token expired'){
                spotifyApi.refreshAccessToken().then(
                    function(data) {
                      config.token = data.body['access_token'];
                      fs.writeFile('./config.json', JSON.stringify(config), function writeJSON(err) {
                        if (err) return console.log(err);
                      });
                      spotifyApi.setAccessToken(data.body['access_token']);
                    },
                    function(err) {
                      console.log('Could not refresh access token', err);
                    }
                  );
            }
        })
}, 500)

server.listen(80);