/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


var septa = require("../lib/septa/rr/main.js");
var util = require("util");


/**
* This function is our main entry point.
*/
exports.go = function(request, response) {

	var retval = "";

	septa.getRawData(function(error, in_data) {

		var data = {};
		data["data"] = in_data;
		data["_comment"] = "Raw Regional Rail data from SEPTA";

		retval += JSON.stringify(data, null, 4);

		//
		// Make this readable in the web browser.
		//
		response.header("Content-Type", "text/json");

		response.send(retval);

	});

} // End of go()




