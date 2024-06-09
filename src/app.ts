import bcrypt from "bcrypt";
// require database connection 
import { dbConnect } from "./db-connect";
import { auth } from "./auth";
import express from 'express';
const app = express()
import jwt from "jsonwebtoken";
import { User } from "./models/user-model";
import { Article } from "./models/article-model";

// import auth from "./auth";
const port = 3001

const posts = [
    {
        title: "Post 1",
        paragraph: "Lorem Ispum1",
    },
    {
        title: "Post 2",
        paragraph: "Lorem Ispum2",
    }
]

// execute database connection 
dbConnect();

// for parsing application/json
app.use(express.json())
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
})


app.post("/register", (req, res) => {
    // User.findOne({email: req.body.email}).then((user) => {
    //     if(user) return res.status(400).send({
    //         message: "Email already registered"
    //     })
    // })


    bcrypt.hash(req.body.password, 10)
        .then((hashedPassword) => {
            const user = new User({
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
        })
});

app.post('/login', (req, res) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                res.status(404).send({
                    message: "Email not found",
                })
                return;
            }

            bcrypt.compare(req.body.password, user.password)
                .then((pwIsCorrect) => {
                    if (!pwIsCorrect) {
                        return res.status(400).send({
                            message: "Password does not match",
                        })
                    }
                    //   create JWT token
                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userEmail: user.email,
                        },
                        process.env.SECRET_ACCESS_TOKEN as string,
                        { expiresIn: "24h" }
                    );

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
                    })
                })


        })
        .catch((e) => {
            res.status(404).send({
                message: "Email not found",
                e,
            })
        })
})

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});

app.get('/articles', auth, (req, res) => {
    Article.find({}).then(articles => {
        res.status(200).send({
            items: articles
        })
    })
})

app.post('/articles', auth, (req, res) => {

    console.log(auth)

    const post = new Article({
        title: req.body.title,
        paragraph: req.body.paragraph,
        ownerID: auth.name
    })

    post.save().then((result) => {
        res.status(201).send({
            message: "Article Created Successfully",
            result
        })
    }).catch((error) => {
        res.status(500).send({
            message: "Error Creating Post",
            error
        })
    })
})

app.listen(port, () => {
    console.log(`App Demo listening on port ${port}`)
})