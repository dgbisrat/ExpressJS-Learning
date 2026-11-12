# ⚔️ BOSS BATTLE #1: The Movie Vault

**Mixes:** Lessons 1, 2, and 3. **No hints** until you try for real. 🔥

> 🧠 **Mindset:** This will feel hard. That is the point. When you want to stop, that is exactly when the XP starts. Stay in the fight for **20 minutes** before you ask for anything.

---

## 🎬 Part 1: Predict First (40 XP)

**Do not run any code.** Write your answers in a file first. Each answer needs a **why**.

**A.** Your routes are in this order:

```js
app.get("/movies/:id", (req, res) => res.send("one movie"));
app.get("/movies/top", (req, res) => res.send("top movie"));
```

What does the browser show for `/movies/top`? Why?

**B.** What is `req.query` for this URL?

```
/movies?genre=drama&genre=action&year=2020
```

**C.** What is the result of each line? Explain each one.

```js
"5" + 1
Number("5") + 1
```

**D.** A route runs `console.log("hi")` but never calls `res.send()`. What does the browser do? Why?

---

## 🎬 Part 2: Build the Vault (80 XP)

Use this data:

```js
const movies = [
  { id: 1, title: "Inception", genre: "scifi", year: 2010, rating: 8.8 },
  { id: 2, title: "Titanic", genre: "drama", year: 1997, rating: 7.9 },
  { id: 3, title: "Interstellar", genre: "scifi", year: 2014, rating: 8.7 },
  { id: 4, title: "Joker", genre: "drama", year: 2019, rating: 8.4 },
  { id: 5, title: "The Matrix", genre: "scifi", year: 1999, rating: 8.7 },
];
```

Build these routes:

| # | Route | What it does |
|---|---|---|
| 1 | `GET /` | A welcome message |
| 2 | `GET /movies` | All movies. Supports `?genre=`, `?minRating=`, and `?limit=` (first N results). All three must work **together** |
| 3 | `GET /movies/top` | The movie with the highest rating |
| 4 | `GET /movies/:id` | One movie. Id is not a number (like `abc`) → status **400** with a message. Movie not found → status **404** with a message |
| 5 | `GET /movies/:id/similar` | Other movies with the **same genre**, not including itself. Not found → 404 |
| 6 | `POST /movies` | Send `"Movie added"` |
| 7 | `DELETE /movies/:id` | Send `"Deleted movie <id>"`. Not found → 404 |

**Test these (use Thunder Client, Postman, or curl):**
- `/movies?genre=scifi&minRating=8.7&limit=2`
- `/movies/top`
- `/movies/3`, `/movies/99`, `/movies/abc`
- `/movies/1/similar`

**Rules:**
- ⌨️ Type it yourself.
- 🚫 Do not send a bare number with `res.send()`. Send text or an object.
- 🧩 Think about **route order** before you write the routes. You know why.

---

## 🎬 Part 3: Bug Hunt (30 XP)

This code has **3 bugs**. Find all of them **before** running it. For each one, tell me what happens and **why**.

```js
app.get("/movies/:id", (req, res) => {
  const movie = movies.find((m) => m.id === req.params.id);
  res.send(movie);
});

app.get("/movies/top", (req, res) => {
  res.send("Top movie");
});

app.delete("/movies/:id", (req, res) => {
  res.status(404).send("Not found");
  res.send("Deleted");
});
```

---

## 🎬 Part 4: Teach It Back (30 XP)

Answer in your own words. Short and simple is fine.

1. When a request arrives, how does Express decide **which function** to run? Use the "list" idea.
2. Why does **route order** matter?
3. What is the difference between `req.params` and `req.query`?

---

## 🏆 Scoring

| Part | XP |
|---|---|
| Part 1: Predict | 40 |
| Part 2: Build | 80 |
| Part 3: Bug Hunt | 30 |
| Part 4: Teach back | 30 |
| 🏅 Boss clear bonus | +50 |
| 🔥 No hints used | +50 |
| **Total possible** | **280 XP** |

Beat this boss and you reach **Level 2: The Middleware Zone** 🟡

## 🪜 Rules of the Fight

- 🚫 No hints at first.
- ⏱️ Struggle **20 minutes**. Use `console.log`. Read every error.
- When stuck, ask yourself: *"What did I expect? What did I get? Where do they split?"*
- Still stuck? Say `Hint 1`. Hints cost bonus XP, but quitting costs more.
- Send me your code and answers when you are done. I will review them honestly. 💪

Commit: `git commit -m "Boss Battle 1: movie vault"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (+670 XP waiting for you!) | Day 1 |

**⏭️ After the boss:** Lesson 4, **Middleware**, the heart of Express. Everything you will build later sits on top of it. 🔥