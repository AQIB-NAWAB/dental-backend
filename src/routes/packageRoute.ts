import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";

import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";

import { Package } from "../models/package.model";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { isAdmin } from "../middlewares/isAdmin";
import { Course } from "../models/courses.model";

const router = express.Router();

// Create a new package by admin for a courese

router.post(
  "/api/packages",
  [
    body("packageName").not().isEmpty().withMessage("Title is required"),
    body("price").not().isEmpty().withMessage("Price is required"),
    body("courseId").not().isEmpty().withMessage("Course ID is required"),
    body("start").not().isEmpty().withMessage("Start date is required"),
    body("end").not().isEmpty().withMessage("End date is required"),
    body("packageType").not().isEmpty().withMessage("Package type is required"),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { packageName, price, courseId, start, end, packageType } = req.body;

    if (price <= 0) {
      throw new BadRequestError("Price must be greater than 0");
    }

    const coures = await Course.findById(courseId);

    // alredy exist package for that coures with same name
    const existingPackage = await Package.find({ packageName, courseId });

    if (existingPackage.length > 0) {
      throw new BadRequestError("Package already exist for this course with same name");
    }

    if (packageType === "mock") {
      const { mocksPrices } = req.body;
      if (!mocksPrices) {
        throw new BadRequestError("MocksPrices is required for mocks package ");
      }

      const newPackage = await Package.build({
        packageName,
        price,
        courseId,
        start,
        end,
        packageType,
        mocksPrices: mocksPrices.map((mockPrice: any) => ({
          quantity: mockPrice.quantity,
          price: mockPrice.price,
        })),
      });

      await newPackage.save();

      // push the package id to the course packages array
      coures!.packages.push({ packageId: newPackage.id });
      await coures!.save();

      return res.status(201).send(newPackage);
    } else {
      const newPackage = await Package.build({
        packageName,
        price,
        courseId,
        start,
        end,
        packageType,
        mocksPrices: [],
      });

      await newPackage.save();

      // push the package id to the course packages array
      coures!.packages.push({ packageId: newPackage.id });
      await coures!.save();

      return res.status(201).send(newPackage);
    }

    res.status(201).send("Package created");
  }
);



// Get all packages of a course 

router.get(
  "/api/packages/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const packages = await Package.find({ courseId: req.params.id });

    res.send(packages);
  }
);



// delete a package by admin

router.delete(
  "/api/packages/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const packageToDelete = await Package.findById(req.params.id);

    if (!packageToDelete) {
      throw new BadRequestError("Package not found");
    }

    const course = await Course.findById(packageToDelete.courseId);

    if (!course) {
      throw new BadRequestError("Course not found");
    }

    // remove the object from the array of packages in the course

    course.packages = course.packages.filter(
      (pack) => pack.packageId.toString() !== packageToDelete.id.toString()
    );

    await course.save();


    await Package.findByIdAndDelete(req.params.id);

    res.send({ message: "Package deleted" });
  }
);


// update a package by admin

router.put(
  "/api/packages/:id",
  [
    body("packageName").not().isEmpty().withMessage("Title is required"),
    body("price").not().isEmpty().withMessage("Price is required"),
    body("start").not().isEmpty().withMessage("Start date is required"),
    body("end").not().isEmpty().withMessage("End date is required"),
    body("packageType").not().isEmpty().withMessage("Package type is required"),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { packageName, price, start, end, packageType } = req.body;

    if (price <= 0) {
      throw new BadRequestError("Price must be greater than 0");
    }

    const packageToUpdate = await Package.findById(req.params.id);

    if (!packageToUpdate) {
      throw new BadRequestError("Package not found");
    }

    if (packageType === "mock") {
      const { mocksPrices } = req.body;
      if (!mocksPrices) {
        throw new BadRequestError("MocksPrices is required for mocks package");
      }

      packageToUpdate.packageName = packageName;
      packageToUpdate.price = price;
      packageToUpdate.start = start;
      packageToUpdate.end = end;
      packageToUpdate.packageType = packageType;
      packageToUpdate.mocksPrices = mocksPrices.map((mockPrice: any) => ({
        quatity: mockPrice.quatity,
        price: mockPrice.price,
      }));

      await packageToUpdate.save();

      return res.status(201).send(packageToUpdate);
    } else {
      packageToUpdate.packageName = packageName;
      packageToUpdate.price = price;
      packageToUpdate.start = start;
      packageToUpdate.end = end;
      packageToUpdate.packageType = packageType;
      packageToUpdate.mocksPrices = [];

      await packageToUpdate.save();

      return res.status(201).send(packageToUpdate);
    }
  }
);


export { router as packageRoutes };
