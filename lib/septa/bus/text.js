/**
* This module is used for getting human-readable text from our 
* Regional Rail data.
*
* LISTEN UP!  In case it's not clear what I'm trying to, my intent
* is to run the code here as little as possible.  In fact, I'd ideally
* like to run it only once per successful API call to SEPTA's API.
* That way, all page loads only cause pre-generated data to be read,
* and no calculations to be run over and over.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


var util = require("util");


/**
* This function checks our status, and decides what CSS class to tell our 
* template to use.
*/
exports.getStatusClass = function(status) {

	var retval = "status-unknown";
	if (status == "not fucked") {
		retval = "status-not-fcked";

	} else if (status == "a little fucked") {
		retval = "status-a-little-fcked";

	} else if (status == "fucked") {
			retval = "status-fcked";

	} 

	return(retval);

} // End of getStatusClass()


/**
* Get our message to display, based on our current status.
*/
exports.getMessage = function(data) {

	var retval = "";
	var status = data["status"]["status"];

	var num_total = data["num"];
	var num_suspended = data["num_suspended"];

	if (status == "fucked") {
		retval = util.format(
			"%d out of %d bus lines are suspended! You may want to look into alternate forms of transportation.",
			num_suspended, num_total
			);

	} else if (status == "a little fucked") {
		retval = util.format(
			"%d out of %d bus lines are suspended! You may want to look into alternate forms of transportation.",
			num_suspended, num_total
			);

	} else if (status == "not fucked") {
		retval = util.format(
			"All %d bus lines that I know about are running!",
			num_total);

	} else if (status == "(no data found)") {
		//
		// This is if we don't yet know 
		//
		retval = "No train data was returned to me by SEPTA's API.";

	} else if (status == "(unknown)") {
		//
		// (unknown) is the initial status when this app is started.
		// We should rarely see it in production.
		//
		retval = "Unable to retrieve train status in the last few minutes.";

	}

	return(retval);

} // End of getMessage()


/**
* Check the age of our data.  If it's too old, mark it as such.
*
* @param object data Our array of train data. Passedin by reference.
*/
exports.checkAge = function(data, cb) {

		//
		// Compute the age of the data in seconds
		//
		var time_t = Math.round(new Date().getTime() / 1000);
		var age = time_t - data["time_t"];
		var max_age = 60 * 10;
		//var max_age = 1; // Debugging

		if (data["time_t"] != -1
			&& age > max_age) {
				var minutes = Math.round(max_age / 60);

            	data["status"]["status"] = "(unknown)";
            	data["status"]["late"] = [];

				var message = util.format(""
					+ "Our last data from SEPTA is over %d minutes old. "
					+ "We're not sure what's going on. "
					+ "Please try refreshing this page again shortly.",
					minutes
					);
				console.log(message);
				data["status"]["message"] = message;

				//
				// Better update our CSS, too.
				//
				data["status"]["css_class"] = exports.getStatusClass(data["status"]["status"]);

        }

		cb(null, age);

} // End of checkAge()


/**
* Convert an array of suspended busses into an array of human-readable statuses 
* that can be put on the website.
*
* @param array data Our array of late trains
*/
exports.getSuspendedNames = function(data) {

	var retval = [];

	var regexp = /bus_route_([0-9a-zA-Z]+)/;

	for (var k in data) {

		var name = data[k];
		var results = name.match(regexp);
		var route_number = results[1];

		var message = util.format("Bus route %s is currently suspended",
			route_number
			);
		retval.push(message);

	}

	return(retval);

} // End of getSuspendedNames()



