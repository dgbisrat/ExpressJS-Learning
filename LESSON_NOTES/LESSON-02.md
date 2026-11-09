# 🚀 PHASE 1 · LESSON 2: The Request Object, Params & Query Strings

> 🎮 **Your XP Bar:** `[██████░░░░] 600 / 1500 XP` *(if you finished Lesson 1)*
> **Current Level:** 🐣 Server Hatcher → 🦅 **Route Master** (unlocks at 900 XP)

> 🔗 **Connection to Lesson 1:** In Lesson 1, your server only *talked*. It sent responses. Today your server learns to **listen**. It reads what the client is asking for and answers *differently* depending on it.

Lesson 1 = a server that says things. 🗣️
Lesson 2 = a server that **understands** things. 🧠

---

## 🔁 Quick Warm-Up (from Lesson 1)

Before we go forward, check your memory. Can you answer these without looking?

1. What does `app.listen()` do?
2. What are `req` and `res`?
3. Why must the 404 handler be at the **bottom**?
4. What's the difference between `res.send()` and `res.json()`?

If any answer feels fuzzy, re-read Lesson 1's recap. This lesson **stacks** on it. 🧱

---

## 🧠 1. What is the `req` object?

Every time a client hits your server, Express hands your handler **two** things:

```js
app.get("/hello", (req, res) => {
  //          │     │
  //          │     └── res: what YOU send back (Lesson 1 ✅)
  //          └──────── req: what the CLIENT sent you (today 🆕)
});
```

`req` is a big object filled with information about the request:

| Property | What it holds |
|----------|---------------|
| `req.method` | `"GET"`, `"POST"`, etc. |
| `req.url` | The path and query string, e.g. `/search?q=cat` |
| `req.path` | Just the path, e.g. `/search` |
| `req.params` | Values captured **from the path** 🆕 |
| `req.query` | Values captured **after the `?`** 🆕 |
| `req.headers` | Metadata sent by the client |

Think of the restaurant again 🍽️:

- Lesson 1: the waiter *brings food*.
- Lesson 2: the waiter *reads your order slip* ("I want pizza, extra cheese, no onions").

`req` is that **order slip**. 📝

---

## 🔬 2. Meet `req` in action

Let's peek inside it. Create `lesson2.js`:

```js
// lesson2.js
const express = require("express");
const app = express();

app.get("/inspect", (req, res) => {
  res.json({
    method: req.method,
    url: req.url,
    path: req.path,
    userAgent: req.headers["user-agent"],
  });
});

app.listen(3000, () => {
  console.log("Lesson 2 server: http://localhost:3000");
});
```

Run it with `node --watch lesson2.js` and visit `http://localhost:3000/inspect`.

🎉 You'll see your own browser described back to you. Your server just *read* the request!

> 📝 **Note:** `req.headers` keys are always **lowercase**. That's why we wrote `"user-agent"`, not `"User-Agent"`.

---

## 🎯 3. Route Parameters: dynamic URLs

### ❓ The problem

Imagine a movie API (like your Challenge 2 🎬). You'd need a route for every movie:

```js
// 😱 This doesn't scale
app.get("/movies/1", ...);
app.get("/movies/2", ...);
app.get("/movies/3", ...);
// ...1,000,000 more?
```

### ✅ The solution: route parameters

Put a **colon** `:` before a name. That part of the URL becomes a **variable**:

```js
app.get("/movies/:id", (req, res) => {
  res.send(`You asked for movie number ${req.params.id}`);
});
```

Now:

| URL you visit | `req.params` |
|---------------|--------------|
| `/movies/1` | `{ id: "1" }` |
| `/movies/42` | `{ id: "42" }` |
| `/movies/banana` | `{ id: "banana" }` |

One route handles **infinite** URLs. 🤯

### ⚠️ DANGER ZONE: params are always strings!

```js
app.get("/double/:num", (req, res) => {
  const result = req.params.num * 2; // works because JS auto-converts
  res.send(`Double is ${result}`);
});

app.get("/add/:num", (req, res) => {
  const result = req.params.num + 1; // 😱 "5" + 1 = "51"
  res.send(`Result is ${result}`);
});
```

Visit `/add/5` and you get `51`, not `6`. 🐛

**The fix:** convert it yourself.

```js
const num = Number(req.params.num);
```

> 📝 **Note:** This is the same JavaScript type-coercion trap you already know. Express didn't cause it. Data from the URL is **always text**. Never forget that.

### Multiple parameters

