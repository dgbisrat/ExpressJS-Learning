import express from "express";

const app = express();

const movies = [
  {
    id: 1,
    title: "Inception",
    year: 2010,
    rating: 8.8,
  },
  {
    id: 2,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
  },
];

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Movies API" });
});

// we are asking for minRating query if there is one and if it is we are filtering 
app.get("/movies", (req, res) => {
  const { minRating } = req.query;

  

  if (minRating) {
    const filtered = movies.filter((movie) => movie.rating >= minRating);

    if(filtered.length === 0){
      return res.json({Message:"No movies found with this rating",Movies:movies});
    }``
    return res.json(filtered);
  }

  res.json(movies);
});

app.get("/movies/top", (req, res) => {
  res.json({ top: "Top Movies" });
});

// Get movies by id

app.get("/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((movie) => movie.id === id);

  if (!movie) {
    return res.status(404).json({ error: "Movie not found!" });
  }

  res.json(movie);
});

// Catch any thing out of this error
app.use((req, res) => {
  res.status(404).json({ error: "Route not found!" });
});

app.listen(4000, () => {
  console.log("Run on 4000");
});

/* note: In routes movies/top and movies/:id , the first one is specific route and the second one is dynamic route the order should be specific above the dynamic because , movies/:id matches everything whether you give it a number or a string if the dynamic comes first the id catches top value as an id and executes based on the rules of that path so we cannot access the movies/top route  */
