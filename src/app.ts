import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './Models/User';
import { setupSwagger } from './swagger';

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

// Swagger документация
setupSwagger(app);

// Роуты

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создание нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 */
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получение списка пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 */
app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await User.find().select('-__v');
        res.json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (err) {
        handleError(err, res);
    }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удаление пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Пользователь удален
 */
app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        user ? res.status(204).end() : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        handleError(err, res);
    }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Обновление данных пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Данные пользователя обновлены
 *       404:
 *         description: Пользователь не найден
 *       400:
 *         description: Ошибка валидации
 */
app.patch('/users/:id', async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
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