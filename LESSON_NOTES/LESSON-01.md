# 🚀 PHASE 1 · LESSON 1: Meet Express.js

> 🎮 **Your XP Bar:** `[░░░░░░░░░░] 0 / 500 XP`
> **Current Level:** 🥚 Newbie → 🐣 Server Hatcher (unlocks at 100 XP)

You already know Node.js. Today you build your own web server and watch it respond in your browser. That moment is **very** satisfying. 🔥

---

## 🧠 1. What is Express.js?

Express is a **small framework for Node.js** that helps you build web servers and APIs.

- **Node.js** lets JavaScript run outside the browser.
- **Express** sits on top of Node and makes web servers *easy to write*.

Think of a restaurant 🍽️:

- **Node.js** is the kitchen, with stoves, knives, and fire.
- **Express** is the head waiter. It takes orders, sends them to the right chef, and brings the food back.

---

## 🤔 2. Why do developers use it?

You *can* build a server with plain Node. Here is what that looks like:

```js
// ❌ Plain Node.js (no Express)
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Home page");
  } else if (req.url === "/about" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("About page");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(3000);
```

Now the same thing with Express:

```js
// ✅ Express
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Home page"));
app.get("/about", (req, res) => res.send("About page"));

app.listen(3000);
```

Shorter, cleaner, and readable. Now imagine 50 routes. 😮

Express gives you:

- ✅ Clean routing (which URL does what)
- ✅ Easy responses (`res.send`, `res.json`)
- ✅ Middleware (coming in Phase 2 👀)
- ✅ A huge ecosystem, and most Node backends use it

---

## ⚙️ 3. How does it work?

Every web interaction follows this cycle:

```
 Browser (Client)                         Your Express Server
       │                                         │
       │ ───── 1. REQUEST: "GET /about" ──────▶  │
       │                                         │  2. Express finds the
       │                                         │     matching route
       │                                         │  3. Your function runs
       │ ◀──── 4. RESPONSE: "About page" ─────── │
       │                                         │
```

Three key players:

| Name | What it is |
|------|-----------|
| `app` | Your Express application (the waiter 🧑‍🍳) |
| `req` | The **request**: what the client is asking for |
| `res` | The **response**: what you send back |

A **route** is a rule that says:

> "When someone asks for **this method** on **this path**, run **this function**."

```js
app.get("/about", (req, res) => { ... });
//  │      │            │
//  │      │            └── the handler: what to do
//  │      └── the path (URL)
//  └── the HTTP method
```

---

## 🛠️ 4. Let's build it in VS Code

### 🎯 Quest 1: Setup (+50 XP)

Open your terminal:

```bash
mkdir express-journey
cd express-journey
npm init -y
npm install express
```

What happened?

