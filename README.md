
What is this?
=============

This is the code repository for the site www.isSeptaFcked.com.  Or, if you 
are a regular commuter on SEPTA: www.isSeptaFucked.com.


Why did you write it?
=====================

This, and many more questions are answered in the FAQ: http://www.isseptafucked.com/faq


How does it work?
=================

Once every minute, it makes an API request for SEPTA's Regional Rail trains.  
	It then esitmates "fuckedness" as follows:

- All trains < 10 minutes late: Not Fucked
- 1 or more trains >= 10 minutes late and < 30 minutes late: A Little Fucked
- 1 or more trains >= 30 minutes late: Fucked


If you have any questions, feel free to reach out to me. I can be reached 
here on GitHub or through the many social networks I am on: http://www.dmuth.org/contact


Architecture Overview
=====================

For fellow nerds out there, here's a brief rundown on how the various 
	node.js modules are laid out:

- views/ - Jade templates for public facing pages.
- public/ - CSS and the site's robots.txt
- node_modules/ - Modules installed with npm.  One school of thought says 
	I should just rely on the site's install.js file.  But I always felt 
	that a "git clone" operation should provide a complete working copy 
	of the software.  I may revise this decision when that directory 
	gets sufficently large. ;-)
- lib/logger.js - Handles custom logging in Express.  Heroku uses proxies, 
	and I would like to log the IP that incoming requests are forwarded for.
- lib/api.js - Module that actually connects to SEPTA's API, and translates 
	their data into something we can actually use.
- lib/main.js - The main function in here is called at Express boot time,
	and it is responsible for calling SEPTA's API once a minute.
	It is also responsible for determing the level of "fuckedness" of Regional Rail. 
- lib/text.js - Create messages based on the lateness data.
- lib/sfw.js - Makes the determination if we are running under the SFW 
	domain, and does filtering of strings.
- routes/ - Each file in here corresponds to the same named URI, and handles requests to that URI.