You can have more than one:

```js
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params; // destructuring 😎
  res.json({ userId, postId });
});
```

Visit `/users/7/posts/99`:

```json
{ "userId": "7", "postId": "99" }
```

---

## 🔎 4. Query Strings: optional extras

Look at a URL like this:

```
/search?q=cat&limit=5
```

Everything after the `?` is the **query string**. It's made of `key=value` pairs joined by `&`.

```js
app.get("/search", (req, res) => {
  const { q, limit } = req.query;
  res.json({ searchingFor: q, limit: limit });
});
```

| URL | `req.query` |
|-----|-------------|
| `/search?q=cat` | `{ q: "cat" }` |
| `/search?q=cat&limit=5` | `{ q: "cat", limit: "5" }` |
| `/search` | `{}` (empty!) |

> ⚠️ Same rule as params: values are **strings**. And if a key is missing, you get `undefined`.

### 🥊 Params vs Query: when to use which?

| | Route Params `:id` | Query String `?key=value` |
|---|---|---|
| **Purpose** | Identify **one specific thing** | **Filter, sort, or tweak** a result |
| **Required?** | Yes, the route doesn't match without it | No, it's optional |
| **Example** | `/movies/3` → *that* movie | `/movies?year=2010` → *filter* movies |
| **Mental model** | The **address** of a thing 🏠 | The **options** on a request 🎛️ |

Simple rule:

> 🧠 **"Which one?" → params. "How/Which kind?" → query.**

---

## 🧩 5. Putting It Together: a real example

This combines **Lesson 1 and Lesson 2**. Study it carefully. 👇

```js
const express = require("express");
const app = express();

const movies = [
  { id: 1, title: "Inception", year: 2010, rating: 8.8 },
  { id: 2, title: "Interstellar", year: 2014, rating: 8.7 },
  { id: 3, title: "The Dark Knight", year: 2008, rating: 9.0 },
];

// GET /movies  or  GET /movies?minRating=8.8
app.get("/movies", (req, res) => {
  const { minRating } = req.query;

  if (minRating) {
    const filtered = movies.filter((m) => m.rating >= Number(minRating));
    return res.json(filtered);
  }

  res.json(movies);
});

// GET /movies/2
app.get("/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(movie);
});

// 404 catch-all (still at the bottom! Lesson 1 ✅)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000, () => console.log("Running on 3000"));
```

### 🔍 What's new here?

**1. `return res.json(...)`**

Why `return`? Without it, the function keeps running after sending a response, and a second `res.send` would crash with:

```
Error: Cannot set headers after they are sent to the client
```

`return` stops the function right there. 🛑

**2. `if (!movie)`**

`.find()` returns `undefined` when nothing matches. So you check for that and send a `404`. This is how real APIs say *"that thing doesn't exist."*

**3. Two different 404s**

- `/movies/999` → route **matches**, but the movie doesn't exist → *"Movie not found"*
- `/banana` → **no route matches** → *"Route not found"*

> 📝 **Note:** These are two different situations that both use status `404`. Good developers send messages that tell the client **which** problem happened.

---

## 🧨 6. The Route Order Trap (Lesson 1 meets Lesson 2)

Remember "Express checks routes top to bottom"? Now it gets spicy. 🌶️

```js
app.get("/movies/:id", (req, res) => {
  res.send("Movie by ID");
});

app.get("/movies/top", (req, res) => {
  res.send("Top movies");
});
```

Visit `/movies/top`. What do you get?

👉 **"Movie by ID"** 😱

Why? Because `:id` matches **anything**, including the word `top`. Express hits the first matching route and stops.

### ✅ The fix: specific routes go FIRST

```js
app.get("/movies/top", (req, res) => {
  res.send("Top movies");
});

app.get("/movies/:id", (req, res) => {
  res.send("Movie by ID");
});
```

> 🧠 **Golden Rule:** Put **specific** routes above **dynamic** ones.
> **Specific → Dynamic → 404 catch-all.**

*(Did you think about this in Challenge 2 of Lesson 1? `/movies/top` and `/movies/count` were a preview of exactly this!)* 😉

---

## 🧯 7. Debugging cheat sheet (Lesson 2 edition)

| Problem | Likely cause |
|---------|-------------|
| `req.params.id` gives the wrong result in math | It's a **string**. Use `Number()` |
| `/movies/top` shows the "by ID" handler | Dynamic route is above the specific one |
| `Cannot set headers after they are sent` | You sent two responses. Add `return` |
| `req.query.x` is `undefined` | The client didn't send `?x=...` |
| `Cannot read properties of undefined` | You did `movie.title` when `movie` is `undefined`. Check first! |
| Number turns into `NaN` | `Number("banana")` is `NaN`. Validate input! |