- `npm init -y` created a `package.json` (your project's ID card 🪪).
- `npm install express` downloaded Express into `node_modules/`.

Now create a file called **`server.js`** in that folder.

### 🎯 Quest 2: Your first server (+50 XP)

```js
// server.js
const express = require("express");

const app = express(); // create the app

// A route: GET request to "/"
app.get("/", (req, res) => {
  res.send("Hello from my first Express server! 🚀");
});

const PORT = 3000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

Run it:

```bash
node --watch server.js
```

> 💡 `--watch` restarts the server **automatically** every time you save. No more stopping and starting!

Open **http://localhost:3000** in your browser.

🎉 **If you see your message, you are officially a backend developer.** Seriously.

---

## 🔍 5. Understanding the important code

### `const app = express();`

`express()` is a function that creates your application. Everything (routes, settings, middleware) attaches to `app`.

### `app.get("/", handler)`

This registers a route:

- **`get`**: only responds to GET requests (what browsers send when you visit a URL)
- **`"/"`**: the home path
- **handler**: the function `(req, res) => { ... }` that runs when it matches

### `res.send(...)`

Sends a response and **ends** the request. You can send text, HTML, or even objects.

### `app.listen(PORT, callback)`

This makes your server **start waiting for requests**.

- **Port** = a numbered "door" on your computer. `3000` is a common choice for development.
- The callback runs **once**, when the server is ready.

> 🧩 Without `app.listen()`, your server never starts. It's like opening a restaurant but never unlocking the door. 🚪

---

## 📦 6. Three more tools you need

Before the challenges, learn these. They're all you need. 👇

### A) Sending HTML

```js
app.get("/welcome", (req, res) => {
  res.send("<h1>Welcome!</h1><p>This is HTML.</p>");
});
```

### B) Sending JSON (the language of APIs)

```js
app.get("/user", (req, res) => {
  res.json({ name: "Sam", age: 25, isDeveloper: true });
});
```

`res.json()` converts a JavaScript object into JSON and sets the correct headers for you. You will use this **constantly**.

### C) Setting a status code

```js
app.get("/secret", (req, res) => {
  res.status(403).send("You are not allowed here! 🚫");
});
```

Common status codes for now:

| Code | Meaning |
|------|---------|
| `200` | OK (default) |
| `201` | Created |
| `403` | Forbidden |
| `404` | Not found |
| `500` | Server error |

---

## 🐛 7. What happens with an unknown route?

Visit `http://localhost:3000/banana` in your browser. You'll see:

```
Cannot GET /banana
```

That's Express's default **404**: "I have no route for that."

You can create your own **catch-all** 404 at the **bottom** of your file:

```js
// ⚠️ Must be AFTER all your other routes
app.use((req, res) => {
  res.status(404).send("Oops! Page not found 😢");
});
```

> 🧠 **Order matters!** Express checks routes from **top to bottom**. If this catch-all were first, it would swallow every request. This idea is the seed of **middleware** (Phase 2).

---

## 🧯 8. Debugging cheat sheet

| Problem | Likely cause |
|---------|-------------|
| `Error: Cannot find module 'express'` | You forgot `npm install express`, or you're in the wrong folder |
| `EADDRINUSE: address already in use :::3000` | Another server is already running on that port. Stop it (`Ctrl + C`) or change the port |
| Browser shows `Cannot GET /something` | No route matches that path. Check your spelling |
| Browser keeps loading forever ⏳ | Your handler never called `res.send()` or `res.json()` |
| Changes don't appear | Server wasn't restarted. Use `node --watch` |

> 🏆 **Pro tip:** Reading error messages carefully is **half of being a developer**. Read them *slowly*, top to bottom.

---

## ✅ 9. Quick recap

- Express is a framework that makes Node servers easy.
- `app` = your application, `req` = the request, `res` = the response.
- `app.get(path, handler)` creates a route.
- `res.send()` sends text or HTML, and `res.json()` sends JSON.
- `res.status(code)` sets the status code.
- `app.listen(port)` starts the server.
- Routes are checked **top to bottom**.

---

# ⚔️ THE CHALLENGES

> You have everything you need. If something looks unfamiliar, it's plain JavaScript you already know (arrays, objects, functions). Use `res.send`, `res.json`, and `res.status`.
>
> **Rules:** Try on your own first. Hints are hidden below each challenge for when you're stuck. No full solutions until you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+100 XP`

**Goal:** Prove you understood the basics.

Create a **new file** `challenge1.js` with a server on **port 4000** that has these routes:

| Route | Response |
|-------|----------|
| `GET /` | Text: `Welcome to my server!` |
| `GET /about` | HTML with an `<h1>` that says your name |
| `GET /api/me` | JSON with your `name`, `country`, and an array of `skills` |

✅ **Success check:** All 3 routes work in your browser, and the console prints a "server running" message.

<details>
<summary>💡 Hint 1 (open only if stuck)</summary>

You need three `app.get(...)` calls. Each one has a different path and a different `res.` method.

</details>

<details>
<summary>💡 Hint 2</summary>

For the JSON route, build a normal JavaScript object with an array inside it, then pass it to `res.json()`.

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+150 XP`

**Goal:** Build something that feels like a real tiny API.

Create `challenge2.js` (port **5000**). You're building a **Movie Shelf API** 🎬.

Start with this data at the top of your file:

```js
const movies = [
  { id: 1, title: "Inception", year: 2010, rating: 8.8 },
  { id: 2, title: "Interstellar", year: 2014, rating: 8.7 },
  { id: 3, title: "The Dark Knight", year: 2008, rating: 9.0 },
];
```

Build these routes:

| Route | Behavior |
|-------|----------|
| `GET /` | A friendly HTML welcome page that mentions the number of movies (don't hardcode the number! 😉) |
| `GET /movies` | Returns **all** movies as JSON |
| `GET /movies/top` | Returns only the movie(s) with rating **above 8.7** |
| `GET /movies/count` | Returns JSON like `{ "count": 3 }` |
| *anything else* | Custom **404** with a status code of `404` and a message |

⚠️ **Think carefully:** does the order of your routes matter anywhere here?

✅ **Success check:**

- Adding a 4th movie to the array automatically updates `/`, `/movies/count`, and the top results. **No other code changes.**
- Visiting `/nonsense` shows your custom 404.
- In your browser's DevTools → Network tab, the 404 response really has status `404`.

<details>
<summary>💡 Hint 1</summary>

Use array methods you already know: `.length` and `.filter()`.

</details>

<details>
<summary>💡 Hint 2</summary>

For the HTML page, you can use a template literal with `${...}` inside the string you pass to `res.send()`.

</details>

<details>
<summary>💡 Hint 3</summary>

Where should the 404 handler go in your file, at the top or bottom? Think about "top to bottom."

</details>

---

## 🥇 CHALLENGE 3: Brain-Stretching · `+200 XP`

**Goal:** Combine everything. Think like a developer, not a follower.

Create `challenge3.js` (port **6000**). You're building a **Mini Server Dashboard** 🖥️ that reports information about *itself*.

**Requirements:**

1. `GET /` returns an HTML page with the title of your dashboard and **three links** to the other routes (clickable `<a>` tags).

2. `GET /time` returns JSON with the **current server time** in **two** formats: a readable string and a timestamp number. It must be *fresh on every request*. Refresh twice and the values must change.

3. `GET /random` returns JSON with a random integer **between 1 and 100** (inclusive). A new number on every visit.

4. `GET /uptime` returns JSON with **how many seconds the server has been running**. ⚠️ You must calculate this yourself using a value you store **when the server starts**. Don't use a built-in uptime function.

5. `GET /admin` always responds with a `403` status and an HTML message explaining the page is restricted.

6. Any unknown route returns a **404 JSON** response (not HTML!) shaped like this:

```json
{ "error": "Route not found", "status": 404 }
```

7. **Bonus 🌟 (+50 XP):** Keep a counter of how many total requests the `/random` route has received since startup, and include it in the response as `"timesCalled"`.

✅ **Success check:**

- Refreshing `/time`, `/random`, and `/uptime` shows changing values every time.
- `/uptime` increases by roughly the seconds that passed between refreshes.
- `/admin` shows your message **and** DevTools shows status `403`.
- The bonus counter increases: 1, 2, 3...

🧠 **Where to think:**

- Where should "start time" be stored: **inside** a route handler, or **outside** it? What happens in each case?
- How do you generate a random integer in a range with plain JS?
- Which `Date` method gives you a timestamp number?

<details>
<summary>💡 Hint 1 (uptime)</summary>

Create a variable *outside* every route, right when the file loads. Inside the route, subtract it from the current time.

</details>

<details>
<summary>💡 Hint 2 (random number)</summary>

`Math.random()` gives a decimal from 0 to just below 1. You need to scale it, round it down, and shift it so the range starts at 1.

</details>

<details>
<summary>💡 Hint 3 (counter bonus)</summary>

A variable declared outside the route keeps its value between requests. A variable declared *inside* is reborn every time. 👀

</details>

---

## 🏁 YOUR TURN!

Here's your XP board:

| Quest | XP |
|-------|----|
| Setup (npm + install) | 50 |
| First server running | 50 |
| Challenge 1 🥉 | 100 |
| Challenge 2 🥈 | 150 |
| Challenge 3 🥇 | 200 |
| Bonus 🌟 | 50 |
| **Total possible** | **600 XP** |

**What to send me next:**

1. Your code for each challenge (paste it in a code block)
2. What worked ✅
3. What confused you or broke ❌ (paste the exact error if you got one)

I'll review your solutions, explain your mistakes instead of just fixing them, and then we unlock **Lesson 2** (the `req` object, route parameters, and query strings 👀).

**Go build. I'm waiting.** 💪🔥