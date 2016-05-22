let Guid = require("guid");

class UserStorage {
    constructor(users) {
        this.users = users;
    }

    nameExists(name) {
        return this.users.some(({name: existentName}) => existentName === name);
    }

    getByNameAndPassword(name, password) {
        return this.users.find(({name: n, password: p}) => n === name && p === password);
    }

    getById(searchId) {
        return this.users.find(({id}) => id.equals(searchId));
    }

    createUser(name, password) {
        if (this.nameExists(name))
            throw "Already exists";
        let newUser = {
            id: Guid.create(),
            name: name,
            password: password
        };
        this.users.push(newUser);
        return newUser;
    }
}

module.exports = UserStorage;