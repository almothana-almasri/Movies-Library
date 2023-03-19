'use strict';

const express = require('express');
const app = express();
const port = 3000;
const data = require('./Movie Data/data.json');

function MovieData(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

app.get('/', (req, res) => {
    const movie = new MovieData(data.title, data.poster_path, data.overview);
    res.json(movie);
});
app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        responseText: 'Page not found'
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        responseText: 'Sorry, something went wrong'
    });
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});