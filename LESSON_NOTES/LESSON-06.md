# 🚀 PHASE 3 · LESSON 6: Architecture, Routers & Controllers

> 🎮 **Your XP Bar:** `[█████████░] 5675 / 8000 XP` *(if you finished Lessons 1-5)*
> **Current Level:** 🛡️ Server Guardian ✅ → 🏛️ **API Architect** (unlocks at 7000 XP)

> 🎉 **Phase 2 complete. Welcome to Phase 3: Building APIs the professional way.**

> 🔗 **Connection to Lessons 1-5:**
> - Lesson 1: server **speaks** 🗣️
> - Lesson 2: server **listens** 👂
> - Lesson 3: server **changes things** ✍️
> - Lesson 4: server gets an **assembly line** 🏭
> - Lesson 5: server gets **armor and settings** 🛡️⚙️
> - Lesson 6: server gets **a blueprint** 🏛️

Look at your Lesson 5 boss `server.js`. It does *everything*: config, middleware, data, validation, routes, errors. 😅 Imagine 20 resources. That's a 2000-line monster.

Today you learn how real teams organize code so projects can **grow without becoming a mess**. And the best part: **you already know every concept.** This lesson is about *where code lives*.

---

## 🔁 Quick Warm-Up (Lessons 1-5)

From memory:

1. Why does the central error handler go **last**?
2. What's the difference between an *expected* error and a *bug*?
3. Why is `process.env.PORT` tricky? *(Lesson 2 déjà vu 😉)*
4. Why do specific routes go **above** dynamic ones?

Fuzzy? Re-read those recaps. 🧱

---

## ✅ The Lesson Ritual (same every lesson)

| Step | Do this |
|------|---------|
| ⌨️ | **Type** all code yourself. No copy-paste |
| 🔬 | **Debug alone** for 10 minutes before asking me |
| 🧪 | **Test** in Thunder Client. Save requests to your collection |
| 🏗️ | **Add to `my-project/`** (Zone 4 below) |
| 🐙 | **Commit and push** after each challenge |
| 🧠 | **Teach it back** (Zone 5) |

---

# 🌐 PART A: REST, the Art of Designing URLs

Before moving files, let's fix *what* we're organizing. Your URLs so far worked, but professional APIs follow **REST conventions**, a shared "grammar" so any developer can guess your API.

## 🧠 1. The core idea

> **URLs are *nouns* (things). HTTP methods are *verbs* (actions).**

You've been doing this already (Lesson 3)! Now we make it a rule.

| ❌ Messy | ✅ RESTful | Why |
|----------|-----------|-----|
| `GET /getAllTasks` | `GET /tasks` | The method already says "get" |
| `POST /createTask` | `POST /tasks` | `POST` = create |
| `GET /task?id=5` | `GET /tasks/5` | An ID **identifies** a thing → path (Lesson 2 ✅) |
| `POST /deleteTask/5` | `DELETE /tasks/5` | Use the right verb |
| `GET /tasks/delete/5` | `DELETE /tasks/5` | `GET` must **never** change data |
| `GET /users/5/getPosts` | `GET /users/5/posts` | Nested noun |
| `POST /tasks/5/markDone` | `PATCH /tasks/5` + `{ "done": true }` | A state change is just an update |

## 📜 2. The REST checklist

