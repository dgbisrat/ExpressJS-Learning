# 🟠 Level 3, Lesson 8: Controllers and Project Structure 🏗️

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end.

> 💬 **Honest coach note:** this is Lesson 8 and you have **0 XP**. The skill you want, staying in the struggle, only grows when you type, break, and fix. Today's lesson is a refactor, so use **your own Notes API** as the practice project. Before Lesson 9 (Boss Battle #3), I'd love to see **one piece of your code**, even a broken one. 🔑

## 🤔 The "Why"

Look at your `routes/notes.js`. Each route does **two jobs** at once:
1. **Wiring:** "which URL and method?"
2. **Logic:** "check the id, find the note, build the answer."

When logic grows, routes get messy. And you can't reuse or test the logic alone.

## 🧠 Mental Model

> 🍽️ **A restaurant.**
> - **Routes** = the **menu and waiter**: which order goes where.
> - **Controllers** = the **kitchen**: the real work for each order.
> - **Data layer** = the **pantry**: where the ingredients (data) live.
>
> The waiter never cooks. The kitchen never talks to customers' tables.

```
Request → app.js → router → controller → data layer
                                  ↓
                            Response ←
```

---

## 🔬 Under the Hood: A Controller Is Just a Function

Nothing new! A route handler is already `(req, res, next) => {...}`. A **controller** is the **same function**, but **named** and **moved to its own file**.

```js
// BEFORE: handler written inline
router.get("/", (req, res) => { res.json(notes); });

// AFTER: handler lives elsewhere, we pass its NAME
router.get("/", getAll);
```

**Important:** we pass `getAll`, **not** `getAll()`.

- `getAll` = the function itself. Express **stores** it and calls it later, for each request.
- `getAll()` = **calls it right now**, with no `req` or `res`, and gives Express its **return value** (`undefined`).

This is the same idea as `app.use(logger)` vs `app.use(logger())` from Lesson 5. 🧩

---

## 🛠️ Part 1: The Folder Structure

Create a new folder `lesson8` and this structure:

```
lesson8/
  src/
    app.js              ← builds the app (middleware + mounts + errors)
    server.js           ← starts the server (listen)
    routes/
      notes.js          ← URLs only
    controllers/
      notesController.js ← what each route does
    data/
      notesStore.js     ← where the notes live
    middleware/
      auth.js
    utils/
      AppError.js
  .env
  .gitignore
  package.json
```

Run: `npm init -y` and `npm install express`. You will add `dotenv` in Part 4.

### Why split `app.js` and `server.js`?

- `app.js` **builds** the app and exports it. It does **not** call `listen`.
- `server.js` imports the app and **opens the port**.

**Why?** Importing a file must not start a server. Later, in testing (Level 6), a test imports `app` and sends fake requests **without** opening a real port. Two files, two jobs. ✅

---

## 🛠️ Part 2: Build It Layer by Layer

Type each file. Start from the **bottom** (pantry) and go up.

**`src/utils/AppError.js`** (from Lesson 6):

```js
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
module.exports = AppError;
```

**`src/data/notesStore.js`** (the pantry):

```js
let notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];
let nextId = 3;

function findAll(search) {
  if (!search) return notes;
  return notes.filter((n) => n.text.toLowerCase().includes(search.toLowerCase()));
}

function findById(id) {
  return notes.find((n) => n.id === id);
}

function add(text) {
  const note = { id: nextId++, text };
  notes.push(note);
  return note;
}

module.exports = { findAll, findById, add };
```

**Why `nextId` instead of `notes.length + 1`?** Delete note 1 from `[1, 2]`, then add one: `length + 1` gives **2** again. Two notes now share id 2. 🐛 A separate counter never repeats.

**`src/controllers/notesController.js`** (the kitchen):

```js
const notesStore = require("../data/notesStore");
const AppError = require("../utils/AppError");

exports.getAll = (req, res) => {
  res.json(notesStore.findAll(req.query.search));
};

exports.getOne = (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return next(new AppError("id must be a number", 400));

  const note = notesStore.findById(id);
  if (!note) return next(new AppError("Note not found", 404));

  res.json(note);
};

exports.create = (req, res, next) => {
  const { text } = req.body;
  if (!text) return next(new AppError("text is required", 400));

  res.status(201).json(notesStore.add(text));
};
```

`exports.getAll = ...` adds a property to the object this file shares with others. Another file gets it with `require`.

**`src/middleware/auth.js`:**

```js
const AppError = require("../utils/AppError");

module.exports = function requireKey(req, res, next) {
  if (req.get("x-api-key") !== "secret123") {
    return next(new AppError("Unauthorized", 401));
  }
  next();
};
```

