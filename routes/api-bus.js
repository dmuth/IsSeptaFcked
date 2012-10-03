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

	septa.getData(function(error, data) {

		data["_comment"] = "Bus data processed by us";

		retval += JSON.stringify(data, null, 4);

		//
		// Make this readable in the web browser.
		//
		response.header("Content-Type", "text/json");

		response.send(retval);

	});

} // End of go()