1. **Plural nouns:** `/tasks`, not `/task`.
2. **Methods = verbs:** `GET` read, `POST` create, `PUT` replace, `PATCH` update, `DELETE` remove.
3. **IDs in the path**, **filters in the query:** `/tasks/5` vs `/tasks?done=true`. *(Lesson 2's rule!)*
4. **Nest for relationships, max 2 levels:** `/members/3/workouts` ✅, `/a/1/b/2/c/3/d` 😱.
5. **Right status codes** (Lessons 3 and 5): `201`, `204`, `400`, `401`, `403`, `404`, `409`, `429`.
6. **Consistent response shapes.** Always the same envelope.
7. **Version your API:** `/api/v1/tasks`. When you break compatibility, ship `/api/v2` and old apps keep working.

### 🎯 Our response shape (from now on)

```js
// A list:   { "count": 2, "data": [ ... ] }
// One item: the item itself
// An error: { "error": "...", "status": 404 }
```

> 📝 **Note:** There's no single "official" shape. What matters is picking one and being **consistent**. Your React code will thank you.

### 🤔 "But what about actions like `borrow`?"

Great question. Sometimes the action doesn't map to a simple update. Two accepted styles:

- **Pragmatic:** `POST /books/5/borrow` (what you built in Lesson 3. Fine!)
- **Purist:** treat the *event* as a noun: `POST /loans` with `{ "bookId": 5, "memberId": 2 }`. A **loan** is a thing that exists, can be listed, and can be returned.

The purist style scales better, and you'll use it in today's boss fight. 😎

### 🔖 A pro touch: the `Location` header

When you create something, tell the client where it lives:

```js
res.status(201).location(`/api/v1/tasks/${task.id}`).json(task);
```

> 🎮 **Quest 0: Push your Lesson 5 work to GitHub if you haven't (+50 XP).** Git first, then new stuff. 🐙

---

# 🗂️ PART B: `express.Router()`, Mini Apps

## 🧠 3. What is a Router?

> **A Router is a mini Express app** that holds a group of related routes. You build it in its own file, then **mount** it on the main app.

Think of a **mall** 🏬: the mall (`app`) doesn't sell anything itself. It has **stores** (routers). Each store has its own staff and layout, and the mall just says *"the shoe store is on this floor."*

### Before (everything in one file)

```js
app.get("/tasks", ...);
app.post("/tasks", ...);
app.get("/tasks/:id", ...);
app.get("/users", ...);
app.post("/users", ...);
// ...and 40 more
```

### After

```js
// routes/tasks.routes.js
const express = require("express");
const router = express.Router();

router.get("/", listTasks);          // ⬅️ notice: "/" not "/tasks"
router.post("/", createTask);
router.get("/:id", getTask);

module.exports = router;             // ⚠️ DON'T FORGET THIS LINE
```

```js
// app.js
const tasksRouter = require("./routes/tasks.routes");

app.use("/api/v1/tasks", tasksRouter);   // mounting 🏬
```

### 🔑 The Mount Rule (most common beginner confusion)

> **Paths inside a router are *relative* to where it's mounted.**

| Router file says | Mounted at | Final URL |
|------------------|-----------|-----------|
| `router.get("/")` | `/api/v1/tasks` | `/api/v1/tasks` |
| `router.get("/:id")` | `/api/v1/tasks` | `/api/v1/tasks/5` |
| `router.get("/tasks")` ❌ | `/api/v1/tasks` | `/api/v1/tasks/tasks` 😱 |

### ⛓️ `router.route()`: chain methods on one path

```js
router.route("/")
  .get(listTasks)
  .post(requireApiKey, createTask);

router.route("/:id")
  .get(validateId, loadTask, getTask)
  .patch(requireApiKey, validateId, loadTask, updateTask)
  .delete(requireApiKey, validateId, loadTask, deleteTask);
```

Cleaner: the path is written **once**. 

### 🧰 Middleware arrays

Express accepts **arrays** of middleware anywhere. Great for reusable bundles:

```js
const withTask = [validateId, loadTask];

router.route("/:id")
  .get(withTask, getTask)
  .patch(requireApiKey, withTask, updateTask);
```

### 🛡️ Router-level middleware: `router.use()`

Protect an **entire router** with one line:

```js
// routes/admin.routes.js
const router = express.Router();

router.use(requireApiKey);          // 🔒 everything below needs the key

router.get("/stats", getStats);
router.get("/history", getHistory);

module.exports = router;
```

> 📝 **Note:** Remember Lesson 4's "which level of middleware?" Now you have all four: **global** (`app.use`), **path** (`app.use("/x")`), **router** (`router.use`), **route** (in the chain). 🧅

### 🌶️ The Order Trap lives on

Inside a router, order **still** matters:

```js
router.get("/:id", getTask);
router.get("/stats", getStats);   // ❌ never reached: ":id" swallows "stats"
```

Specific first, dynamic after. Always.

> 🎮 **Quest 1: Split a Lesson 3/4 Task API into a router mounted at `/api/v1/tasks` (+100 XP).**

---

# 🎛️ PART C: Controllers

## 🍽️ 4. Routes vs controllers

Restaurant time again 🍽️:

| Layer | Restaurant | Job |
|-------|-----------|-----|
| **Router** | The **menu + order desk** | *Which* URL goes to *which* function? |
| **Controller** | The **chef** | *What* happens for that request? |
| **Data store** | The **pantry** | *Where* is the data kept? |

> 🧠 **Single Responsibility Principle:** each file has **one reason to change**. If you change a URL, you touch the router. If you change the logic, the controller. If you switch to MongoDB, **only the data store**. 🤯

### Why the data store matters (a sneak preview)

Right now your "database" is an array. In **Lesson 7** you'll replace it with MongoDB. If your controllers talk to a **store module** instead of touching the array directly, that swap will touch **one file**. Build it right today. 😉

---

## 🧱 5. The folder structure

```
my-api/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── src/
    ├── server.js              ← starts listening (tiny!)
    ├── app.js                 ← builds the Express app (no listen)
    ├── config/
    │   └── config.js
    ├── errors/
    │   └── errors.js
    ├── middleware/
    │   ├── errorHandler.js
    │   ├── notFound.js
    │   ├── requireApiKey.js
    │   ├── validateId.js
    │   └── loadTask.js
    ├── routes/
    │   └── tasks.routes.js
    ├── controllers/
    │   └── tasks.controller.js
    └── data/
        └── tasks.store.js
```

### 🤔 Why split `app.js` and `server.js`?

- **`app.js`** creates and configures the app, then **exports** it.
- **`server.js`** imports it and calls `listen()`.

In Phase 6 you'll **test** your API by importing `app` *without* starting a real server. If `listen()` lived in `app.js`, that would be impossible. Pros plan ahead. 🧠

---

## 🛠️ 6. Let's build it: the Task API, professionally

Type each file. ⌨️ (Reuse `errors.js` and `config.js` from Lesson 5, just move them.)

### 📄 `src/data/tasks.store.js`: the pantry

```js
let tasks = [
  { id: 1, title: "Learn Express", done: false },
  { id: 2, title: "Build an API", done: false },
];
let nextId = 3;

function findAll({ done } = {}) {
  if (done === undefined) return tasks;
  return tasks.filter((t) => t.done === done);
}

function findById(id) {
  return tasks.find((t) => t.id === id);
}

function create({ title }) {
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return task;
}

function update(id, changes) {
  const task = findById(id);
  if (!task) return undefined;
  Object.assign(task, changes); // ⚠️ safe ONLY because the controller whitelists fields
  return task;
}

function remove(id) {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before; // true if something was removed
}

module.exports = { findAll, findById, create, update, remove };
```

> 📝 **Note:** The store knows **nothing** about `req` or `res`. It just stores and returns data. That's what makes it swappable. And the `Object.assign` warning matters: the controller must pass **only allowed fields** (Lesson 3's Habit Tracker lesson!).

