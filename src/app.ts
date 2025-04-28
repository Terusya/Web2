import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для динамической страницы
app.get('/page', (req: Request, res: Response) => {
    const user = req.query.user || 'Guest';
    res.render('pages/home', {
        title: 'Главная',
        user,
        currentYear: new Date().getFullYear()
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});