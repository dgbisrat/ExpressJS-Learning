import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Welcome,Bisrat</h1>");
});

app.get("/skills", (req, res) => {
  res.send("<ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>");
});

app.get("/projects", (req, res) => {
  res.send("<ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
