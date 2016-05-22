"use strict";

let express = require('express');
let bodyParser = require('body-parser');

class UserApi {
    constructor(userStorage, authentication) {
        this.userStorage = userStorage;
        this.auth = authentication;
    }

    createRouter() {
        let userRouter = express.Router();
        userRouter.use(bodyParser.json());

        userRouter.post("/user", ({body: {name, password}}, res) => {
            name || res.status(400).json({ error: "Must have field 'name' in payload"});
            password || res.status(400).json({ error: "Must have field 'password' in payload"});
            if (this.userStorage.nameExists(name)) {
                res.status(409).json({
                    error: "User with such name already exists"
                });
            } else {
                this.userStorage.createUser(name, password);
                res.sendStatus(201);
            }
        });

        userRouter.post("/user/login", ({body: {name, password}}, res) => {
            name || res.status(400).json({ error: "Must have field 'name' in payload"});
            password || res.status(400).json({ error: "Must have field 'password' in payload"});
            var user = this.userStorage.getByNameAndPassword(name, password);
            if (user) {
                res.json({
                    token: this.auth.sign({userId: user.id})
                });
            } else {
                res.status(404).json({error: "No user found with such name and password"});
            }
        });

        userRouter.get("/user/me", this.auth.middleware(), ({user: authInfo}, res) => {
            if (!authInfo || !authInfo.userId) {
                res.sendStatus(401);
            } else {
                var user = this.userStorage.getById(authInfo.userId);
                if (user) {
                    res.json({ name: user.name });
                } else {
                    res.sendStatus(401);
                }
            }
        });

        return userRouter;
    }
}

module.exports = UserApi;