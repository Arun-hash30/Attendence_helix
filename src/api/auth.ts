import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import authRouter from '../api/features/auth/auth.route.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
