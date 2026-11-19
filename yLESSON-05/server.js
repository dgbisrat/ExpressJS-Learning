import express from 'express';

const app = express();


app.use(express.urlencoded({extended:false}));

app.post("/contact",(req,res) => {
  console.log(req.body);
  res.send(`Thanks ${req.body.name}`);
} );


app.listen(3000,() => {
  console.log("Server is running!!");
})