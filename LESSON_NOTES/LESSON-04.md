# 🚀 PHASE 2 · LESSON 4: Middleware, the Secret Engine of Express

> 🎮 **Your XP Bar:** `[██████░░░░] 2100 / 3500 XP` *(if you finished Lessons 1-3)*
> **Current Level:** 🏗️ API Builder → 🔧 **Middleware Wizard** (unlocks at 3000 XP)

> 🎉 **Phase 1 complete!** You can build full CRUD APIs. Welcome to **Phase 2**, where you stop writing code that *works* and start writing code that is *clean*.

> 🔗 **Connection to Lessons 1-3:**
> - Lesson 1: your server **spoke** 🗣️
> - Lesson 2: your server **listened** 👂
> - Lesson 3: your server **changed things** ✍️
> - Lesson 4: your server gets an **assembly line** 🏭

Remember the pain from Lesson 3? You copied the same "validate the ID, find the item" code into `GET`, `PUT`, `PATCH`, and `DELETE`. And `app.use(express.json())` was a mystery line I told you to just trust.

Today the mystery is **solved**, and the repeated code **disappears**. 🔧✨

---

## 🔁 Quick Warm-Up (Lessons 1-3)

Answer from memory:

1. Why must the 404 catch-all be at the **bottom**?
2. What does `app.use(express.json())` do, and why must it be **above** your routes?
3. What status code means "the client sent invalid data"? And "the state forbids it"?
4. Why do we write `return res.status(...)` for early exits?

Fuzzy? Re-read the recaps. This lesson stacks on all four. 🧱

---

## 🧠 1. What is middleware?

> **Middleware = a function that runs *between* the request arriving and your final handler responding.**

Think of an **airport** ✈️:

```
 You arrive
    │
    ▼
 🛂 Passport check      ← middleware 1 (are you who you say?)
    │
    ▼
 🧳 Baggage scan        ← middleware 2 (is your bag safe?)
    │
    ▼
 🚪 Boarding gate       ← your final route handler (the actual flight)
```

At each station, one of three things happens:

1. ✅ **Pass:** "All good, move to the next station."
2. 🛑 **Stop:** "You can't go further," and a response is sent right there.
3. ✏️ **Modify:** "Here's a sticker for your bag," so later stations can use it.

That's **all** middleware ever does. Everything else is details. 🎯

### 🤯 The big reveal

You've been using middleware since Lesson 1 without knowing it:

```js
app.use(express.json());   // middleware!
app.use((req, res) => {    // your 404 catch-all was middleware too!
  res.status(404).json({ error: "Route not found" });
});
```

And here's the biggest secret: **your route handlers are middleware too.** They're just the *last* station in the line. 😮

---

## 🔬 2. The anatomy of middleware

A route handler has **2** parameters. Middleware has **3**:

```js
function myMiddleware(req, res, next) {
  // do something...
  next(); // "pass to the next station"
}
```

| Param | Meaning |
|-------|---------|
| `req` | The request (same object for **every** station) |
| `res` | The response (same object for **every** station) |
| `next` | 🆕 A function. Calling it means *"I'm done, continue the line"* |

### The 3 outcomes in code

```js
function example(req, res, next) {
  // 1️⃣ PASS: do something, then continue
  next();

  // 2️⃣ STOP: respond and DON'T call next
  // return res.status(403).json({ error: "Nope" });

  // 3️⃣ MODIFY: attach data for later stations
  // req.something = "hello";
  // next();
}
```

### 🚨 Rule #1 of middleware

> **Every middleware must do exactly one of these:** call `next()` **or** send a response.
> If it does **neither**, the request **hangs forever**. ⏳

Remember the Lesson 1 bug "Browser keeps loading forever"? A forgotten `next()` is its twin. 👯

---

## 🛠️ 3. Your first middleware: the Logger

Create `lesson4.js`:

```js
const express = require("express");
const app = express();

// 🔧 Middleware: logs every request
function logger(req, res, next) {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
}

app.use(logger); // 👈 register it

app.get("/", (req, res) => {
  res.send("Home 🏠");
});

app.get("/about", (req, res) => {
  res.send("About 📖");
});

app.listen(3000, () => console.log("http://localhost:3000"));
```

Run it with `node --watch lesson4.js`. Visit `/` and `/about`. Your terminal shows:

```
📨 GET /
📨 GET /about
```

