import express from 'express';

const app = express();

app.get("/",(req,res) => {
  res.send("Hello There")
  console.log(req.url);
})


app.listen(3000,() => {
  console.log("Server up!")
})