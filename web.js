
var express = require('express');

//
// Create an IP token for the logging system that lists the original IP, 
// if there was a proxy involved.
//
express.logger.token("ip", function(request) {

	var retval = "";

	if (request["headers"] && request["headers"]["x-forwarded-for"]) {
		//
		// Proxied request
		//
		retval = request["headers"]["x-forwarded-for"];

	} else if (request["socket"] && request["socket"]["remoteAddress"]) {
		//
		// Direct request
		//
		retval = request["socket"]["remoteAddress"];

	} else if (request["socket"] && request["socket"]["socket"] 
		&& request["socket"]["socket"]["remoteAddress"]) {
		//
		// God only knows what happened here...
		//
		retval = request["socket"]["socket"]["remoteAddress"];

	}
	
	return(retval);

});


//
// Tweak our default logging format to include the new IP token.
//
express.logger.format("default", 
	':ip :remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
	);

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


