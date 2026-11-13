# 🟡 Level 2, Lesson 6: Error-Handling Middleware 🚨

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges and **👹 Boss Battle #2** at the end.

> 💬 **Honest talk:** your XP is still **0**. I only give XP for work you show me, and the pile of waiting challenges is over 1,000 XP now. Reading makes you feel smart. **Typing and breaking things makes you a developer.** Boss Battle #2 is the perfect moment to start. Pick one challenge from any old lesson, struggle 20 minutes, and send me your code. 💪

## 🤔 The "Why"

Things **will** go wrong: bad input, a crash in your code, a failed database call. Without a plan, the user sees an ugly stack trace or a hanging page.

We want **one place** that catches all errors and sends a clean answer. That place is **error-handling middleware**.

## 🧠 Mental Model

> 🚑 **A hospital emergency door.** Normal patients go through the normal rooms (your middleware and routes). When something goes wrong, the patient is rushed **past all normal rooms** to the emergency room at the end.

```
Request → [mw1] → [mw2] → [route] 💥 error!
                                 ↓
         skips every normal item ...
                                 ↓
                        [ERROR HANDLER] → Response
```

---

## 🔬 Under the Hood: How Express Finds the Emergency Room

An error handler is a middleware with **exactly 4 parameters**:

```js
(err, req, res, next) => { ... }
```

Express checks `fn.length` (the number of declared parameters) for each function in the list. **4 = error handler.** Fewer = normal middleware. Nothing is magic. It is just counting. 🔢

Two things start the "emergency mode":
1. You call `next(err)` with **any value inside** (like an Error).
2. Your code **throws** inside a route or middleware. Express wraps your function in a `try/catch` and calls `next(err)` for you.

In emergency mode, Express **skips all normal middleware and routes** and runs only the next function that has 4 parameters.

### ⚡ Mini Challenge 1 (10 XP): See the default handler
Create `lesson6.js`:

```js
const express = require("express");
const app = express();

app.get("/crash", (req, res) => {
  throw new Error("Something broke!");
});

app.listen(3000, () => console.log("Running on 3000"));
```

1. Visit `/crash`. Read what the browser shows (status, stack trace).
2. Run it in production mode and visit again. What changed?
   - Mac/Linux: `NODE_ENV=production node lesson6.js`
   - Windows PowerShell: `$env:NODE_ENV="production"; node lesson6.js`
3. Why do you think Express hides the stack in production? *(Think about who can see it.)*

This is Express's **built-in** default error handler. Now let's write our own.

---

## 🛠️ Part 1: Your Own Error Handler

```js
app.get("/crash", (req, res) => {
  throw new Error("Something broke!");
});

// 4 parameters. Must come AFTER all routes.
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Server error" });
});
```

**What breaks?**
- Remove `next` (3 params only) → Express sees a **normal** middleware. It never receives errors, and the default handler runs again.
- Move the handler **above** the routes → it only handles errors from items **above** it. Your crash passes by. **Order matters, again!** 🔁

### ⚡ Mini Challenge 2 (15 XP)
1. Add the handler above.
2. Prove both "What breaks?" lines by testing them yourself.
3. Which line of Lesson 4's chain idea explains why position matters? Say it in one sentence.

---

## 🛠️ Part 2: `next(err)` and Custom Errors

Throwing is not the only way. You can **pass** an error:

```js
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

app.get("/notes/:id", (req, res, next) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return next(new AppError("id must be a number", 400));
  }
  res.json({ id });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 ? "Server error" : err.message;
  res.status(status).json({ error: message });
});
```

**Line by line:**
- `class AppError extends Error`: an error that also carries an HTTP `status`.
- `return next(new AppError(...))`: send the request to the emergency room. `return` stops the route from continuing (you know why from Lesson 2).
- `err.status || 500`: errors we create have a status. Surprise crashes (bugs) don't, so they become 500.
- For 500 we send a **generic** message. Real error text may leak secrets (file paths, database info). 🔒

> 🧩 **Connect to Lesson 5:** remember bad JSON sent to `express.json()`? That middleware calls `next(err)` with `err.status = 400`. Your handler above catches it automatically!

### ⚡ Mini Challenge 3 (20 XP)
1. Type the code above.
2. Test `/notes/abc` and `/notes/5`.
3. Add `app.use(express.json())` and a `POST /echo` route. Send **broken JSON** (`{ bad`) with curl or Thunder Client. What status and message does your handler return? Log `err` to see the extra fields (`err.type`).

---

## 🛠️ Part 3: The 404 Handler Is Not an Error

A route that doesn't exist is **not** an error in Express. It's just "nothing matched." So we use a **normal** middleware at the bottom, and turn it into an error:

```js
// after all routes:
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.url}`, 404));
});

