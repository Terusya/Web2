import express, { Request, Response, NextFunction } from 'express';

// ������� ��������� ����������
const app = express();
const port = 3000;

// Middleware 1: ����������� ��������
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

// ���������� middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// �������� ����
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// ������ �������
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});