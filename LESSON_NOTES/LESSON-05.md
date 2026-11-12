# 🚀 PHASE 2 · LESSON 5: Pro-Level Express (Errors, Security & Config)

> 🎮 **Your XP Bar:** `[███████░░░] 3625 / 6000 XP` *(if you finished Lessons 1-4)*
> **Current Level:** 🔧 Middleware Wizard → 🛡️ **Server Guardian** (unlocks at 4500 XP)

> 🏁 **This lesson finishes Phase 2.** After today, your API stops looking like a tutorial project and starts looking like a **real, deployable backend**.

> 🔗 **Connection to Lessons 1-4:**
> - Lesson 1: server **speaks** 🗣️
> - Lesson 2: server **listens** 👂
> - Lesson 3: server **changes things** ✍️
> - Lesson 4: server gets an **assembly line** 🏭
> - Lesson 5: server gets **armor, a safety net, and a settings panel** 🛡️🧯⚙️

Three big upgrades today:

1. 🧯 **Professional error handling:** one central place for all errors
2. 📦 **Third-party middleware:** `morgan`, `helmet`, `cors` (**your React app finally talks to Express!**)
3. ⚙️ **Environment variables:** secrets and settings out of your code

---

## 🔁 Quick Warm-Up (Lessons 1-4)

Answer from memory:

1. What are the **3 things** middleware can do?
2. Why must an error-handling middleware have **4 parameters**?
3. What's the difference between `401` and `403`?
4. Why does a middleware that forgets `next()` make the request hang?

Fuzzy? Re-read the Lesson 4 recap first. 🧱

---

# 🎒 PART 0: Upgrade Your Learning Process

Before the new content, let's upgrade **how** you learn. These six habits turn "I followed a lesson" into "I became a developer." From now on, **every lesson** has them built in. 💪

### 1️⃣ The Git Ritual 🐙 (after every lesson)

> **Rule:** A lesson isn't finished until it's **committed and pushed**.

**Why?** Your GitHub profile becomes proof of your work. Green squares build the habit. And if you break something, you can always go back.

### 🎯 QUEST 0: Push your backlog (+100 XP)

You have a pile of files from Lessons 1-4. Let's organize and push them **once**, then it's easy forever.

**Step 1: Organize.** Make one folder with subfolders:

```
express-journey/
├── lesson-1/
├── lesson-2/
├── lesson-3/
├── lesson-4/
└── lesson-5/
```

Move your `.js` files into the matching folders.

**Step 2: Create `.gitignore`** in the `express-journey/` root:

```
node_modules/
.env
```

> 🚨 **Why?** `node_modules/` is huge and re-creatable (`npm install`). `.env` will hold **secrets** (more on that today). Never push either.

**Step 3: Create an empty repo on GitHub** (no README, no license). Name it `express-journey`.

**Step 4: Push:**

```bash
cd express-journey
git init
git add .
git commit -m "Lessons 1-4: routes, params, CRUD, middleware"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/express-journey.git
git push -u origin main
```

**Step 5: From now on, after every lesson:**

```bash
git add .
git commit -m "Lesson 5: error handling, env vars, morgan/helmet/cors"
git push
```

> 📝 **Note:** Good commit messages say **what** and **why**, in plain words. `"fix"` is bad. `"Return 409 when borrowing a checked-out book"` is great.

### 2️⃣ Type it yourself ⌨️

**Never copy-paste lesson code.** Type every line. Your fingers and brain learn together. When you *want* to paste, that's the signal to slow down and understand the line.

### 3️⃣ Debug alone first 🔬 (the 10-minute protocol)

When something breaks:

1. **Read the error top to bottom.** Slowly.
2. **Find the file and line** it points to.
3. **Add `console.log`** to check your assumptions. *"Is this function even running? What's in this variable?"*
4. **Shrink the problem.** Comment out code until it works, then add it back.
5. **Explain it out loud** (rubber duck 🦆) or write it as a comment.
6. **Only then** ask me, and send what you tried.

> 🧠 This is how you become someone who can "think, build, debug, and solve hard problems independently." The struggle **is** the training.

### 4️⃣ Test with a real tool 🧪

Use **Thunder Client** (or **Postman**) for everything. Level up today:

- **Save every request** into a **Collection** (e.g., "Express Journey").
- Use an **environment variable** `{{baseUrl}}` = `http://localhost:3000`, so URLs are `{{baseUrl}}/tasks`.
- Export the collection as JSON and put it in your repo under `docs/`. Now your project **documents itself**. 📚

### 5️⃣ Your own mini project 🏗️

Tutorial projects (movies, books) are *mine*. Now start **yours**.

> Pick an idea you'd **actually use**: expense tracker, workout log, study planner, game score board, anything.

Create a folder `my-project/` in your repo. **Every lesson, you add that lesson's skills to it.** By Phase 7 you'll have a real portfolio piece, built step by step. You'll do this at the end of today's lesson.

### 6️⃣ Teach it back 🧠

At the end of each lesson, you explain the concepts **in your own words**. If you can teach it, you own it.

---

# 🧠 PART A: Professional Error Handling

## 😩 1. The problem with Lesson 3-4 style errors

Look at the code you've been writing:

```js
if (!task) {
  return res.status(404).json({ error: "Task not found" });
}
```

This is fine... until your app has **50 routes**. Then:

