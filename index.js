const express = require("express");
const server = express();
const mongoose = require("mongoose");
const port = 4000;


mongoose.connect("mongodb+srv://admin:admin123@ua-database.epy2x.mongodb.net/MIDTERM-API?retryWrites=true&w=majority&appName=UA-DATABASE");


let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => console.log("We are connected to mongoDB"));


const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});


const User = mongoose.model("User", userSchema)
module.exports = User;

server.use(express.json());
server.use(express.urlencoded({extended:true}));


server.post("/register", (req, res) => {
    User.findOne({ email: req.body.email })
        .then((result) => {
            if (result) {
                return res.status(400).send({
                    code: "ERROR",
                    message: "Duplicate User",
                    data: null
                });
            }

            const adduser = new User(req.body);
            adduser.save()
                .then((savedUser) => {
                    return res.status(201).send({
                        code: 200,
                        message: "User Added",
                        data: savedUser
                    });
                })
                .catch((saveErr) => {
                    console.error(saveErr);
                    return res.status(500).send({
                        code: "ERROR",
                        message: "Failed to add user",
                        data: null
                    });
                });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).send({
                code: "ERROR",
                message: "Internal server error",
                data: null
            });
        });
});



server.get("/user/search",(req,res)=>{
    User.find({}).then((result, err)=>{
        if(err){
            return res.send("ERROR")
        }else{
            return res.send({
                code: 200,
                message: "LIST OF ALL USER",
                data: result
            });
        }
    })
})

server.get("/search", (req,res)=>{
    const email = req.query.email;
    User.findOne({email:email}).then((result, err) => {
        if(!result){
            return res.send({
                message: "Not Found"
            })
        }else{
             res.send({    
                message: "User found.",
                result: result
            })
        }
    })
})




server.put("/edit/:UserId", (req, res) => {
    const updatedUserDetails = req.query;
    User.findByIdAndUpdate(req.params.UserId, updatedUserDetails, { new: true })
        .then((result) => {
            if (!result) {
                res.send({
                    message: "Cannot find User with the given Id."
                });
            } else {
                res.send({
                    message: "A User HAS BEEN UPDATED",
                    result: result
                });
            }
        })
});


server.delete("/delete/:UserId", (req,res)=>{
    User.findByIdAndDelete(req.params.UserId).then((result, err) => {
        if(err){
            return res.send({
                message: "There is a server error."
            })
        }else{
            if(result == null){
                res.send({
                    message: "Cannot delete User with the given Id."
                })
            }else{
                res.send({
                    message: "A User HAS BEEN DELETED",
                    result: result
                })
            }
        }
    })
})




server.listen(port, () => console.log("Server is running at port number " +port));



