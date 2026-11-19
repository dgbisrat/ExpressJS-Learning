import express from "express";

const app = express();

// let id = 1;
// app.use((req, res, next) => {
//   req.id = id;
//   id++;
//   next();
// });

// app.get("/about", (req, res) => {
//   res.set("X-Request-id", req.id);
//   res.send([`#${id}`]);
// });

// const notes = [
//   { id: 1, message: "The one thing!" },
//   {
//     id: 2,
//     message: "The psychology of Money!",
//   },
// ];

// // Challenge 2

// app.get("/notes", (req, res) => {
//   res.send(notes);
// });

// app.get("/notes/:id", (req, res) => {
//   const id = Number(req.params.id);

//   if (!id) {
//     return res.status(404).send("Id is required!");
//   }

//   const exists = notes.some((n) => n.id === id);
//   if (!exists) {
//     return res.status(404).json({ message: "Note e not found!" });
//   }

//   if (id) {
//     const note = notes.find((n) => n.id === id);
//     res.send(note);
//   }
// });

// app.post("/notes", (req, res) => {
//   res.set("x-headers-key", "sercret123");
//   res.send("Create something");
// });

// app.put("/notes", (req, res) => {
//   res.set("x-headers-key", "sercret123");
//   res.send("Update something");
// });

// app.delete("/notes", (req, res) => {
//   res.set("x-headers-key", "sercret123");
//   res.send("Delete soemthing");
// });

// // Challenge 3

// app.use((req, res, next) => {
//   console.log("1");
//   next();
//   console.log("2");
// });

// app.use((req, res, next) => {
//   console.log("3");
//   next();
//   console.log("4");
// });

// app.use((req, res, next) => {
//   console.log("5");
//   res.send("Done");
//   console.log("6");
// });

// Challenge 4

app.use("/getStack", (req, res, next) => {
  const { key } = req.query;

  if (key !== "bisrat") {
    return res
      .status(404)
      .send("the query must match what is expected to be!!");
  }

  next();
});

app.get("/getStack", (req, res) => {
  res.send("Stack");
});

app.listen(3000, () => {
  console.log("Server is up!");
});
