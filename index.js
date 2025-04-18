const express = require('express');
const app = express();
const {userRouter} = require('./routes/user')
const {courseRouter} = require('./routes/course');
const {adminRouter} = require('./routes/admin');
const db = require('./db');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const JWT_SECRET = "helloworld";

app.use(express.json());

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/course', courseRouter);


async function main() {
    await mongoose.connect("mongodb+srv://darshanrao552:darshanrao552@cluster0.yam1i4d.mongodb.net/coursera-app");
    app.listen(3000);
    console.log("Port:3000")
}



main()