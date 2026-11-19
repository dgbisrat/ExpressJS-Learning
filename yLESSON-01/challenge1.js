import express from "express";

const app = express();

// ^ if we have two same routes the route that comes first will be displayed 
// app.get("/",(req,res) => {
//   res.send("A")
// })

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.get("/hello", (req, res) => {
  res.send("Hello! Bisrat");
});

app.use((req, res) => {
  res.status(404).send("Route not found!");
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running  on port http://localhost:${port}`);
});