🎉 **You just wrote a function that runs for every request.** Without touching any route.

> 🎮 **Quest 1: Run the logger (+25 XP).**

### 🧪 Experiment: break it on purpose

Remove the `next()` line and save. Visit `/`. The browser spins forever ⏳. 

**Put it back.** You now *know* what a forgotten `next()` feels like. Recognizing it later will save you hours.

> 📝 **Note:** Breaking things on purpose is a **developer superpower**. When you understand how something fails, you can fix it in seconds.

---

## 🧅 4. The Order Principle (the most important idea today)

Express runs middleware **in the order you write it**, top to bottom.

```js
app.use((req, res, next) => { console.log("1️⃣"); next(); });
app.use((req, res, next) => { console.log("2️⃣"); next(); });

app.get("/", (req, res) => {
  console.log("3️⃣");
  res.send("Done");
});

app.use((req, res, next) => { console.log("4️⃣"); next(); });
```

Visiting `/` prints:

```
1️⃣
2️⃣
3️⃣
```

**4️⃣ never prints!** Why? The route handler sent a response and **didn't call `next()`**, so the line stopped there. 🛑

### 🧅 The onion model (deep dive)

Code **after** `next()` runs when the later stations are done:

```js
app.use((req, res, next) => {
  console.log("A: before");
  next();
  console.log("A: after");
});

app.get("/", (req, res) => {
  console.log("handler");
  res.send("ok");
});
```

Output:

```
A: before
handler
A: after
```

Think of an **onion** 🧅: the request goes **in** through the layers, then the response comes **back out** through them. We'll use this idea soon.

### 🌶️ Connect it to Lesson 1

Why did the 404 catch-all have to go at the bottom? **Because it's middleware that never calls `next()`.** Put it first and it would stop every request. Lesson 1's "order matters" rule was middleware all along. 🤯

---

## 🎯 5. Three levels of middleware

### Level A: Global (runs for **every** request)

```js
app.use(logger);
```

### Level B: Path-based (runs for requests starting with a path)

```js
app.use("/admin", (req, res, next) => {
  console.log("🔒 Someone is in the admin area");
  next();
});
```

This runs for `/admin`, `/admin/users`, `/admin/anything`. And **not** for `/about`.

### Level C: Route-level (runs for **one** route only) ⭐

You put middleware **between the path and the handler**:

```js
app.get("/secret", checkKey, (req, res) => {
  res.send("Top secret data 🕵️");
});
```

You can chain **as many as you want**:

```js
app.get("/tasks/:id", validateId, findTask, (req, res) => {
  res.json(req.task);
});
```

Each one is a station. If any station **stops**, the next ones never run. This is the cure for the repeated code from Lesson 3. 💊

---

## 📦 6. Built-in middleware

Express ships with some. You'll meet three:

| Middleware | What it does |
|------------|--------------|
| `express.json()` | Reads **JSON** bodies → `req.body` (Lesson 3 ✅) |
| `express.urlencoded({ extended: true })` | Reads **HTML form** bodies → `req.body` |
| `express.static("public")` | Serves **files** (HTML, CSS, images, JS) from a folder |

### 🆕 `express.static`: serve a real website

1. Create a folder `public/` next to `lesson4.js`.
2. Inside, create `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Express Site</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <h1>Served by Express! 🚀</h1>
  </body>
</html>
```

3. Create `public/style.css`:

```css
body { font-family: sans-serif; background: #111; color: #0f0; text-align: center; }
```

4. Add this to `lesson4.js`:

```js
app.use(express.static("public"));
```

Visit `http://localhost:3000/`. Express serves your HTML **and** CSS automatically. You didn't write a single route. 🎉

> 📝 **Note:** Notice that `public` does **not** appear in the URL. The file `public/style.css` is reached at `/style.css`. The folder is the "root" of your static site.

> 🌶️ **Order trap:** If `express.static` is above your `app.get("/")` route, the file `public/index.html` wins for `/`. Static middleware answers first and stops the line.

> 🎮 **Quest 2: Serve your own page (+50 XP).**

---

## ✍️ 7. Writing useful custom middleware

Now the fun part. 🎨 Here are four patterns you'll use **forever**.

### Pattern 1: Logger with timing ⏱️

```js
function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });

  next();
}
```

New ideas:

- `res.on("finish", ...)` runs **when the response has been fully sent**. So we can read the final `res.statusCode`.
- `req.originalUrl` is the full URL with query string (useful for logs).

