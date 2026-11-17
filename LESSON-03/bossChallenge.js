import express from "express";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

export let notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];

// READ all (with optional ?search=)
app.get("/notes", (req, res) => {
  const { search } = req.query;
  if (search) {
    const found = notes.filter((n) =>
      n.text.toLowerCase().includes(search.toLowerCase()),
    );
    return res.json(found);
  }
  res.json(notes);
});

// READ one
app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

// CREATE
app.post("/notes", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  const newNote = { id: notes.length + 1, text };
  notes.push(newNote);
  res.status(201).json(newNote);
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

app.listen(3000, () => console.log("Notes API on 3000"));
