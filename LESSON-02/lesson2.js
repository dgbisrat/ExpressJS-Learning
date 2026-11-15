import express from "express";

const app = express();

app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("Get Ping!");
});

app.post("/ping", (req, res) => {
  res.send("Post Pong!");
});

app.delete("/ping", (req, res) => {
  res.send("Delete Pong!");
});

app.get("/notes/:noteId", (req, res) => {
  console.log(req.params);
  res.send(`You asked for note ${req.params.id}`);
});

// Req params
app.get("/users/:name/posts/:postId", (req, res) => {
  console.log(typeof req.params.postId);
  res.send(`User: ${req.params.name}, Post:${req.params.postId} `);
});

// Req Query

app.get("/search", (req, res) => {
  console.log(req.query);

  res.send(`Searching for ${req.query.term}`);
});

app.get("/greet", (req, res) => {
  if (req.query.name) {
    return res.send(`Hello ,${req.query.name}`);
  }

  res.send("Hello Stranger!");
});

// request body

app.post("/echo", (req, res) => {
  console.log(res.json(req.body));
  res.send("Check your terminal");
});



app.listen(3000, () =>
  console.log("Server is running on port http://localhost:3000"),
);