Output:

```
GET /tasks?done=true → 200 (3ms)
POST /tasks → 400 (1ms)
```

This is a *real* production-style log. 😎

### Pattern 2: Attach data to `req` 🏷️

Middleware can **stick custom properties on `req`**. Later stations read them:

```js
let requestCount = 0;

function addRequestInfo(req, res, next) {
  requestCount++;
  req.requestId = requestCount;
  req.receivedAt = new Date().toISOString();
  next();
}

app.use(addRequestInfo);

app.get("/whoami", (req, res) => {
  res.json({
    requestId: req.requestId,
    receivedAt: req.receivedAt,
  });
});
```

Every request now has an ID and a timestamp, and **no route had to calculate it**.

### Pattern 3: The Gatekeeper 🛡️ (stopping requests)

```js
function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];

  if (!key) {
    return res.status(401).json({ error: "API key is missing" });
  }
  if (key !== "express-is-fun") {
    return res.status(403).json({ error: "API key is invalid" });
  }

  next(); // ✅ passed the check
}

app.delete("/tasks/:id", requireApiKey, (req, res) => {
  // only reached if the key is valid
});
```

#### 🆕 `401` vs `403`: a classic confusion

| Code | Name | Meaning |
|------|------|---------|
| `401` | Unauthorized | **"Who are you?"** You didn't prove your identity |
| `403` | Forbidden | **"I know who you are, but you can't do this"** |

> 📝 **Note:** The names are confusing (`401` is called "Unauthorized" but really means "unauthenticated"). Just remember the meanings. We'll go deep into this in Phase 5 (authentication). 🔐

**Test it in Thunder Client:** add a header named `x-api-key` with the value `express-is-fun`.

### Pattern 4: The Loader (the cure for repeated code) 💊

Here's the **big win**. Remember Lesson 3, where *every* route started with this?

```js
const id = Number(req.params.id);
if (Number.isNaN(id)) { return res.status(400)... }
const task = tasks.find((t) => t.id === id);
if (!task) { return res.status(404)... }
```

Now it becomes **two tiny middleware functions**:

```js
function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID must be a positive integer" });
  }

  req.itemId = id; // 🏷️ attach the clean number
  next();
}

function findTask(req, res, next) {
  const task = tasks.find((t) => t.id === req.itemId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  req.task = task; // 🏷️ attach the found task
  next();
}
```

And now your routes become **beautiful**:

```js
app.get("/tasks/:id", validateId, findTask, (req, res) => {
  res.json(req.task);
});

app.patch("/tasks/:id", validateId, findTask, (req, res) => {
  const { title, done } = req.body ?? {};
  if (title !== undefined) req.task.title = String(title).trim();
  if (done !== undefined) req.task.done = done;
  res.json(req.task);
});

app.delete("/tasks/:id", requireApiKey, validateId, findTask, (req, res) => {
  tasks = tasks.filter((t) => t.id !== req.itemId);
  res.status(204).send();
});
```

Look at what happened:

- **Before:** ~10 repeated lines in every route.
- **After:** the route *only* contains what makes it unique. ✨

The assembly line for `DELETE /tasks/:id` is:

```
Request → requireApiKey → validateId → findTask → handler → Response
              🛡️             🔢          🔍         🗑️
```

If any station says stop, the rest never run.

> 🧠 **Principle:** *Each middleware does ONE job.* Small, single-purpose functions are easy to test, reuse, and debug. This is a core habit of professional developers.

> 🎮 **Quest 3: Refactor your Lesson 3 Task Manager to use `validateId` and `findTask` (+100 XP).** Delete the repeated code. Watch the file shrink. Enjoy it. 😌

---

## 💥 8. A first look at error handling

What if your code **crashes**? Or a client sends broken JSON?

Try this. Send `POST /tasks` with the body `{"title": "oops",}` (note the trailing comma, which is invalid JSON). 

Without any handling, Express responds with an **HTML error page** and a stack trace. Ugly, and it leaks internal details. 😬

### The error-handling middleware

Express has a special middleware with **4 parameters**:

```js
app.use((err, req, res, next) => {
  // ⬆️ 4 params: Express knows this handles ERRORS
  console.error("💥", err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  res.status(500).json({ error: "Something went wrong on our side" });
});
```

### 🔑 Critical rules

