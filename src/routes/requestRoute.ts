import express, { Request, Response } from "express";
import { body } from "express-validator";

import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

import { User } from "../models/user.mode";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { Ticket } from "../models/request.model";
import { isAdmin } from "../middlewares/isAdmin";
import { sendEmail } from "../utils/sendEmail";
import fs from "fs";
import path from "path";

const router = express.Router();

// Create a new ticket by a user to request a course with a package

router.post(
  "/api/tickets",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("courseId").not().isEmpty().withMessage("Course ID is required"),
    body("packageId").not().isEmpty().withMessage("Package ID is required"),
    body("paidThrough")
      .not()
      .isEmpty()
      .withMessage("Payment method is required"),
    body("pricePaid").not().isEmpty().withMessage("Price is required"),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const {
      email,
      courseId,
      packageId,
      paidThrough,
      receiptLink,
      pricePaid,
      mocksPurcahsed,
    } = req.body;

    const user = await User.findById(req.currentUser!.id);

    // Check if the user has already requested the course with the package

    const existingTicket = await Ticket.findOne({ email, courseId, packageId });

    if (existingTicket) {
      throw new BadRequestError(
        "You have already requested this course with the package"
      );
    }

    const ticket = Ticket.build({
      email,
      createdBy: user!.id,
      courseId,
      packageId,
      paidThrough,
      receiptLink,
      status: "pending",
      pricePaid,
      mocksPurcahsed: mocksPurcahsed ? mocksPurcahsed : 0,
    });

    await ticket.save();

    const options = {
      email: email,
      subject: "Course Requested",
      html: fs.readFileSync(
        path.join(__dirname, "../mailsTemplate/requestmail.html"),
        "utf-8"
      ),
    };

    try {
      sendEmail(options);
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Email not sent");
    }

    res.status(201).send(ticket);
  }
);

// Get all tickets by admin

router.get(
  "/api/tickets",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.find({ status: "pending" }).populate('createdBy')
      .populate("courseId")
      .populate("packageId");
    res.send(tickets);
  }
);

// Delete a ticket by admin with ticket ID

router.delete(
  "/api/tickets/:id",
  currentUser,
  requireAuth,
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
  [body("status").not().isEmpty().withMessage("Status is required")],
  validateRequest,
  currentUser,
  requireAuth,
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

    user.courses.push({
      courseId: ticket.courseId,
      packageId: ticket.packageId,
    });

    await user.save();

    res.send({ message: "Ticket updated successfully" });
  }
);

// get all tickets whose status is pending

router.get(
  "/api/pendingtickets",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.find({ status: "pending" })
      .populate("courseId")
      .populate("packageId");
    res.send(tickets);
  }
);

// Get all  requeste by a user whose status is approve

router.get(
  "/api/mytickets",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.find({
      createdBy: req.currentUser!.id,
      status: "approve",
    })
      .populate("courseId")
      .populate("packageId");

    res.send(tickets);
  }
);

export { router as requestRoutes };
