let Guid = require("guid");

class VoteStorage {
    constructor(votes) {
        this.votes = votes;
    }

    getById(searchId) {
        return this.votes.find(({id}) => id.equals(searchId));
    }

    removeById(id) {
        let voteIndex = this.votes.findIndex(b => b.id.equals(id));
        if (voteIndex === -1)
            throw "Does not exist";
        this.votes.splice(voteIndex, 1);
    }

    removeAllByBallot(ballotId) {
        let voteIndex = this.votes.findIndex(b => b.ballot.equals(ballotId));
        while (voteIndex !== -1) {
            this.votes.splice(voteIndex, 1);
            voteIndex = this.votes.findIndex(b => b.ballot.equals(ballotId));
        }
    }

    getByVoterAndBallot(userId, ballotId) {
        return this.votes.find(v => v.createdBy.equals(userId) && v.ballot.equals(ballotId));
    }

    addVote(content, userId, ballotId) {
        if (this.getByVoterAndBallot(userId, content.ballot))
            throw "Already voted";
        let newVote = Object.assign({}, content, {
            id: Guid.create(),
            createdBy: new Guid(userId),
            ballot: new Guid(ballotId)
        });
        this.votes.push(newVote);
        return newVote;
    }

    changeVote(content, userId, ballotId) {
        let voteIndex = this.votes.findIndex(v => v.createdBy.equals(userId) && v.ballot.equals(ballotId));
        if (voteIndex === -1)
            throw "Does not exist";
        this.votes[voteIndex] = Object.assign({}, content, {
            id: this.votes[voteIndex].id,
            createdBy: new Guid(userId),
            ballot: new Guid(ballotId)
        });
    }

    getVotesOnBallot(ballotId) {
        return this.votes.filter(v => v.ballot.equals(ballotId));
    }
}

module.exports = VoteStorage;