### 📄 `src/middleware/validateId.js`

```js
const { BadRequestError } = require("../errors/errors");

function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError("ID must be a positive integer");
  }
  req.itemId = id;
  next();
}

module.exports = validateId;
```

### 📄 `src/middleware/loadTask.js`

```js
const store = require("../data/tasks.store");
const { NotFoundError } = require("../errors/errors");

function loadTask(req, res, next) {
  const task = store.findById(req.itemId);
  if (!task) throw new NotFoundError("Task");
  req.task = task;
  next();
}

module.exports = loadTask;
```

### 📄 `src/middleware/requireApiKey.js`

```js
const config = require("../config/config");
const { UnauthorizedError, ForbiddenError } = require("../errors/errors");

function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) throw new UnauthorizedError("API key is missing");
  if (key !== config.adminKey) throw new ForbiddenError("API key is invalid");
  next();
}

module.exports = requireApiKey;
```

### 📄 `src/controllers/tasks.controller.js`: the chef

```js
const store = require("../data/tasks.store");
const { BadRequestError } = require("../errors/errors");

function listTasks(req, res) {
  const { done } = req.query;
  const filter = {};

  if (done !== undefined) {
    if (done !== "true" && done !== "false") {
      throw new BadRequestError("'done' must be true or false");
    }
    filter.done = done === "true";
  }

  const data = store.findAll(filter);
  res.json({ count: data.length, data });
}

function getTask(req, res) {
  res.json(req.task); // loadTask already found it 🎉
}

function createTask(req, res) {
  const { title } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    throw new BadRequestError("Title is required");
  }

  const task = store.create({ title: title.trim() });
  res.status(201).location(`/api/v1/tasks/${task.id}`).json(task);
}

function updateTask(req, res) {
  const { title, done } = req.body ?? {};
  const changes = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      throw new BadRequestError("Title must be a non-empty string");
    }
    changes.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      throw new BadRequestError("'done' must be true or false");
    }
    changes.done = done;
  }

  res.json(store.update(req.itemId, changes));
}

function deleteTask(req, res) {
  store.remove(req.itemId);
  res.status(204).send();
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
```

### 📄 `src/routes/tasks.routes.js`: the menu

```js
const express = require("express");
const controller = require("../controllers/tasks.controller");
const validateId = require("../middleware/validateId");
const loadTask = require("../middleware/loadTask");
const requireApiKey = require("../middleware/requireApiKey");

const router = express.Router();
const withTask = [validateId, loadTask];

router.route("/")
  .get(controller.listTasks)
  .post(requireApiKey, controller.createTask);

router.route("/:id")
  .get(withTask, controller.getTask)
  .patch(requireApiKey, withTask, controller.updateTask)
  .delete(requireApiKey, withTask, controller.deleteTask);

module.exports = router;
```

**Look at that file.** You can read the whole API in 10 seconds. 😍

> 🧠 **Think:** why is `requireApiKey` placed **before** `withTask`? What would an anonymous user learn if `loadTask` ran first? *(Lesson 4 boss question, now answered in code!)*

### 📄 `src/middleware/notFound.js` and `errorHandler.js`

```js
// notFound.js
const { NotFoundError } = require("../errors/errors");

function notFound(req, res, next) {
  next(new NotFoundError("Route"));
}

module.exports = notFound;
```

```js
// errorHandler.js
const config = require("../config/config");
const { AppError } = require("../errors/errors");

function errorHandler(err, req, res, next) {
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
}

module.exports = errorHandler; // ⚠️ still 4 params!
```

### 📄 `src/app.js`: the blueprint

```js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const config = require("./config/config");
const tasksRouter = require("./routes/tasks.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 1️⃣ Global middleware
app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

// 2️⃣ Routes
app.get("/api/v1/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/v1/tasks", tasksRouter);

// 3️⃣ 404, then errors (ALWAYS last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

### 📄 `src/server.js`: tiny!

```js
const app = require("./app");
const config = require("./config/config");

