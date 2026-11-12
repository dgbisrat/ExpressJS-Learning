import express from "express";
import cors from 'cors';

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send(
    `<h1>My Server DashBoard</h1><a href="/time">time</a> <a href="/random">Random</a> <a href="/uptime">Uptime</a><a href="/admin">Admin</a>`,
  );
});

app.get("/time", (req, res) => {
  res.send(`<h1>Hello ${new Date()}</h1>`);
});

app.get("/random", (req, res) => {
  const random = Math.floor(Math.random() * 100 + 1);
  res.json({ number: random });
});

app.get("/uptime", (req, res) => {
  const now = new Date();
  res.json({ readable: now.toISOString(), timestamps: now.getTime() });
});

app.get("/admin", (req, res) => {
  res.status(403).send("<h1>You are not allowed to visit this route!!</h1>");
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
