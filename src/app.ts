import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import cors from 'cors';
import axios, { AxiosError } from 'axios';
import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';

// Routes
import { userRoutes } from './routes/userRoute';
import { requestRoutes } from './routes/requestRoute';
import { courseRoutes } from './routes/courseRoute';
import { packageRoutes } from './routes/packageRoute';
import { contentRoutes } from './routes/contentRoute';
import { paymentRoute } from './routes/paymentRoute';

// Error handler
const app = express();

app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
}));
app.use(
  cors({
    origin: ['http://dental-strivers.vercel.app', 'http://localhost:5173'],
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true,
  })
);


app.get('/proxy', async (req: Request, res: Response) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).send('URL query parameter is required');
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    // TypeScript type guard to handle AxiosError or generic Error
    if (axios.isAxiosError(error)) {
      console.error('Axios error fetching PDF:', error.message);
      console.error(error.stack);
    } else {
      console.error('Unknown error fetching PDF:', (error as Error).message);
      console.error((error as Error).stack);
    }
    res.status(500).send('Error fetching PDF');
  }
});

app.use(userRoutes);
app.use(requestRoutes);
app.use(courseRoutes);
app.use(packageRoutes);
app.use(contentRoutes);
app.use(paymentRoute);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
