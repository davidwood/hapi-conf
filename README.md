# hapi-conf

`hapi-conf` loads environment variables using [dotenv](https://www.npmjs.com/package/dotenv) and exposes with a hapi server method. Environment variables are filtered and parsed as JSON with [filter-env](https://www.npmjs.com/package/filter-env).

[![Circle CI](https://circleci.com/gh/davidwood/hapi-conf/tree/master.svg?style=svg)](https://circleci.com/gh/davidwood/hapi-conf/tree/master)
[![bitHound Overall Score](https://www.bithound.io/github/davidwood/hapi-conf/badges/score.svg)](https://www.bithound.io/github/davidwood/hapi-conf)
[![bitHound Dependencies](https://www.bithound.io/github/davidwood/hapi-conf/badges/dependencies.svg)](https://www.bithound.io/github/davidwood/hapi-conf/master/dependencies/npm)

## Usage

The following example loads environment variables from `.env` and filters the variables

```
const fs = require('fs');
const Hapi = require('hapi');
const hapiConf = requre('hapi-conf');
const server = new Hapi.Server({});
hapiConf(server, /^TEST-/, { env: fs.readFileSync('./.env'), json: true, freeze: true });
```
