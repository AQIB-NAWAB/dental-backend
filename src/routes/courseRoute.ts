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
import { Ticket } from "../models/request.model";

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
],validateRequest,currentUser,requireAuth,isAdmin,async(req:Request,res:Response)=>{
    const {title,description,image}=req.body;
    const course=Course.build({title,description,image,packages:[]});
    await course.save();
    res.status(201).send(course);
});


// get all users who have purchased a course 

router.get("/api/active-users",currentUser,requireAuth,isAdmin,async(req:Request,res:Response)=>{


const activeCourses=await Ticket.find({status:"approve"}).populate('createdBy').populate('packageId').populate('courseId');

    res.send(activeCourses);

})


// Delete a course by admin for a user and delete the ticket of that course 

router.delete("/api/active-users",
    [
        body("userId").not().isEmpty().withMessage("userId is required"),
        body("courseId").not().isEmpty().withMessage("courseId is required"),
        body("packageId").not().isEmpty().withMessage("packageId is required")
    ],
    validateRequest
    ,   
    currentUser,requireAuth,isAdmin,async(req:Request,res:Response)=>{

const {userId,courseId,packageId}=req.body;

const user=await User.findById(userId);

if(!user){
    throw new BadRequestError("User not found");
}


const ticket=await Ticket.findOne({createdBy:userId,courseId,packageId,status:"approve"});


if(!ticket){
    throw new BadRequestError("Ticket not found");
}


await Ticket.findByIdAndDelete(ticket.id);


// remove course from user courses array using the course id and the package id

let courses=[];

for(let i=0;i<user!.courses.length;i++){
    if(user!.courses[i].courseId!=courseId){
        courses.push(user!.courses[i]);
    }
}

user!.courses=courses;




await user.save();


res.send({message:"Course deleted successfully"});

});















export { router as courseRoutes };