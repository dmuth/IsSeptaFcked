/**
* This module looks at the hostname, and makes the determination
* if we are running in SFW mode or not.  If we are, we'll 
* then do some filtering.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


/**
* This function checks to see if our request is on the SFW site.
*
* @return boolean True if SFW, false otherwise.
*/
export function is_sfw(request) {

	//
	// Default to false. This ensures use of the word "fuck".
	//
	var retval = false;

	if (request["headers"] && request["headers"]["host"]) {

		var hostname = request["headers"]["host"];
		//hostname = "www.isseptafcked.com"; // Debugging

		if (hostname.indexOf("fcked") != -1) {
			retval = true;
		}

	}

	return(retval);

} // End of is_sfw()


/**
* Filter our data
*/
export function filter(data) {

	//
	// Changed over thanks to COVID-19's "fuuuuuuuucked" status for busses.
	//
	var retval = data.replace(/fuck/ig, "f*ck");
	var retval = retval.replace(/fuuuuuuuuck/ig, "f********ck");
	//var retval = data.replace(/fu+ck/ig, "f*ck");

	//
	// Un-filter the URL to the NSFW site. :-)
	//
	retval = retval.replace(/isseptaf\*cked/ig, "isseptafucked");

	return(retval);

} // End of filter()



