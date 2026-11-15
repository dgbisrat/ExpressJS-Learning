import express from "express";

const app = express();

app.use(express.json());

let notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];

app.get("/notes", (req, res) => {
  const { search, limit, sort,text } = req.query;


  let result = notes;

  if(text.trim){
    result = result.filter(n => n.text.toLowerCase() === text);
  }

  if (search) {
    result = result.filter((n) =>
      n.text.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (sort === "desc") {
    result = [...result].sort((a, b) => b.id - a.id);
  }

  if (sort === "asc") {
    result = [...result].sort((a, b) => a.id - b.id);
  }

  if (limit) {
    result = result.slice(0, Number(limit));
  }

  res.json(result);
});

app.get("/notes/latest", (req, res) => {
  res.json(notes[notes.length - 1]);
});


app.get("/notes/count",(req,res) => {
  res.json({count: notes.length})
})

app.post("/notes", (req, res) => {
  const { text } = req.body;

  if (!text || text.trim === "") {
    return res.status(400).json({ message: "Text is required!" });
  }

  if( typeof text !== "string"){
    return res.status(400).json({message:"Text must be alphabet"});
  }

  const nextId = notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  const newNote = { id: notes.length + 1, text };

  notes.push(newNote);

  res.status(201).json({ message: "✅ Note created successfully!", notes });
});

app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  const exists = notes.some((n) => n.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.json(notes.find((n) => n.id === id));
});

app.patch("/notes/:id",(req,res) => {
  const id = Number(req.params.id);

  const exists = notes.find(n => n.id === id);

  if(!exists){
    return res.status(404).json({message:"Note not found!"})
  }

  Object.assign(exists,req.body);
  res.json(user);
})

app.put("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { text } = req.body;

  const exists = notes.some((n) => n.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Note not found!" });
  }

  notes = [...notes].map((n) => (n.id === id ? { ...n, text } : n));

  res.json({ message: "✅Note updated successfuly", notes });
});

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  const exists = notes.some((n) => n.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Note not found!" });
  }

  notes = notes.filter((n) => n.id !== id);
  res.json({ message: "Note deleted successfully ", notes });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
