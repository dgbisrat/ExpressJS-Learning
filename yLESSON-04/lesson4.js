import express from "express";

const app = express();

// Middleware runs for every request
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.url}`);
//   next();
// });

app.get("/", (req, res) => {
  res.send("Home");
});

app.get("/about", (req, res) => {
  res.send(`${new Date().toISOString()}`);
});

// Part 2: Middleware can change the req
// app.use((req,res,next) => {
//   req.requestTime = Date.now();
//   next()
// });

app.get("/time", (req, res) => {
  res.json({ receivedAt: req.requestTime, now: Date.now() });
});

// Mini challenge
let count = 0;
app.use((req, res, next) => {
  count++;
  req.visitorNumber = count;
  next();
});

app.get("/visitor", (req, res) => {
  res.json({ "You are visitor": req.visitorNumber });
});

/* 
  ^ #1. Running a middleware that prints the req.method and the url of the give n function first
  
  ~~ # 2. adding some object for the req or adjusting the req and reusing that adjusted value for some specific route

  HACK: # 3. finally doing some specific mini challenge that adds when every visitor visits it 
  
*/

// Middleware can stop the req

app.use((req, res, next) => {
  if (req.query.key !== "123") {
    return res.json(404).json({ error: "Wrong Key" });
  }

  next();

});

// ! Where middlewares applies

//Note: #1. everywhere for all routes app.use(logger);

// Note: # for specific route app.use("/admin",guard);

// Note: #3 for one route app.get("/secret",guard,(req,res) => { res.send("Top Secret"});

// ~~ Mini Challenge 4

app.use("/admin", (req, res, next) => {
  console.log("Checking runs");
  next();
});

app.get("/admin", (req, res) => {
  res.send("Admin home");
});

app.get("/admin/users", (req, res) => {
  res.send("Admin users");
});

app.get("/public",(req,res) => {
  res.send("Anyone can see it!");
} )

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
