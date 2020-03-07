/**
* This module is used for interacting with SEPTA's API.
*
* @author Douglas Muth <http://www.dmuth.org/>
*/


//
// Our module that actually fetches and transforms the data from the API.
//
var api = require("./api.js");

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


//
// This variable holds the value of setTimeout() for fetching 
// SEPTA's data.  It may be cleared and another setTimeout() call
// made if the train data is too hold (which would signify a 
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

	api.go(this).then( (data) => {
		//
		// We have our data.  Process it!
		//

		//data = null; // Debugging - Uncomment this to make status "(unknown)"
		return(processData(data));

	}).then( (data) => {
		//
		// Store our main data 
		//
		_data = data;

		schedule_api_fetch_loop();

	}).catch(function(error) {
		console.log("ERROR: api.go(): " + error);
		schedule_api_fetch_loop();

	});

} // End of api.go()


/**
* Schedule the next call to api_fetch_loop().
*/
function schedule_api_fetch_loop() {

	//var timeout_sec = 60 * 5;
	var timeout_sec = 60 * 1;
	//var timeout_sec = 1; // Debugging - Uncomment this to timeout
	var timeout = timeout_sec * 1000;

	var message = util.format("Will fetch RR data again in %d seconds.",
		timeout_sec);
	console.log("main.js: api_fetch_loop(): " + message);

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

	var sec = 60 * 5;
	//var sec = 1; // Debugging - Uncomment this to check the data age way more often
	var ms = sec * 1000;

	//
	// Max allowable age of the data before we care.
	//
	var max_age = 60 * 10;
	//var max_age = 5; // Debugging - Uncomment this to expire the data way more often

	setTimeout(function() {

		text.checkAge(_data).then( (age) => {

			console.log(util.format("Scheduling RR data to be checked again in %d sec", sec));
			age_check_loop();

			if (age > max_age) {
				var message = util.format(
					"Whoa!  RR data is %d seconds old. (%d sec max) "
					+ "Clearing out old timeout and calling "
					+ "api_fetch_loop right now!",
					age, max_age
					);
				console.log(message);
				clearTimeout(api_fetch_timeout);
				api_fetch_loop();

			} else {
				var message = util.format(
					"RR data is %d seconds old, which is less than %d seconds. We're cool.",
					age, max_age
					);
				console.log(message);
			}

		}).catch(function(error) {
			console.log("ERROR: api.age_check_loop(): " + error);

		});

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
* This function gets the average number of late minutes for all trains over 10 minutes late.
* I am aware that this number doesn't reflect all late trains.  If I did include them that
* would cause the average to skew towards numbers under 10, which isn't quite what I want here.
*
* @param object data Our various late trains.
*
* @return float The average number of minutes late.
*/
function getLateAverage(data) {

	retval = 0;

	num_trains = 0;
	num_minutes_late = 0;

	for (var min in data) {

		var trains = data[min];

		for (train in trains) {
			late = trains[train]["late"];

			num_trains++;
			num_minutes_late += late;

		}
	}

	retval = num_minutes_late / num_trains;

	//
	// Grab only the first decimal point in the average.
	//
	//retval = 46.33333333; // Debugging - Uncomment this to test rounding
	retval = parseInt(retval * 10) / 10;

	return(retval);

} // End of getLateAverage()


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

	if (data["30"].length >= 5) {
		retval = "turbo fucked";
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
	message = text.getMessage(retval)
	retval["status"]["message"] = message["message"];
	retval["status"]["summary"] = message["summary"];
	retval["status"]["css_class"] = text.getStatusClass(retval["status"]["status"]);

	return(retval);

} // End of init()


/**
* Actually process our raw data, determine how many trains 
* are late, levels of "fuckedness", etc.
*/
function processData(data, cb) {
	return(new Promise( (resolve, reject) => {

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
	// Get average minutes late for any train over 10 minutes late.
	//
	data["late_average"] = getLateAverage(data["late"]);

	//
	// Now create human-readable statuses
	//
	//data["num"] = 0; // Debugging - Uncomment this for "(Not Data Found)"

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
	message = text.getMessage(data);
	//console.log("RR Message: ", message); // Debugging - Uncomment to display status messages when the app starts.
	data["status"]["summary"] = message["summary"];
	data["status"]["message"] = message["message"];

	//console.log(JSON.stringify(data["status"], null, 4)); // Debugging

	resolve(data);

	}));
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