- 😵 The error **format** differs between routes (`{ error }`, `{ message }`, `{ msg }`...).
- 😵 Status codes get typed wrong in one place.
- 😵 Changing the format means editing **50 places**.
- 😵 Real crashes may leak **internal details** to clients.

### 💡 The solution: **throw, don't respond**

> **Handlers and middleware *throw* errors. ONE central handler turns them into responses.**

```
 Route/middleware ──throw──▶ 🧯 Central error handler ──▶ clean JSON response
```

Same idea as Lesson 4's airport ✈️: instead of every station having its own "emergency exit," there's **one** security office that handles every incident the same way.

---

## 🏷️ 2. Custom error classes

You already know JavaScript classes. Let's use them.

Create **`errors.js`**:

```js
// errors.js

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);              // ⚠️ super() FIRST
    this.name = this.constructor.name;
    this.status = status;
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You are not allowed to do this") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(what = "Resource") {
    super(`${what} not found`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict with current state") {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
```

### 🔍 Why this is powerful

| Error class | Status | Meaning |
|-------------|--------|---------|
| `BadRequestError` | `400` | Client sent invalid data |
| `UnauthorizedError` | `401` | "Who are you?" |
| `ForbiddenError` | `403` | "You can't do this" |
| `NotFoundError` | `404` | It doesn't exist |
| `ConflictError` | `409` | State forbids it |

The **status code travels inside the error.** Now one line says everything:

```js
throw new NotFoundError("Task");   // → 404 "Task not found"
```

> 📝 **Note:** Notice `module.exports` and `require("./errors")`. That's plain Node.js from your earlier course: **splitting code into files**. In Phase 3 we'll organize whole projects this way. Today it's just one extra file.

### Two kinds of errors (important idea) 🧠

| Kind | Example | Safe to show the client? |
|------|---------|--------------------------|
| **Expected** ("operational") | Task not found, invalid input | ✅ Yes, you wrote the message |
| **Unexpected** (bugs) | `TypeError: Cannot read properties of undefined` | ❌ **No!** It leaks internals |

Your central handler must treat them **differently**.

---

## 🧯 3. The central error handler

```js
// bottom of server.js
const { AppError } = require("./errors");

app.use((err, req, res, next) => {
  // If a response already started, let Express's default handler finish
  if (res.headersSent) return next(err);

  const status = err.status || 500;

  // "Safe" = we wrote the message, or the body parser did (it sets err.expose)
  const isSafe = err instanceof AppError || err.expose === true;

  // Log unexpected bugs for YOU, never for the client
  if (!isSafe) console.error("💥", err);

  const body = {
    error:
      err.type === "entity.parse.failed"
        ? "Invalid JSON in request body"
        : isSafe
        ? err.message
        : "Something went wrong on our side",
    status,
  };

  // In development ONLY, include the stack to help yourself debug
  if (process.env.NODE_ENV === "development" && !isSafe) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
});
```

### 🔍 What's new?

- **`res.headersSent`**: if a response is *already* going out, you can't send another. Pass the error along with `next(err)`.
- **`err instanceof AppError`**: "is this one of **my** errors?" If yes, trust the message.
- **`err.expose`**: Express's own body parser errors (bad JSON, payload too large) set this to `true` when the message is client-safe.
- **Generic message for bugs:** attackers learn nothing from `"Something went wrong on our side"`. You still see the full error in **your** terminal.
- **Consistent shape:** every error is `{ error, status }`. Your React app will love this. ❤️

---

## 🔄 4. Refactor time: "throw, don't respond"

Remember Lesson 4's loaders? Look how much cleaner they get:

### Before (Lesson 4)

```js
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID must be a positive integer" });
  }
  req.itemId = id;
  next();
}
```

### After (Lesson 5) ✨

```js
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("ID must be a positive integer");
  }
  req.itemId = id;
  next();
}

function findTask(req, res, next) {
  const task = tasks.find((t) => t.id === req.itemId);
  if (!task) throw new NotFoundError("Task");
  req.task = task;
  next();
}

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) throw new UnauthorizedError("API key is missing");
  if (key !== process.env.ADMIN_KEY) throw new ForbiddenError("API key is invalid");
  next();
}
```