> 🏆 **Pro tip:** `NaN` is your enemy. Check with `Number.isNaN(value)` before trusting converted input.

---

## ✅ 8. Quick recap

- `req` = the **order slip**. It holds what the client asked for.
- `req.params` = values from the **path** (`/movies/:id`).
- `req.query` = values after the **`?`** (`?year=2010`).
- Both are **always strings**. Convert with `Number()`.
- Params identify **one thing**. Query **filters or tweaks**.
- **Specific routes first, dynamic routes next, 404 last.**
- Use `return res...` to avoid sending two responses.

---

# ⚔️ THE CHALLENGES

> 🔗 These **stack** on Lesson 1. Each challenge uses *older* skills plus the new ones. Challenge 3 is a **boss fight** that combines **everything so far**. 👹
>
> **Rules:** Try alone first. Hints are hidden. No full solutions unless you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+100 XP`

**Goal:** Prove you understand `req.params` and `req.query`.

Create `l2_challenge1.js` on **port 4000**.

| Route | Behavior |
|-------|----------|
| `GET /hello/:name` | Returns text: `Hello, <name>! Welcome to my server.` |
| `GET /square/:num` | Returns JSON: `{ "number": 5, "square": 25 }` (real **numbers**, not strings!) |
| `GET /greet` | Reads `?name=` and returns `Hi <name>!`. If no name is given, returns `Hi stranger!` |

✅ **Success check:** `/square/5` shows `25`, **not** `"55"` or `NaN`.

<details>
<summary>💡 Hint 1</summary>

For `/square/:num`, convert the param first, then multiply. Return **both** values in the JSON object.

</details>

<details>
<summary>💡 Hint 2</summary>

For the default name, you can use `||` (or the `??` operator) to provide a fallback value.

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+150 XP`

**Goal:** Build a real searchable API, using **Lesson 1 + Lesson 2** together.

Create `l2_challenge2.js` on **port 5000**. You're building a **Student Directory API** 🎓.

```js
const students = [
  { id: 1, name: "Amina", grade: 90, city: "Addis Ababa" },
  { id: 2, name: "Daniel", grade: 75, city: "Hawassa" },
  { id: 3, name: "Selam", grade: 88, city: "Addis Ababa" },
  { id: 4, name: "Yonas", grade: 62, city: "Bahir Dar" },
  { id: 5, name: "Hana", grade: 95, city: "Hawassa" },
];
```

Build these routes:

| Route | Behavior |
|-------|----------|
| `GET /` | HTML welcome page showing the **total student count** (dynamic, not hardcoded) |
| `GET /students` | All students as JSON |
| `GET /students?city=Hawassa` | Only students from that city |
| `GET /students?minGrade=80` | Only students with a grade **at or above** that number |
| `GET /students/top` | The single student with the **highest grade** |
| `GET /students/:id` | One student by ID. If not found → `404` JSON `{ "error": "Student not found" }` |
| *anything else* | `404` JSON `{ "error": "Route not found" }` |

⚠️ **Think carefully:**

- Where does `/students/top` go relative to `/students/:id`?
- What if the client sends **both** `?city=` and `?minGrade=` together? Should it work?

✅ **Success check:**

- `/students?city=Hawassa&minGrade=90` returns **only Hana**.
- `/students/3` returns Selam. `/students/99` returns your custom 404 with a **real 404 status**.
- `/students/top` returns Hana, **not** "Student not found".
- Adding a 6th student needs **zero** other code changes.

<details>
<summary>💡 Hint 1</summary>

Start with `let result = students;` and then **narrow it down** step by step: `if (city) { result = result.filter(...) }`, then the same for `minGrade`.

</details>

<details>
<summary>💡 Hint 2</summary>

For the top student, `.reduce()` works well, or sort a **copy** of the array. Be careful: `.sort()` changes the original array!

</details>

<details>
<summary>💡 Hint 3</summary>

If `/students/top` returns "Student not found", you've hit the Route Order Trap from section 6. 🌶️

</details>

---

## 🥇 CHALLENGE 3: 👹 BOSS FIGHT: The Stacked Challenge · `+300 XP`

**Goal:** Combine **everything from Lesson 1 and Lesson 2** into one project.

