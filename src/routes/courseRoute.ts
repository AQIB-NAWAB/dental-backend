import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

import { User } from "../models/user.mode";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Course } from "../models/courses.model";
import { isAdmin } from "../middlewares/isAdmin";
import mongoose from "mongoose";
import { Package } from "../models/package.model";

const router = express.Router();



// Get all courses 
router.get("/api/courses",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const courses= await Course.find({});

    res.send(courses);
}
);




// Get all courses of a user from array of courses
  
router.get("/api/courses/mine",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const user=await User.findById(req.currentUser!.id);
    let courses=[];
    for(let i=0;i<user!.courses.length;i++){
        courses[i]=await Course.findById(user!.courses[i].courseId);   
    }

    let allCourses=[];

    for(let i=0;i<courses.length;i++){
        const packageDetails=await Package.findById(user!.courses[i]!.packageId);
        allCourses[i]={
            courseDetails:courses[i],
            packageDetails:packageDetails
            
        }
    }




    res.send(allCourses);

});


// Get a course by id with it's packages


router.get("/api/courses/:id",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const course= await Course.findById(req.params.id).populate('packages.packageId');

    res.send(course);
})


// Create a new course by admin

router.post("/api/courses",[
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("image").not().isEmpty().withMessage("Image is required"),
],validateRequest,currentUser,requireAuth,async(req:Request,res:Response)=>{
    const {title,description,image}=req.body;
    const course=Course.build({title,description,image,packages:[]});
    await course.save();
    res.status(201).send(course);
});




export { router as courseRoutes };