**`src/routes/notes.js`** (the waiter):

```js
const express = require("express");
const c = require("../controllers/notesController");
const requireKey = require("../middleware/auth");

const router = express.Router();

router.route("/").get(c.getAll).post(requireKey, c.create);
router.route("/:id").get(c.getOne);

module.exports = router;
```

Look how short it is. You can read the **whole API** in 5 lines. 😍

**`src/app.js`:**

```js
const express = require("express");
const notesRouter = require("./routes/notes");
const AppError = require("./utils/AppError");

const app = express();

app.use(express.json());
app.use("/notes", notesRouter);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Server error" : err.message });
});

module.exports = app;
```

**`src/server.js`:**

```js
const app = require("./app");

const PORT = 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
```

Run: `node src/server.js`

**What breaks?**
- In `routes/notes.js`, write `.get(c.getAll())` → crash at startup: `res` is `undefined` inside the call. You called the kitchen with no order.
- Rename `getOne` in the controller but not in the route → `c.getOne` is `undefined`, and Express throws `Route.get() requires a callback function but got a [object Undefined]`.
- Add `app.listen` inside `app.js` **and** `server.js` → `EADDRINUSE`, the port is already used.

### ⚡ Mini Challenge 1 (25 XP)
Type all the files above and test:
1. `GET /notes`, `GET /notes/1`, `GET /notes/abc`, `GET /notes/99`, `GET /nothing`
2. `POST /notes` with and without the `x-api-key` header
3. Prove the first "What breaks?" line yourself. Read the error and find the **exact line** it points to.

### ⚡ Mini Challenge 2 (20 XP): Test the `nextId` idea
1. Add a `remove(id)` function to `notesStore.js` (use `filter`, and **reassign** `notes`).
2. Temporarily change `add` to use `notes.length + 1`. Remove note 1, add a note, and print `findAll()`. See the duplicate id.
3. Change it back to `nextId`. Explain in one sentence why it's safer.

---

## 🛠️ Part 3: `asyncHandler` (One Wrapper for All Async Routes)

In Lesson 6, async routes needed `try/catch` + `next(e)` in Express 4. Writing that in every controller is boring. So we write a **wrapper**:

```js
// src/utils/asyncHandler.js
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Step by step:**
1. `asyncHandler(fn)` takes **your** controller and returns a **new** function. This is a **factory** (Lesson 5 again!).
2. The new function calls your controller.
3. `Promise.resolve(...)` makes sure we have a promise, even if your controller isn't `async`.
4. `.catch(next)` means: if the promise **rejects**, call `next(err)`. That sends the error to your error handler.

Use it:

```js
const asyncHandler = require("../utils/asyncHandler");

