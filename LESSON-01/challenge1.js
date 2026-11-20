import express from 'express';

const app = express();

app.get("/",(req,res) => {
  res.send("Welcome to my server app");
});

app.get("/hello",(req,res) =>{
  res.send("Hello,Express!");
});


app.get("/bye",(req,res) => {
  res.send("Goodbye!");
})


app.listen(3000,() => {
  console.log("Server is running on port 3000");
})