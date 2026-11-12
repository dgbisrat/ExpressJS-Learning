import express from "express";

const app = express();

const students = [
  { id: 1, name: "Amina", grade: 90, city: "Addis Ababa" },
  { id: 2, name: "Daniel", grade: 75, city: "Hawassa" },
  { id: 3, name: "Selam", grade: 88, city: "Addis Ababa" },
  { id: 4, name: "Yonas", grade: 62, city: "Bahir Dar" },
  { id: 5, name: "Hana", grade: 95, city: "Hawassa" },
];

app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to Student API website</h1><p>Count:${students.length} students available!</p>`,
  );
});

app.get("/students", (req, res) => {
  const { city, minGrade } = req.query;
  const minGradeFiltered = students.filter((s) => s.grade >= minGrade);

  if (city && minGrade) {
    return res.json(
      students.filter((s) => s.city === city && s.grade >= minGrade),
    );
  }

  if (city) {
    const Cityfiltered = students.filter((s) => s.city === city);
    return res.json(Cityfiltered);
  }

  if (minGrade) {
    return res.json(minGradeFiltered);
  }

  res.json(students);
});

app.get("/students/top", (req, res) => {
  const topStudent = students.reduce((highest, current) => {
    return current.grade > highest.grade ? current : highest;
  }, students[0]);
  res.json(topStudent);
});

app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const findStudent = students.find((s) => s.id === id);

  if (findStudent) {
    return res.json(findStudent);
  }

  res.status(404).json({ Error: "Student not Found!" });
});


app.use((req,res) => {
  res.status(404).json({Error:"Route not found!"});
})

const port = 5000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