// last of all:
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Server error" : err.message });
});
```

The perfect bottom of every Express app:

```
... all your routes ...
[404 middleware]   ← normal (3 params): creates the error
[error handler]    ← emergency room (4 params): answers it
```

### ⚡ Mini Challenge 4 (15 XP)
Add both to your file. Visit `/nothing`. Then break it: swap the **order** of these two. What do you see? Why?

---

## 🛠️ Part 4: Async Errors (Important!) ⚠️

```js
function fakeDb() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("DB is down")), 100);
  });
}

app.get("/db", async (req, res) => {
  const data = await fakeDb();   // rejects!
  res.json(data);
});
```

**What happens depends on your Express version!**
- **Express 4:** a rejected promise is **not** caught. The request hangs, and Node may print "unhandled rejection." You had to write `try { ... } catch (e) { next(e); }` in every async route.
- **Express 5:** Express sees that your function returned a promise and automatically calls `next(err)` if it rejects.

Check yours: `npm ls express`

### ⚡ Mini Challenge 5 (25 XP)
1. Check your Express version.
2. Add the `/db` route and visit it. Does your error handler catch it, or does the page hang?
3. If it hangs (Express 4), fix it with `try/catch` and `next(e)`. If it works (Express 5), **prove** what Express 4 would do by writing a plain-Node version of "a promise rejects and nobody catches it." What does Node print?
4. Explain: why can't a normal `try/catch` around `app.get(...)` catch an error that happens **later**, inside the callback? *(Hint: when does the callback actually run?)*

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Add an **error layer** to your Notes API:
- `AppError` class
- 404 middleware + error handler at the bottom
- `GET /notes/:id` with a bad id → `400`; missing note → `404`; both through `next(new AppError(...))`, **no** `res.status(...)` inside the route for errors

**⚔️ Challenge 2: Real-world (40 XP)**
Make the error handler smarter:
- Log every error to the terminal with the **method, URL, and message**
- In development, include `stack` in the JSON. In production, never.
- Bad JSON from the client → friendly message `"Invalid JSON body"` with status `400`
- Use `process.env.NODE_ENV` to decide

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Predict the **exact console output** for a request to `/`, **before** running:

```js
app.use((req, res, next) => { console.log("A"); next(); });

app.get("/", (req, res, next) => {
  console.log("B");
  next(new Error("boom"));
});

app.use((req, res, next) => { console.log("C"); next(); });

app.use((err, req, res, next) => {
  console.log("D", err.message);
  next(err);
});

app.use((err, req, res, next) => {
  console.log("E");
  res.status(500).send("fail");
});
```

1. Which letters print, and in what order?
2. Why is **C** missing (or not)?
3. What happens to the user if **D** doesn't call `next(err)` and doesn't send anything?

**🐞 Bug Hunt (30 XP):** find **2 bugs**, plus one **security risk**:

```js
app.use((err, req, res) => {
  res.status(500).json({ error: err.stack });
});

app.get("/crash", (req, res) => {
  throw new Error("x");
});
```

---

## 👹 BOSS BATTLE #2 (150 XP, +75 bonus for no hints)

**Mix of Lessons 2 to 6. No hints at first!**

Build a **Bookmarks API** from scratch in a new folder:

1. `GET /bookmarks`: all bookmarks. Supports `?search=word` (title contains it) and `?limit=3`.
2. `GET /bookmarks/:id`: one bookmark. Bad id → `400`. Missing → `404`.
3. `POST /bookmarks`: body `{ title, url }`. Both are required. `url` must start with `http`. Wrong data → `400` with a clear message. Success → `201`.
4. `PUT /bookmarks/:id` and `DELETE /bookmarks/:id` need the header `x-api-key`. Use **your own factory** `requireKey(key)`.
5. Use `morgan`, `cors`, and `express.json()`. Put each in the correct order.
6. Every error goes through `next(new AppError(...))`. One **central** handler returns `{ error, status }`. Unknown routes return a JSON 404. Bad JSON returns a friendly `400`. No stack in production.
7. Serve a tiny `public/index.html` that lists bookmarks with `fetch`.

**Rules:**
- ⏱️ Struggle at least **20 minutes** before any hint.
- 📝 Keep a **bug diary**: each bug, how you found it, what fixed it.
- 🧠 +30 XP: explain back the **full journey** of `DELETE /bookmarks/99` with a wrong key: every middleware it touches, in order, and where it stops.

**Bonus XP:** 🏆 +10 per challenge with no hint.

## 🪜 Stuck?

1. Struggle **20 minutes**. Add `console.log("reached X")` to see where the request stops.
2. Ask: *"Which item in the list is the request in right now?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 6: error handling + boss battle 2"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 2 (Middleware) | 0 (pile waiting: **1,300+ XP**) | Day 1 |

**⏭️ Next lesson:** 🟠 **Level 3 starts!** Lesson 7: **`express.Router`**, how to split a big app into small files. Your single file is about to become a real project structure. 🏗️

Send me one piece of code, even a broken one. A bug you can't solve is the most valuable thing you can show me. 🚀