Create `l2_boss.js` on **port 6000**. You're building a **Mini Library System** 📚 that also reports on itself.

```js
const books = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, available: true },
  { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Adichie", year: 2006, available: false },
  { id: 3, title: "Beneath the Lines", author: "Maaza Mengiste", year: 2010, available: true },
  { id: 4, title: "The Shadow King", author: "Maaza Mengiste", year: 2019, available: true },
  { id: 5, title: "Americanah", author: "Chimamanda Adichie", year: 2013, available: false },
];
```

### 📋 Requirements

**🔙 From Lesson 1 (must reuse):**

1. `GET /` → HTML dashboard with the library's name and **clickable links** to other routes.
2. `GET /status` → JSON with the **server start time** (stored *outside* handlers) and **seconds running**.
3. `GET /admin` → always `403` with an HTML message.
4. Any unknown route → `404` JSON: `{ "error": "Route not found", "status": 404 }`.

**🆕 From Lesson 2 (new skills):**

5. `GET /books` → all books. Supports **combined** query filters:
   - `?author=Maaza Mengiste`
   - `?available=true` (⚠️ remember: it's a **string** `"true"`, not a boolean!)
   - `?after=2008` (books published after that year)
   - Any combination of the three works together.
6. `GET /books/:id` → one book. Not found → `404` JSON. **Invalid ID** (like `/books/banana`) → `400` JSON `{ "error": "ID must be a number" }`.
7. `GET /books/newest` → the most recently published book.
8. `GET /authors/:name/books` → all books by that author. Not found → `404` JSON with a helpful message.
9. `GET /books/count` → JSON with `{ "total": 5, "available": 3 }`, calculated dynamically.

**🌟 Bonus (+75 XP):**

10. Add `GET /books/:id/summary` that returns a single string like: `"Things Fall Apart" by Chinua Achebe (1958): Available ✅` or `Checked out ❌`.

### ✅ Success check

- `/books?author=Maaza Mengiste&available=true&after=2015` → **only** *The Shadow King*.
- `/books/newest` and `/books/count` work **and** `/books/3` still works. (Route order! 🌶️)
- `/books/banana` → status `400`. `/books/999` → status `404`. Check both in DevTools.
- Adding a book to the array updates everything automatically.
- `/status` uptime keeps increasing across refreshes.

### 🧠 Where to think

- There are **three** routes starting with `/books/...`. In what order must they go?
- How do you turn the string `"true"` into a boolean comparison?
- What does `Number("banana")` give you? How do you detect it?
- Spaces in URLs become `%20`. Does Express decode `Maaza%20Mengiste` for you? *(Test it. Don't guess!)* 🔬

<details>
<summary>💡 Hint 1 (combined filters)</summary>

Use the same "narrowing" idea from Challenge 2: start with all books, then `if (author) {...}`, `if (available !== undefined) {...}`, `if (after) {...}`, each one filtering the previous result.

</details>

<details>
<summary>💡 Hint 2 (the "true" string)</summary>

Compare the **string** directly: `req.query.available === "true"`. That produces a real boolean you can compare with `book.available`.

</details>

<details>
<summary>💡 Hint 3 (400 vs 404)</summary>

`400` means "you sent something **invalid**". `404` means "what you asked for **doesn't exist**". Check validity first, then existence.

</details>

<details>
<summary>💡 Hint 4 (route order)</summary>

List your `/books/...` routes from most specific to least: fixed words (`newest`, `count`) before `:id`.

</details>

---

## 🏁 YOUR XP BOARD

| Quest | XP |
|-------|----|
| Challenge 1 🥉 | 100 |
| Challenge 2 🥈 | 150 |
| Boss Fight 🥇 | 300 |
| Bonus 🌟 | 75 |
| **Lesson 2 Total** | **625 XP** |

> 🦅 Reach **900 XP total** and you unlock the **Route Master** title.

---

## 🔮 Sneak Peek: Lesson 3

Lesson 3 will be about **HTTP methods and reading data from the request body** (`POST`, `PUT`, `DELETE`). Your API will stop only *reading* data and start **creating, changing, and deleting** it. 🔥

And the Lesson 3 boss fight will stack **Lessons 1, 2, and 3** together.

---

## 📤 What to send me next

1. Your code for each challenge (in code blocks)
2. What worked ✅
3. What broke ❌ (paste the **exact error**)

I'll review your work, explain your mistakes, and then we unlock **Lesson 3**. 💪

**Go build. The boss is waiting.** 👹🔥