app.listen(config.port, () => {
  console.log(`🚀 http://localhost:${config.port} (${config.nodeEnv})`);
});
```

### ▶️ Run it

In `package.json`, add scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "node --watch src/server.js"
}
```

```bash
npm run dev
```

> ⚠️ **Run it from the project root** (where `.env` lives). `dotenv` looks in the folder you launched Node from.

Now test **every** route with Thunder Client. All behavior from Lessons 3-5 must still work, at the new URLs. 🧪

> 🎮 **Quest 2: Build the full structure with controller + store (+100 XP).**
> 🎮 **Quest 3: Add `GET /api/v1/tasks/stats` and discover the route-order trap yourself (+100 XP).** *(Hint: where must it go in the router?)*

---

# 🪆 PART D: Nested Routers & Multiple Resources

## 🧠 7. Resources that belong to other resources

A **member** has **workouts**. A **book** has **loans**. The REST way:

```
GET  /api/v1/members/3/workouts       ← workouts of member 3
POST /api/v1/members/3/workouts       ← add a workout for member 3
```

### The problem

```js
// routes/members.routes.js
router.use("/:memberId/workouts", workoutsRouter);   // mount a router inside a router
```

```js
// routes/memberWorkouts.routes.js
const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.params.memberId);   // ⚠️ undefined!!
});
```

By default, a child router **can't see** the parent's params. 😱

### ✅ The fix: `mergeParams`

```js
const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  console.log(req.params.memberId);   // ✅ "3"
});
```

> 📝 **Note:** This is *the* classic nested-router bug. Burn `{ mergeParams: true }` into memory. 🔥

### 🧱 A clean pattern

```js
// routes/members.routes.js
const express = require("express");
const memberWorkoutsRouter = require("./memberWorkouts.routes");

const router = express.Router();

router.route("/").get(c.listMembers).post(requireApiKey, c.createMember);
router.route("/:id").get(withMember, c.getMember);

// Validate the member ONCE, then hand off to the nested router
router.use("/:id/workouts", withMember, memberWorkoutsRouter);
```

Notice: `withMember` runs first and **loads the member** (or throws `404`). The nested router can then use `req.member` with no extra work. Middleware chains are **LEGO**. 🧱

### 🚦 When resources talk to each other

Controllers may need data from **another** store (e.g., check a member exists before creating a loan). Import the other store. Keep the **flow** one-directional:

```
routes → controllers → stores
```

