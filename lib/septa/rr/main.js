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
// Our module to convert our data to text
//
var text = require("./text.js");


//
// Our latest copy of the train statuses.
//
var _data = {};

//
// The raw data we get from SEPTA, mostly for debugging purposes.
//
var _raw_data = {};


/**
* This function is run at application boot time, and starts the 
* process of fetching data from SEPTA's API.
*/
exports.boot = function() {

	//
	// Start fetching our data right away!
	//
	api_fetch_loop();

	//
	// Start checking the age of our data after our first fetch
	//
	age_check_loop();

} // End of boot()


/**
* Return our data to an outside source.
*/
exports.getData = function(cb) {

	//
	// Make a copy of this data first, since we don't want an outside 
	// caller to modify data that's returned by reference.
	//
	var data = JSON.parse(JSON.stringify(_data));
	cb(null, data);

} // End of getData()


/**
* Return our raw data. This will probably be used for debugging.
*/
exports.getRawData = function(cb) {
	//
	// Make a copy of this data first, since we don't want an outside 
	// caller to modify data that's returned by reference.
	//
	var data = JSON.parse(JSON.stringify(_raw_data));
	cb(null, data);
}


/**
* This function fetches our data from SEPTA's API and then loops.
*/
function api_fetch_loop() {

	seq().seq(function() {
		api.go(this); // Debugging - Comment this out to make status "(unknown)"

	}).seq(function(data) {
		//
		// We have our data.  Process it!
		//
		processData(data, this);

	}).seq(function(data) {
		//
		// Store our main data 
		//
		_data = data;

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

	//var timeout_sec = 60 * 5;
	var timeout_sec = 60 * 1;
	//var timeout_sec = 1; // Debugging
	var timeout = timeout_sec * 1000;

	var message = util.format("Will fetch data again in %d seconds.",
		timeout_sec);
	console.log("main.js: api_fetch_loop(): " + message);

	setTimeout(function() {
		api_fetch_loop();
		}, timeout);

} // End of schedule_api_fetch_loop()


/**
* This function calls itself in a delayed loop, and checks the age of 
* our data.
*/
function age_check_loop() {

	var sec = 60 * 5;
	//var sec = 1; // Debugging
	var ms = sec * 1000;

	setTimeout(function() {
		text.checkAge(_data);
		console.log(util.format("Scheduling data to be checked again in %d sec", sec));
		age_check_loop();
		}, ms);

} // End of age_check_loop()


/**
* This function returns trains which are late.
*
* @param array data Our list of trains to check
*
* @param integer min The minimum minutes a train must be late before we care
*
* @param integer max The maximum number of minutes a train must be late 
*	after which we DON'T care.  This is useful when checking to see if 
*	trains are only a few minutes late, for example.
*
* @return array An array of trains which are late.
*/
function getLate(data, min, max) {

	var retval = [];

	for (var k in data) {
		var row = data[k];
		var late = row["late"];

		if (late >= min && late <= max) {
			retval.push(row);
		}
	}

	return(retval);

} // End of getLate()


/**
* Logic to determine the over fuckedness of Regional Rail.
*
* @param array data Our associative array of late trains.
*
* @return string How fucked is Regional Rail?
*/
function getIsFucked(data) {

	var retval = "not fucked";

	if (data["10"].length >= 1) {
		retval = "a little fucked";
	} 

	if (data["30"].length >= 1) {
		retval = "fucked";
	}

	return(retval);

} // End of getIsFucked()


/**
* This function initializes our data array.
*/
function init(time, time_t) {

	var retval = {};
	retval["num"] = 0;
	retval["time"] = time;
	retval["time_t"] = time_t;
	retval["late"] = {};
	retval["status"] = {};
	retval["status"]["message"] = text.getMessage(retval);
	retval["status"]["css_class"] = text.getStatusClass(retval["status"]["status"]);

	return(retval);

} // End of init()


/**
* Actually process our raw data, determine how many trains 
* are late, levels of "fuckedness", etc.
*/
function processData(data, cb) {

	//
	// Pull out a copy of our raw data, then delete it
	//
	_raw_data = data["raw_data"];
	delete data["raw_data"];

	//
	// Determine which trains are late past certain thresholds.
	//
	data["late"] = {};
	data["late"]["10"] = getLate(data["data"], 10, 29);
	data["late"]["30"] = getLate(data["data"], 30, 86400);

	//
	// Now create human-readable statuses
	//
	//data["num"] = 0; // Debugging - set for "(not sure)"

	data["status"] = {};
	if (data["num"] >= 1) {
		data["status"]["status"] = getIsFucked(data["late"]);
		data["status"]["late"] = [];

		var late = text.getLateTrainNames(data["late"]["10"]);
		for (var k in late) {
			var row = late[k];
			data["status"]["late"].push(row);
		}

		var late = text.getLateTrainNames(data["late"]["30"]);
		for (var k in late) {
			var row = late[k];
			data["status"]["late"].push(row);
		}

	} else {
		data["status"]["status"] = "(no data found)";

	}
		
	data["status"]["css_class"] = text.getStatusClass(data["status"]["status"]);
	data["status"]["message"] = text.getMessage(data);

	//console.log(JSON.stringify(data["status"], null, 4)); // Debugging

	cb(null, data);

} // End of processData()


/**
* Prime our data array.  This is done becuase normally during startup
* there is about a 300ms delay between when the webserver starts 
* listening and we fetch the data from SEPTA.
*
* Because of that, we want the website to display something sane during 
* that time, or else we have a race condition.  So this funciton, excuted 
* on the initial require() of this script, will pre-populate our data 
* array with something sensible.
*/
function prime() {

	retval = init("never", -1);

	_data = retval;

} // End of prime()

//
// Now call this directly. Because there are no callbacks in prime(), 
// this will fully execute before the require() on this module finishes.
//
prime();



