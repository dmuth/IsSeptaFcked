/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var util = require("util");
var septa = require("../lib/septa/main.js");


exports.go = function(request, response) {

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

		var status_class = getStatusClass(status["status"]);
		var message = getMessage(status["status"], max_age);

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

} // End of go()


/**
* This function checks our status, and decides what CSS class to tell our 
* template to use.
*/
function getStatusClass(in_status) {

	var retval = "status-unknown";
	if (in_status == "not fucked") {
		retval = "status-not-fcked";

	} else if (in_status == "a little fucked") {
		retval = "status-a-little-fcked";

	} else if (in_status == "fucked") {
			retval = "status-fcked";

	} 

	return(retval);

} // End of getStatusClass()


/**
* Get our message to display, based on our current status.
*/
function getMessage(in_status, max_age) {

	var retval = "";

	if (in_status == "(unknown)") {
		var minutes = Math.round(max_age / 60);
		retval = util.format(
				"Our last successful data from SEPTA is over %d minutes old. "
				+ " We're not sure what's going on. "
				+ "Please try refreshing this page again shortly.",
				minutes
				);

	} else if (in_status == "fucked") {
		retval = "You may want to look into alternate forms of transportation.";

	} else if (in_status == "a little fucked") {
		retval = "Check back here in a few minutes to see if things improve.";

	} else if (in_status == "not fucked") {
		retval = "All trains are running on or close to on time!";

	}

	return(retval);

} // End of getMessage()


