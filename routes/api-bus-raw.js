/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


var septa = require("../lib/septa/bus/main.js");
var util = require("util");


/**
* This function is our main entry point.
*/
exports.go = function(request, response) {

	var retval = "";

	septa.getRawData(function(error, in_data) {

		var data = {};
		data["data"] = in_data;
		data["_comment"] = "Raw bus data from SEPTA";

		retval += JSON.stringify(data, null, 4);

		//
		// As per RFC 4627, this should application/json so that apps can consume it.
		//
		response.header("Content-Type", "application/json");

		response.send(retval);

	});

} // End of go()