1. It **must** have exactly **4 parameters**, even if you never use `next`. Express checks the function's parameter count to recognize it. With 3, it's treated as normal middleware.
2. It goes at the **very bottom**, *after* all routes and your 404 handler.
3. If any code throws an error, Express skips all normal middleware and jumps **straight** to this one.

### Triggering errors yourself

```js
app.get("/crash", (req, res) => {
  throw new Error("Boom!");
});
```

Visit `/crash`. Instead of an ugly HTML page, the client gets clean JSON, and the real error is in **your** terminal. 

### Passing errors manually with `next(err)`

```js
app.get("/risky", (req, res, next) => {
  const error = new Error("Something specific failed");
  next(error); // ⬅️ jump to the error handler
});
```

> 📝 **Note:** In **Express 5** (what you installed), errors thrown inside `async` functions, or rejected promises, are **automatically** sent to the error handler. In older Express 4 tutorials you'll see workarounds like `try/catch` + `next(err)` everywhere. You'll now understand why those tutorials look so heavy. 😄

> 🔮 **Lesson 5 will go deep** on error handling (custom error classes, centralized handling) and third-party middleware. Today is just the first taste. 🍬

### 🧭 The final, complete skeleton

This is the shape of **every professional Express app**. Memorize this order:

```js
const express = require("express");
const app = express();

// 1️⃣ Global middleware (logger, body parsers, static files)
app.use(logger);
app.use(express.json());
app.use(express.static("public"));

// 2️⃣ Routes (specific → dynamic)
app.get("/tasks", ...);
app.get("/tasks/:id", validateId, findTask, ...);

// 3️⃣ 404 catch-all (middleware that never calls next)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 4️⃣ Error handler (4 params, always LAST)
app.use((err, req, res, next) => { ... });

app.listen(3000);
```

> 🏆 **Pro tip:** If something is behaving strangely, ask: *"Which middleware ran, in what order, and did any of them forget `next()` or `return`?"* That question solves 80% of Express bugs.

---

## 🧯 9. Debugging cheat sheet (Lesson 4 edition)

| Problem | Likely cause |
|---------|-------------|
| Request hangs forever ⏳ | A middleware doesn't call `next()` **and** doesn't send a response |
| `Cannot set headers after they are sent` | Middleware sent a response **and** also called `next()`. Add `return` |
| Middleware never runs | It's registered **below** the route that responds first |
| `req.body` is `undefined` | `express.json()` is missing or below the route |
| `req.task` is `undefined` in the handler | The `findTask` middleware isn't in that route's chain, or comes **after** the handler |
| Error handler never triggers | It has 3 params instead of 4, or it's not at the bottom |
| Static file gives `Cannot GET /style.css` | Wrong folder name, or the file isn't inside `public/` |
| Server crashes and shows an HTML error | No error-handling middleware yet |

---

## ✅ 10. Quick recap

- **Middleware** = a function `(req, res, next)` running between the request and the response.
- It can **pass** (`next()`), **stop** (send a response), or **modify** (attach to `req`).
- **Forget both** `next()` and a response → the request hangs.
- Order is everything: **top to bottom**.
- Three levels: **global** (`app.use`), **path-based**, **route-level** (`app.get(path, mw1, mw2, handler)`).
- Built-ins: `express.json()`, `express.urlencoded()`, `express.static()`.
- Custom patterns: **logger**, **attach data**, **gatekeeper**, **loader**.
- `401` = "who are you?", `403` = "you can't do this".
- Error handlers have **4 params** and go **last**.
- Each middleware does **one job**.

---

# ⚔️ THE CHALLENGES

