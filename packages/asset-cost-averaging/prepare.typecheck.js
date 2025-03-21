/* eslint-disable */
const fs = require("fs");

let projectFile = fs.readFileSync("tsconfig.json").toString();
projectFile = projectFile.replace(/}([^}]*)$/, "$1") + ",\"exclude\": [ \"src/**/*.test.ts\", \"test/*\" ]" + "}";
fs.writeFileSync("tsconfig.typecheck.json", projectFile);
