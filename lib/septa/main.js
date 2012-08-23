/**
* This module is used for interacting with SEPTA's API.
*
* @author Douglas Muth <http://www.dmuth.org/>
*/


//
// Our module that actually fetches and transforms the data from the API.
//
var api = require("./api.js");

var seq = require("seq");
var util = require("util");


//
// Our latest copy of the train statuses.
//
var data = {};


/**
* This function is run at application boot time, and starts the 
* process of fetching data from SEPTA's API.
*/
exports.boot = function() {

	api_fetch_loop();

} // End of boot()


/**
* Return our data to an outside source.
*/
exports.getData = function(cb) {
	cb(null, data);
}


/**
* This function fetches our data from SEPTA's API and then loops.
*/
function api_fetch_loop() {

	seq().seq(function() {
		api.go(this);

	}).seq(function(in_data) {

		var retval = {};
		retval["trains"] = in_data;
		retval["time"] = new Date().toString();

		data = retval;

		schedule_api_fetch_loop();

	}).catch(function(error) {
		console.log("ERROR: " + error);
		schedule_api_fetch_loop();

	});

} // End of api.go()


/**
* Schedule the next call to api_fetch_loop().
*/
function schedule_api_fetch_loop() {

	var timeout_sec = 60 * 5;
	//var timeout_sec = 1; // Debugging
	var timeout = timeout_sec * 1000;

	var message = util.format("Will fetch data again in %d seconds.",
		timeout_sec);
	console.log("main.js: api_fetch_loop(): " + message);

	setTimeout(function() {
		api_fetch_loop();
		}, timeout);

} // End of schedule_api_fetch_loop()



