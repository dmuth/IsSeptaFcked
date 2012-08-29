/**
* This module is used for getting human-readable text from our 
* Regional Rail data.
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
exports.getMessage = function(status) {

	var retval = "";

	if (status == "fucked") {
		retval = "You may want to look into alternate forms of transportation.";

	} else if (status == "a little fucked") {
		retval = "Check back here in a few minutes to see if things improve.";

	} else if (status == "not fucked") {
		retval = "All trains are running on or close to on time!";

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
exports.checkAge = function(data) {

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

} // End of checkAge()



