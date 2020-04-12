var express = require('express');
var app = express();

app.listen(3000, function()
{
  console.log("Listening on port 3000!")
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendfile('index.html');
});
