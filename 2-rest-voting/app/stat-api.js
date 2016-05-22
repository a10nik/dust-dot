"use strict";

let express = require('express');

class StatApi {
    constructor(ballotStorage, voteStorage) {
        this.voteStorage = voteStorage;
        this.ballotStorage = ballotStorage;
    }

    stats(ballot, votes) {
        let stats = ballot.questions.map(q => q.options.map(o => ({ option: o, votes: 0 })));
        votes.forEach(v => {
            v.answers.forEach(({option}, i) => {
                stats[i].find(stat => stat.option === option).votes++;
            });
        });
        return stats;
    }

    createRouter() {
        let statRouter = express.Router();

        statRouter.get("/ballot/:ballotId/stats", ({params: {ballotId}}, res) => {
            let ballot = this.ballotStorage.getById(ballotId);
            if (!ballot) {
                res.sendStatus(404);
            } else {
                let votesOnBallot = this.voteStorage.getVotesOnBallot(ballotId);
                res.json(this.stats(ballot, votesOnBallot));
            }
        });

        return statRouter;
    }
}

module.exports = StatApi;