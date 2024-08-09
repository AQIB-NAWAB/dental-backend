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
import { sendEmail } from "../utils/sendEmail";

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

router.post('/api/users/signout', (req, res) => {
  req.session = {
    jwt: null
  }

  res.send({})

})

// get the current user
router.get(
  "/api/users/current-user",
  currentUser,
  requireAuth,
  async (req, res) => {
    const user = await User.findById(req?.currentUser?.id);

    res.send(user);
  }
);

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

router.get(
  "/api/users/loaduser",
  currentUser,
  requireAuth,
  async (req, res) => {
    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      throw new BadRequestError("User not found");
    }

  

  
    res.status(201).send(user);
  }
);

// contact us route

router.post(
  "/api/contactus",
  [
    body("name").not().isEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("message").not().isEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, email, message } = req.body;

    const html = `
    <!DOCTYPE html>
<html>
<head>
    <title>Request Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
            padding: 0;
            margin: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .header h1 {
            color: #007BFF;
        }
        .content {
            padding: 20px 0;
        }
        .content p {
            margin: 0 0 10px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            color: #888;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            font-size: 16px;
            color: white !important; 
            background-color: #007BFF;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dental Strivers</h1>
        </div>
        <div class="content">
            <h2>Contact US </h2>
            <p>Dear ${name},</p>
            <p>
            Thanks for contacting us. We will get back to you as soon as possible.
            </p>
            <h3>Here is your message :</h3>
            <p>${message}</p>

            <p>If you have any questions, please don't hesitate to contact us.</p>
            <a href="https://yourwebsite.com/contact" class="btn">Contact Us</a>
        </div>
        <div class="footer">
            <p>&copy; 2024 Dental Strivers. All rights reserved.</p>
            <p>123 Dental Street, Smile City, 45678</p>
        </div>
    </div>
</body>
</html>

    `;

    const options = {
      email: email,
      subject: "Contact Us",
      html: html,
    };

    try {
      sendEmail(options);
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Email not sent");
    }

    res.status(201).json({ message: "Email sent" });
  }
);


// Reset Password

router.post(
  "/api/reset-password",
  [
    body("email").isEmail().withMessage("Email must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    user.resetToken = resetToken;
    await user.save();

    const html = `
    <!DOCTYPE html>
<html>
<head>
    <title>Request Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
            padding: 0;
            margin: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .header h1 {
            color: #007BFF;
        }
        .content {
            padding: 20px 0;
        }
        .content p {
            margin: 0 0 10px;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            color: #888;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            font-size: 16px;
            color: white !important; 
            background-color: #007BFF;
            text-decoration: none;
            border-radius: 5px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dental Strivers</h1>
        </div>
        <div class="content">
            <h2>Reset Password</h2>
            <p>Dear ${user.name},</p>
            <p>
            You are receiving this email because you have requested to reset your password.
            </p>
            <p>Please click the link below to reset your password.</p>
            <a href="${process.env.LIVE_URL}/reset-password/${resetToken}" class="btn">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Dental Strivers. All rights reserved.</p>
            <p>123 Dental Street, Smile City, 45678</p>
        </div>
    </div>
</body>
</html>

    `;

    const options = {
      email: email,
      subject: "Reset Password",
      html: html,
    };

    try {
      sendEmail(options);
    } catch (err) {
      console.log(err);
      throw new BadRequestError("Email not sent");
    }

    res.status(201).json({ message: "Email sent" });
  }

);



// token validation

router.get(
  "/api/validate-token/:token",
  async (req: Request, res: Response) => {

    const { token } = req.params;


    if (!token ) {
      throw new BadRequestError("Invalid token");
    
    }

  

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!);

      

      const { id } = payload as { id: string };


      const user = await User.findById(id);


      if (!user) {
        throw new BadRequestError("Invalid token");
      }


      // do the login stuff

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


      // remove the token from the user

      user.resetToken = "";

      await user.save();


      res.status(200).send(user);

    } catch (err) {
      throw new BadRequestError("Invalid token");
    }
  }
);







export { router as userRoutes };
