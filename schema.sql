CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    release_date DATE,
    poster_path VARCHAR(255),
    overview TEXT,
    comments TEXT
);