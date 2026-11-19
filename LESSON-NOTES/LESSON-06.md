# 🗂️ Lesson 6: Advanced Router

**Level 3 · Reward: 300 XP**

Your single file is getting crowded. Today you learn to **split your app into clean, separate files**. This is how real projects are built. 🏗️

---

## 📝 Notes (copy into `lesson6.md`)

### The problem
One `app.js` with 40 routes is hard to read, hard to debug, and hard to share with a team.

### The solution: `express.Router()`
A **Router** is a mini-app that holds a group of related routes. You build it in its own file, then **mount** it on the main app under a prefix.

```js
// routes/books.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.send("All books"));
router.get("/:id", (req, res) => res.send(`Book ${req.params.id}`));

module.exports = router;
```

```js
// app.js
const booksRouter = require("./routes/books");
app.use("/books", booksRouter);
```

Result:
- `GET /books` runs `router.get("/")`
- `GET /books/5` runs `router.get("/:id")`

> 🧠 Inside the router, paths are **relative to the mount point**. You write `"/"`, not `"/books"`.

### Router methods you already know
`router.get`, `router.post`, `router.put`, `router.delete`, `router.route()`, and `router.use()` all work like on `app`.

---

## 🔍 Under the hood

### 1. A Router is a mini-app
`express.Router()` returns a function (like `app`) that has only the **routing and middleware** parts. It has no `listen()`. It cannot run alone. It needs `app.use()` to plug it in.

### 2. What `app.use("/books", router)` does
When a request arrives for `/books/5`:
1. Express sees the path **starts with** `/books`, so it enters the router.
2. It **removes** `/books` from `req.url`, so inside the router `req.url` is `/5`.
3. It remembers the removed part in `req.baseUrl` (`"/books"`).
4. The router then matches `/5` against `/:id`.

That is why inside a router `req.url` and `req.originalUrl` **differ**. Remember the question from Lesson 4? 😉

### 3. `module.exports` and `require`
Node runs each file in its own scope. `module.exports = router` is how a file **hands** something to other files. `require("./routes/books")` **receives** it. No magic, just exports and imports.

---

## 🛠️ Step 1: Project structure

Create this inside `lesson6/`:

```
lesson6/
├── app.js
└── routes/
    ├── books.js
    └── users.js
```

**`routes/books.js`**
```js
const express = require("express");
const router = express.Router();

let books = [
  { id: 1, title: "Atomic Habits" },
  { id: 2, title: "Deep Work" },
];

router.get("/", (req, res) => {
  res.json(books);
});

router.get("/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

module.exports = router;
```

**`app.js`**
```js
const express = require("express");
const app = express();

app.use(express.json());

const booksRouter = require("./routes/books");
app.use("/books", booksRouter);

app.listen(3000, () => console.log("Running on 3000"));
```

Test `GET /books` and `GET /books/1` in Postman.

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Inside `router.get("/:id")`, add:

```js
console.log("url:", req.url);
console.log("baseUrl:", req.baseUrl);
console.log("originalUrl:", req.originalUrl);
```

Call `/books/1`. Write in a comment what each one printed and why.

---

## 🛠️ Step 2: A second router

### 🎯 Mini Challenge 2 (⚡ 30 XP)
Create `routes/users.js` with a router that has:
- `GET /` → list of users (JSON)
- `GET /:id` → one user, 404 if missing
- `POST /` → create a user (201), 400 if `name` is missing

Mount it in `app.js` at `/users`. Test it in Postman.

> 💡 Hint: copy the **structure** of `books.js`, not the data. Don't forget `module.exports`.

---

## 🛠️ Step 3: Router-level middleware

`router.use()` runs a function for **every request that enters this router**, and only this router.

```js
router.use((req, res, next) => {
  console.log("Books router hit:", req.method, req.url);
  next();
});
```

Place it **above** the routes in `books.js`. Now `/users` requests don't trigger it, but every `/books` request does.

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Add a `router.use` to `users.js` that blocks all requests without an `x-api-key` header equal to `"letmein"` (401 JSON error). Test that `/books` still works **without** the key.

> 💡 Hint: you wrote this check in Lesson 5. What changes is **where** it lives.

---

## 🛠️ Step 4: Nested routers and `mergeParams`

Imagine reviews belong to a book: `/books/:bookId/reviews`.

**`routes/reviews.js`**
```js
const express = require("express");
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.json({ message: `Reviews for book ${req.params.bookId}` });
});

module.exports = router;
```

**In `books.js`**, above the export:
```js
const reviewsRouter = require("./reviews");
router.use("/:bookId/reviews", reviewsRouter);
```

Test `GET /books/2/reviews`.

**Why `mergeParams: true`?** By default a child router only sees **its own** params. Without this option, `req.params.bookId` is `undefined` inside `reviews.js`. Try removing it and see. 👀

### 🎯 Mini Challenge 4 (⚡ 30 XP)
Add `GET /:reviewId` to the reviews router that replies `Review <reviewId> of book <bookId>`. Test `/books/2/reviews/9`.

---

## 🧪 Quick Check

1. What does `express.Router()` return, and what can it **not** do that `app` can?
2. Inside a router mounted at `/books`, why do you write `router.get("/")` and not `router.get("/books")`?
3. What is `req.baseUrl`?
4. When do you need `mergeParams: true`?

---

## 🏆 Main Challenges

In VS Code and Postman. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson6/challenge1/` with `app.js` and `routes/todos.js`:
- `GET /todos` → list
- `POST /todos` → create (201, 400 if no `task`)

Mounted with `app.use("/todos", todosRouter)`.

### 🟡 Challenge 2: Real-world (90 XP)
Create `lesson6/challenge2/`. Build a **school API** with **3 routers** in separate files:
- `/students` → GET all, GET one, POST, DELETE
- `/teachers` → GET all, GET one
- `/courses` → GET all, GET one

Requirements:
- each router uses `router.route()` where a path has more than one method (Lesson 5)
- JSON errors: 400 invalid id, 404 not found
- a JSON 404 for unknown routes in `app.js`, placed **after** all routers
- every router prints a log line with `req.baseUrl` and `req.method`

> 💡 Hint: the global 404 must come **last**. Why? Think about the order Express checks routes.

### 🔴 Challenge 3: Brain-stretcher (120 XP, stacks Lessons 1 to 6)
Create `lesson6/challenge3/`: a **blog API**.

Structure:
```
challenge3/
├── app.js
└── routes/
    ├── posts.js
    └── comments.js
```

- `app.js`: `express.json()`, a global logger, mount `/posts`, JSON 404 at the end
- `posts.js`: full CRUD with `router.route()`
- `comments.js`: nested under `/posts/:postId/comments` with `mergeParams`
  - `GET` all comments of a post
  - `POST` a comment (400 if no `text`)
  - `DELETE /:commentId`
- if the post does not exist, comments routes return 404 `{ error: "Post not found" }`
- response header `X-Resource` on posts routes with the value `posts`, and on comments routes with `comments` (use `router.use`)

Before coding, draw (on paper or in a comment) the **path a request takes** for `DELETE /posts/1/comments/3`: which files, which functions, in which order. Compare it with what happens when you run it with logs.

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 6: routers"`
2. 🗣️ **Explain back:** in 3 sentences, what happens to the URL when a request enters a mounted router?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

Send me your code and explain-back. I'll review it, award XP, and unlock **Lesson 7: Route Parameters In Depth** 🔓

Go! 🔥