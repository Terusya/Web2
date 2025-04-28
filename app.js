const express = require('express');
const app = express();
const port = 3000;

// Обработка всех HTTP-методов и путей
app.use((req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});