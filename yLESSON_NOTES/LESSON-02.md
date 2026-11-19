# 🟢 Level 1, Lesson 2: Routes, HTTP Methods, and the `req` Object

> 🎮 **Today's mode:** 95% VS Code. Keep your terminal open. Type every block. The ⚡ **Mini Challenges** are in the middle. The ⚔️ **Main Challenges** are at the end.

> 📌 Lesson 1 challenges are still open (+100 XP waiting). Do them anytime.

## 🤔 The "Why"

A website has one address, like `/notes`. But users want to do **different things** with it: read notes, add a note, change a note, delete a note.

How does the server know which one? The browser sends a **method**. A method is a word that says *what action you want*.

## 🧠 Mental Model

> 📚 **A library desk.** The path (`/notes`) is the **shelf**. The method is the **verb** you say to the librarian.

| Method | Verb | Example |
|---|---|---|
| `GET` | "Show me" | Read notes |
| `POST` | "Add this" | Create a note |
| `PUT` | "Replace it with this" | Update a whole note |
| `PATCH` | "Change just this part" | Edit one field |
| `DELETE` | "Remove it" | Delete a note |

**Key idea:** a route is a **pair**: `method + path`. `GET /notes` and `POST /notes` are two **different** routes. In Lesson 1, Express kept a list like `[GET "/" → fn]`. Now each item is `(method, path) → fn`.

---

## 🛠️ Part 1: Same Path, Different Methods

Create `lesson2.js` and type this:

```js
const express = require("express");
const app = express();

app.get("/ping", (req, res) => {
  res.send("GET pong");
});

app.post("/ping", (req, res) => {
  res.send("POST pong");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Run it: `node lesson2.js`

**The browser can only send `GET` from the address bar.** To test other methods, use one of these:
- **Thunder Client** (VS Code extension, easiest 👍)
- **curl** in the terminal

```bash
curl http://localhost:3000/ping
curl -X POST http://localhost:3000/ping
```

- `-X POST` means "use the POST method."

**Under the hood:** the request carries its method as plain text in the first line: `POST /ping HTTP/1.1`. Express reads that line, then walks its list and asks for each route: *"Does the method match? Does the path match?"*

### ⚡ Mini Challenge 1 (10 XP)
1. Add a `DELETE /ping` route that sends `"DELETE pong"`.
2. Test all three methods.
3. Then send `PUT /ping` (no route). What do you see? **Why?**

---

## 🛠️ Part 2: `req.params` (Dynamic Paths)

**Problem:** you can't write one route for every note: `/notes/1`, `/notes/2`, `/notes/3`...

**Solution:** a **route parameter**. It is a part of the path that changes. You mark it with a colon `:`.

```js
app.get("/notes/:id", (req, res) => {
  console.log(req.params);
  res.send(`You asked for note ${req.params.id}`);
});
```

Visit `http://localhost:3000/notes/42` and look at your terminal.

**Under the hood:**
- Express turns `"/notes/:id"` into a pattern, like a regex: "`/notes/` then any text until the next `/`."
- When the path matches, Express **cuts out** the changing part and builds an object: `req.params = { id: "42" }`.
- Notice: `"42"` is a **string**, not a number!

```
URL:      /notes/42
Pattern:  /notes/:id
Result:   req.params = { id: "42" }
```

**What breaks?**
- Change `:id` to `:noteId` → now it's `req.params.noteId`. `req.params.id` becomes `undefined`.
- Visit `/notes` (no id) → `Cannot GET /notes`. The pattern needs the second part.

### ⚡ Mini Challenge 2 (15 XP)
Make a route: `GET /users/:name/posts/:postId`
It should respond with: `User: Sara, Post: 7` for `/users/Sara/posts/7`.
Then test: what is `typeof req.params.postId`? Log it.

---

## 🛠️ Part 3: `req.query` (Extra Options in the URL)

**Query string** = extra info after a `?` in the URL. Format: `?key=value&key2=value2`.

```js
app.get("/search", (req, res) => {
  console.log(req.query);
  res.send(`Searching for: ${req.query.term}`);
});
```

Visit: `http://localhost:3000/search?term=express&limit=5`

Your terminal shows: `{ term: 'express', limit: '5' }`

**Under the hood:** Express splits `req.url` at the `?`. The left part is the path (used for matching). The right part is parsed into the object `req.query`.

> 🧩 **Params vs Query:** params say **which thing** (`/notes/42`). Query says **how to show it** (`?sort=new`).

**What breaks?** Visit `/search` with no `?term=`. You see `Searching for: undefined`. The server did not crash, but your code must handle missing values.

### ⚡ Mini Challenge 3 (15 XP)
Make `GET /greet`. Visit `/greet?name=Bisrat&lang=en`.
- If `lang` is `"en"` → send `Hello, Bisrat`
- If `lang` is `"am"` → send `Selam, Bisrat`
- If `name` is missing → send `Hello, stranger`

---

