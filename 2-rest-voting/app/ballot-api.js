"use strict";

let express = require('express');
let bodyParser = require('body-parser');

class BallotApi {
    constructor(userStorage, ballotStorage, voteStorage, authentication) {
        this.userStorage = userStorage;
        this.ballotStorage = ballotStorage;
        this.voteStorage = voteStorage;
        this.auth = authentication;
    }

    createRouter() {
        let ballotRouter = express.Router();
        ballotRouter.use(bodyParser.json());

        ballotRouter.post("/ballot", this.auth.middleware(), ({body: content, user}, res) => {
            if (!(content.questions instanceof Array))
                res.status(400).json({error: "Must contain array 'questions' in the payload"});
            else if (!this.userStorage.getById(user.userId)) {
                res.sendStatus(401);
            } else {
                let newBallot = this.ballotStorage.addBallot(content, user.userId);
                res.status(201).json(newBallot);
            }
        });

        ballotRouter.get("/ballot/:id", ({params: {id}}, res) => {
            var ballot = this.ballotStorage.getById(id);
            if (ballot) {
                res.json(ballot);
            } else {
                res.sendStatus(404);
            }
        });

        ballotRouter.delete("/ballot/:id", this.auth.middleware(), ({user, params: {id}}, res) => {
            if (!user || !user.userId) {
                res.sendStatus(401);
            } else {
                var ballot = this.ballotStorage.getById(id);
                if (!ballot) {
                    res.sendStatus(404);
                } else if (!ballot.createdBy.equals(user.userId)) {
                    res.sendStatus(401);
                } else {
                    this.ballotStorage.removeById(id);
                    this.voteStorage.removeAllByBallot(id);
                    res.sendStatus(204);
                }
            }
        });

        return ballotRouter;
    }
}

module.exports = BallotApi;