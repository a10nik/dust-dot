"use strict";

let express = require('express');
let bodyParser = require('body-parser');

class VoteApi {
    constructor(userStorage, ballotStorage, voteStorage, authentication) {
        this.userStorage = userStorage;
        this.ballotStorage = ballotStorage;
        this.voteStorage = voteStorage;
        this.auth = authentication;
    }

    getAnswersAndQuestionsMatchError({answers}, {questions}) {
        if (!(answers instanceof Array))
            return "Must contain array `answers` in the payload";
        if (answers.length !== questions.length)
            return `There are ${questions.length} questions in the ` +
                    `ballot, but ${answers.length} answers given`;
        let wrongOptions = questions
            .map((q, i) => ({ options: q.options, option: answers[i].option }))
            .filter(({options, option}) => options.indexOf(option) === -1);
        if (wrongOptions.length > 0)
            return wrongOptions
                    .map(({options, option}) => `Option ${option} is not one of the list: ${options.join(", ")}`)
                    .join("\n");
        return null;
    }

    validationMiddleware() {
        return ({body: content, user, params: {ballotId}}, res, next) => {
            if (!user || !this.userStorage.getById(user.userId)) {
                res.sendStatus(401);
                return;
            }
            let ballot = this.ballotStorage.getById(ballotId);
            if (!ballot) {
                res.status(404).json({error: "Ballot not found"});
                return;
            }
            let matchError = this.getAnswersAndQuestionsMatchError(content, ballot);
            if (matchError) {
                res.status(400).json({error: matchError});
                return;
            }
            next();
        };
    }

    createRouter() {
        let voteRouter = express.Router();
        voteRouter.use(bodyParser.json());

        voteRouter.post("/ballot/:ballotId/vote",
            this.auth.middleware(),
            this.validationMiddleware(),
            ({body: content, user, params: {ballotId}}, res) => {

                if (this.voteStorage.getByVoterAndBallot(user.userId, ballotId)) {
                    res.status(409).json({error: "Already voted for that ballot"});
                    return;
                }
                let created = this.voteStorage.addVote(content, user.userId, ballotId);
                res.status(201).json(created);
            });

        voteRouter.put("/ballot/:ballotId/vote/mine",
            this.auth.middleware(),
            this.validationMiddleware(),
            ({body: content, user, params: {ballotId}}, res) => {
                if (!this.voteStorage.getByVoterAndBallot(user.userId, ballotId)) {
                    res.sendStatus(404);
                    return;
                }
                this.voteStorage.changeVote(content, user.userId, ballotId);
                res.sendStatus(200);
            });

        voteRouter.get("/ballot/:ballotId/vote/mine", this.auth.middleware(),
            ({user, params: {ballotId}}, res) => {
                if (!user) {
                    res.sendStatus(401);
                    return;
                }
                let vote = this.voteStorage.getByVoterAndBallot(user.userId, ballotId);
                if (!vote) {
                    res.sendStatus(404);
                    return;
                }
                res.json(vote);
            });

        voteRouter.delete("/ballot/:ballotId/vote/mine", this.auth.middleware(), ({user, params: {ballotId}}, res) => {
            if (!user || !user.userId) {
                res.sendStatus(401);
            } else {
                let vote = this.voteStorage.getByVoterAndBallot(user.userId, ballotId);
                if (!vote) {
                    res.sendStatus(404);
                } else if (!vote.createdBy.equals(user.userId)) {
                    res.sendStatus(401);
                } else {
                    this.voteStorage.removeById(vote.id);
                    res.sendStatus(204);
                }
            }
        });

        return voteRouter;
    }
}

module.exports = VoteApi;