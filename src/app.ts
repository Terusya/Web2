import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './Models/User';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение MongoDB
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// Роуты
app.post('/users', async (req: Request, res: Response) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            status: 'success',
            data: user
        });
    } catch (err) {
        handleError(err, res);
    }
});

app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-__v');
        res.json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        user ? res.status(204).end() : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        handleError(err, res);
    }
});

// Обработчик ошибок
const handleError = (err: unknown, res: Response) => {
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            status: 'fail',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});