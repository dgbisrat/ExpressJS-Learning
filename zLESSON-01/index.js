import http from "http";
import express from 'express';

// IN Node js 
// const server = http.createServer((req, res) => {
//   if (req.url === "/" && req.method === "GET") {
//     res.writeHead(200, { "content-type": "text/plain" });
//     res.end("Home Page");
//   } else if (req.url === "/about" && req.method === "GET") {
//     res.writeHead(200, { "Content-Type": "text/plain" });
//     res.end("About page");
//   } else {
//     res.writeHead(404, { "content-type": "text/plain" });
//     res.end("Not found!");
//   }
// });

// server.listen(3000);


const app = express();

app.get("/",(req,res) => res.send("Home Page"));
app.get("/about",(req,res) => res.send("About Page"));
app.get("/contact",(req,res)=> {
  console.log(req)
})

app.listen(3000,()=>{
  console.log("http://localhost:3000")
});