Never the reverse. Stores never import controllers. (That's how you get circular `require` bugs. 😵)

---

## 🧯 8. Debugging cheat sheet (Lesson 6 edition)

| Problem | Likely cause |
|---------|-------------|
| `TypeError: argument handler must be a function` / `Router.use() requires a middleware function but got a Object` | You forgot `module.exports = router` (or exported the wrong thing) |
| `/api/v1/tasks/tasks` works but `/api/v1/tasks` is a 404 | You repeated the prefix inside the router. Paths are **relative** to the mount |
| `controller.getTask is not a function` | Mismatch between how you **export** and how you **import**. Check `module.exports = { ... }` and the exact names |
| `Cannot find module './errors/errors'` | Wrong relative path. From `src/controllers/`, it's `../errors/errors` |
| `req.params.memberId` is `undefined` in a nested router | Missing `express.Router({ mergeParams: true })` |
| `/tasks/stats` returns "Task not found" | `/:id` is registered above `/stats` in the router |
| `.env` values are `undefined` | You started Node from the wrong folder. Run from the project root |
| `ReferenceError`/weird `undefined` imports | **Circular require**: file A imports B and B imports A. Rethink the dependency direction |
| Everything 404s after refactor | Router not mounted (`app.use("/path", router)`), or mounted **after** `notFound` |
| `cors` error returns after splitting files | `cors` ended up **below** a router mount. Global middleware must come **first** |

> 🏆 **Pro tip:** When a refactor breaks everything, **commit before you refactor**. Then `git diff` shows you exactly what changed, and `git restore .` rescues you.

---

## ✅ 9. Quick recap

- **REST:** URLs are plural **nouns**, methods are **verbs**, IDs in path, filters in query, nest max 2 levels, version with `/api/v1`.
- **`express.Router()`** = a mini app. Paths inside are **relative** to the mount point. **Export it!**
- `router.route(path).get().post()` chains methods on one path.
- **Middleware arrays** (`[validateId, loadTask]`) bundle reusable steps.
- `router.use(mw)` protects a **whole router**.
- **Controllers** hold the logic. **Routers** are the menu. **Stores** hold data.
- Flow: **routes → controllers → stores**. Never backwards.
- **`app.js` builds**, **`server.js` listens**.
- Nested routers need **`mergeParams: true`**.
- A good store module makes the **MongoDB swap** (Lesson 7) painless.

---

# ⚔️ THE CHALLENGES

> 🔗 **Stacking rule:** the Boss Fight combines **Lessons 1 + 2 + 3 + 4 + 5 + 6**. 👹
>
> **Ritual:** ⌨️ type it · 🔬 debug alone first · 🧪 Thunder Client · 🐙 commit after each challenge. Hints hidden. No full solutions unless you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+150 XP`

**Goal:** Prove you can split a project into router, controller, and store.

Create `lesson-6/challenge1/` with the full structure (`src/app.js`, `src/server.js`, `config/`, `errors/`, `middleware/`, `routes/`, `controllers/`, `data/`). Port **4000** from `.env`.

You're building a **Notes API** 📝 mounted at `/api/v1/notes`:

```js
let notes = [
  { id: 1, text: "Buy milk", pinned: false },
  { id: 2, text: "Finish Express lesson", pinned: true },
];
```

| Route | Behavior |
|-------|----------|
| `GET /api/v1/notes` | `{ count, data }`. Supports `?pinned=true` |
| `GET /api/v1/notes/:id` | One note |
| `POST /api/v1/notes` | 🔒 key required. `text` required → `201` + `Location` header |
| `PATCH /api/v1/notes/:id` | 🔒 only `text` and `pinned` allowed |
| `DELETE /api/v1/notes/:id` | 🔒 `204` |
| `GET /api/v1/health` | `{ "status": "ok" }` |

✅ **Success check:**

- Controllers contain **no** array code. Everything goes through `notes.store.js`.
- Routes file is **under 20 lines** and uses `router.route()`.
- `app.js` has **no** `listen()`. `server.js` is **under 8 lines**.
- All errors flow through `errorHandler`, and unknown routes → `404` JSON.
- `.env` ignored, `.env.example` committed.

<details>
<summary>💡 Hint 1</summary>

Copy the *structure* from the lesson, but write the **notes** logic yourself. If a file feels like a copy-paste with find-and-replace, slow down and read each line.

</details>

<details>
<summary>💡 Hint 2</summary>

Stuck on `Cannot find module`? Count the `../` carefully. `src/controllers/` → `../data/notes.store`.

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+350 XP`

**Goal:** Two resources, nested routes, and an admin router. 🏋️

Create `lesson-6/challenge2/`. Port **5000**. You're building a **Gym Tracker API** 💪.

```js
let members = [
  { id: 1, name: "Amina", plan: "premium" },
  { id: 2, name: "Daniel", plan: "basic" },
  { id: 3, name: "Selam", plan: "basic" },
];

let workouts = [
  { id: 1, memberId: 1, type: "cardio", minutes: 40, date: "2026-11-05" },
  { id: 2, memberId: 1, type: "strength", minutes: 55, date: "2026-11-07" },
  { id: 3, memberId: 2, type: "cardio", minutes: 30, date: "2026-11-07" },
];
```

**Each resource gets its own router, controller, and store.**

| Route | Behavior |
|-------|----------|
| `GET /api/v1/members` | List. Filter `?plan=basic|premium` |
| `GET /api/v1/members/:id` | One member |
| `POST /api/v1/members` | 🔒 `name` (non-empty), `plan` (`basic` or `premium`) |
| `PATCH /api/v1/members/:id` | 🔒 only `name` and `plan` |
| `DELETE /api/v1/members/:id` | 🔒 `409` if the member **still has workouts** |
| `GET /api/v1/members/:memberId/workouts` | That member's workouts. Supports `?type=` and `?after=YYYY-MM-DD` |
| `POST /api/v1/members/:memberId/workouts` | 🔒 `type` (non-empty), `minutes` (positive integer). `date` defaults to today |
| `GET /api/v1/workouts` | **All** workouts, with filters `?type=`, `?minMinutes=` |
| `GET /api/v1/workouts/:id` | One workout |
| `DELETE /api/v1/workouts/:id` | 🔒 `204` |
| `GET /api/v1/admin/stats` | 🔒 **router-level** protection: total members, total workouts, total minutes, most active member |

✅ **Success check:**

- `/members/99/workouts` → `404` "Member not found" (from **middleware**, not the controller).
- `/members/banana/workouts` → `400`.
- Nested routes use `mergeParams: true`.
- `admin.routes.js` protects **every** route with a single `router.use(requireApiKey)`.
- `workouts.store.js` and `members.store.js` are separate files. The members controller imports the workouts store only for the `409` check.
- **REST audit:** in a `docs/REST-NOTES.md` file, list every URL you built and confirm each follows the checklist. Fix any that don't.

<details>
<summary>💡 Hint 1 (nested loading)</summary>

Make `validateId` flexible, or write a `validateMemberId` that reads `req.params.memberId`. Then `loadMember` attaches `req.member`. Mount: `router.use("/:memberId/workouts", validateMemberId, loadMember, memberWorkoutsRouter)`.

</details>

<details>
<summary>💡 Hint 2 (most active member)</summary>

Build an object of `memberId → total minutes` with `.reduce()`, find the largest, then look the member up. Handle "no workouts" gracefully!

</details>

<details>
<summary>💡 Hint 3 (date default)</summary>

`new Date().toISOString().slice(0, 10)` (Lesson 3's trick!). Comparing `"YYYY-MM-DD"` strings with `>` works correctly because of their format.

</details>

---

## 🥇 CHALLENGE 3: 👹 BOSS FIGHT: The Stacked Challenge · `+700 XP`

**Goal:** Merge **Lessons 1-6**. Rebuild your **Library System** with **professional architecture** and **purist REST**. 📚🏛️

Create `lesson-6/boss/` with the complete structure (`src/`, `.env`, `.env.example`, `.gitignore`, `README.md`). Port **6000**.

```js
let books = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", year: 1958 },
  { id: 2, title: "Half of a Yellow Sun", author: "Chimamanda Adichie", year: 2006 },
  { id: 3, title: "Beneath the Lines", author: "Maaza Mengiste", year: 2010 },
  { id: 4, title: "The Shadow King", author: "Maaza Mengiste", year: 2019 },
  { id: 5, title: "Americanah", author: "Chimamanda Adichie", year: 2013 },
];

let members = [
  { id: 1, name: "Amina", email: "amina@example.com" },
  { id: 2, name: "Daniel", email: "daniel@example.com" },
];

let loans = [
  { id: 1, bookId: 2, memberId: 1, borrowedAt: "2026-11-01T09:00:00.000Z", returnedAt: null },
];
```

> 🔄 **Design change:** `available` is **no longer stored on books**. A book is available when it has **no active loan** (`returnedAt === null`). *Compute it, don't duplicate it.* 🧠

### 📋 Requirements

**🏛️ Lesson 6: Architecture**

1. Folders: `config/`, `errors/`, `middleware/`, `routes/`, `controllers/`, `data/`. One router, controller, and store per resource: **books, members, loans**.
2. `app.js` builds the app, `server.js` listens.
3. Everything under **`/api/v1`**, except `GET /` (HTML dashboard), which stays at the root.
4. **List responses:** `{ "count": N, "data": [...] }`. **`201` responses include a `Location` header.**
5. `/api/v1/admin/*` protected with **`router.use(requireApiKey)`**.

**🔙 Lessons 1-5 must all still work (in the new structure):**

6. `GET /` dashboard with clickable links. `GET /api/v1/status` (uptime calculated **by you**, counts). Unknown routes → `404` `{ "error": "Route not found", "status": 404 }`.
7. `GET /api/v1/books` with combinable filters: `?author=`, `?available=true|false` (**computed** from loans!), `?after=<year>`, plus `?sort=year|title&order=asc|desc`.
8. `GET /api/v1/books/newest`, `/books/count`, `/books/:id` (route order! 🌶️), `GET /api/v1/authors/:name/books`.
9. Full CRUD for **books** and **members** with validation (title/author/year range; name and a valid-looking email; **unique email** → `409`).
10. **Loans (purist REST):**
    - `POST /api/v1/loans` → body `{ "bookId", "memberId" }`. Book must exist (`404`), member must exist (`404`), book must be **available** (`409`). → `201` + `Location`.
    - `POST /api/v1/loans/:id/return` → sets `returnedAt`. Already returned → `409`.
    - `GET /api/v1/loans` with `?active=true|false`, `?memberId=`, `?bookId=`.
    - `GET /api/v1/loans/:id`
11. **Nested routes:** `GET /api/v1/books/:id/loans` (history of a book) and `GET /api/v1/members/:id/loans` (history of a member).
12. **Delete rules:** a book with an **active** loan can't be deleted (`409`). A member with an **active** loan can't be deleted (`409`).
13. All lessons 4-5 infrastructure: **requestId**, **rate limiter** (limits from `.env`), `helmet`, `cors` (from `.env`), `morgan` (with the requestId token if you did the bonus), `express.json({ limit })`, **custom error classes**, **one central error handler**, **zero `res.status(4xx)` outside it**, fail-fast `config.js`.
14. Write operations require the admin key (`401` missing / `403` wrong). Reads are public.
15. `GET /api/v1/reports/summary` → async, 300ms fake delay → totals, active loans, most borrowed book. `?fail=true` throws → `500` through the handler.

**📄 Documentation & Git**

16. `README.md`: how to run it, the `.env` variables, and a table of **all endpoints**.
17. Thunder Client collection exported to `docs/`.
18. **At least 6 meaningful commits**, pushed to GitHub. Real secrets never in history.

**🌟 Bonus (+100 XP):**

19. **Backward-compatible redirects:** old URLs like `/books/2` redirect to `/api/v1/books/2` using status **`308`** (it **preserves the method**, so `POST` stays `POST`). Research why `301`/`302` can break `POST`. 🔬
20. Update your Lesson 5 React page to the new URLs and new `{ count, data }` shape, and add a **member selector + "Borrow" button** that calls `POST /loans`. *(Hint: the admin key can't live in the frontend. Think about what to do. Document your decision.)*

### ✅ Success check

- Borrow book 1 → `GET /books?available=false` now includes it. Return it → it's gone from that list.
- Borrow it twice → `409`. `/loans` with a missing book → `404`, with a missing `memberId` field → `400`.
- Deleting a book that's out on loan → `409`.
- `/books/newest`, `/books/count`, `/books/3` all work.
- `/books/1/loans` shows its history. `/members/9/loans` → `404`.
- `/admin/stats` without the key → `401`. Wrong key → `403`.
- Break the JSON on a `POST` → clean `400`. `/reports/summary?fail=true` → clean `500`.
- Your controllers contain **zero** direct array manipulation. Only store calls.
- Your folder tree could be understood by a stranger in 30 seconds.

### 🧠 Where to think

- `available` is **derived** from loans. Where should that logic live: in the **books controller**, the **books store**, or a **helper**? Defend your choice in a comment.
- Books needs loan data, and loans needs book data. How do you avoid a **circular require**? *(Hint: who imports whom? Consider keeping all cross-resource logic in the **controllers**, never in stores.)*
- `POST /loans/:id/return`: is `POST` or `PATCH` more RESTful for this? Write down both arguments, then decide.
- For `GET /books/:id/loans` and `GET /members/:id/loans`, do you need **two** nested routers with `mergeParams`, or can one controller function serve both? Which is cleaner?
- Where does the **rate limiter** go relative to `requireApiKey`? Why does it matter for *brute-force key guessing*? 🕵️

<details>
<summary>💡 Hint 1 (computed availability)</summary>

Write a helper `isBookAvailable(bookId)` that checks `loans.some(l => l.bookId === bookId && l.returnedAt === null)`. To filter `?available=true`, run each book through it. Keep the helper in **one** place and reuse it.

</details>

<details>
<summary>💡 Hint 2 (circular requires)</summary>

If `books.controller` needs loan info, import `loans.store` in the **controller**. Rule of thumb: **stores never import other stores**. Controllers combine them.

</details>

<details>
<summary>💡 Hint 3 (nested loans)</summary>

You can mount `router.use("/:id/loans", ...)` inside `books.routes.js` and `members.routes.js`, or simply define `router.get("/:id/loans", withBook, controller.listBookLoans)` as a normal route. Both work. Compare them.

</details>

<details>
<summary>💡 Hint 4 (redirect bonus)</summary>

`app.use("/books", (req, res) => res.redirect(308, "/api/v1" + req.originalUrl))`. Mount it *before* the 404. Test with a `POST` in Thunder Client and check that the method survives.

</details>

---

# 🏋️ THE PRACTICE ARENA (Lesson 6)

## 🔮 ZONE 1: Predict the Output · `+50 XP`

### Q1: The double prefix

```js
// app.js
app.use("/api/tasks", tasksRouter);

// tasks.routes.js
router.get("/tasks", listTasks);
```

What URL reaches `listTasks`?

<details>
<summary>👀 Answer</summary>

`/api/tasks/tasks`. The router path is **relative** to the mount. Use `router.get("/")`.

</details>

### Q2: The swallowed route

```js
router.get("/:id", getOne);
router.get("/search", searchAll);
```

What does `GET /search` call?

<details>
<summary>👀 Answer</summary>

`getOne`, with `req.params.id === "search"`. Specific routes must go **above** dynamic ones. This rule is the same in Lesson 2, in routers, and forever. 🌶️

</details>

### Q3: Nested params

```js
const child = express.Router();                 // no mergeParams
parent.use("/:memberId/workouts", child);

child.get("/", (req, res) => res.json(req.params));
```

What does `GET /3/workouts` return?

<details>
<summary>👀 Answer</summary>

`{}`. The child can't see `memberId`. Fix: `express.Router({ mergeParams: true })`.

</details>

---

## 🐛 ZONE 2: Bug Hunt · `+100 XP`

### 🐞 Bug 1: The Missing Export

```js
// routes/notes.routes.js
const router = require("express").Router();
router.get("/", listNotes);
```

```js
// app.js
app.use("/api/v1/notes", require("./routes/notes.routes"));
```

The app crashes on startup. Why?

<details>
<summary>👀 Answer</summary>

No `module.exports = router;`. `require` returns `{}`, and `app.use` expects a function.

</details>

### 🐞 Bug 2: The Import Mismatch

```js
// controllers/notes.controller.js
module.exports = { listNotes, getNote };

// routes/notes.routes.js
const getNote = require("../controllers/notes.controller");
router.get("/:id", getNote);
```

Why does it crash?

<details>
<summary>👀 Answer</summary>

`require` returns the whole **object** `{ listNotes, getNote }`, not the function. Use `const controller = require(...)` and `controller.getNote`, or destructure: `const { getNote } = require(...)`.

</details>

### 🐞 Bug 3: The Layering Violation (find 3)

```js
// data/tasks.store.js
const express = require("express");

function create(req, res) {
  tasks.push(req.body);
  res.status(201).json(req.body);
}
```

<details>
<summary>👀 Answer</summary>

1. The **store** knows about `req` and `res`. It should only store/return data.
2. It pushes `req.body` **unvalidated**. Validation belongs in the controller.
3. It controls the **HTTP response**. That's the controller's job. A MongoDB swap would now require rewriting everything.

</details>

### 🐞 Bug 4: The Late Mount

```js
app.use(notFound);
app.use("/api/v1/tasks", tasksRouter);
app.use(errorHandler);
```

Every request returns `404 Route not found`, even valid ones. Why?

<details>
<summary>👀 Answer</summary>

`notFound` is registered **before** the router, so it catches everything first and never calls the router. Order: routers → `notFound` → `errorHandler`.

</details>

---

## ⚡ ZONE 3: Speed Drills · `+50 XP each (200 XP)`

### ⚡ Drill 1: REST Doctor 🩺

Fix these URLs (write the correct method + path). Explain each fix in one line:

1. `GET /getUserById?id=7`
2. `POST /users/7/delete`
3. `GET /products/list/all`
4. `PUT /orders/5/cancel` *(Is there a better design? Think noun vs state.)*
5. `GET /api/user/7/getOrders`
6. `POST /api/v1/login` *(Is this REST? Discuss it. There's no perfect answer.)*

Put your answers in `docs/rest-doctor.md`.

### ⚡ Drill 2: Mini Mall 🏬

Make **3 routers** (`pets`, `owners`, `vets`) each with just `GET /` and `GET /:id` and in-memory data. Mount all under `/api/v1`. Verify **no URL clashes**.

### ⚡ Drill 3: The Secure Zone 🔒

Create `admin.routes.js` with `router.use(requireApiKey)` and **three** routes inside. Prove with Thunder Client that **adding a 4th route automatically protects it**. Why is that safer than adding `requireApiKey` to each route by hand?

### ⚡ Drill 4: The Rebuild Ritual 🔁

Close everything. From memory, build the **Tasks API structure** (`app.js`, `server.js`, router, controller, store, loaders, central handler). Note everything you peeked at. Commit. 🐙

🎮 **Badge: 🏛️ Blueprint Builder** after all 4 drills.

---

## 🏗️ ZONE 4: Your Own Project (Step 4) · `+150 XP`

In `my-project/`:

1. **Restructure** into `src/` with `config/`, `errors/`, `middleware/`, `routes/`, `controllers/`, `data/`.
2. Split `app.js` and `server.js`.
3. Mount under `/api/v1`.
4. Add a **second resource** related to your first (like members + workouts), with a **nested route**.
5. Write a `README.md` with your endpoint table.
6. Update your Thunder Client collection in `docs/`.
7. **Commit and push**.

> 📝 **Note:** Your project is now structured like a real company codebase. Employers look for exactly this in portfolios. 💼

---

## 🧠 ZONE 5: Teach-Back · `+50 XP`

Answer in your own words (2-4 sentences each):

1. What does `express.Router()` do, and why use it? Invent your own analogy (not the mall!).
2. What's the difference between a route, a controller, and a store? What goes wrong if they're mixed together?
3. Why must the router paths be *relative* to the mount point?
4. When do you need `mergeParams: true`, and why isn't it the default?
5. Why is "compute `available` from loans" better than storing `available` on the book? *(Think about what could go wrong with two sources of truth.)*

---

## 🏁 YOUR XP BOARD

| Quest | XP |
|-------|----|
| Quest 0: Push Lesson 5 to GitHub | 50 |
| Quest 1: Router split | 100 |
| Quest 2: Controller + store structure | 100 |
| Quest 3: Route-order trap hunt | 100 |
| Challenge 1 🥉 | 150 |
| Challenge 2 🥈 | 350 |
| Boss Fight 🥇 | 700 |
| Bonus 🌟 | 100 |
| Practice Arena (Zones 1-3, 5) | 400 |
| Your Own Project (Zone 4) | 150 |
| **Lesson 6 Total** | **2200 XP** |

> 🏛️ Reach **7000 XP total** and you become an **API Architect**.
> 🧮 With Lessons 1-5 done, you'll be at **7875 XP** after this lesson. 😎

### 🏅 Badges

| Badge | How to earn it |
|-------|----------------|
| 🏛️ Blueprint Builder | All 4 drills |
| 🪆 Nesting Master | Challenge 2 with working `mergeParams` |
| 🧮 Single Source of Truth | Boss fight with computed availability |
| 🐙 Commit Streak | 6+ meaningful commits in the boss |
| 📚 Documentarian | README + REST notes + Thunder Client export |

---

## 🔮 Sneak Peek: Lesson 7 (Phase 4 begins: MongoDB!)

This is the payoff for all the structure. 🎁

- 🍃 **Connect Express to MongoDB** (Atlas or local)
- 📐 **Mongoose schemas and models**
- 🔁 Replace `data/*.store.js` arrays with **real database calls**, while your routers and controllers barely change
- 💾 Data that **survives restarts** (finally!)

You already know MongoDB from your fundamentals. Now it meets your API. And the Lesson 7 boss fight stacks **Lessons 1-7**. 👹

---

## 📤 What to send me next

In **batches**:

1. **Teach-Back + Predict + Bug Hunt answers**
2. **Challenge 1 + drills**: code in code blocks
3. **Challenge 2 + Boss Fight + GitHub link** 🐙

For each: ✅ what worked, ❌ what broke (**exact error**), and 🔬 **what you tried** first.

I'll review your work, explain your mistakes, and unlock **Lesson 7**. 💪

**You're not writing scripts anymore. You're designing systems. Go build the blueprint.** 🏛️🔥