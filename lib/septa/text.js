/**
* This module is used for getting human-readable text from our 
* Regional Rail data.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

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
exports.getMessage = function(status, max_age) {

	var retval = "";

	if (status == "(not sure)") {
		var minutes = Math.round(max_age / 60);
		retval = util.format(
				"Our last successful data from SEPTA is over %d minutes old. "
				+ " We're not sure what's going on. "
				+ "Please try refreshing this page again shortly.",
				minutes
				);

	} else if (status == "fucked") {
		retval = "You may want to look into alternate forms of transportation.";

	} else if (status == "a little fucked") {
		retval = "Check back here in a few minutes to see if things improve.";

	} else if (status == "not fucked") {
		retval = "All trains are running on or close to on time!";

	} else if (status == "(unknown)") {
		retval = "Unable to retrieve train status in the last few minutes.";

	}

	return(retval);

} // End of getMessage()


