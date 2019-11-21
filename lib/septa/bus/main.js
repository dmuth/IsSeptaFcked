/**
* This module is used for interacting with the SEPTA Bus API.
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
// Our latest copy of the bus statuses.
//
var _data = {};

//
// The raw data we get from SEPTA, mostly for debugging purposes.
//
var _raw_data = {};


//
// This variable holds the value of setTimeout() for fetching 
// SEPTA's data.  It may be cleared and another setTimeout() call
// made if the bus data is too old (which would signify a 
// request timing out)
//
var api_fetch_timeout;


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

	var timeout_sec = 60 * 5;
	//var timeout_sec = 1; // Debugging - Uncomment to fetch way more often
	var timeout = timeout_sec * 1000;

	var message = util.format("Will fetch Bus data again in %d seconds.",
		timeout_sec);
	console.log("bus/main.js: api_fetch_loop(): " + message);

	api_fetch_timeout = setTimeout(function() {
		api_fetch_loop();
		}, timeout);

} // End of schedule_api_fetch_loop()


/**
* This function calls itself in a delayed loop, and checks the age of 
* our data.
*
* One of its additional functions involves checking to see if the 
* data is too old, and possibly out of date.  This is a byproduct 
* of node.js's asynchronous I/O gladly waiting forever on a TCP 
* connection.  so if the data is too old, our old timeout is 
* killed off (and presumably the connection, but I am not 100% 
* sure this won't leak file descriptors), and the fetch funciton 
* is called right away.
*/
function age_check_loop() {

	//
	// How long before calling ourselves again.
	//
	var sec = 60 * 10;
	//var sec = 5; // Debugging - Uncomment to check age more often
	var ms = sec * 1000;

	//
	// Max allowable age of the data before we care.
	//
	var max_age = 60 * 20;
	//var max_age = 2; // Debugging - Uncomment to expire much quicker

	setTimeout(function() {

		seq().seq(function() {
			text.checkAge(_data, this);

		}).seq(function(age) {
			console.log(util.format("Scheduling Bus data to be checked again in %d sec", sec));
			age_check_loop();

			if (age > max_age) {
				var message = util.format(
					"Whoa!  Bus data is %d seconds old. (%d sec max) "
					+ "Clearing out old timeout and calling "
					+ "api_fetch_loop right now!",
					age, max_age
					);
				console.log(message);
				clearTimeout(api_fetch_timeout);
				api_fetch_loop();

			} else {
				var message = util.format(
					"Bus data is %d seconds old, which is less than %d seconds. We're cool.",
					age, max_age
					);
				console.log(message);
			}

		});

		}, ms);

} // End of age_check_loop()


/**
* Logic to determine the overall fuckedness of busses.
*
* @param integer num_suspended How many busses are suspended?
*
* @return string How fucked is the SEPTA bus system?
*/
function getIsFucked(num_suspended) {

	var retval = "not fucked";

	if (num_suspended >= 1 && num_suspended <= 5) {
		retval = "a little fucked";

	} else if (num_suspended > 5) {
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
	retval["status"]["status"] = "(unknown)";
	message = text.getMessage(retval)
	retval["status"]["message"] = message["message"];
	retval["status"]["summary"] = message["summary"];
	retval["status"]["css_class"] = text.getStatusClass(retval["status"]["status"]);

	return(retval);

} // End of init()


/**
* Actually process our raw data, determine how many buses
* are suspended, levels of "fuckedness", etc.
*/
function processData(data, cb) {

	//
	// Pull out a copy of our raw data, then delete it
	//
	_raw_data = data["raw_data"];
	delete data["raw_data"];

	//
	// Now create human-readable statuses
	//
	//data["num"] = 0; // Debugging - set for "(not sure)"

	data["status"] = {};

	if (data["num"] >= 1) {
		data["status"]["status"] = getIsFucked(data["num_suspended"]);
		data["status"]["suspended"] = text.getSuspendedNames(data["suspended"]);

	} else {
		data["status"]["status"] = "(no data found)";

	}
		
	data["status"]["css_class"] = text.getStatusClass(data["status"]["status"]);
	message = text.getMessage(data);
	//console.log("Bus Message: ", message); // Debugging - Uncomment to display status messages when the app starts.
	data["status"]["summary"] = message["summary"];
	data["status"]["message"] = message["message"];

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



