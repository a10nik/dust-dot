"use strict";

let app = require("../app");
let expect = require('chai').expect;
let jwt = require("jsonwebtoken");
let request = require("co-request")
require('co-mocha')(require('mocha'));

let server;
var secret = "lol secret";
beforeEach(() => {
    server = app.start({
        secret: secret,
        endpoint: "http://localhost:3001"
    });
});
afterEach(() => server.close());

describe('user', () => {
    it('should create without error', function*() {
        let {statusCode} = yield request.post("http://localhost:3001/user", {
            json: {
                name: "as",
                password: "asdasd"
            }
        });
        expect(statusCode).to.equal(201);
    });
    it('should fail when created twice', function*() {
        var user = {
            name: "as",
            password: "asdasd"
        };
        yield request.post("http://localhost:3001/user", {json: user});
        let {statusCode, body} = yield request.post("http://localhost:3001/user", {json: user});
        expect(statusCode).to.equal(409);
        expect(body.error).to.contain("already exists");
    });

    it("should yield token with userId when logged in with created user", function*() {
        var user = {
            name: "as",
            password: "asdasd"
        };
        yield request.post("http://localhost:3001/user", {json: user});
        let {body} = yield request.post("http://localhost:3001/user/login", {json: user});
        let decoded = jwt.verify(body.token, secret);
        expect(decoded.userId).not.to.be.empty;
    });

    it("should give not authorized on /user/me when not logged in", function*() {
        let {statusCode, body} = yield request.get("http://localhost:3001/user/me", {json: true});
        expect(statusCode).to.equal(401);
    });

    it("should yield token with userId when logged in with created user", function*() {
        var user = {
            name: "as",
            password: "asdasd"
        };
        yield request.post("http://localhost:3001/user", {json: user});
        let {body} = yield request.post("http://localhost:3001/user/login", {json: user});
        let {statusCode} = yield request.get("http://localhost:3001/user/me", {
            auth: {bearer: body.token}
        });
        expect(statusCode).to.equal(200);
    });
});

let createUserAndLogIn = function* (name) {
    var user = {
        name: name || "sampleName",
        password: "samplePassword"
    };
    yield request.post("http://localhost:3001/user", {json: user});
    let {body: {token}} = yield request.post("http://localhost:3001/user/login", {json: user});
    return { bearer: token };
};

describe('ballot', () => {
    it("should provide a ballot after creation", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {
            questions: []
        };
        let {body: {id: createdId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        let {body, statusCode} = yield request.get(`http://localhost:3001/ballot/${createdId}`, {
            json: true
        });
        expect(statusCode).to.equal(200);
        expect(body.description).to.equal(ballot.description);
    });

    it("should delete a ballot with the user who created it", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: []};
        let {body: {id}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth
        });
        let {statusCode} = yield request.del(`http://localhost:3001/ballot/${id}`, {
            json: true,
            auth
        });
        expect(statusCode).to.equal(204);
    });
    it("should not allow to delete a ballot with the other user", function*() {
        let auth1 = yield createUserAndLogIn("user1");
        let auth2 = yield createUserAndLogIn("user2");
        let ballot = {questions: []};
        let {body: {id}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth1
        });
        let {statusCode} = yield request.del(`http://localhost:3001/ballot/${id}`, {
            json: true,
            auth: auth2
        });
        expect(statusCode).to.equal(401);
    });

});

describe("vote", () => {
    it("should retrieve a posted vote", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: []};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        let {body: createdVote} = yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: []},
            auth
        });
        let {body: retrievedVote} = yield request.get(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: true,
            auth
        });
        expect(retrievedVote).to.deep.equal(createdVote);
    });

    it("should throw 400 if posted vote contains invalid answer", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: [{ options: ["A", "B", "C"]}]};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        let {statusCode} = yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: [{option: "D"}]},
            auth
        });
        expect(statusCode).to.equal(400);
    });

    it("should delete votes", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: []};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: []},
            auth
        });
        yield request.del(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: true,
            auth
        });
        let {statusCode} = yield request.get(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: true,
            auth
        });
        expect(statusCode).to.equal(404);
    });

    it("should delete votes when ballot is deleted", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: []};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: []},
            auth
        });
        yield request.del(`http://localhost:3001/ballot/${ballotId}`, {
            json: true,
            auth
        });
        let {statusCode} = yield request.get(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: true,
            auth
        });
        expect(statusCode).to.equal(404);
    });

    it("should change vote with put", function*() {
        let auth = yield createUserAndLogIn();
        let ballot = {questions: [{ options: ["A", "B", "C"]}]};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: [{option: "B"}]},
            auth
        });
        yield request.put(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: {answers: [{option: "C"}]},
            auth
        });
        let {body} = yield request.get(`http://localhost:3001/ballot/${ballotId}/vote/mine`, {
            json: true,
            auth
        });
        expect(body.answers[0].option).to.equal("C");
    });
});


describe("stats", () => {
    it("should make proper stats", function*() {
        let auth1 = yield createUserAndLogIn("user1");
        let auth2 = yield createUserAndLogIn("user2");
        let auth3 = yield createUserAndLogIn("user3");

        let ballot = {questions: [{ options: ["A", "B", "C"]}]};
        let {body: {id: ballotId}} = yield request.post("http://localhost:3001/ballot", {
            json: ballot,
            auth: auth1
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: [{option: "B"}]},
            auth: auth1
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: [{option: "A"}]},
            auth: auth2
        });
        yield request.post(`http://localhost:3001/ballot/${ballotId}/vote`, {
            json: {answers: [{option: "B"}]},
            auth: auth3
        });
        let {body} = yield request.get(`http://localhost:3001/ballot/${ballotId}/stats`, {
            json: true
        });
        expect(body[0]).to.deep.equal([
            {option: "A", votes: 1},
            {option: "B", votes: 2},
            {option: "C", votes: 0}
        ]);
    });
});