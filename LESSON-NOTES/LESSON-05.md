# 📮 Lesson 5: Postman and `app.route()`

**Level 3 · Reward: 250 XP**

Until now you tested only GET in the browser. Today you become a real **API tester** and learn to write routes **without repeating yourself**. 🔥

---

## 📝 Notes (copy into `lesson5.md`)

### Postman
Postman is an app for **sending any HTTP request** and inspecting the response: method, URL, headers, body, status, time.

You can use **Postman** or **Thunder Client** (a VS Code extension). The ideas are identical.

A request has 4 parts you control:

| Part | Where in Postman |
|---|---|
| Method + URL | top bar |
| Query / params | **Params** tab |
| Headers | **Headers** tab |
| Body | **Body** tab → **raw** → **JSON** |

### `app.route()`
When one path has many methods, you repeat the path:

```js
app.get("/books", ...);
app.post("/books", ...);
app.put("/books", ...);
```

`app.route()` lets you write the path **once** and chain the methods:

```js
app.route("/books")
  .get((req, res) => { ... })
  .post((req, res) => { ... })
  .put((req, res) => { ... });
```

---

## 🔍 Under the hood

### 1. How `app.route()` works
`app.route("/books")` creates a **Route object** for that path and returns it. Every `.get()`, `.post()` etc. on that object registers a handler **on the same route**. Each method returns the route again, which is why chaining works.

It is the same routing you already know, with less typing and fewer typos in the path.

### 2. How a request body travels
When Postman sends JSON, the body does **not** arrive as one object. Node receives it as **a stream of chunks** (raw bytes). Someone has to:

1. collect the chunks
2. join them into a string
3. run `JSON.parse()` on it
4. put the result somewhere you can read it

By default, **nobody does this**, so `req.body` is `undefined`. The fix is one line:

```js
app.use(express.json());
```

`express.json()` is a **middleware**. It runs **before** your routes, does those 4 steps, and puts the object in `req.body`. We'll dissect middleware fully in a later lesson. For now, think of it as a **gatekeeper that prepares the request for your routes**. 🚪

> ⚠️ It must be placed **above** your routes. Order matters (Lesson 2!).

---

## 🛠️ Step 1: Setup and first POST

Create `lesson5/api.js` and type it yourself:

```js
const express = require("express");
const app = express();

app.use(express.json());

app.post("/echo", (req, res) => {
  console.log("body:", req.body);
  res.json({ youSent: req.body });
});

app.listen(3000, () => console.log("Running on 3000"));
```

In Postman:
1. Method: **POST**, URL: `http://localhost:3000/echo`
2. **Body** → **raw** → choose **JSON**
3. Type: `{ "name": "Bisrat", "age": 20 }`
4. Click **Send**

Check the response **and** your terminal.

### 🎯 Mini Challenge 1 (⚡ 20 XP)
**Delete** the `app.use(express.json())` line. Send the same request again. What is `req.body` now? Put the line back and note the difference in a comment.

---

## 🛠️ Step 2: A mini in-memory API

Replace your file with this:

```js
const express = require("express");
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: "Atomic Habits" },
  { id: 2, title: "Deep Work" },
];

app.get("/books", (req, res) => {
  res.json(books);
});

app.post("/books", (req, res) => {
  const book = { id: books.length + 1, title: req.body.title };
  books.push(book);
  res.status(201).json(book);
});

app.listen(3000, () => console.log("Running on 3000"));
```

Test in Postman:
- `GET /books` → both books
- `POST /books` with body `{ "title": "Clean Code" }` → status 201
- `GET /books` again → three books! ✅

> 🧠 The data lives in a **variable**, not a database. Restart the server and it resets. MongoDB comes much later.

### 🎯 Mini Challenge 2 (⚡ 30 XP)
In `POST /books`, if `req.body.title` is missing, **return** 400 with `{ error: "Title is required" }`. Test it with an empty body `{}`.

> 💡 Hint: remember Lesson 4. What happens if you forget `return`?

---

## 🛠️ Step 3: Refactor with `app.route()`

Rewrite the two book routes:

```js
app.route("/books")
  .get((req, res) => {
    res.json(books);
  })
  .post((req, res) => {
    // your validation + create logic here
  });
```

Run the same Postman tests. The behavior is **identical**, but the path is written once. 🎉

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Add a second route object for `/books/:id` using `app.route()` with:
- `.get` → return that book, or 404 if not found
- `.delete` → remove it from the array, reply with `{ message: "Book deleted" }`

> 💡 Hint: params are strings (Lesson 3). For deleting, think about `filter` or `findIndex` + `splice`.

---

## 🛠️ Step 4: Organize Postman

1. Create a **Collection** called `Express Quest`
2. Save each request inside it with a clear name: `Get all books`, `Create book`, etc.
3. Create a **variable** `baseUrl` = `http://localhost:3000` and use `{{baseUrl}}/books`

Why? When you change the port or deploy, you edit **one** place. This is how professionals work. 💼

---

## 🧪 Quick Check

1. Why is `req.body` `undefined` without `express.json()`?
2. Why must `app.use(express.json())` be placed **above** the routes?
3. What does `app.route("/x")` return, and why can you chain?
4. Which status code should a successful POST that creates something return?

---

## 🏆 Main Challenges

In VS Code and Postman. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson5/challenge1.js` on port 4000, a **todos** API using `app.route("/todos")`:
- `GET` → all todos
- `POST` → add a todo `{ id, task, done: false }` (status 201)

Test both in Postman and save them in your collection.

### 🟡 Challenge 2: Real-world (80 XP)
Create `lesson5/challenge2.js`. Extend it into a full **CRUD**:
- `app.route("/todos")` → GET (all), POST (create)
- `app.route("/todos/:id")` → GET (one), PUT (update `task` and `done`), DELETE
- 400 if the id is not a number, 404 if the todo doesn't exist, 400 if POST has no `task`
- custom JSON 404 at the bottom

Test **every** case in Postman, including the error cases, and save them in your collection.

> 💡 Hint: for PUT, find the todo first. If you can't find it, stop with `return`. Then update its fields.

### 🔴 Challenge 3: Brain-stretcher (110 XP, stacks Lessons 1 to 5)
Create `lesson5/challenge3.js`: a **notes API with protection and logging**.

- `logger` handler on every route (prints `METHOD originalUrl`)
- header-based key check: `checkKey` reads `req.get("x-api-key")`. If it isn't `"letmein"`, return 401 `{ error: "Invalid key" }`
- `app.route("/notes")` → GET, POST (both protected)
- `app.route("/notes/:id")` → GET, PUT, DELETE (all protected)
- response header `X-Total-Notes` on `GET /notes` with the number of notes
- JSON 404 for anything else

In Postman, set the key as a **header** and test with and without it.

Before coding, write in comments: **why is it better to send a key in a header than in the URL like in Lesson 3's challenge?** (Think about where URLs get stored: browser history, server logs...)

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 5: postman and app.route"`
2. 🗣️ **Explain back:** in 3 sentences, how does JSON sent from Postman end up in `req.body`?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

Send me your code and explain-back. I'll review it, award XP, and unlock **Lesson 6: Advanced Router (`express.Router()`)** 🔓

Go! 🔥