'use strict';

const express = require('express');
const app = express();
const cors = require('cors')
const axios = require('axios');
const StoredData = require('./Movie Data/data.json');
const bodyParser = require('body-parser')
const { json } = require('express');
const { Client } = require('pg')
require('dotenv').config()
const URL = process.env.DATABASE_URL
const client = new Client(URL)
const apiKey = process.env.API_Key
const port = process.env.port;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

function MovieData(id, name, first_air_date, poster_path, overview) {
    this.id = id;
    this.title = name;
    this.release_date = first_air_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

app.get('/', (req, res) => {
    const movie = new MovieData(StoredData.name, StoredData.poster_path, StoredData.overview);
    res.json(movie);
});
app.get('/favorite', (req, res) => {
    res.send('Welcome to Favorite Page');
});
app.get("/trending", (req, res) => {
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(url)
        .then((result) => {
            let trendingMovies = result.data.results.map((trending) => {
                return new MovieData(trending.id, trending.name, trending.first_air_date, trending.poster_path, trending.overview)
            })
            console.log(result.data.results[0]);
            res.json(trendingMovies);
        })
        .catch((err) => {
            console.log(err);
            errorHandler(err, req, res);
        });
});
app.get("/search", (req, res) => {
    let MovieName = req.query.name
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${MovieName}&page=2`
    axios.get(url)
        .then((result) => {
            let searchedMovies = result.data.results.map((searched) => {
                return new MovieData(searched.id, searched.name, searched.first_air_date, searched.poster_path, searched.overview)
            })
            console.log(req.query);
            console.log(result.data.results[0]);
            res.json(searchedMovies);
        })
        .catch((err) => {
            console.log(err);
            errorHandler(err, req, res);
        });
})
app.get("/discover", (req, res) => {
    let url = ` https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`;
    axios.get(url)
        .then((result) => {
            let trendingMovies = result.data.results.map((trending) => {
                return new MovieData(trending.id, trending.name, trending.first_air_date, trending.poster_path, trending.overview)
            })
            console.log(result.data.results[0]);
            res.json(trendingMovies);
        })
        .catch((err) => {
            console.log(err);
            errorHandler(err, req, res);
        });
});
app.get("/keyword", (req, res) => {
    let keyword = req.query.name
    let url = ` https://api.themoviedb.org/3/keyword/${keyword}?api_key=${apiKey}`
    axios.get(url)
        .then((result) => {
            let searchedMovies = result.data.results.map((searched) => {
                return new MovieData(searched.id, searched.name, searched.first_air_date, searched.poster_path, searched.overview)
            })
            console.log(req.query);
            console.log(result.data.results[0]);
            res.json(searchedMovies);
        })
        .catch((err) => {
            console.log(err);
            errorHandler(err, req, res);
        });
})
app.post('/addMovie', (req, res) => {
    let { title, release_date, poster_path, overview, comments } = req.body;
    let sql = 'INSERT INTO movies (title, release_date, poster_path, overview, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    let values = [title, release_date, poster_path, overview, comments];
    client.query(sql, values).then(result => {
        console.log(result.rows);
        res.status(201).json(result.rows);
    }).catch(err => {
        console.log(err);
        errorHandler(err, req, res);

    })
});
app.get('/getMovies', (req, res) => {
    let sql = `SELECT * FROM movies;`;
    client.query(sql).then((result) => {
        console.log(result);
        res.json(result.rows)
    }).catch((err) => {
        console.log(err);
        errorHandler(err, req, res);

    })
});
app.put('/UPDATE/:id', (req, res) => {
    let {id} = req.params;
    let { title, release_date, poster_path, overview, comments } = req.body;
    let sql = `UPDATE movies SET title=$1, release_date=$2, poster_path=$3, overview=$4, comments=$5 WHERE id=$6;`;
    let values = [title, release_date, poster_path, overview, comments, id];
    client.query(sql, values).then(result => {
        console.log(result);
        res.send("Updated Title: " + title + " Comments: " + comments)
    }).catch(err => {
        console.log(err);
        errorHandler(err, req, res);
    })
})
app.delete('/DELETE/:id', (req, res) => {
    let id = req.params.id;
    let sql = `DELETE FROM movies WHERE id=$1;`;
    let values = [id];
    client.query(sql, values).then(result => {
        console.log(result);
        res.status(200).send("Deleted ID: " + id);
        }).catch(err => {
        console.log(err);
        errorHandler(err, req, res);
    })
})
app.get('/getMovie/:id', (req, res) => {
    let id = req.params.id;
    let sql = `SELECT * FROM movies WHERE id=$1;`;
    let values = [id];
    client.query(sql, values).then((result) => {
        console.log(result);
        res.json(result.rows)
        }).catch((err) => {
        console.log(err);
        errorHandler(err, req, res);
    })
})


// Error handling
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        responseText: 'Page not found'
    });
});
app.use(errorHandler);
function errorHandler(error, req, res) {
    console.error(error.stack);
    res.status(500).json({
        status: 500,
        responseText: 'Sorry, something went wrong'
    });
};

// DB connect then listen for port
client.connect().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    })
}).catch(err => {
    console.log(`Failed to listen on port ${port} because of error: ${err}`);
})