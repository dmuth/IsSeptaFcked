/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var util = require("util");
var septa = require("../lib/septa/main.js");


var production = false;


/**
* This function is called when the module is first loaded.
*
* @param boolean in_production Are we currently in production mode?
*/
module.exports = function(in_production) {

	var retval = {};

	production = in_production;

	retval["go"] = go;

	return(retval);

} // End of exports()


function go(request, response) {

	var time_t = new Date().getTime() / 1000;
	seq().seq(function() {
		septa.getData(this);

	}).seq(function(data) {
		var status = data["trains"]["status"];

		var message = "";

		var age = Math.round(time_t) - data["trains"]["time_t"];
		var max_age = 60 * 10;
		//var max_age = 1; // Debugging

		//
		// If our data is too old, then we're going to ignore it.
		//
		if (age > max_age) {
			status["status"] = "(unknown)";
			status["late"] = [];
		}

		//
		// Jade documentation can be found at:
		// https://github.com/visionmedia/jade
		//
		response.render("index.jade", {
				"title": "Is SEPTA Fucked?",
				"train_status": status["status"],
				"train_status_time": data["trains"]["time"],
				"status_class": status["css_class"],
				"late": status["late"],
				"message": status["message"],
				"production": production,
				"refresh": 300,
			}, this);

	}).seq(function(html) {
		//
		// Send our response
		//
		response.send(html);

		//
		// Now calculate how long it took to load and render 
		// our text, and print that out.
		//
		var time_t_after = new Date().getTime() / 1000;
		var diff = Math.round((time_t_after - time_t) * 1000) / 1000;
		var message = util.format("Page rendered in %d seconds", diff);
		console.log(message);

	}).catch(function(error) {
		console.log("ERROR: web.js: /: " + error);

	});

} // End of go()


