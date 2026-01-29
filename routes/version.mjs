/**
 * Route to get version and build info about the application.
 */

import os from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

export function go(request, response) {

    response.set("Cache-Control", "no-store"); // you want fresh
    response.json({

        name: pkg.name,
        version: pkg.version,

        node: process.version,
        uptime_sec: Math.floor(process.uptime()),
        hostname: os.hostname(),

        git_sha: process.env.GIT_SHA ?? null,
        build_time: process.env.BUILD_TIME ?? null,
        env: process.env.NODE_ENV ?? null,

        // Fly-provided deploy/runtime identity
        fly_image_ref: process.env.FLY_IMAGE_REF ?? null,
        fly_machine_version: process.env.FLY_MACHINE_VERSION ?? null,
        fly_machine_id: process.env.FLY_MACHINE_ID ?? null,
        fly_region: process.env.FLY_REGION ?? null,

    });

}
