
import { Client } from "square";
import { randomUUID } from "crypto";
import express from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { Request, Response } from "express";




const { paymentsApi } = new Client({
  accessToken: 'EAAAlyvuKkagCL5JrFG0hIxYiko6mqyzY-PX-DjBk_04nH0TlEzBAS3kYXblrud8',
  environment: "sandbox" as any
});

const router = express.Router();

router.post("/create-checkout-session",
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('nonce').isString().withMessage('Nonce must be a string'),
  ],
  validateRequest, async (req:Request, res:Response) => {
const {amount,nonce}=req.body;
  

  const request_body = {
    sourceId: nonce,
    amountMoney: {
      currency: 'USD',
      amount: amount, 
    },
    idempotencyKey: randomUUID(),
  };

  try {
    const response = await paymentsApi.createPayment(request_body);

    const responseData = JSON.parse(JSON.stringify(response, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    res.json(responseData);
  } catch (error:any) {
    console.log(error)
    res.status(500).json({ errors: error.errors });
  }
});



export {router  as paymentRoute} ;