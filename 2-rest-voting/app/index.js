"use strict";

let express = require('express');
let UserApi = require("./user-api");
let UserStorage = require("./user-storage");
let Authentication = require("./authentication");
let BallotApi = require("./ballot-api");
let BallotStorage = require("./ballot-storage");
let VoteStorage = require("./vote-storage");
let VoteApi = require("./vote-api");
let StatApi = require("./stat-api");
let parse = require('url-parse');
var expressWinston = require('express-winston');
var winston = require('winston'); // for transports.Console

module.exports.start = ({secret, endpoint}) => {
    let {hostname, port} = parse(endpoint);

    let app = express();
    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ]
    }));
    let authentication = new Authentication(secret);
    let userStorage = new UserStorage([]);
    let userApi = new UserApi(userStorage, authentication);
    let ballotStorage = new BallotStorage([]);
    let voteStorage = new VoteStorage([]);
    let ballotApi = new BallotApi(userStorage, ballotStorage, voteStorage, authentication);
    let voteApi = new VoteApi(userStorage, ballotStorage, voteStorage, authentication);
    let statApi = new StatApi(ballotStorage, voteStorage);
    app.use(userApi.createRouter());
    app.use(ballotApi.createRouter());
    app.use(voteApi.createRouter());
    app.use(statApi.createRouter());

    console.log(`\n[${Date.now()}] listening on ${endpoint}`);
    return app.listen(port, hostname);
};