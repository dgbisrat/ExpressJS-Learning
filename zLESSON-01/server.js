import express from "express";

// initializing express app
const app = express();

// Sending texts
app.get("/", (req, res) => {
  res.send("Hello from my first express sever!!🚀");
});

// sending HTML file
app.get("/welcome", (req, res) => {
  res.send("<h1>Welcome!</h1><p>This is HTML...</p>");
});

// Sending json file

app.get("/user", (req, res) => {
  res.json({ name: "Bisrat", grade: 11, isDeveloper: true });
});

//  Setting a status code

app.get("/secret", (req, res) => {
  res.status(403).send("You are not allowed here 🚫.");
});

// Make this in the last so that express donot stop to iterate to all routes

app.use((req, res) => {
  res.status(404).send("Ooops! Page not found!");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