**No more `return res.status(...)`**. A `throw` stops the function automatically (so the Lesson 3 "forgot `return`" bug **can't happen** here). 🎉

> 📝 **Note:** In Express 5, a `throw` inside a **synchronous** middleware or handler goes straight to the error handler. Nothing extra needed.

### 404 for unknown routes, now as an error

Remember the 404 catch-all? It's now one line:

```js
app.use((req, res, next) => {
  next(new NotFoundError("Route"));   // → { "error": "Route not found", "status": 404 }
});
```

It **forwards** a `NotFoundError` to the central handler. One handler, one format. 🎯

---

## ⏳ 5. Async errors (the Express 5 gift 🎁)

Real routes `await` things: databases, APIs, files. Try this:

```js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.get("/slow-report", async (req, res) => {
  await wait(300); // pretend we're talking to a database

  if (req.query.fail === "true") {
    throw new Error("Database exploded 💥");
  }

  res.json({ report: "All good", generatedAt: new Date().toISOString() });
});
```

Visit `/slow-report?fail=true`.

In **Express 5**, errors thrown inside `async` handlers are **caught automatically** and sent to your central handler. No `try/catch`, no `next(err)`.

> 📝 **Note:** In older tutorials (Express 4) you'll see `try { ... } catch (err) { next(err); }` in every async route, or a wrapper called `asyncHandler`. You don't need that anymore. When you see it, now you know **why** it existed. 🧠

> ⚠️ This works for **handlers and middleware**. A random `setTimeout(() => { throw ... })` or an un-awaited promise is **not** caught. Always `await` your async work.

### 🧪 Test your error system

Add these temporary routes:

```js
app.get("/err/bad", () => { throw new BadRequestError("You sent nonsense"); });
app.get("/err/missing", () => { throw new NotFoundError("Spaceship"); });
app.get("/err/bug", () => { null.name; }); // a real bug!
```

| URL | Expected response |
|-----|-------------------|
| `/err/bad` | `400` `{ "error": "You sent nonsense", "status": 400 }` |
| `/err/missing` | `404` `{ "error": "Spaceship not found", "status": 404 }` |
| `/err/bug` | `500` generic message, real error **only in your terminal** |

> 🎮 **Quest 1: Build `errors.js` + the central handler and test all three (+100 XP).**

---

# 📦 PART B: Third-Party Middleware

## 🌍 6. What is "third-party" middleware?

Other developers wrote middleware and shared it on **npm**. You install it and `app.use()` it, exactly like Lesson 4. 🔌

Today's three essentials:

```bash
npm install morgan helmet cors
```

### 📜 `morgan`: professional request logging

Remember writing your own logger in Lesson 4? Morgan is the polished, battle-tested version.

```js
const morgan = require("morgan");

app.use(morgan("dev"));
```

Terminal output:

```
GET /tasks 200 4.123 ms - 189
POST /tasks 400 1.502 ms - 36
```

Colored by status. Built-in formats:

| Format | Best for |
|--------|----------|
| `"dev"` | Development: short, colored |
| `"tiny"` | Minimal |
| `"combined"` | Production: full Apache-style logs (IP, browser, etc.) |

> 📝 **Note:** Writing your own logger in Lesson 4 wasn't wasted. Now you understand **exactly** what Morgan does under the hood: it listens for `finish` on `res`, just like you did. 😎

### 🛡️ `helmet`: security headers with one line

```js
const helmet = require("helmet");

app.use(helmet());
```

**What does it do?** It sets a bundle of **HTTP security headers** that protect browsers from common attacks (clickjacking, MIME sniffing, and more). It also **removes** the `X-Powered-By: Express` header, which advertises your framework to attackers.

**Check it yourself:** open DevTools → Network → click a request → Response Headers. Compare **with** and **without** helmet. 🔬

> 🧠 You don't need to understand every header today. Just know: **one line, big win. Always use it.**

### 🌐 `cors`: let your React app talk to your API

This one is a rite of passage. 🎓 Every full-stack developer hits this error:

```
Access to fetch at 'http://localhost:3000/tasks' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

### 🤔 What is going on?

An **origin** = protocol + domain + **port**:

| URL | Origin |
|-----|--------|
| `http://localhost:3000` | your Express API |
| `http://localhost:5173` | your React app (Vite's default port) |

**Different port = different origin.** Browsers refuse to let a page from one origin read responses from another, **unless the server says it's allowed**. That permission is the `Access-Control-Allow-Origin` header.

### ✅ The fix

```js
const cors = require("cors");

app.use(cors({ origin: "http://localhost:5173" }));
```

Now Express adds the header, and the browser lets your React app in. 🎉

### 🧠 Important truths about CORS

1. **CORS is enforced by browsers only.** Thunder Client, curl, and other servers ignore it entirely. That's why your API "worked in Thunder Client" but "failed in React."
2. **CORS is NOT security for your API.** It protects *users' browsers*. Anyone can still call your API from a script. Real protection = authentication (Phase 5).
3. **`cors()` with no options** allows **every** origin. Fine for learning, bad for real apps. Prefer a specific `origin`.
4. For `POST`/`PUT`/`DELETE` with JSON, browsers first send an **OPTIONS "preflight"** request asking permission. The `cors` middleware answers it for you.

### 🔥 Connect your React skills (mini demo)

In a separate folder:

```bash
npm create vite@latest task-ui -- --template react
cd task-ui
npm install
npm run dev
```

Replace `src/App.jsx` with:

```jsx
import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/tasks")
      .then((res) => {
        if (!res.ok) throw new Error(`Server said ${res.status}`);
        return res.json();
      })
      .then(setTasks)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>❌ {error}</p>;

  return (
    <div>
      <h1>My Tasks 📋</h1>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.done ? "✅" : "⬜"} {t.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

**First, run it without `cors`** and read the browser console error. **Then add `cors`** and watch your Express data appear in React. 🤯

> 🎮 **Quest 2: Install the 3 packages, test each one, and see your React app load Express data (+75 XP).**

### 🧱 Middleware order (Lesson 4 ✅ meets Lesson 5)

```js
app.use(helmet());                       // 1️⃣ security headers first
app.use(cors({ origin: ... }));          // 2️⃣ CORS before routes
app.use(morgan("dev"));                  // 3️⃣ log everything
app.use(express.json({ limit: "10kb" })); // 4️⃣ body parser
// ... routes ...
// 404 → error handler (LAST)
```

### 🆕 Small but mighty: `limit`

```js
express.json({ limit: "10kb" })
```

Rejects giant request bodies with a clean `413` error. Without a limit, an attacker could send gigabytes. Your central handler handles it automatically thanks to `err.expose`. 🛡️

---

# ⚙️ PART C: Environment Variables

## 🔐 7. Why not hardcode?

In Lesson 4 you wrote this:

```js
if (key !== "express-is-fun") { ... }  // ❌ secret in the code
app.listen(3000);                       // ❌ fixed port
```

Problems:

- 🚨 The secret is **in your code**. Push to GitHub → the whole world sees it.
- 🔧 Different places need different settings (your laptop vs a server).
- 🚫 Changing a setting means **editing code**.

### ✅ The solution: environment variables

Settings live **outside** the code, in a `.env` file:

```
PORT=3000
NODE_ENV=development
ADMIN_KEY=my-super-secret-key-123
CLIENT_ORIGIN=http://localhost:5173
```

Your code reads them via **`process.env`**:

```js
process.env.PORT        // "3000"
process.env.ADMIN_KEY   // "my-super-secret-key-123"
```

### 🔌 Loading `.env` with `dotenv`

```bash
npm install dotenv
```

```js
require("dotenv").config(); // ⚠️ at the VERY TOP of your entry file
```

> 📝 **Note:** Modern Node (20.6+) can load a file natively: `node --env-file=.env server.js`. But `dotenv` works **everywhere** and you'll see it in nearly every project, so learn it first.

### ⚠️ Three truths about `process.env`

1. **Everything is a string.** `process.env.PORT` is `"3000"`, not `3000`. (Lesson 2's string trap again. 😄) Use `Number(...)`.
2. **Missing = `undefined`.** Use fallbacks: `Number(process.env.PORT) || 3000`.
3. **Load it FIRST.** If you read `process.env.X` *before* `dotenv.config()` runs, it's `undefined`.

### 🚨 The golden rules of secrets

| Rule | Why |
|------|-----|
| ✅ `.env` goes in `.gitignore` | Secrets must never reach GitHub |
| ✅ Commit a **`.env.example`** with fake values | Teaches others (and future you) which variables exist |
| ✅ **Fail fast** if a required variable is missing | Better to crash on startup than behave strangely later |
| ❌ Never log secrets | Logs get shared |
| ❌ Never put secrets in **frontend** code | Anyone can read it in DevTools |

Your **`.env.example`**:

```
PORT=3000
NODE_ENV=development
ADMIN_KEY=change-me
CLIENT_ORIGIN=http://localhost:5173
```

### 🧱 A clean `config.js`

```js
// config.js
require("dotenv").config();

const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  adminKey: process.env.ADMIN_KEY,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};

// Fail fast 🚑
if (!config.adminKey) {
  console.error("❌ ADMIN_KEY is missing. Check your .env file.");
  process.exit(1);
}

module.exports = config;
```

Now **one file** reads the environment, validates it, and everyone else imports `config`. This pattern is used in real companies.

> 🧠 **Remember the `process.env.NODE_ENV` check in our error handler?** Now it makes sense. In **development** you want stack traces. In **production** you don't. Same code, different behavior. That's the power of environment variables.

> 🎮 **Quest 3: Create `.env`, `.env.example`, and `config.js`. Move your API key and port out of the code (+75 XP).**

---

# 🧩 PART D: The Pro Skeleton (Version 2)

Here's the structure of a professional Express file. **Type it; don't paste it.** ⌨️

```js
// server.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const config = require("./config");
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require("./errors");

const app = express();

// 1️⃣ Global middleware
app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

// 2️⃣ Data
let tasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Build an API", done: false },
];
let nextId = 3;

