# 🟡 Level 2, Lesson 4: Middleware (the Heart of Express ❤️)

> 🎮 **Level 2 unlocked!** Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end.

> 📌 I haven't seen your Lesson 3 Boss Battle yet. It's still waiting (150 XP). Struggle on it for 20 minutes, then send me what you tried. 💪

## 🤔 The "Why"

Imagine 20 routes. You want to **log every request**. Or check if the user is **logged in**. Do you copy the same code into all 20 routes? 😵

No. We need a way to say: *"Run this code for many routes, before they do their own work."*

That tool is **middleware**.

**Middleware** = a function with three inputs: `(req, res, next)`. It runs **between** the request arriving and your final route.

## 🧠 Mental Model

> 🛂 **Airport checkpoints.** A passenger (the request) walks through stations: passport check, bag scan, ticket check. At the end, they reach the gate (your route).
>
> Each station can do one of three things:
> 1. ✏️ **Change** something (stamp the passport → modify `req`)
> 2. ✅ **Let them pass** (call `next()`)
> 3. 🛑 **Stop them** (send a response, no `next()`)

```
Request → [Logger] → [Auth check] → [express.json] → [Route] → Response
              ↓            ↓               ↓             ↓
           next()       next()          next()      res.send()
```

---

## 🔬 Under the Hood: Build "Mini Express" (no magic!)

Express keeps a **list** of functions. `next` is just a function that **runs the next item in the list**. Let me prove it with plain Node (no Express). Create `mini.js` and run it:

```js
const stack = [
  (req, res, next) => { console.log("A"); next(); },
  (req, res, next) => { console.log("B"); next(); },
  (req, res) => { console.log("C: send response"); },
];

function handle(req, res) {
  let i = 0;
  function next() {
    const fn = stack[i];
    i++;
    if (fn) fn(req, res, next);
  }
  next();
}

handle({}, {});
```

**Line by line:**
- `i` = a counter: "which item is next?"
- `next()` takes `stack[i]`, moves the counter forward, and **calls that function, giving it `next` again**.
- Each function decides: call `next()` (go forward) or not (chain stops).

Output: `A`, `B`, `C: send response`.

**That is Express's core idea.** Real Express also checks method and path for each item, but the chain is the same. Nothing is magic. 🔍

### ⚡ Mini Challenge 1 (15 XP)
In `mini.js`:
1. Remove `next()` from function **B**. Predict the output, then run it. What happened to C? Why?
2. Add a new function **between A and B** that logs `"A2"`. Did you need to change anything else?
3. What happens if the stack is **empty** or runs out? (Hint: look at the `if (fn)`. In real Express, this is where the `Cannot GET /...` 404 comes from.)

---

## 🛠️ Part 1: Your First Real Middleware

Create `lesson4.js`:

```js
const express = require("express");
const app = express();

// Middleware: runs for EVERY request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Home");
});

app.get("/about", (req, res) => {
  res.send("About");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Visit `/` and `/about`. Watch your terminal. Every request is logged, and you wrote the log code **once**. ✅

**What breaks?**
- Remove `next()` → the browser **loads forever** ⏳. The chain stops. Nobody sends a response. (You saw this in `mini.js`!)
- Move the middleware **below** the routes → no logs. The route already sent the response, so the chain never reaches it. **Order matters!**

### ⚡ Mini Challenge 2 (15 XP)
Upgrade the logger to print the time too:
`2026-11-13T10:30:00.000Z GET /about`
(Hint: `new Date().toISOString()`)

---

## 🛠️ Part 2: Middleware Can Change `req`

All middleware and the final route share the **same `req` object**. So one station can add information for later stations.

```js
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

app.get("/time", (req, res) => {
  res.json({ receivedAt: req.requestTime });
});
```

```
req = { method, url, ... }
        ↓ middleware adds requestTime
req = { method, url, ..., requestTime }
        ↓ route reads it
