import express, { Request, Response, NextFunction } from 'express';

// Создаем экземпляр приложения
const app = express();
const port = 3000;

// Middleware 1: Логирование запросов
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

// Подключаем middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Основной роут
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});