// 3️⃣ Route-level middleware
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("ID must be a positive integer");
  }
  req.itemId = id;
  next();
}

function findTask(req, res, next) {
  const task = tasks.find((t) => t.id === req.itemId);
  if (!task) throw new NotFoundError("Task");
  req.task = task;
  next();
}

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) throw new UnauthorizedError("API key is missing");
  if (key !== config.adminKey) throw new ForbiddenError("API key is invalid");
  next();
}

// 4️⃣ Routes
app.get("/tasks", (req, res) => res.json(tasks));

app.get("/tasks/:id", validateId, findTask, (req, res) => {
  res.json(req.task);
});

app.post("/tasks", requireApiKey, (req, res) => {
  const { title } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError("Title is required");
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.delete("/tasks/:id", requireApiKey, validateId, findTask, (req, res) => {
  tasks = tasks.filter((t) => t.id !== req.itemId);
  res.status(204).send();
});

// 5️⃣ 404 → forwarded as an error
app.use((req, res, next) => {
  next(new NotFoundError("Route"));
});

// 6️⃣ Central error handler (ALWAYS LAST, 4 params)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  const isSafe = err instanceof AppError || err.expose === true;
  if (!isSafe) console.error("💥", err);

  const body = {
    error:
      err.type === "entity.parse.failed"
        ? "Invalid JSON in request body"
        : isSafe
        ? err.message
        : "Something went wrong on our side",
    status,
  };
  if (config.nodeEnv === "development" && !isSafe) body.stack = err.stack;

  res.status(status).json(body);
});

app.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port} (${config.nodeEnv})`);
});
```

> 🏆 **Pro tip:** This exact order is a **blueprint**: *security → CORS → logging → body parsing → routes → 404 → error handler.* Burn it into your memory.

