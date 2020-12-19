import express, { Request, Response } from 'express';
import path from 'path';
export const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/register', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.use('/', express.static(path.join(__dirname, '../public')));
