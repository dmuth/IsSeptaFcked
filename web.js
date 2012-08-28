
var express = require('express');


// TODO:
//   request: headers: 'x-forwarded-for': 'real IP address'
var app = express.createServer(express.logger());
var seq = require("seq");
var septa = require("./lib/septa/main.js");
var util = require("util");


//
// Associative array for all of our routes
//
var routes = {};
routes["main"] = require("./routes/main.js");
routes["api"] = require("./routes/api.js");
routes["api_raw"] = require("./routes/api_raw.js");
routes["echo"] = require("./routes/echo.js");

app.get("/", routes["main"].go);
app.get("/api", routes["api"].go);
app.get("/api/raw", routes["api_raw"].go);
app.get("/echo", routes["echo"].go);


//
// Set this up, mostly for our favicon.
//
app.use(express.static(__dirname + '/public'));

//
// Set our Views directory for Jade.
//
app.set("views", __dirname + "/views");


//
// Start up the SEPTA sub-system, specifically fetching from the API.
//
septa.boot();


//
// Actually start listening.
//
var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});


