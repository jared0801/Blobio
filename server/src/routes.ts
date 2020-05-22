import express, { Request, Response } from 'express';
import path from 'path';
export const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

router.get('/register', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/register.html'));
});

router.use('/client', express.static(path.join(__dirname, '../../client')));