> 🔗 **Stacking rule:** each challenge uses **older lessons + middleware**. The boss fight uses **Lessons 1 + 2 + 3 + 4** together. 👹
>
> **Rules:** Try alone first. Hints are hidden. No full solutions unless you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+100 XP`

**Goal:** Prove you understand how middleware works.

Create `l4_challenge1.js` on **port 4000**. You're building a **Request Watcher** 👀.

**Middleware to write (all global):**

1. `logger`: logs `METHOD URL → STATUS (Xms)` when each response finishes.
2. `counter`: counts total requests and attaches the number to `req.requestNumber`.
3. `addHeader`: sets a response header `X-Request-Number` to that number. *(Use `res.setHeader(name, value)`.)*

**Routes:**

| Route | Behavior |
|-------|----------|
| `GET /ping` | `{ "message": "pong", "requestNumber": <n> }` |
| `GET /time` | `{ "time": "<ISO string>" }` |
| `GET /stats` | `{ "totalRequests": <n> }` |
| *anything else* | `404` JSON (middleware at the bottom) |

✅ **Success check:**

- Your terminal logs every request, **including the 404s**, with correct status codes.
- In DevTools → Network → Headers, you can see `X-Request-Number` increasing.
- `/stats` counts **itself** too (calling it the 1st time shows `1`).
- Move `counter` **below** the routes. What breaks? *(Write the answer as a comment in your file.)* 🔬

<details>
<summary>💡 Hint 1</summary>

The `counter` middleware needs a variable **outside** the function (like Lesson 1's counter bonus). Increase it, then copy the value to `req.requestNumber`.

</details>

<details>
<summary>💡 Hint 2</summary>

`addHeader` must run **after** `counter` (it needs `req.requestNumber`). Order in `app.use(...)` matters!

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+250 XP`

**Goal:** Build a clean, protected API using **Lessons 1-4**.

Create `l4_challenge2.js` on **port 5000**. You're building a **Bookmarks API** 🔖.

```js
let bookmarks = [
  { id: 1, title: "MDN Web Docs", url: "https://developer.mozilla.org", tags: ["docs", "js"] },
  { id: 2, title: "Express Guide", url: "https://expressjs.com", tags: ["docs", "express"] },
  { id: 3, title: "Node.js", url: "https://nodejs.org", tags: ["node"] },
];
let nextId = 4;
```

**🔧 Required middleware (each does ONE job):**

- `logger` (with timing)
- `validateId` and `findBookmark` (the loader pair, **route-level**)
- `requireApiKey`: `401` if missing, `403` if wrong. Protects **only** `POST`, `PUT`, `PATCH`, `DELETE`. Reading (`GET`) stays public.
- A **404** catch-all and an **error handler** at the bottom.

**Routes:**

| Route | Behavior |
|-------|----------|
| `GET /` | HTML page with a **dynamic** bookmark count |
| `GET /bookmarks` | All. Supports `?tag=` and `?search=` (partial, case-insensitive on title). Combinable |
| `GET /bookmarks/count` | `{ "count": n }` |
| `GET /bookmarks/:id` | One bookmark (use your middleware!) |
| `POST /bookmarks` | Create. `title` (non-empty string) and `url` (must start with `http://` or `https://`) required. `tags` optional array of strings. Duplicate `url` → `409` |
| `PUT /bookmarks/:id` | Replace (all fields required) |
| `PATCH /bookmarks/:id` | Partial update. Only `title`, `url`, `tags` allowed |
| `DELETE /bookmarks/:id` | `204` |

✅ **Success check:**

- `DELETE` with **no** key → `401`. **Wrong** key → `403`. **Right** key → `204`.
- Sending broken JSON (`{"title": "x",}`) → clean `400` JSON from your error handler (not an HTML page).
- Visiting `/crash` (add a route that throws) → clean `500` JSON, and **no stack trace** sent to the client.
- Your route handlers contain **zero** repeated ID-validation code.
- `/bookmarks/count` works **and** `/bookmarks/2` works. (Route order! 🌶️)

<details>
<summary>💡 Hint 1 (protect only writes)</summary>

You have options. Either add `requireApiKey` as a middleware in each write route, **or** make one middleware that checks `req.method` and calls `next()` immediately for `GET`. Try both and decide which you prefer. 🤔

</details>

<details>
<summary>💡 Hint 2 (URL validation)</summary>

`url.startsWith("http://") || url.startsWith("https://")`. Check it's a string **first**.

</details>

<details>
<summary>💡 Hint 3 (error handler)</summary>

Check `err.type === "entity.parse.failed"` for bad JSON. Everything else → generic `500` message. Log the real error with `console.error`.

</details>

---

## 🥇 CHALLENGE 3: 👹 BOSS FIGHT: The Stacked Challenge · `+500 XP`

**Goal:** Merge **Lessons 1 + 2 + 3 + 4**. Upgrade your **Library System** into a *production-style* API. 📚🏭

Create `l4_boss.js` on **port 6000**. Start from your `l3_boss.js`, then **refactor it** with middleware. The data is the same:

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

**🔙 Everything from Lessons 1-3 must still work:**

