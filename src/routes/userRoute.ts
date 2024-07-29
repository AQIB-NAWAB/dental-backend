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

const router = express.Router();

// SIGN-UP ROUTE

router.post(
  "/api/users/signup",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    const user = User.build({
      email,
      password,
      name,
      courses: [],
      role: "user",
    });
    await user.save();
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  }
);

// SIGN-IN ROUTE

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(user.password, password);

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(user);
  }
);

// Sign Out

router.post("/api/users/signout", (req, res) => {
  req.session = null;
  res.send({});
});


// get the current user 
router.get("/api/users/current-user",currentUser,requireAuth,async(req,res)=>{
    const user=await User.findById(req?.currentUser?.id);

    res.send(user)
})



// Update Password


router.post(
    "/api/users/change-password",
    [
      body("oldPassword").not().isEmpty().withMessage("Old password is required"),
      body("newPassword")
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage("New password must be between 4 and 20 characters"),
    ],
    validateRequest,
    currentUser,
    requireAuth,
    async (req: Request, res: Response) => {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const user = await User.findById(req.currentUser!.id);
  
      if (!user) {
        throw new BadRequestError("User not found");
      }
  
      const passwordsMatch = await Password.compare(user.password, oldPassword);
      if (!passwordsMatch) {
        throw new BadRequestError("Old password is incorrect");
      }
  
      if (newPassword !== confirmPassword) {
        throw new BadRequestError("New passwords do not match");
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).send({ message: "Password updated successfully" });
    }
  );
  
  



  // Load User 

  router.get("/api/users/loaduser",currentUser,requireAuth,async(req,res)=>{
    const user=await User.findById(req.currentUser?.id);
    if(!user){
        throw new BadRequestError("User not found");
    }
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(user);
  });

  // get all users whoes role is user


export {router as userRoutes}