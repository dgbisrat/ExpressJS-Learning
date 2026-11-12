import express from "express";

const app = express();

// this is for practicing params
app.get("/hello/:name", (req, res) => {
  const name = req.params.name;
  res.send(`Hello ${name}! Welcome to my express Server!`);
});


// note: this is also for params to practice
app.get("/square/:num", (req, res) => {
  const num = Number(req.params.num);
  const result = Math.pow(num, 2);
  res.json({ number: num, square: result });
});


// note: this one used for practicing query
app.get("/greet", (req, res) => {
  const {name} = req.query;

  if (name) {
    return res.send(`<h1>Hello ${name}</h1>`);
  }

  res.send("<h1>Hello Stranger!</h1>");
});

const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
