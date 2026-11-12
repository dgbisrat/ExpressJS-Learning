import express from "express";

const app = express();

app.get("/inspect", (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    path: req.path,
    userAgent: req.headers["user-agent"],
  });
});

app.get("/movies/:id", (req, res) => {
  res.send(`You asked for movie number ${req.params.id}`);
});

// getting num from params and multiply it by two
app.get("/double/:num", (req, res) => {
  const result = req.params.num * 2; // this one works because js auto converts it
  res.send(`Double is ${result}`);
});

// adding req.params.num with 1 and changing it to the number type since everything in request is string
app.get("/add/:num", (req, res) => {
  const result = Number(req.params.num) + 1;
  console.log(typeof req.params.num);
  res.send(`Add is ${result}`);
});

app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;

  res.json({ userId, postId });
});


app.get("/search",(req,res) => {
  const {q,limit} = req.query;

  res.json({searchingFor:q,limit});
})

app.listen(4000, () => {
  console.log(`Lesson 02 server http://localhost:4000`);
});
