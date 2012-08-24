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

//
// The raw data we get from SEPTA, mostly for debugging purposes.
//
var raw_data = {};


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
* Return our raw data. This will probably be used for debugging.
*/
exports.getRawData = function(cb) {
	cb(null, raw_data);
}


/**
* This function fetches our data from SEPTA's API and then loops.
*/
function api_fetch_loop() {

	seq().seq(function() {
		api.go(this);

	}).seq(function(in_data) {

		//
		// If we have raw data, pull it out and store it in a separate variable.
		//
		if (in_data["raw_data"]) {
			raw_data["trains"] = in_data["raw_data"];
			delete in_data["raw_data"];
		}

		//
		// Store our main data in the "trains" index.
		// Yes, I may be doing stats on busses or light rail at some 
		// future point... :-)
		//
		data["trains"] = in_data;

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



