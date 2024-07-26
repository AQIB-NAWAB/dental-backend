import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import { RequestValidationError } from "../errors/request-validation-error";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

import { User } from "../models/user.mode";
import { Password } from "../utils/password";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Course } from "../models/courses.model";

const router = express.Router();



// Get all courses 
router.get("/api/courses",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const courses= await Course.find({});

    res.send(courses);
}
);




// Get all courses of a user from array of courses
  
router.get("/api/courses/user",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const user=await User.findById(req.currentUser!.id);
    let courses=[];
    for(let i=0;i<user!.courses.length;i++){
        courses[i]=await Course.findById(user!.courses[i].courseId);

    }

    res.send(courses);

});

