/**
* This module is our handler for echo functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*/


var util = require("util");


/**
* This function is our main entry point.
*/
exports.go = function(request, response) {

	var retval = "<pre>"
		+ "Original URL: " + request["originalUrl"] + "\n"
		+ "URL: "  + request["url"] + "\n"
		+ "Query: " + util.inspect(request["query"]) + "\n"
		+ "Method: " + request["method"] + "\n"
		+ "Headers: " + util.inspect(request["headers"]) + "\n"
		;
	//retval += util.inspect(request); // Debugging

	response.send(retval);

} // End of go()



