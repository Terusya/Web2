import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const port = 3000;

// ��������� EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ����������� �����
app.use(express.static(path.join(__dirname, 'public')));

// ������� ��� ������������ ��������
app.get('/page', (req: Request, res: Response) => {
    const user = req.query.user || 'Guest';
    res.render('pages/home', {
        title: '�������',
        user,
        currentYear: new Date().getFullYear()
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});