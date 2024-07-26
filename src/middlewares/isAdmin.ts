import {Express,Request,Response,NextFunction} from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import mongoose from "mongoose";
import { User } from "../models/user.mode";

export const isAdmin=async(req:Request,res:Response,next:NextFunction)=>{
    const user= await User.findById(req.currentUser!.id);

    if(user?.role!="admin"){
        throw new NotAuthorizedError();
    }

    next();
}   


