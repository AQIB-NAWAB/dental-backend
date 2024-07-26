
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
import { Ticket } from "../models/request.model";
import mongoose from "mongoose";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();


// Create a new ticket by a user to request a course with a package

router.post(
  "/api/tickets",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("courseId").not().isEmpty().withMessage("Course ID is required"),
    body("packageId").not().isEmpty().withMessage("Package ID is required"),
    body("paidThrough").not().isEmpty().withMessage("Payment method is required"),
  ],
  validateRequest,
  currentUser,
  requireAuth,
    async (req: Request, res: Response) => {
        const { email, courseId, packageId, paidThrough, cardNumber } = req.body;
        
        const user= await User.findById(req.currentUser!.id);
        
        // Check if the user has already requested the course with the package

        const existingTicket = await Ticket.findOne({ email, courseId, packageId });

        if (existingTicket) {
            throw new BadRequestError("You have already requested this course with the package");
        }

        

        
        const ticket = Ticket.build({
            email,
            createdBy: user!.id,
            courseId,
            packageId,
            paidThrough,
            cardNumber,
            status: "pending"
        });

        await ticket.save();

        res.status(201).send(ticket);

    }
);



// Get all tickets by admin

router.get(
  "/api/tickets",
  currentUser,
  requireAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.find({status:"pending"}).populate('courseId').populate('packageId');
    res.send(tickets);
  }
);



// Delete a ticket by admin with ticket ID


router.delete(
  "/api/tickets/:id",
  currentUser,
  requireAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new BadRequestError("Ticket not found");
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.send({ message: "Ticket deleted successfully" });
  }
);


// Update the status of a ticket by admin with ticket ID

router.put(
  "/api/tickets/:id",
    [
        body("status").not().isEmpty().withMessage("Status is required"),
    ],
    validateRequest,
  currentUser,
  requireAuth,
  isAdmin,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new BadRequestError("Ticket not found");
    }

    ticket.set({
      status: req.body.status,
    });

    await ticket.save();

    // Now we need to assign that course to user who requested it

    const user = await User.findById(ticket.createdBy);

    if (!user) {
      throw new BadRequestError("User not found");
    }


    // Assign the course to the user

    user.courses.push({courseId: ticket.courseId, packageId: ticket.packageId});

    await user.save();



    res.send({ message: "Ticket updated successfully" });
  }
);










export { router as RequestRoutes };