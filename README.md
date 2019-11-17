
# What is this?

This is the code repository for the site <a href="http://www.isSeptaFcked.com/">www.isSeptaFcked.com</a>.  Or, if you 
are a regular commuter on SEPTA: <a href="https://www.isSeptaFucked.com/">www.isSeptaFucked.com</a>.

Screenshot:
<img src="https://raw.githubusercontent.com/dmuth/IsSeptaFcked/master/img/septa.png" />


# Why the profanity?

This, and many more questions are answered in the FAQ: http://www.isseptafucked.com/faq


# How does it work?

Once every minute, it makes an API request for SEPTA's Regional Rail trains.  
	It then esitmates "fuckedness" as follows:

- All trains < 10 minutes late: Not Fucked
- 1 or more trains >= 10 minutes late and < 30 minutes late: A Little Fucked
- 1 or more trains >= 30 minutes late: Fucked


If you have any questions, feel free to reach out to me. I can be reached 
here on GitHub or through the many social networks I am on: http://www.dmuth.org/contact


# Media Coverage

- <a href="http://www.phillymag.com/news/2012/09/26/web-app-tells-septa-f%ED/">New Web App Tells You When SEPTA Is F#$%ed</a>
- <a href="http://technical.ly/philly/2016/07/06/is-septa-fucked-douglas-muth/">Now more timely than ever: Is SEPTA F*cked?</a>


# Awards

Never thought I would win an award for profanity, but it happened.  IsSeptaFucked <a href="http://technical.ly/philly/2017/02/08/network-awards-winners/">won the "Best Side Prject" award</a> in the NET/WORK Philly 2017 awards.  


# Architecture Overview

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
	- lib/septa/rr/api.js - Module that actually connects to SEPTA's Regional Rail API, and translates 
	their data into something we can actually use.
	- lib/septa/rr/main.js - The main function in here is called at Express boot time,
	and it is responsible for calling SEPTA's API once a minute.
	It is also responsible for determing the level of "fuckedness" of Regional Rail. 
	- lib/septa/rr/text.js - Create messages based on the lateness data.
	- lib/septa/bus/api.js - Module that actually connects to SEPTA's bus API, and translates 
	their data into something we can actually use.
	- lib/septa/bus/main.js - The main function in here is called at Express boot time,
	and it is responsible for calling SEPTA's bus API once every 5 minutes.
	It is also responsible for determing the level of "fuckedness" of Regional Rail. 
	- lib/septa/bus/text.js - Create messages based on the lateness data.
- lib/sfw.js - Makes the determination if we are running under the SFW 
	domain, and does filtering of strings.
- routes/ - Each file in here corresponds to the same named URI, and handles requests to that URI.


# Development

## In Docker Compose

- `docker-compose build && docker-compose up`
- <a href="http://localhost:5000/">http://localhost:5000/</a>


## In Docker

- `docker build -t septa . && docker run -e TZ=EST5EDT -p 5000:5000 -it -v $(pwd):/mnt septa`
- <a href="http://localhost:5000/">http://localhost:5000/</a>


## The Manual Way (<a href="https://knowyourmeme.com/memes/y-tho">Y Tho</a>)

- Run `npm start` to spin up the webserver on port 5000.
- http://localhost:5000/


# TODO

- Express 4



