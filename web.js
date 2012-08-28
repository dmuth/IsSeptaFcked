
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
routes["api"] = require("./routes/api.js");
routes["api_raw"] = require("./routes/api_raw.js");
routes["echo"] = require("./routes/echo.js");

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

app.get("/", function(request, response) {

	seq().seq(function() {
		septa.getData(this);

	}).seq(function(data) {
		var status = data["trains"]["status"];

		var message = "";

		var time_t = Math.round(new Date().getTime() / 1000);
		var age = time_t - data["trains"]["time_t"];
		var max_age = 60 * 10;
		//var max_age = 1; // Debugging

		//
		// If our data is too old, then we're going to ignore it.
		//
		if (age > max_age) {
			status["status"] = "(unknown)";
			status["late"] = [];
		}


		var status_class = "status-unknown";
		if (status["status"] == "not fucked") {
			status_class = "status-not-fcked";

		} else if (status["status"] == "a little fucked") {
			status_class = "status-a-little-fcked";

		} else if (status["status"] == "fucked") {
			status_class = "status-fcked";

		} else {
			var minutes = Math.round(max_age / 60);
			message = 
				util.format(
					"Our last successful data from SEPTA is over %d minutes old. "
					+ " We're not sure what's going on. "
					+ "Please try refreshing this page again shortly.",
					minutes
					);

		}

		//
		// Jade documentation can be found at:
		// https://github.com/visionmedia/jade
		//
		response.render("index.jade", {
				"title": "Is SEPTA Fucked?",
				"status": status["status"],
				"status_class": status_class,
				"late": status["late"],
				"message": message,
			});

	}).catch(function(error) {
		console.log("ERROR: web.js: /: " + error);

	});

});


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