```

> 🧩 **Connect to Lesson 2:** this is exactly how `express.json()` works. It reads the raw bytes, parses them, and **adds `req.body`** before your route runs. Now you know why `req.body` was `undefined` without it!

### ⚡ Mini Challenge 3 (20 XP)
Write a middleware that adds `req.visitorNumber` (a counter that goes up with every request). Make `GET /visitor` return `{ "you_are_visitor": 5 }` (the number should grow).
*(Think: where must the counter variable live so it survives between requests?)*

---

## 🛠️ Part 3: Middleware Can Stop the Request 🛑

A **guard** checks something. If it fails, it sends a response **and does not call `next()`**.

```js
function guard(req, res, next) {
  if (req.query.key !== "123") {
    return res.status(401).json({ error: "Wrong key" });
  }
  next();
}
```

Notice `return`. Without it, the function would continue to `next()` after sending. That gives a double response bug. (Remember Lesson 2!)

### ⚡ Mini Challenge 4 (20 XP)
1. Add the `guard` function above.
2. Test `/admin?key=123` and `/admin?key=abc` once you finish Part 4 below.

---

## 🛠️ Part 4: Where Middleware Applies (Scope)

You have **three ways** to place middleware:

```js
// 1. Everywhere
app.use(logger);

// 2. Only for paths that START with /admin
app.use("/admin", guard);

// 3. Only for one route (put it before the handler)
app.get("/secret", guard, (req, res) => {
  res.send("Top secret 🤫");
});
```

You can even list **several** in one route: `app.get("/x", mw1, mw2, handler)`.

**Under the hood:** all three are the **same kind of item** in the same list. The only difference is the *matching rule* Express checks before running it.

```
List:
 1. [any path]      logger
 2. [/admin...]     guard
 3. [GET /admin]    handler
```

A request to `/about` skips item 2 (path doesn't match). A request to `/admin` goes through 1, 2, 3.

**What breaks?** Put `app.use("/admin", guard)` **after** `app.get("/admin", ...)`. The route answers first, and the guard never runs. 🔓 **This is how real security bugs happen!**

### ⚡ Mini Challenge 5 (25 XP)
Build this in `lesson4.js`:
- `app.use("/admin", guard)`
- `GET /admin` → "Admin home"
- `GET /admin/users` → "Admin users"
- `GET /public` → "Anyone can see this"

Test all three, with and without `?key=123`. Which routes are protected? Write down **why** for each.

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Build a **request-info middleware**. For every request it should:
- Add `req.id` (a unique number that goes up by 1 each time)
- Log `[#3] GET /about`
- Add a response header `X-Request-Id` with that number (`res.set`)

Test with `curl -i` and see the header.

**⚔️ Challenge 2: Real-world (40 XP)**
Protect your Notes API (from Lesson 2):
- `GET /notes` and `GET /notes/:id` → public
- `POST`, `PUT`, `DELETE` on notes → need a header `x-api-key: secret123`
- Wrong or missing key → status `401` and JSON `{ "error": "Unauthorized" }`

*(Think: how do you read a header? Look at `req.get(...)` or `req.headers`. Which scope from Part 4 fits best? You may need more than one middleware.)*

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Predict the **exact order** of the console output when you visit `/`. Write it down **before** running:

```js
app.use((req, res, next) => {
  console.log("1");
  next();
  console.log("2");
});

app.use((req, res, next) => {
  console.log("3");
  next();
  console.log("4");
});

app.get("/", (req, res) => {
  console.log("5");
  res.send("done");
  console.log("6");
});
```

Then run it and answer: **why** do 2 and 4 come at the end? *(Hint to think about: what does `next()` actually do? It is just a normal function call. What happens after a function call finishes?)*

**⚔️ Challenge 4: Build Your Own Engine (60 XP)** 🛠️
In plain Node (no Express), extend `mini.js`:
- Add a function `use(fn)` that pushes into `stack`
- Add a function `run(req)` that starts the chain
- Make a logger middleware and a guard middleware with your own `(req, res, next)` rules
- Prove that the guard can **stop** the chain

If you can build this, you truly understand Express. 🏆

**🐞 Bug Hunt (30 XP):** find **2 bugs** before running:

```js
app.use("/admin", (req, res, next) => {
  if (req.query.key !== "123") {
    res.status(401).send("No");
  }
  next();
});

app.get("/admin", (req, res) => {
  res.send("Welcome");
});
```

*(Test it with a wrong key. What does the user see? What does your terminal say?)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back in your own words: *"What does `next()` do, and what happens if I forget it?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Add `console.log("reached here")` in each middleware to see how far the request travels.
2. Ask: *"Which item in the list is the request stuck at?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 4: middleware"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 2 (Middleware) | 0 (huge XP pile waiting: **~700**) | Day 1 |

**⏭️ Next lesson:** Lesson 5, **Built-in and third-party middleware** (`morgan`, `cors`, `express.urlencoded`). Lesson 6 brings **error-handling middleware** and **Boss Battle #2** ⚔️

Send me your code and I'll review it. 🚀