
var express = require('express');

var app = express.createServer(express.logger());

//
// Associative array for all of our routes
//
var routes = {};
routes["echo"] = require("./routes/echo.js");


app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get("/echo", routes["echo"].go);


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});





