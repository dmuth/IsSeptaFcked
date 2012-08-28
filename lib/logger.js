/**
* This module handles logging for express.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


/**
* Our main entry point.
*
* @paramn object logger The logger function from Express.
*/
exports.go = function(logger) {

	//
	// Create an IP token for the logging system that lists the original IP, 
	// if there was a proxy involved.
	//
	logger.token("ip", function(request) {

		var retval = "";

		if (request["headers"] && request["headers"]["x-forwarded-for"]) {
			//
			// Proxied request
			//
			retval = request["headers"]["x-forwarded-for"];

		} else if (request["socket"] && request["socket"]["remoteAddress"]) {
			//
			// Direct request
			//
			retval = request["socket"]["remoteAddress"];

		} else if (request["socket"] && request["socket"]["socket"] 
			&& request["socket"]["socket"]["remoteAddress"]) {
			//
			// God only knows what happened here...
			//
			retval = request["socket"]["socket"]["remoteAddress"];

		}
	
		return(retval);

	});


	//
	// Tweak our default logging format to include the new IP token.
	//
	logger.format("default", 
		':ip :remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
		);

} // End of go()


