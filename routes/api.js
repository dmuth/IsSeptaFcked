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

	septa.getData(function(error, data) {
		retval += JSON.stringify(data, null, 4);
		response.send(retval);

	});

} // End of go()




