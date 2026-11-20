import express from 'express';
import http from 'http'

const app  = express();

const server = http.createServer((req,res) => {
  if(req.url === "/"){
    res.end("Welcome to my Node Server");
  }

  if(req.url === '/about'){
    res.end()
  }

  res.status = 404;
  res.sendDate("Route not found")
});

// Express Version

app.get("/",(req,res) => {
  res.send("Welcome to my express server")
} );


app.get("/about",(req,res) => {
  res.send("Welcome to my about page!");
});



server.listen(3000,() => {
  console.log("Server is running on port 3000");
})