---

## 🧯 8. Debugging cheat sheet (Lesson 5 edition)

| Problem | Likely cause |
|---------|-------------|
| `ReferenceError: Must call super constructor...` | In a class constructor, you used `this` **before** `super()` |
| `ADMIN_KEY is undefined` | `.env` is missing, misspelled, or `dotenv.config()` ran **after** you read it |
| `.env` changes don't apply | Restart the server (`--watch` doesn't watch `.env` unless you use `--env-file`) |
| React shows a **CORS error** | `cors()` is missing, below the routes, or `origin` doesn't match your React URL **exactly** (port included) |
| Works in Thunder Client, fails in browser | That's CORS: browsers enforce it, Thunder Client doesn't |
| Error handler never runs | It has 3 params, or it's **not last** |
| Client sees a stack trace or internal message | The handler sends `err.message` for **all** errors. Check `isSafe` |
| `413 Payload Too Large` | Body is bigger than your `express.json({ limit })` |
| Everything returns `500` | You throw plain `Error` instead of `AppError` subclasses |
| `PORT` behaves strangely in math | `process.env.PORT` is a **string**. Convert it |

---

## ✅ 9. Quick recap

- **Throw, don't respond.** Errors travel to **one** central handler.
- **Custom error classes** carry a status code (`NotFoundError` → 404).
- **Expected errors** → show the message. **Bugs** → generic message + log privately.
- Express 5 catches errors in **async** handlers automatically.
- `404` for unknown routes = `next(new NotFoundError("Route"))`.
- **`morgan`** logs, **`helmet`** secures headers, **`cors`** lets your frontend in.
- CORS is **browser-enforced** and **not** API security.
- **`.env`** holds settings and secrets. Never commit it. Commit **`.env.example`**.
- `process.env` values are **always strings**. **Fail fast** on missing ones.
- Order: **helmet → cors → morgan → json → routes → 404 → error handler.**

---

# ⚔️ THE CHALLENGES

> 🔗 **Stacking rule:** the Boss Fight combines **Lessons 1 + 2 + 3 + 4 + 5**. 👹
>
> **Rules:** ⌨️ Type it yourself. 🔬 Debug alone for 10 minutes first. 🧪 Test with Thunder Client. 🐙 Commit after each challenge. Hints are hidden; no full solutions unless you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+150 XP`

**Goal:** Prove you understand the new error system.

Create `lesson-5/challenge1/` with `server.js`, `errors.js`, `config.js`, `.env`, `.env.example`. Port comes from `.env` (use **4000**).

**Requirements:**

1. `errors.js` with `AppError` + at least `BadRequestError`, `NotFoundError`, `ConflictError`.
2. A **central error handler** and a **404 forwarded as an error**, with the shape `{ "error": "...", "status": N }`.
3. Use **morgan** (`"dev"`) and **helmet**.

**Routes (all exist only to test your error system):**

| Route | Behavior |
|-------|----------|
| `GET /ok` | `{ "message": "all good" }` |
| `GET /fail/bad` | Throws `BadRequestError` |
| `GET /fail/missing` | Throws `NotFoundError("Planet")` |
| `GET /fail/conflict` | Throws `ConflictError` |
| `GET /fail/bug` | A **real bug** (e.g., `undefined.something`) |
| `GET /fail/async` | An **async** handler that waits 200ms then throws |
| `GET /double/:n` | Returns `{ "n": 4, "double": 8 }`. Invalid number → `400` via throw |

✅ **Success check:**

- `/fail/bug` and `/fail/async` show a **generic** message to the client but print the real error in your terminal.
- Set `NODE_ENV=production` in `.env`, restart: the `stack` field **disappears** from responses. With `development`, it appears for bugs.
- Send broken JSON to a `POST` route you add → clean `400`.
- `.env` is **not** in git. `.env.example` **is**.

<details>
<summary>💡 Hint 1</summary>

`class ConflictError extends AppError` with `super(message, 409)`. Remember: `super()` must come **before** using `this`.

</details>

<details>
<summary>💡 Hint 2</summary>

For the async route: `await new Promise((r) => setTimeout(r, 200));` then `throw new Error("...")`. No `try/catch` needed in Express 5.

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+300 XP`

**Goal:** Build a secure, configurable API using **Lessons 1-5**.

Create `lesson-5/challenge2/` (port from `.env`, use **5000**). You're building a **Recipe Box API** 🍳.

```js
let recipes = [
  { id: 1, name: "Shakshuka", minutes: 30, vegetarian: true, tags: ["breakfast", "eggs"] },
  { id: 2, name: "Chicken Fried Rice", minutes: 25, vegetarian: false, tags: ["dinner", "rice"] },
  { id: 3, name: "Lentil Soup", minutes: 45, vegetarian: true, tags: ["dinner", "soup"] },
  { id: 4, name: "Pancakes", minutes: 20, vegetarian: true, tags: ["breakfast", "sweet"] },
];
let nextId = 5;
```

**Setup:**

- `.env` with `PORT`, `NODE_ENV`, `ADMIN_KEY`, `CLIENT_ORIGIN`. `config.js` that **fails fast** if `ADMIN_KEY` is missing.
- Middleware order: helmet → cors (restricted to `CLIENT_ORIGIN`) → morgan → `express.json({ limit: "5kb" })`.
- Everything errors via **thrown custom errors** and the **central handler**. No `res.status(4xx)` outside it.

