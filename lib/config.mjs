
export let production = false;
//production = true; // Debugging

if (process.env.NODE_ENV === "production") {
    production = true;
}

if (production === true) {
  console.log("config.js(): Running in PRODUCTION mode!");
} else {
    console.log("config.js(): Running in DEVELOPMENT mode!");
}
