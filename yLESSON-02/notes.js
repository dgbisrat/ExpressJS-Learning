import express from "express";

const app = express();

app.use(express.json());

const notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];

// READ ALL (with optional ?search);
app.get("/notes", (req, res) => {
  const { search, limit, sort } = req.query;

  let result = notes;

  if(search){
    result = result.filter(n => n.text.toLowerCase().includes(search.toLowerCase()));
  }


  if(sort){
    result = [...result].sort((a,b) => b.id - a.id);
  }

  if(limit){
    result = result.slice(0,limit);
  }

  res.json(result);
});

// Finding the latest

app.get("/notes/latest", (req, res) => {
  res.json(notes[notes.length - 1]);
});

// Read ONe

app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);

  if (note) {
    return res.json(note);
  }

  res.status(404).json({ message: "Note not found!" });
});

// Create

app.post("/notes", (req, res) => {
  const { text } = req.body;
  console.log(req.body);
  console.log(req.params);

  if (!text) {
    return res.status(404).json({ error: "Text is required" });
  }

  const newNote = { id: notes.length + 1, text };
  notes.push(newNote);
  res.status(201).json(newNote);
});

// PUT

app.put("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { text } = req.body;

  const idExists = notes.some((note) => note.id === id);

  console.log(typeof id);
  console.log(idExists);

  if (!idExists) {
    return res.status(404).json({ message: "Id not found!" });
  }

  const updateNote = notes.map((note) =>
    note.id === id ? { ...note, text } : note,
  );

  res.json({ message: "✅ Note updated successfully!!", updateNote });
});

// Delete

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  const exists = notes.some((note) => note.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Note not found!" });
  }

  const updatedNotes = notes.filter((note) => note.id !== id);
  res.json({ message: "✅ Note deleted successfully!", updatedNotes });
});

app.listen(3000, () => console.log("Notes API on 3000"));