exports.getSlow = asyncHandler(async (req, res) => {
  const data = await fakeDb();   // may reject
  res.json(data);
});
```

> 💡 In **Express 5**, this is automatic. But many real projects still use Express 4, and now you know what's happening inside either way.

### ⚡ Mini Challenge 3 (25 XP)
1. Add `fakeDb()` (from Lesson 6, rejects after 100 ms) to a new controller `getSlow`, and a route `GET /notes/slow/test`. (Careful: where must this route go, relative to `/:id`? You learned this in Lesson 2.)
2. First **without** `asyncHandler` (check your Express version first: does it hang or work?).
3. Wrap it with `asyncHandler`. Prove the error reaches your error handler.
4. Remove `.catch(next)`. What happens now?

---

## 🛠️ Part 4: Environment Variables (`.env`)

**Problem:** `3000` and `"secret123"` are written in the code. If you push to GitHub, everyone sees your secret. And on a real server, the port is different.

**Environment variable** = a setting that lives **outside** your code, in the computer's environment. Node reads them from `process.env`.

Install: `npm install dotenv`

**`.env`** (in the project root, not in `src`):

```
PORT=4000
API_KEY=secret123
```

**`.gitignore`:**

```
node_modules
.env
```

Update `server.js`. The `config()` call must be **first**:

```js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
```

Update `auth.js` to use `process.env.API_KEY` instead of `"secret123"`.

**Under the hood:** `dotenv.config()` reads the `.env` file as text, splits each line at the `=`, and **copies** each pair into `process.env`. That's the whole trick. 🔍 And all values are **strings**: `process.env.PORT` is `"4000"`, not `4000`.

**What breaks?**
- Call `require("dotenv").config()` **after** you require other files that read `process.env` at load time → those values are `undefined`.
- Remove `API_KEY` from `.env` → `process.env.API_KEY` is `undefined`. Then `req.get("x-api-key") !== undefined` is **always true** for a real header, so everything is blocked. And a request with **no** header gives `undefined !== undefined` = `false`, so **it gets in!** 😱 A missing secret can silently open the door. Always check it exists.

### ⚡ Mini Challenge 4 (20 XP)
1. Set up `.env`, `.gitignore`, and `dotenv`.
2. Start the server. Does it use your new port?
3. Delete `API_KEY` from `.env` and test `POST /notes` with **no** header. Do you get in? (See the danger.) Then fix `auth.js` so it **refuses to start the app** (throws an error at load time) if `API_KEY` is missing.

---

## 🛠️ Part 5: Rules for "Where Does This Code Go?"

| If the code... | It goes in |
|---|---|
| Matches a URL + method | `routes/` |
| Reads `req`, validates, calls the store, sends `res` | `controllers/` |
| Reads/writes the data | `data/` (later: models) |
| Runs for many routes (guards, loggers) | `middleware/` |
| Is a small helper used everywhere | `utils/` |
| Starts the server | `server.js` |

> 🔮 **Why the data layer matters:** in Level 4 you replace `notesStore.js` with **MongoDB**. If the controllers only call `findAll`, `findById`, `add`, you change **one file** and everything else stays the same. That's the payoff. 💎

### ⚡ Mini Challenge 5 (15 XP): Sort the code
Without running anything, write down in which folder each piece belongs:
1. A function `isValidEmail(text)`
2. `app.use(morgan("dev"))`
3. `router.delete("/:id", c.remove)`
4. A function that reads `req.params.id`, calls `notesStore.remove(id)`, and sends `204`
5. `let users = []`

Check yourself with the table. Disagree with one answer? Explain why. 🧠

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Finish the Notes feature in the new structure:
- Add `update(id, text)` and `remove(id)` to `notesStore.js`
- Add `update` and `remove` to the controller (`404` if missing, `400` if `text` is missing on update)
- Routes: `PUT /notes/:id` and `DELETE /notes/:id` need `requireKey`. `DELETE` returns status `204` with no body.

**⚔️ Challenge 2: Real-world (40 XP)**
Add a **users** resource with the **same pattern**: `routes/users.js`, `controllers/usersController.js`, `data/usersStore.js`.
- `GET /users`, `GET /users/:id`, `POST /users` (`name` and `email` required, `email` must contain `@`)
- No duplicate emails: second try → `409` (conflict)
- Put `PORT` and `API_KEY` in `.env`. Create `.env.example` with fake values (this one **is** committed, so teammates know what to set).

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Predict each result **before** running:

```js
// controller.js
const getAll = (req, res) => res.json([]);
exports = { getAll };
```

```js
// routes.js
const c = require("./controller");
router.get("/", c.getAll);
```

1. What error appears, and **when** (at startup or at request time)?
2. Why? *(Hint to think about: `exports` and `module.exports` start as the **same object**. What does `exports = {...}` do to that link?)*
3. What is the smallest change that fixes it? Give **two** different fixes.

**⚔️ Challenge 4: Build Your Own `dotenv` (60 XP)** 🛠️
In plain Node, write `loadEnv(path)`:
- read the file with `fs.readFileSync`
- skip empty lines and lines that start with `#`
- split each line at the **first** `=` only (values may contain `=`)
- trim spaces
- set `process.env[key] = value`, but **do not overwrite** a variable that already exists
- test it with a `.env` that has a comment, a blank line, and `KEY=a=b`

If you can build this, `dotenv` is no longer a mystery. 🏆

**🐞 Bug Hunt (30 XP):** find **3 bugs** before running:

```js
// routes/notes.js
const { getAll } = require("../controllers/notesController");
router.get("/", getAll());
```

```js
// controllers/notesController.js
const getAll = (req, res) => {
  res.json(notesStore.findAll(req.query.search));
};
module.exports = getAll;
```

*(Look at: calling vs passing, how the file exports, and one missing line at the top of the controller.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"What is the job of a route, a controller, and a data layer? What happens to the other two if I change the data layer?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Read the **first line** of the error and the file and line number it gives. Most bugs are there.
2. Ask: *"Is it a typo, a wrong path in `require`, or a wrong idea?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 8: controllers and structure"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 3 (Architecture) | 0 (pile waiting: **~2,000 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 9, **Validation middleware**, and **👹 Boss Battle #3**, which finishes Level 3 with your **Structured Blog API**. 🔥

Send me one small thing: an error you hit, a folder screenshot, or Mini Challenge 1. I'll review it. 🚀