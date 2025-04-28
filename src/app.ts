import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './Models/User';
import { setupSwagger } from './swagger';
import jwt from 'jsonwebtoken';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES) {
    console.error('❌ Missing JWT configuration in .env file');
    process.exit(1);
}


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
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Регистрация нового пользователя
 *     description: Создает нового пользователя в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Пользователь с таким email уже существует
 */
app.post('/auth/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, age } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            age
        });

        // Создаем объект пользователя без пароля
        const { password: _, ...userData } = user.toObject();

        res.status(201).json({
            status: 'success',
            data: userData
        });
    } catch (err) {
        handleAuthError(err, res);
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Аутентификация пользователя
 *     description: Возвращает JWT токен для авторизации
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Неверные учетные данные
 */
app.post('/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) throw new Error('Invalid email or password');

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) throw new Error('Invalid email or password');

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string, // <-- Явное приведение типа
            { expiresIn: process.env.JWT_EXPIRES as string } // <-- Явное приведение типа
        );

        const { password: _, ...userData } = user.toObject();

        res.json({
            status: 'success',
            token,
            data: userData
        });
    } catch (err) {
        handleAuthError(err, res);
    }
});

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
const handleAuthError = (err: unknown, res: Response) => {
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            status: 'fail',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if ((err as any).code === 11000) {
        return res.status(400).json({
            status: 'fail',
            message: 'Email already exists'
        });
    }

    if (err instanceof Error) {
        return res.status(401).json({
            status: 'fail',
            message: err.message
        });
    }

    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};

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
    console.log(`Server running on port ${port}`);
});