- `GET /` (HTML dashboard with links), `GET /status`, unknown route → `404` JSON `{ "error": "Route not found", "status": 404 }`.
- `GET /books` with combinable filters (`author`, `available`, `after`) plus the bonus sort from Lesson 3 if you did it.
- `GET /books/newest`, `GET /books/count`, `GET /books/:id`, `GET /authors/:name/books`.
- `POST`, `PUT`, `PATCH`, `DELETE /books...` with full validation.
- `POST /books/:id/borrow`, `POST /books/:id/return`, `GET /history?limit=N`.

**🆕 Lesson 4 upgrades (the new power):**

1. **`logger` middleware:** logs `[#<requestId>] METHOD URL → STATUS (Xms)`.
2. **`requestId` middleware:** gives each request a unique number in `req.requestId` and sets the header `X-Request-Id`.
3. **`validateBookId` + `loadBook`:** used by **every** `/books/:id...` route. Your handlers must have **zero** manual ID checks.
4. **`requireAdminKey`:** protects **all** write routes (`POST`, `PUT`, `PATCH`, `DELETE`, `borrow`, `return`). Missing key → `401`. Wrong key → `403`. Read routes stay public.
5. **`validateBookBody`:** one reusable middleware that validates the body for `POST` and `PUT` (title, author, year, plus `available` for `PUT`) and returns `400` naming the bad field. Used in **both** routes.
6. **`GET /admin`** → **without** the admin key: `403` HTML message (like Lesson 1). **With** the right key: `200` JSON with the **full history**, total books, and uptime.
7. **`rateLimiter`:** each client IP may make at most **20 requests per 10 seconds**. After that → `429` JSON `{ "error": "Too many requests" }`. After the window passes, requests work again.
8. **Error handler:** bad JSON → `400`. Any other crash → `500` clean JSON. Add a `GET /crash` route to test it.
9. **Correct final order:** logger/requestId → rate limiter → `express.json()` → routes → 404 → error handler.

**🌟 Bonus (+100 XP):**

10. Add a `routeHits` object to `/status` that counts hits **per route pattern** (like `"GET /books/:id": 4`). Not per URL!

### ✅ Success check

- `DELETE /books/1` with no key → `401`; wrong key → `403`; right key on a **borrowed** book → `409`; right key on an available one → `204`.
- Every response has an `X-Request-Id` header, and your terminal log matches it.
- Call `/status` 25 times fast (hold refresh, or use a loop in the browser console) → you start getting `429`s. Wait 10 seconds → works again.
- `POST /books` with `year: 3000` and the right key → `400` mentioning `year`.
- `/books/banana` → `400`, `/books/999` → `404`, both from **middleware**.
- `/crash` returns JSON `500`. Broken JSON returns JSON `400`.
- Your file has **no copy-pasted ID-validation blocks**.

### 🧠 Where to think

- The rate limiter needs memory **between requests**. Where do you store counts per IP? *(An object keyed by `req.ip` holding an array of timestamps? A counter plus a window start time?)* Compare the two ideas.
- Should the rate limiter be **above or below** `requireAdminKey`? What do you want to happen to an attacker guessing keys? 🕵️
- `borrow` and `return` are write routes. How can you apply `requireAdminKey` to **specific routes** without repeating it everywhere? *(Hint: you have three levels of middleware. Which fits best?)*
- Which should run first for `POST /books`: `requireAdminKey` or `validateBookBody`? Why would the opposite order be a **security** problem? *(Think: should an anonymous user get detailed validation feedback?)*

<details>
<summary>💡 Hint 1 (rate limiter, simple version)</summary>

Keep `const hits = {}`. For each request: get `hits[req.ip]` (or `[]`), **keep only timestamps from the last 10 seconds**, push `Date.now()`, store it back. If the array length is over 20 → `429`. Otherwise `next()`.

</details>

<details>
<summary>💡 Hint 2 (protecting only write routes)</summary>

You could use a single middleware that skips `GET`. Or put `requireAdminKey` in each write route's chain. Or use `app.post("/books", requireAdminKey, validateBookBody, handler)`. Pick one and stay consistent.

</details>

<details>
<summary>💡 Hint 3 (route patterns for the bonus)</summary>

Inside `res.on("finish", ...)`, the property `req.route?.path` holds the matched pattern (like `"/books/:id"`). Combine it with `req.method`. It's `undefined` for 404s, so handle that.

