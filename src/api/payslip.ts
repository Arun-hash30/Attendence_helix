import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import bodyParser from 'body-parser';
import payslipRouter from '../api/features/payslip/payslip.route.js';

const app = express();
app.use(bodyParser.json());
app.use('/api/payslip', payslipRouter);

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
