const bcrypt = require("bcrypt");
const User = require("./user-model");
// require database connection 
const dbConnect = require("./db-connect");
const express = require('express')
const app = express()
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const port = 3001



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

app.post("/register", (request, response) => {
    bcrypt.hash(request.body.password, 10)
        .then((hashedPassword) => {
            const user = new User({
                email: request.body.email,
                password: hashedPassword,
            });
            user.save().then((result) => {
                response.status(201).send({
                    message: "User Created Successfully",
                    result,
                });
            })
                .catch((error) => {
                    response.status(500).send({
                        message: "Error creating user",
                        error,
                    });
                });
        })
        .catch((e) => {
            response.status(500).send({
                message: "Password was not hashed successfully",
                e,
            });
        })
});

app.post('/login', (req, res) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            console.log(user.password)
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
                        "RANDOM-TOKEN",
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

// free endpoint
app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
  // authentication endpoint
  app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
  });

app.listen(port, () => {
    console.log(`App Demo listening on port ${port}`)
})