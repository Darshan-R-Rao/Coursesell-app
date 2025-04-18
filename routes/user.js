const express = require('express');
const userRouter = express.Router();
const {userModel} = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {JWT_USER_SECRET} = require('../config')

    userRouter.post('/signup',async function(req,res){
        const {email,password,firstName,lastName} = req.body; 

        const hashedPassword = await bcrypt.hash(password, 5);
        try {
            await userModel.create({
                email,
                password:hashedPassword,
                firstName,
                lastName
            })
            res.json({
                message:"You have logged in"
            })
        } catch(e) {
            res.status(500).send("Database not created")
        }
        
    })
    
    userRouter.post('/signin',async function(req,res){
        const {email,password} = req.body; 

        const user = await userModel.findOne({
            email
        })

        if(!user) {
            res.json({
                message: "User login failed"
            })
            return
        }

        const passmatch = await bcrypt.compare(password, user.password);

        if(passmatch) {
            const token = jwt.sign({
                id: user._id.toString()
            },JWT_USER_SECRET);

            res.json({
                token
            })
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            })
        }
    
    })
    
    userRouter.post('/user/purchase', function(req,res){
        const userId = req.userId;

    })

    function userAuth(req,res,next) {
        const token = req.headers.token;
        const decodedData = JWT.verify(token, JWT_SECRET);
    }


module.exports = {
    userRouter
}