**Routes:**

| Route | Behavior |
|-------|----------|
| `GET /` | HTML welcome page with a dynamic recipe count |
| `GET /recipes` | Filters (Lesson 2): `?vegetarian=true`, `?maxMinutes=30`, `?tag=dinner`. All combinable |
| `GET /recipes/random` | One random recipe |
| `GET /recipes/:id` | One recipe (`validateId` + `findRecipe` middleware) |
| `POST /recipes` | 🔒 key required. `name` (unique, case-insensitive → `409`), `minutes` (positive integer), `vegetarian` (boolean), `tags` (optional array of strings) |
| `PUT /recipes/:id` | 🔒 replace (all fields required, same validation) |
| `PATCH /recipes/:id` | 🔒 partial. Only `name`, `minutes`, `vegetarian`, `tags` |
| `DELETE /recipes/:id` | 🔒 `204` |
| *unknown* | `404` via `NotFoundError("Route")` |

✅ **Success check:**

- `GET /recipes?vegetarian=true&tag=dinner&maxMinutes=50` → only Lentil Soup.
- `/recipes/random` works **and** `/recipes/2` works. (Route order! 🌶️)
- No key → `401`. Wrong key → `403`. Right key → success.
- Posting a 6kb body → clean `413` JSON.
- DevTools shows **no** `X-Powered-By` header, and extra security headers from helmet.
- A tiny React page on `localhost:5173` lists the recipes (**CORS works**). Change `CLIENT_ORIGIN` to a different port, restart, and confirm the browser **blocks** it. 🔬
- Your repo has **meaningful** commit messages.

<details>
<summary>💡 Hint 1 (the `vegetarian` query)</summary>

It's the string `"true"` (Lesson 2's trap). Compare with `=== "true"` and only filter when the param is present.

</details>

<details>
<summary>💡 Hint 2 (validation helper)</summary>

Write a `validateRecipeBody(body, { partial })` function that **throws** `BadRequestError` naming the bad field. Reuse it in `POST`, `PUT`, and `PATCH`. Lesson 3's helper idea, upgraded. 🔧

</details>

<details>
<summary>💡 Hint 3 (random recipe)</summary>

`Math.floor(Math.random() * recipes.length)` gives a valid index. What if the array is empty? Throw a `NotFoundError`!

</details>

---

## 🥇 CHALLENGE 3: 👹 BOSS FIGHT: The Stacked Challenge · `+600 XP`

**Goal:** Merge **Lessons 1 + 2 + 3 + 4 + 5**. Turn your **Library System** into a **production-ready API with a React frontend**. 📚🛡️

Create `lesson-5/boss/` with:

```
boss/
├── server.js
├── config.js
├── errors.js
├── .env          (ignored by git)
├── .env.example  (committed)
└── package.json
```

Start from your `l4_boss.js`. Same books data:

```js
let books = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", year: 1958, available: true },
  { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Adichie", year: 2006, available: false },
  { id: 3, title: "Beneath the Lines", author: "Maaza Mengiste", year: 2010, available: true },
  { id: 4, title: "The Shadow King", author: "Maaza Mengiste", year: 2019, available: true },
  { id: 5, title: "Americanah", author: "Chimamanda Adichie", year: 2013, available: false },
];
let nextId = 6;
let history = [];
let totalBorrows = 0;
```

### 📋 Requirements

**🔙 Everything from Lessons 1-4 must still work:**

- Dashboard `GET /`, `GET /status`, `/admin` (`403` without key, `200` JSON with the key), all `GET /books...` filters/routes, `GET /authors/:name/books`, full CRUD with validation, `borrow`, `return`, `GET /history?limit=N`.
- `validateBookId` + `loadBook` middleware, `requireAdminKey` on all writes, `validateBookBody` for `POST`/`PUT`, the **rate limiter**, correct route order.

**🆕 Lesson 5 upgrades:**

1. **`.env` configuration:** `PORT`, `NODE_ENV`, `ADMIN_KEY`, `CLIENT_ORIGIN`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`. No hardcoded secrets or limits anywhere. ⚠️ Remember: env values are **strings**.
2. **`config.js` fails fast** if `ADMIN_KEY` is missing (clear message + `process.exit(1)`).
3. **`.env.example`** committed, `.env` ignored.
4. **`errors.js`:** `AppError` + at least `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, and a new **`TooManyRequestsError`** (`429`).
5. **Zero manual error responses:** every middleware and route **throws**. The only `res.status(4xx/5xx)` lives in the central handler.
6. **Consistent shape** for every error: `{ "error": "...", "status": N }`. The unknown-route error is exactly `{ "error": "Route not found", "status": 404 }`.
7. **Replace your custom logger with `morgan`:** `"dev"` in development, `"combined"` in production.
8. **`helmet`**, and confirm `X-Powered-By` is gone.
9. **`cors` restricted to `CLIENT_ORIGIN`.**
10. **`express.json({ limit: "10kb" })`** → oversize bodies get a clean `413` JSON.
11. **An `async` route:** `GET /reports/summary` awaits a fake 300ms delay, then returns `{ totalBooks, availableBooks, borrowedBooks, newestBook }`. With `?fail=true` it **throws** → `500` through the central handler. **No try/catch.**
12. **React frontend** (Vite, port 5173): a page that fetches `GET /books` and shows each book with an availability badge ✅/❌. It handles loading and error states.
13. **Final middleware order:** helmet → cors → morgan → requestId → rate limiter → json → routes → 404 → error handler.
14. **Git:** at least **4 commits** with meaningful messages, pushed to GitHub, with a short `README.md` listing the endpoints and how to run it.