</details>

<details>
<summary>💡 Hint 4 (an easy way to test the limiter)</summary>

In your browser DevTools console, run: `for (let i = 0; i < 30; i++) fetch("/status").then(r => console.log(i, r.status))`. 

</details>

---

# 🏋️ THE PRACTICE ARENA (Lesson 4)

> Because you asked for more, here's the practice built-in. Do these **before** the boss fight if you want an easier ride. 😉

---

## 🔮 ZONE 1: Predict the Output · `+50 XP`

### Q1: Who prints what?

```js
app.use((req, res, next) => { console.log("A"); next(); });

app.get("/hi", (req, res) => {
  console.log("B");
  res.send("hi");
});

app.use((req, res, next) => { console.log("C"); next(); });
```

What prints for **(a)** `GET /hi` and **(b)** `GET /other`?

<details>
<summary>👀 Answer</summary>

- **(a)** `A`, `B`. The handler responded without `next()`, so `C` never runs.
- **(b)** `A`, `C`, then Express's default `Cannot GET /other` (no route matched, nothing responded).

</details>

### Q2: The onion

```js
app.use((req, res, next) => { console.log("1 before"); next(); console.log("1 after"); });
app.use((req, res, next) => { console.log("2"); next(); });
app.get("/", (req, res) => { console.log("3"); res.send("ok"); });
```

What is the full console output for `GET /`?

<details>
<summary>👀 Answer</summary>

```
1 before
2
3
1 after
```

Request goes **in** through the layers, response comes **back out**. 🧅

</details>

### Q3: Which status?

For each, name the status code:

- **A)** No `x-api-key` header sent
- **B)** `x-api-key` sent, but the value is wrong
- **C)** Valid key, but the book is checked out and you try to delete it
- **D)** Broken JSON in the body
- **E)** Client exceeded the rate limit

<details>
<summary>👀 Answer</summary>

**A)** `401` **B)** `403` **C)** `409` **D)** `400` **E)** `429`

</details>

---

## 🐛 ZONE 2: Bug Hunt · `+100 XP`

### 🐞 Bug 1: The Silent Logger

```js
app.use((req, res, next) => {
  console.log(req.method, req.url);
});

app.get("/", (req, res) => res.send("Hello"));
```

Visiting `/` loads forever. Why, and what's the fix?

<details>
<summary>👀 Answer</summary>

The middleware never calls `next()` and never responds. Express waits forever. Fix: add `next();` at the end.

</details>

### 🐞 Bug 2: The Leaky Gate

```js
function requireKey(req, res, next) {
  if (req.headers["x-api-key"] !== "secret") {
    res.status(403).json({ error: "Forbidden" });
  }
  next();
}

app.delete("/items/:id", requireKey, (req, res) => {
  items = items.filter((i) => i.id !== Number(req.params.id));
  res.status(204).send();
});
```

A request with the wrong key still **deletes the item**, and the terminal shows an error. Find **3** problems.

<details>
<summary>👀 Answers</summary>

1. **Missing `return`:** after sending `403`, `next()` still runs, so the handler runs too. Security hole! 🚨
2. **Double response:** the handler tries to send `204` after `403` was sent → `Cannot set headers after they are sent`.
3. **Missing-key case:** no key at all should be `401`, not `403`.

</details>

### 🐞 Bug 3: The Late Guard

```js
app.delete("/items/:id", (req, res) => {
  items = items.filter((i) => i.id !== Number(req.params.id));
  res.status(204).send();
});

app.use(requireKey);
```

The guard never blocks anything. Why? Find **2** problems.

<details>
<summary>👀 Answer</summary>

1. **Order:** `requireKey` is registered **after** the route. The route already responded.
2. **Scope:** even if moved, `app.use(requireKey)` would protect **everything**, including public `GET` routes. Better to put it in the route chain: `app.delete("/items/:id", requireKey, handler)`.

</details>

### 🐞 Bug 4: The Imposter Error Handler

```js
app.use((err, req, res) => {
  res.status(500).json({ error: err.message });
});
```

This was meant to catch errors, but crashes weirdly on normal requests. Why?

<details>
<summary>👀 Answer</summary>

Express recognizes error handlers by having **exactly 4 parameters**. With 3, it's treated as normal middleware, so `err` is actually the `req`, `req` is the `res`, and `res` is `next`. Add the `next` parameter, even if unused.

