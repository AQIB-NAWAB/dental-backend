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
import { Content } from "../models/content.model";
import { Package } from "../models/package.model";
import { Ticket } from "../models/request.model";
import { convert } from "../helper/helper";

const router = express.Router();



// get all content of a course according to pachage id and coures id
router.get("/api/content/:courseId/:packageId",currentUser,async(req:Request,res:Response)=>{
    const {courseId,packageId}=req.params;
    const coures=await Course.findById(courseId);
    if(!coures){
        throw new BadRequestError("Course not found");
    }
    const targetedPackage=await Package.findById(packageId);
    if(!targetedPackage){
        throw new BadRequestError("Package not found");
    }
    const user=await User.findById(req.currentUser!.id);

    if(user?.role=="user"){
    // check that this user has purchased the courese or not with couresid and packageid

        const ticket=await Ticket.findOne({createdBy:req.currentUser!.id,courseId,packageId,status:"approve"});
        if(!ticket){
            throw new BadRequestError("You have not purchased this course");
        }

    }

    if(targetedPackage.packageType=="mock"){
        const user=await User.findById(req.currentUser!.id);

        const ticket=await Ticket.findOne({email:user?.email,courseId,packageId});

        const limit=(ticket?.mocksPurchased! * 8) || 8;

        
        const content=await Content.find({courseId,packageId,contentType:"mock"}).limit(limit);
        console.log(content)
        return res.send(content);
    }else{
        const content=await Content.find({courseId,packageId});
        return res.send(content);
    }


});


// Add content to a course

router.post("/api/content",currentUser,requireAuth,isAdmin,[
    body("courseId").not().isEmpty().withMessage("Course id is required"),
    body("packages").isArray().not().isEmpty().withMessage("Packages is required"),
    body("contentType").not().isEmpty().withMessage("Content type is required"),
    body("weekNo").not().isEmpty().withMessage("Week no is required"),
    body("lectureNo").not().isEmpty().withMessage("Lecture no is required"),
],validateRequest,async(req:Request,res:Response)=>{
    const {courseId,packages,contentType,weekNo,lectureNo,topic,meetLink,pdfLink,mockLink}=req.body;
    
    const course=await Course.findById(courseId);

    if(!course){
        throw new BadRequestError("Course not found");
    }


    for(let i=0;i<packages.length;i++){
        const packageId=packages[i];
        const targetedPackage=await Package.findById(packageId);
        if(!targetedPackage){
            throw new BadRequestError("Package not found");
        }
        const content=Content.build({courseId,packageId,contentType,weekNo,lectureNo,topic,meetLink,pdfLink,mockLink,packageName:targetedPackage.packageName});
        await content.save();
    }
    

    res.send({message:"Content added successfully"});

});




    
// Delete content by id

router.delete("/api/content/",currentUser,requireAuth,isAdmin,async(req:Request,res:Response)=>{
    const {contentId}=req.body;
    const content= await Content.findById(contentId);
    if(!content){
        throw new BadRequestError("Content not found");
    }
    await Content.findByIdAndDelete(contentId);
    res.send(content);
});





export { router as contentRoutes }