**🌟 Bonus (+100 XP):**

15. `GET /health` returns `{ "status": "ok", "env": "<NODE_ENV>", "uptimeSeconds": N }`. ⚠️ **It must never expose `ADMIN_KEY` or any secret.** Prove it by testing.
16. A custom **morgan token** that prints your `requestId` in each log line (look up `morgan.token`).

### ✅ Success check

- Delete `ADMIN_KEY` from `.env` → server **refuses to start** with a clear message.
- `NODE_ENV=production` → no `stack` in any error response. `development` → stack only for unexpected bugs.
- `/reports/summary?fail=true` → `500`, generic message to the client, real error in the terminal.
- Sending a 20kb body → `413` JSON.
- Your React page lists books. Change `CLIENT_ORIGIN` → the browser blocks it.
- Rate limiter returns `429` JSON, shaped by the central handler.
- Searching your repo history, `ADMIN_KEY`'s real value **never appears** in any commit. 🕵️

### 🧠 Where to think

- Your rate limiter used to send its own `429`. How do you convert it to `throw new TooManyRequestsError(...)`?
- **Should the React app contain the admin key?** (Think carefully: who can read frontend code?) How can the frontend still show books? *(Hint: which routes are public?)*
- If you committed `.env` by accident, is deleting it in the next commit enough? Why not? *(Git remembers history. This is why `.gitignore` comes **first**.)*
- Where does `requestId` need to be relative to `morgan`, if you want the bonus token to work?
- `process.env.RATE_LIMIT_MAX` is `"20"`. What happens with `count > "20"`? What about `count + "20"`? Test in the console. 🔬

<details>
<summary>💡 Hint 1 (env numbers)</summary>

Convert once, in `config.js`: `rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 20`. Everywhere else uses the clean number.

</details>

<details>
<summary>💡 Hint 2 (React + CORS)</summary>

The URL in `fetch(...)` is your **API** (`http://localhost:6000/books`), not your React app. `CLIENT_ORIGIN` must be the **React** origin, e.g. `http://localhost:5173`, with no trailing slash.

</details>

<details>
<summary>💡 Hint 3 (the async report)</summary>

Make the handler `async`, `await` your `wait(300)` helper, and `throw` if `req.query.fail === "true"`. Express 5 does the rest.

</details>

<details>
<summary>💡 Hint 4 (custom morgan token)</summary>

`morgan.token("id", (req) => req.requestId)` then use a format string like `":id :method :url :status :response-time ms"`. Put your requestId middleware **before** morgan so the value exists when morgan reads it.

</details>

---

# 🏋️ THE PRACTICE ARENA (Lesson 5)

## 🔮 ZONE 1: Predict the Output · `+50 XP`

### Q1: The early handler

```js
app.use((err, req, res, next) => {
  res.status(500).json({ error: "handled" });
});

app.get("/boom", (req, res) => {
  throw new Error("x");
});
```

What does `GET /boom` return?

<details>
<summary>👀 Answer</summary>

**Not** `"handled"`. Express's default error page (HTML, 500) appears. Error handlers only catch errors from middleware/routes registered **before** them. Order matters again. 🧅

</details>

### Q2: The string trap

`.env` has `RATE_LIMIT_MAX=20`. What do these print?

```js
const max = process.env.RATE_LIMIT_MAX;
console.log(typeof max);
console.log(max + 1);
console.log(max * 2);
console.log(25 > max);
```

<details>
<summary>👀 Answer</summary>

```
string
201      ← string concatenation 😱
40       ← auto-converted
true     ← compared as numbers
```

Always convert env values **once** in `config.js`.

</details>

### Q3: Who gets blocked?

Your API has **no** `cors` middleware. You send `GET /tasks` from **(a)** Thunder Client, **(b)** `fetch` in a React app on another port. Which works?

<details>
<summary>👀 Answer</summary>

**(a)** works. **(b)** is blocked **by the browser**. CORS is enforced only by browsers, and the server did respond (check Thunder Client or the Network tab).

</details>

---

## 🐛 ZONE 2: Bug Hunt · `+100 XP`

### 🐞 Bug 1: The late CORS

```js
app.get("/tasks", (req, res) => res.json(tasks));
app.use(cors({ origin: "http://localhost:5173" }));
```

React still gets a CORS error. Why?

<details>
<summary>👀 Answer</summary>

`cors` is registered **after** the route. The route already answered without the CORS headers. Move `cors` **above** the routes.

</details>

### 🐞 Bug 2: The leaky config (find 2)

```js
const PORT = process.env.PORT || 3000;
require("dotenv").config();
app.listen(PORT);
```

…and the repo has `.env` committed. What's wrong?

<details>
<summary>👀 Answer</summary>

1. `process.env.PORT` is read **before** `dotenv.config()` runs, so `.env` is ignored. Load dotenv **first**.
2. `.env` is committed. Secrets are public in the repo history. Add `.env` to `.gitignore` **before** the first commit.

</details>

