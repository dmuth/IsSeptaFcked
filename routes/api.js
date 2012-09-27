/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var sfw = require("../lib/sfw.js");
var util = require("util");
var septa = require("../lib/septa/rr/main.js");


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

	var title_home = "Is SEPTA Fucked?";
	var title = "API - " + title_home;
	if (is_sfw) {
		title = sfw.filter(title);
	}

	response.render("api.jade", {
		"title_home": title_home,
		"title": title,
		"production": production,
		"is_sfw": is_sfw,
		"uri": request["url"],
		});

} // End of go()


