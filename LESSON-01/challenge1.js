import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to my server!!");
});

app.get("/about", (req, res) => {
  res.send("<h1>Hello Bisrat</h1><p>I am Backend developer now.👨‍💻</p>");
});

app.get("/api/me", (req, res) => {
  res.json({
    name: "Bisrat",
    country: "Ethiopia",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Tailwind",
      "MongoDB",
      "NodeJS",
    ],
  });
});

app.use((req,res) => {
  res.status(404).send("No Page found :(");
})


const PORT = 4000;

app.listen(PORT,() => {
  console.log(`Server is running on port http://localhost:${PORT}`);
})