## 🛠️ Part 4: `req.body` (Data Sent Inside the Request)

For `POST`, data usually travels **inside** the request, in the **body**. It is not in the URL.

Try this:

```js
app.post("/echo", (req, res) => {
  console.log(req.body);
  res.send("Check your terminal");
});
```

Send this with **Thunder Client** (Body → JSON): `{ "name": "Bisrat" }`

Terminal shows: `undefined` 😮

**Why?** The body arrives from the network as **raw chunks of bytes**, not as an object. Express does not read it for you by default. Nothing is magic.

**The fix:** add this line **above** your routes:

```js
app.use(express.json());
```

**`express.json()`** is a helper (called *middleware*) that runs **before** your route. We study middleware deeply in Level 2. For now, know what it does:

```
Raw bytes arrive → express.json() collects them
→ turns the text into an object with JSON.parse
→ saves it as req.body
→ then your route runs
```

Send the request again. Now you see `{ name: 'Bisrat' }` ✅

**What breaks?**
- Remove the `app.use(express.json())` line → `req.body` is `undefined` again.
- Put it **below** the route → still `undefined`. **Order matters**, just like in Lesson 1.

### ⚡ Mini Challenge 4 (20 XP)
Make `POST /echo` respond with the same data using `res.json(req.body)`.
Then break it on purpose: move `express.json()` below the route. Explain **why** it fails, in one sentence.

---

## 🛠️ Part 5: Sending Better Responses

```js
res.status(201).json({ message: "Created" });
```

- `res.status(201)` sets the status code. **201** means "created."
- `res.json(obj)` does three things: turns the object into JSON text, sets `Content-Type: application/json`, and ends the response.

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Normal success |
| 201 | Created | After POST adds something |
| 400 | Bad request | User sent wrong data |
| 404 | Not found | Thing doesn't exist |

---

## 🧩 Put It All Together: Notes API

Create `notes.js`. This is the code you will extend. Type it, don't paste it:

```js
const express = require("express");
const app = express();
app.use(express.json());

let notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];

// READ all (with optional ?search=)
app.get("/notes", (req, res) => {
  const { search } = req.query;
  if (search) {
    const found = notes.filter((n) => n.text.toLowerCase().includes(search.toLowerCase()));
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

app.listen(3000, () => console.log("Notes API on 3000"));
```

**Why `Number(req.params.id)`?** Params are strings. `"1" === 1` is `false`, so `find` would never match. 🐛

**Why `return` before `res.status(404)...`?** Without `return`, the function keeps running after sending, and the next `res.json(note)` tries to send a **second** response. That gives the error `Cannot set headers after they are sent`.

### ⚡ Mini Challenge 5 (20 XP): Test it
Using Thunder Client, check each one and write the status code you get:
1. `GET /notes`
2. `GET /notes/1`
3. `GET /notes/99`
4. `GET /notes?search=express`
5. `POST /notes` with `{ "text": "Practice" }`
6. `POST /notes` with `{}`

---

## ⚔️ Main Challenges

Work in `notes.js`. Type your own code.

**⚔️ Challenge 1: Foundation (30 XP)**
Add two routes to the Notes API:
- `PUT /notes/:id`: replace the note's `text` with `req.body.text`. Return the updated note. If the id doesn't exist, return 404.
- `DELETE /notes/:id`: remove the note. Return `{ message: "Deleted" }`. If it doesn't exist, return 404.

**⚔️ Challenge 2: Real-world (40 XP)**
Add `GET /notes?limit=2&sort=desc`:
- `limit` → return only that many notes
- `sort=desc` → newest (highest id) first
- Both options are optional and can be used together.

**⚔️ Challenge 3: Brain stretch (60 XP)**
You add this route **below** `GET /notes/:id`:

```js
app.get("/notes/latest", (req, res) => {
  res.json(notes[notes.length - 1]);
});
```

1. **Predict:** what happens when you visit `/notes/latest`?
2. Test it. Was your prediction right?
3. Explain **why**, using the "Express walks the list from top to bottom" idea.
4. Fix it **without** deleting any route.

**🐞 Bug Hunt (30 XP):** this code has **2 bugs**. Find them before running it.

```js
app.post("/notes", (req, res) => {
  const text = req.body.text;
  const newNote = { id: notes.length + 1, text };
  notes.push(newNote);
  res.json(newNote);
  res.status(201);
});
```

*(Hint: think about status codes and what happens when `text` is missing.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: after you finish, explain back in your own words: *"What is the difference between `req.params`, `req.query`, and `req.body`?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Read the error. Use `console.log(req.params)`, `console.log(req.body)`.
2. Ask: *"What did I expect? What did I get?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 2: routes, methods, req object, notes API"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (up to **295 XP** available now) | Day 1 |

**⏭️ Next lesson:** Lesson 3, the `res` object in depth, and how to serve HTML and static files. Plus your first **Boss Battle** is close! ⚔️

Send me your code when you are ready. I'll review it. 🚀