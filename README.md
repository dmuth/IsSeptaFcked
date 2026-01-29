
# What is this?

This is the code repository for the [IsSEPTAFcked.com]("http://www.isSeptaFcked.com/)
Or, if you are a regular commuter on SEPTA: [IsSEPTAFucked.com](https://www.isSeptaFucked.com/)

Screenshot:
<img src="https://raw.githubusercontent.com/dmuth/IsSeptaFcked/master/img/septa.png" alt="Screenshot" />

## Why the profanity?

This, and many more questions are answered in the FAQ: http://www.isseptafucked.com/faq

## How does it work?

Once every minute, it makes an API request for SEPTA's Regional Rail trains.  
It then esitmates "fuckedness" as follows:

- All trains < 10 minutes late: Not Fucked
- 1 or more trains >= 10 minutes late and < 30 minutes late: A Little Fucked
- 1 or more trains >= 30 minutes late: Fucked

If you have any questions, feel free to reach out to me. I can be reached
here on GitHub or through the many social networks I am on: [http://www.dmuth.org/contact](http://www.dmuth.org/contact)

## Media Coverage

- [New Web App Tells You When SEPTA Is F#$%ed](http://www.phillymag.com/news/2012/09/26/web-app-tells-septa-f%ED/)
- [Now more timely than ever: Is SEPTA F*cked](http://technical.ly/philly/2016/07/06/is-septa-fucked-douglas-muth/)
- [That snow storm sent SEPTA trains to new ‘Turbo F*cked’ status](https://technical.ly/philly/2018/11/16/septa-regional-rail-turbo-fcked/)
- [The evolution of Doug Muth’s irreverent SEPTA delay tracker](https://technical.ly/philly/2019/09/29/evolution-doug-muth-irreverent-is-septa-fucked-delay-tracker/)

## Awards

Never thought I would win an award for profanity, Yet here we are.  IsSeptaFucked [won the "Best Side Prject" award](http://technical.ly/philly/2017/02/08/network-awards-winners/) in the NET/WORK Philly 2017 awards.  

## Architecture Overview

For fellow nerds out there, here's a brief rundown on how the various node.js modules are laid out:

- `views/` - Jade templates for public facing pages.
- `public/` - CSS and the site's robots.txt
- `node_modules/` - Modules installed with npm.
- `lib/logger.mjs` - Handles custom logging in Express.  Heroku uses proxies, and I would like to log the IP that incoming requests are forwarded for.
  - `lib/septa/rr/api.mjs` - Module that actually connects to SEPTA's Regional Rail API, and translates their data into something we can actually use.
  - `lib/septa/rr/main.mjs` - The main function in here is called at Express boot time, and it is responsible for calling SEPTA's API once a minute.  It is also responsible for determing the level of "fuckedness" of Regional Rail.
  - `lib/septa/rr/text.mjs` - Create messages based on the lateness data.
  - `lib/septa/bus/api.mjs` - Module that actually connects to SEPTA's bus API, and translates their data into something we can actually use.
  - `lib/septa/bus/main.mjs` - The main function in here is called at Express boot time, and it is responsible for calling SEPTA's bus API once every 5 minutes.  It is also responsible for determing the level of "fuckedness" of Regional Rail.
  - `lib/septa/bus/text.mjs` - Create messages based on the lateness data.
- `lib/sfw.mjs` - Makes the determination if we are running under the SFW domain, and does filtering of strings.
- `routes/` - Each file in here corresponds to the same named URI, and handles requests to that URI.

## Development

### In Docker Compose

- `docker-compose build && docker-compose up`
- [http://localhost:5000/](http://localhost:5000/)

### In Docker

``` bash
./bin/docker-build 
```

Now, go to [http://localhost:5000/](http://localhost:5000/)

The reason this script exists is to wrap some of the underlying complexity with the build process.

### In bash in Docker

``` bash
./bin/docker-build bash
```

- Run `cd /mnt; npm start` to spin up the webserver on port 5000.
- [http://localhost:5000/](http://localhost:5000/)

### The Manual Way

- Run `npm start` to spin up the webserver on port 5000.
- [http://localhost:5000](http://localhost:5000/)

## Testing

At some point I'd like to have unit testing, but because the functionality of the
website is relatively limited, at the current time it's quicker to uncomment sections
of the code that have the string `// Debug` in order to change behavior of the site for
texting purposes.  Debug code can be found in these files:

- `lib/septa/rr/main.js`
- `lib/septa/rr/api.js`
- `lib/septa/rr/text.js`
- `lib/septa/bus/main.js`
- `lib/septa/bus/api.js`
- `lib/septa/bus/text.js`

## Deployment in Fly.io

- ~~`flyctl deploy`~~ - Deploy the app
- `./bin/fly-deploy` - Deploy the app.  This will set the Git SHA1 and Build Time variables
- `flyctl status` - Check the status of the app
- `flyctl log` - Watch the app log in real-time
- `flyctl apps open` - Open the website in the browser
- `flyctl ips list` - List IPs

Additional troubleshhoting can be found at [https://fly.io/docs/getting-started/troubleshooting/](https://fly.io/docs/getting-started/troubleshooting/).

## TODO

- Express 4
- Proper testing
