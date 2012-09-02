/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var sfw = require("../lib/sfw.js");
var util = require("util");
var septa = require("../lib/septa/main.js");


var production = false;


/**
* This function is called when the module is first loaded.
*
* @param boolean in_production Are we currently in production mode?
*/
module.exports = function(in_production) {

	var retval = {};

	production = in_production;

	retval["go"] = go;

	return(retval);

} // End of exports()


function go(request, response) {

	var is_sfw = sfw.is_sfw(request);

	var title = "Is SEPTA Fucked?";
	if (is_sfw) {
		title = sfw.filter(title);
	}

	response.render("faq.jade", {
		"title": title,
		"production": production,
		"is_sfw": is_sfw,
		"uri": request["url"],
		});

} // End of go()


