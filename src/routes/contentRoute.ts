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

const router = express.Router();



// get all content of a course according to pachage id and coures id
router.get("/api/content",currentUser,requireAuth,async(req:Request,res:Response)=>{
    const {courseId,packageId}=req.body;
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



    

    if(targetedPackage.packageType=="mocks" || targetedPackage.packageType=="mock"){
        const user=await User.findById(req.currentUser!.id);

        const ticket=await Ticket.findOne({email:user?.email,courseId,packageId});

        const limit=ticket?.mocksPurcahsed || 0;

        
        const content=await Content.find({courseId,packageId,contentType:"mock"}).limit(limit);
        return res.send(content);
    }else{
        const content=await Content.find({courseId,packageId});
        return res.send(content);
    }


});

// add content to speicific course and package

router.post("/api/content",currentUser,requireAuth,[
    body("courseId").not().isEmpty().withMessage("courseId is required"),
    body("packageId").not().isEmpty().withMessage("packageId is required"),
    body("packageName").not().isEmpty().withMessage("packageName is required"),
    body("contentType").not().isEmpty().withMessage("contentType is required"),
    body("weekNo").not().isEmpty().withMessage("weekNo is required"),
    body("topic").not().isEmpty().withMessage("topic is required"),
    body("lectureNo").not().isEmpty().withMessage("lecture No  is required")
],validateRequest,async(req:Request,res:Response)=>{


    const {courseId,packageId,packageName,contentType,weekNo,lectureNo}=req.body;


    const coures=await Course.findById(courseId);

    if(!coures){
        throw new BadRequestError("Course not found");
    }

    const targetedPackage=await Package.findById(packageId);

    if(!targetedPackage){
        throw new BadRequestError("Package not found");
    }


    if(contentType==="mock" || contentType==="mocks" ){
        const {mockLink,topic}=req.body;
        const content=Content.build({courseId,packageId,packageName,contentType,weekNo,topic,mockLink,lectureNo,meetLink:"",pdfLink:""});  
        await content.save();
        return res.status(201).send(content);
    }else if(contentType==="zoom"){
        const {meetLink,topic}=req.body;
        const content=Content.build({courseId,packageId,packageName,contentType,weekNo,topic,meetLink,lectureNo,mockLink:"",pdfLink:""});  
        await content.save();
        return res.status(201).send(content);
    }else if(contentType==="pdf"){
        const {pdfLink,topic}=req.body;
        const content=Content.build({courseId,packageId,packageName,contentType,weekNo,topic,pdfLink,lectureNo,mockLink:"",meetLink:""});  
        await content.save();
        return res.status(201).send(content);
    }else{
        throw new BadRequestError("Invalid content type");
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


export { router as contentRoutes };