const {Router} = require('express');
const bcrypt = require('bcrypt');
const adminRouter = Router();
const {adminModel, courseModel} = require("../db");
const {z} = require('zod')
const jwt = require('jsonwebtoken');
const {JWT_ADMIN_SECRET} = require('../config');
const { adminMiddlewares } = require('../middlewares/admin');


adminRouter.post('/signup', async function(req,res) {

    const requiredBody = z.object({
        email: z.string(),
        password: z.string().regex(/(?=.*[A-Z])/,"Password must contain atleast one uppercase letter"),
        firstName: z.string(),
        lastName: z.string()
    })

    const parsedDataWithSuccess = await requiredBody.safeParse(req.body);

    if(!parsedDataWithSuccess.success) {
        res.status(403).json({
            message: "Login failed",
            error: parsedDataWithSuccess.error
        })
        return
    }

    const {email,password,firstName,lastName} = parsedDataWithSuccess.data;

    const admin = await adminModel.findOne({
        email
    })

    if(admin) {
        res.json({
            message:"Email already taken"
        })
        return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
    })
    res.json({
        message:"Admin signup successful"
    })

})

adminRouter.post('/signin', async function(req,res){

    const {email,password} = req.body;

    const admin = await adminModel.findOne({
        email
    })

    if(!admin) {
        res.json({
            message:"Admin doesnot exist"
        })
        return
    }

    const decodedPass = await bcrypt.compare(password, admin.password);

    if(decodedPass) {
        const token = jwt.sign({
            id: admin._id
        },JWT_ADMIN_SECRET)
        res.json({
            token
        })
    } else {
        res.status(403).json({
            message:"Admin signin failed"
        })
    }
})

adminRouter.post('/course',adminMiddlewares, async function(req, res) {
    const creatorId = req.CreatorId
    const {title, description, price, imageUrl} = req.body;

    const course = await courseModel.create({
        title,
        description,
        price,
        imageUrl,
        creatorId
    })

    res.json({
        message:"Course added",
        courseId: course._id
    })
})

adminRouter.put('/', async function(req,res){
    const toUpdate = req.body;

    await courseModel.updateOne({
        toUpdate
    })
})

adminRouter.get('/all', function(req,res){
    res.json({
        message:"Admin login endpoint"
    })
})


module.exports = {
    adminRouter
}