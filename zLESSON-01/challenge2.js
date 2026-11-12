import express from "express";

const app = express();

const movies = [
  { id: 1, title: "Inception", year: 2010, rating: 8.8 },
  { id: 2, title: "Interstellar", year: 2014, rating: 8.7 },
  { id: 3, title: "The Dark Knight", year: 2008, rating: 9.0 },
];

app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to Movie Shelf API</h1> <p>Movie Count: ${movies.length} </p>`,
  );
});

app.get("/movies", (req, res) => {
  res.json(movies);
});

app.get("/movies/top", (req, res) => {
  res.json(movies.filter((movie) => movie.rating > 8.7));
});

app.get("/movies/count", (req, res) => {
  res.json({ Count: movies.length });
});

app.use((req, res) => {
  res.status(404).send("404 Page not found :(");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
