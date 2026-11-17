import express from "express";
import path from "path";
const app = express();



app.get("/text", (req, res) => {
  res.send("Hello");
});

app.get("/html", (req, res) => {
  res.send("<h1>Hello</h1>");
});

app.get("/data", (req, res) => {
  res.send({ name: "Bisrat" });
});

// COntent type
app.get("/page", (req, res) => {
  res.type("text/plain");
  res.send("<h1>Hello I am Bisrat</h1><p>I am coder!</p>");
});

// // Custom Headers

// app.get("/secret",(req,res) => {
//   res.set("X-Made-By","Bisrat");
//   res.send("Check the headers!!")
// })

// Status + body
app.get("/teapot", (req, res) => {
  res.status(418).send("I am teapot ☕");
});

// Redirect

app.get("/old", (req, res) => {
  res.redirect("/new");
});

app.get("/new", (req, res) => {
  res.send("Welcome to the new page");
});

app.get("/go", (req, res) => {
  res.redirect("/secret");
});

app.get("/secret", (req, res) => {
  res.send("I am going to become a millioner soon by some coding achievement!");
});

app.get("/hello", (req, res) => {
  console.log(path.resolve("public"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.resolve("public", "about.html"));
});




app.use(
  express.static(path.join(process.cwd(),"public")),
);


app.listen(3000, () => {
  console.log("Running on 3000");
});
