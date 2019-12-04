/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


var rr = require("../lib/septa/rr/main.js");
var bus = require("../lib/septa/bus/main.js");
var util = require("util");


/**
* This function is our main entry point.
*/
exports.go = function(request, response) {

	var retval = "";

	bus.getData(function(error, data) {

		delete data["data"];
		delete data["suspended"];
		delete data["status"]["css_class"];
		delete data["status"]["suspended"];
		delete data["status"]["message"];
		bus_data = data;

		rr.getData(function(error, data) {

			delete data["data"];
			delete data["late"];
			delete data["status"]["css_class"];
			delete data["status"]["late"];
			delete data["status"]["message"];
			rr_data = data;

			data = {}
			data["time"] = rr_data["time"];
			data["time_t"] = rr_data["time_t"];
			data["status"] = {};
			data["status"]["rr"] = rr_data["status"];
			data["status"]["bus"] = bus_data["status"];
			data["summary"] = util.format("Regional rail is %s! Busses are %s! %s %s",
				data["status"]["rr"]["status"],
				data["status"]["bus"]["status"],
				data["status"]["rr"]["summary"],
				data["status"]["bus"]["summary"]
				);

			retval += JSON.stringify(data, null, 4);

			//
			// As per RFC 4627, this should application/json so that apps can consume it.
			//
			response.header("Content-Type", "application/json");

			response.send(retval);

		});

	});

} // End of go()