</details>

---

## ⚡ ZONE 3: Speed Drills · `+50 XP each (200 XP)`

### ⚡ Drill 1: Hit Counter · `l4_drill1.js`

A global middleware counts hits **per path** in an object (e.g., `{ "/": 3, "/about": 1 }`).

| Route | Behavior |
|-------|----------|
| `GET /hits` | Returns the object |
| `GET /`, `GET /about`, `GET /contact` | Simple text responses |

### ⚡ Drill 2: Maintenance Mode · `l4_drill2.js`

A middleware checks a `maintenanceMode` variable. When it's `true`, **every route except `/admin/...`** returns `503` JSON `{ "error": "Under maintenance" }`.

| Route | Behavior |
|-------|----------|
| `POST /admin/maintenance` | Body `{ "on": true/false }` toggles it. Requires an API key header |
| `GET /` | Normal response when not in maintenance |

**Think:** what does `req.path.startsWith("/admin")` give you? Where must the middleware go?

### ⚡ Drill 3: Slow Route Detector 🐌 · `l4_drill3.js`

A middleware measures response time. If it takes **over 500ms**, log `🐌 SLOW: GET /slow (812ms)`.

Add `GET /slow` that waits **800ms** before responding (use `setTimeout` inside the handler) and `GET /fast` that responds instantly.

### ⚡ Drill 4: The Rebuild Ritual 🔁 · `l4_drill4.js`

Close everything. Open an empty file. Rebuild your **Lesson 3 Task Manager** from memory, but **this time with** `logger`, `validateId`, `findTask`, `requireApiKey` (writes only), 404, and the error handler.

Every time you peek, write down **what** you forgot. That list is your personal study guide. 🧠

🎮 **Badge unlocked after all 4 drills: ⚡ Middleware Machine**

---

## 🧠 ZONE 4: Teach-Back · `+50 XP`

Explain **in your own words** (2-4 sentences each):

1. What is middleware? Explain it to a friend using an analogy **you** invent (not the airport!).
2. Why does a middleware that forgets `next()` make the request hang, while one that forgets `return` before an early response causes a *different* bug?
3. Why does the order of `app.use()` calls matter? Give one example where the wrong order causes a bug.
4. What's the difference between `401` and `403`?
5. Why is the error handler placed last, and why does it need exactly 4 parameters?

---

## 🏁 YOUR XP BOARD

| Quest | XP |
|-------|----|
| Run the logger | 25 |
| Serve your own page | 50 |
| Refactor Task Manager | 100 |
| Challenge 1 🥉 | 100 |
| Challenge 2 🥈 | 250 |
| Boss Fight 🥇 | 500 |
| Bonus 🌟 | 100 |
| Practice Arena (Zones 1-4) | 400 |
| **Lesson 4 Total** | **1525 XP** |

> 🔧 Reach **3000 XP total** and you unlock the **Middleware Wizard** title.
> 🧮 After Lesson 4 (with Lessons 1-3), you're at **3625 XP**. 😎

### 🏅 Badges to collect

| Badge | How to earn it |
|-------|----------------|
| 🛡️ Gatekeeper | Challenge 2 with correct `401`/`403` |
| 🏭 Assembly Line Architect | Boss Fight, zero repeated ID code |
| 🚦 Traffic Controller | Working rate limiter |
| ⚡ Middleware Machine | All 4 drills |

---

## 🔮 Sneak Peek: Lesson 5

**Lesson 5 finishes Phase 2** with:

- 🧯 **Deep error handling:** custom error classes, `404` as an error, one central handler
- 📦 **Third-party middleware:** `morgan` (pro logging), `cors` (letting your React app talk to your API!), and `helmet` (security headers)
- 🌍 **Environment variables** and `.env` files

Your **React** skills finally connect to your **Express** skills. And the Lesson 5 boss fight stacks **Lessons 1-5**. 👹

---

## 📤 What to send me next

You don't need to send it all at once. Send in **batches**:

1. **Predict + Bug Hunt + Teach-Back answers** (quick to review)
2. **Challenge 1 and drills**: code in code blocks
3. **Challenge 2 and Boss Fight**: when ready

For each: ✅ what worked, ❌ what broke (paste the **exact error**).

I'll review, explain your mistakes, and unlock **Lesson 5**. 💪

**You're no longer just writing routes. You're building an assembly line. Go build it.** 🏭🔥