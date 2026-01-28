// web.mjs
import express from "express";
import morgan from "morgan";
import util from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

// CJS local modules: ESM can import them as default (module.exports => default)
import { boot as septa_rr_boot } from "./lib/septa/rr/main.mjs";
import { boot as septa_bus_boot } from "./lib/septa/bus/main.mjs";

// Routes
import { go as route_main_go } from "./routes/main.mjs";
import { go as route_api_go } from "./routes/api.mjs";
import { go as route_api_status_go }  from "./routes/api-status.mjs";
import { go as route_api_rr_go } from "./routes/api-rr.mjs";
import { go as route_api_rr_status_go } from "./routes/api-rr-status.mjs";
import { go as route_api_rr_raw_go } from "./routes/api-rr-raw.mjs";
import { go as route_api_bus_go } from "./routes/api-bus.mjs";
import { go as route_api_bus_status_go } from "./routes/api-bus-status.mjs";
import { go as route_api_bus_raw_go } from "./routes/api-bus-raw.mjs";
import { go as route_echo_go } from "./routes/echo.mjs";
import { go as route_faq_go } from "./routes/faq.mjs";
import { go as route_version_go } from "./routes/version.mjs";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//
// Trust the proxy to provide the proper source IP as per:
//
// https://stackoverflow.com/questions/27588434/logging-with-morgan-only-shows-127-0-0-1-for-remote-addr-in-nodejs
//
app.enable("trust proxy");
app.use(morgan(":remote-addr :method :url :status :res[content-length] - :response-time ms"));

app.set("view options", { layout: true });


//
// If hitting the API, include CORS headers.
//
app.use((req, res, next) => {
  const url = req.originalUrl;
  if (/^\/api/.test(url)) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
});

app.get("/", route_main_go);
app.get("/api", route_api_go);
app.get("/api/status", route_api_status_go);
app.get("/api/rr", route_api_rr_go);
app.get("/api/rr/status", route_api_rr_status_go);
app.get("/api/rr/raw_data", route_api_rr_raw_go);
app.get("/api/bus", route_api_bus_go);
app.get("/api/bus/status", route_api_bus_status_go);
app.get("/api/bus/raw_data", route_api_bus_raw_go);
app.get("/echo", route_echo_go);
app.get("/faq", route_faq_go);
app.get("/version", route_version_go);

// Load Swagger API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//
// Set this up, mostly for our favicon.
//
app.use(express.static(path.join(__dirname, "public")));

//
// Set our Views directory for Jade.
//
app.set("views", path.join(__dirname, "views"));

//
// Don't minify the HTML.
//
app.set("view options", { pretty: true });

//
// Start up the SEPTA sub-system, specifically fetching from the API.
//
septa_rr_boot();
septa_bus_boot();

//
// Actually start listening.
//
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

//setInterval(() => {
//  const m = process.memoryUsage();
//  console.log(`Memory usage: ${m.rss} bytes`);
//}, 1 * 1000).unref();
