require('dotenv').config()
console.log(process.env.MONGO_URL)
const express = require('express');
const app = express();
const {userRouter} = require('./routes/user')
const {courseRouter} = require('./routes/course');
const {adminRouter} = require('./routes/admin');
const db = require('./db');
const mongoose = require('mongoose');

app.use(express.json());

app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/course', courseRouter);


async function main() {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
    console.log("Port:3000")
}



main()