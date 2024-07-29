import express from 'express'
import "express-async-errors"
import { json } from 'body-parser'
import mongoose from 'mongoose'
import cookieSession from 'cookie-session'
import { NotFoundError } from './errors/not-found-error'
import { errorHandler } from './middlewares/error-handler'
import cors from 'cors'





// Routes

import {userRoutes} from "./routes/userRoute"
import {requestRoutes} from "./routes/requestRoute"
import {courseRoutes} from "./routes/courseRoute"
import {packageRoutes} from "./routes/packageRoute"
import { contentRoutes } from './routes/contentRoute'

// Error handler
const app = express()

app.set('trust proxy', true)

app.use(json())
app.use(cookieSession({
  signed: false,
}))
app.use(
  cors({
    origin: ["http://localhost:5173",],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(userRoutes)
app.use(requestRoutes)
app.use(courseRoutes)
app.use(packageRoutes)
app.use(contentRoutes)

app.all("*",()=>{
  throw new NotFoundError()
})

app.use(errorHandler)



export {app}