### 🐞 Bug 3: The oversharing handler (find 3)

```js
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});
```

<details>
<summary>👀 Answer</summary>

1. **Leaks the stack** to every client, in every environment.
2. **Leaks internal messages** for unexpected bugs.
3. **Always `500`**, even for your `404`/`400`/`409` errors. It should use `err.status`.

</details>

### 🐞 Bug 4: The impatient class

```js
class NotFoundError extends Error {
  constructor(message) {
    this.status = 404;
    super(message);
  }
}
```

Crashes with a `ReferenceError`. Why?

<details>
<summary>👀 Answer</summary>

In a subclass constructor, you **must call `super()` before using `this`**. Swap the two lines.

</details>

---

## ⚡ ZONE 3: Speed Drills · `+50 XP each (200 XP)`

### ⚡ Drill 1: Config module · `drill1/`

Create `config.js` that validates **three** required variables (`PORT` as a number, `ADMIN_KEY` non-empty, `NODE_ENV` must be `development` or `production`). If any is invalid → print **which one** and exit.

### ⚡ Drill 2: Error zoo 🦁 · `drill2/`

Add routes that throw **each** of your error classes. Write a tiny script (or a Thunder Client collection) that hits them all. Verify each status.

### ⚡ Drill 3: Tiny bodies · `drill3/`

Set `express.json({ limit: "1kb" })`. Send bodies of 500 bytes and 2kb to a `POST /echo`. Confirm that the `413` response is **clean JSON**, not HTML.

### ⚡ Drill 4: The Rebuild Ritual 🔁 · `drill4/`

Close everything. From memory, rebuild the **Pro Skeleton**: `.env`, `config.js`, `errors.js`, helmet, cors, morgan, json, a CRUD resource with loaders, 404, central handler. Write down everything you peeked at. Then **commit**. 🐙

🎮 **Badge: 🛡️ Guardian Coder** after all 4 drills.

---

## 🏗️ ZONE 4: Your Own Project (Step 3) · `+150 XP`

In `my-project/`, add **this lesson's** skills:

1. `.env`, `.env.example`, and `config.js` with fail-fast validation
2. `errors.js` + a central error handler
3. `helmet`, `cors`, `morgan`
4. At least **one** resource with full CRUD, loaders, and validation
5. Test everything in a **Thunder Client collection** and commit it to `docs/`
6. **Commit and push** with a clear message

> 📝 **Note:** Your project doesn't need to be big. It needs to be **yours** and **growing every lesson**.

---

## 🧠 ZONE 5: Teach-Back · `+50 XP`

Answer in your own words (2-4 sentences each):

1. Why is "throw, don't respond" better than writing `res.status(404).json(...)` in every route?
2. What's the difference between **expected** errors and **bugs**, and how should the handler treat each?
3. Explain CORS to a friend. Why did your API "work in Thunder Client but fail in React"?
4. Why does `.env` stay out of Git, and what is `.env.example` for?
5. Why do we validate environment variables on startup instead of when they're first used?

---

## 🏁 YOUR XP BOARD

| Quest | XP |
|-------|----|
| Quest 0: Push your backlog to GitHub | 100 |
| Quest 1: Error system | 100 |
| Quest 2: morgan + helmet + cors + React demo | 75 |
| Quest 3: `.env` + `config.js` | 75 |
| Challenge 1 🥉 | 150 |
| Challenge 2 🥈 | 300 |
| Boss Fight 🥇 | 600 |
| Bonus 🌟 | 100 |
| Practice Arena (Zones 1-3, 5) | 400 |
| Your Own Project (Zone 4) | 150 |
| **Lesson 5 Total** | **2050 XP** |

> 🛡️ Reach **4500 XP total** and you become a **Server Guardian**.
> 🧮 With Lessons 1-4 done, you'll be at **5675 XP** after this lesson. 😎

### 🏅 Badges

| Badge | How to earn it |
|-------|----------------|
| 🐙 Git Hero | Backlog pushed + 4 meaningful commits in the boss |
| 🧯 Error Tamer | Challenge 1: all error types handled cleanly |
| 🌐 Full-Stack Initiate | React page loads Express data through CORS |
| 🔐 Secret Keeper | `.env` never committed, fail-fast config working |
| 🛡️ Guardian Coder | All 4 drills |

---

## 🔮 Sneak Peek: Lesson 6 (Phase 3 begins!)

Your single `server.js` is getting long. 😅 **Lesson 6** teaches how professionals **organize** code:

- 🗂️ **`express.Router()`**: split routes into files
- 🎛️ **Controllers**: separate "what to do" from "which URL"
- 🧱 **Project architecture**: `routes/`, `controllers/`, `middleware/`
- 🌐 **REST API principles**: designing URLs the right way

The Lesson 6 boss fight stacks **Lessons 1-6**. 👹

---

## 📤 What to send me next

In **batches** (no need to send everything at once):

1. **Teach-Back + Predict + Bug Hunt answers**: quick to review
2. **Challenge 1 + drills**: your code in code blocks
3. **Challenge 2 + Boss Fight + your GitHub link** 🐙

For each: ✅ what worked, ❌ what broke (paste the **exact error**), and 🔬 **what you tried** before asking.

I'll review your work, explain your mistakes, and unlock **Lesson 6**. 💪

**You're not just building routes anymore. You're building software people could actually deploy. Go.** 🛡️🔥