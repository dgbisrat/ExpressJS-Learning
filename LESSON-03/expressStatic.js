import express from "express";
import path from "path";

const app = express();

// PART 1 (SEE TYPES OF HEADERS, text/plain, text/html , application/json);
app.get("/text", (req, res) => {
  res.send("Hello");
});

app.get("/html", (req, res) => {
  res.type("text/plain");
  res.send("<h1>Hello</h1>");
});

app.get("/data", (req, res) => {
  res.send({ name: "Bisrat" });
});

// Mini Challenge part 1

app.get("/page", (req, res) => {
  res.type("text/plain");
  res.send(`<h1>Hello Sender!</h1><p>I am a video editor!</p>`);
});

// PART 2 : status, headers and Redirect

// Custom header
app.get("/secret", (req, res) => {
  res.set("X-Made-By", "Bisrat");
  res.send("Check headers");
});

// Status + body

app.get("/teapot", (req, res) => {
  res.status(418).send("I am a teapot☕.");
});

// Redirect

app.get("/old", (req, res) => {
  res.redirect("/new");
});

app.get("/new", (req, res) => {
  res.send("Welcome to my redirected website!!");
});

// Mini Challenge 2

app.get("/go", (req, res) => {
  res.redirect("/secret");
});

// Part 3:Serving files with res.sendFile

app.get("/hello", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "hello.html"));
});

// Part 3: Mini challenge

app.get("/about", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "about.html"));
});

// Part 4: express.Static , a whole folder at once
app.use(express.static(path.join(process.cwd(), "public")));

// Part 5: The nothing route match

app.use((req, res) => {
  res.status(404).send("<h1>Nothing here 🕳</h1>");
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
