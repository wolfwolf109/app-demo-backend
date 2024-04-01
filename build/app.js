"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// require database connection 
const db_connect_1 = require("./db-connect");
const auth_1 = require("./auth");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("./models/user-model");
const article_model_1 = require("./models/article-model");
// import auth from "./auth";
const port = 3001;
const posts = [
    {
        title: "Post 1",
        paragraph: "Lorem Ispum1",
    },
    {
        title: "Post 2",
        paragraph: "Lorem Ispum2",
    }
];
// execute database connection 
(0, db_connect_1.dbConnect)();
// for parsing application/json
app.use(express_1.default.json());
// for parsing application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: true }));
// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});
app.get('/articles', (req, res) => {
    article_model_1.Article.find({}).then(articles => {
        res.status(200).send({
            items: articles
        });
    });
});
app.post("/register", (req, res) => {
    // User.findOne({email: req.body.email}).then((user) => {
    //     if(user) return res.status(400).send({
    //         message: "Email already registered"
    //     })
    // })
    bcrypt_1.default.hash(req.body.password, 10)
        .then((hashedPassword) => {
        const user = new user_model_1.User({
            email: req.body.email,
            password: hashedPassword,
        });
        user.save().then((result) => {
            res.status(201).send({
                message: "User Created Successfully",
                result,
            });
        })
            .catch((error) => {
            res.status(500).send({
                message: "Error creating user",
                error,
            });
        });
    })
        .catch((e) => {
        res.status(500).send({
            message: "Password was not hashed successfully",
            e,
        });
    });
});
app.post('/login', (req, res) => {
    user_model_1.User.findOne({ email: req.body.email })
        .then((user) => {
        if (!user) {
            res.status(404).send({
                message: "Email not found",
            });
            return;
        }
        bcrypt_1.default.compare(req.body.password, user.password)
            .then((pwIsCorrect) => {
            if (!pwIsCorrect) {
                return res.status(400).send({
                    message: "Password does not match",
                });
            }
            //   create JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: user._id,
                userEmail: user.email,
            }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "24h" });
            //   return success response
            res.status(200).send({
                message: "Login Successful",
                email: user.email,
                token,
            });
        })
            .catch((e) => {
            res.status(400).send({
                message: "Incorrect Password",
                e
            });
        });
    })
        .catch((e) => {
        res.status(404).send({
            message: "Email not found",
            e,
        });
    });
});
// authentication endpoint
app.get("/auth-endpoint", auth_1.auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});
app.post('/articles', auth_1.auth, (req, res) => {
    const post = new article_model_1.Article({
        title: req.body.title,
        paragraph: req.body.paragraph
    });
    post.save().then((result) => {
        res.status(201).send({
            message: "Article Created Successfully",
            result
        });
    }).catch((error) => {
        res.status(500).send({
            message: "Error Creating Post",
            error
        });
    });
});
app.listen(port, () => {
    console.log(`App Demo listening on port ${port}`);
});
