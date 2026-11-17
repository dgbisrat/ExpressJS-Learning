import express from "express";
import path from "path";

const app = express();

// app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.json());

app.get("/old-page", (req, res) => {
  res.redirect("/about.html");
});

app.get("/api/time", (req, res) => {
  res.set("X-server","my-express")
  res.json({ time: new Date().getTime()});
});


// Challenge 3
app.get("/",(req,res) => {
   res.send("From the route");
  //  res.send("Bisrat")
});




app.listen(3000, (req, res) => {
  console.log("Server is up!");
});
