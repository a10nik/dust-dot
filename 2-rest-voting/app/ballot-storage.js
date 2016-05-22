let Guid = require("guid");

class BallotStorage {
    constructor(ballots) {
        this.ballots = ballots;
    }

    getById(searchId) {
        return this.ballots.find(({id}) => id.equals(searchId));
    }

    removeById(id) {
        let ballotIndex = this.ballots.findIndex(b => b.id.equals(id));
        if (ballotIndex === -1)
            throw "Does not exist";
        this.ballots.splice(ballotIndex, 1);
    }

    addBallot(content, userId) {
        let newBallot = Object.assign({}, content, {
            id: Guid.create(),
            createdBy: new Guid(userId)
        });
        this.ballots.push(newBallot);
        return newBallot;
    }
}

module.exports = BallotStorage;