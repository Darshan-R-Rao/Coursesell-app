const express = require('express');
const userRouter = express.Router();
const {userModel, courseModel, purchaseModel} = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_USER_SECRET = require('../config')
const {userMiddlewares} = require('../middlewares/user.js')
const {z} = require('zod')
const mongoose = require('mongoose')

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
    
    userRouter.post('/purchase', userMiddlewares, async function (req, res) {
        const purchasedSchema = z.object({
            courseId: z.string().nonempty("Course Id cannot be empty"),
        });
    
        const parsedData = purchasedSchema.safeParse(req.body);
    
        if (!parsedData.success) {
            return res.status(400).json({
                message: "Invalid request",
                error: parsedData.error.errors,
            });
        }
    
        // Destructure courseId only after validation succeeds
        const { courseId } = parsedData.data;
    
        try {
            // Validate courseId format
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({
                    message: "Invalid courseId format",
                });
            }
    
            // Convert courseId to ObjectId using `new`
            const course = await courseModel.findOne({
                _id: new mongoose.Types.ObjectId(courseId),
            });
    
            if (!course) {
                return res.status(404).json({
                    message: "Course not found",
                });
            }
    
            // Create a purchase record
            await purchaseModel.create({
                userId: req.userId,
                courseId: course._id,
            });
    
            res.json({
                message: "Course successfully purchased",
                course,
            });
        } catch (error) {
            console.error("Error during course purchase:", error.message);
            res.status(500).json({
                message: "An error occurred during purchase",
                error: error.message,
            });
        }
    });



module.exports = {
    userRouter
}