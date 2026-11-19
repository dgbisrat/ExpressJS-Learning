# 🗺️ Your Express.js Roadmap

| Level | Phase | What you learn | Mini project |
|---|---|---|---|
| 🟢 1 | Fundamentals | What Express is, routes, `req` and `res`, params, query | Notes API in memory |
| 🟡 2 | Middleware | How the request pipeline works, custom middleware | Request logger and validator |
| 🟠 3 | Architecture | Router, controllers, error handling, env vars | Structured blog API |
| 🔵 4 | Express + MongoDB | Mongoose, CRUD, relations | Task manager API |
| 🟣 5 | Auth and Security | JWT, hashing, roles, rate limiting | Secure user system |
| 🔴 6 | Professional | Testing, validation, logging, deployment | Deploy a real API |
| ⚫ 7 | Mastery | Big projects, performance, design choices | Full capstone |

**Rules of the game:**
- 🎯 One lesson at a time. I stop and wait for you.
- 🪜 Stuck? Struggle **20 minutes** first. Then I give Hint 1, Hint 2, Hint 3. Full solution only if you say `show solution`.
- ⚔️ Boss Battle every 3 lessons.
- 💾 Commit your code to GitHub after every lesson.

> 💡 If you already know some of this, say `skip` and we jump ahead.

---

# 🟢 Level 1, Lesson 1: What Is Express?

## 🤔 The "Why"

**Problem:** Node.js can already make a web server. So why do we need Express?

Let's build a server **without** Express and feel the pain.

## 🧱 Without Express (raw Node)

First, three words:
- **Server**: a program that waits for requests and sends back answers.
- **Request (`req`)**: the message the browser sends. It says "I want this page."
- **Response (`res`)**: the message you send back.

```js
// raw-server.js
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Home page");
  } else if (req.method === "GET" && req.url === "/about") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("About page");
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("Running on 3000"));
```

**Line by line:**
- `require("http")`: loads Node's built-in tools for talking over HTTP.
- `http.createServer(fn)`: makes a server. Node will call `fn` **every time a request arrives**.
- `req.method` and `req.url`: what the browser asked for (`GET`, `/about`).
- `res.statusCode`: a number that says how it went (200 = OK, 404 = not found).
- `res.setHeader(...)`: tells the browser what kind of data is coming.
- `res.end(...)`: sends the body and **closes** the response.
- `server.listen(3000)`: opens port 3000 and starts waiting.

**The pain:** 20 routes means 20 `else if` blocks. You write headers by hand every time. You parse everything yourself. It gets messy fast. 😵

## 🧠 Mental Model

> 🍽️ **Raw Node** = a restaurant with one door and no staff. You greet, take the order, cook, and serve every customer yourself.
>
> **Express** = you hire a **manager**. The manager reads each order and sends it to the right waiter. You only write what each waiter does.

## ✨ With Express

Setup first:

```bash
mkdir express-journey && cd express-journey
npm init -y
npm install express
```

- `npm init -y` creates `package.json` (the project's ID card).
- `npm install express` downloads Express into `node_modules`.

```js
// express-server.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Same result. Much cleaner. But **how** does it work? Let's open the box. 🔍

## 🔬 Under the Hood (no magic!)

**1. `express()` returns a function.**
`app` is not a special object only. It is a **function** with the shape `(req, res) => {...}`. That is exactly what `http.createServer` wants!

**2. `app.listen(3000)` is a shortcut.**
It does this:

```js
const http = require("http");
http.createServer(app).listen(3000);
```

So Express **is still using Node's http module**. Express is a layer on top, not a replacement.

**3. `app.get("/about", fn)` only stores information.**
Express keeps a list inside `app`:

```
[ GET "/"      → fn1,
  GET "/about" → fn2 ]
```

Nothing runs yet. It just saves the route.

**4. When a request arrives, the flow is:**

```
Browser: GET /about
   ↓
Node http server receives it, calls app(req, res)
   ↓
Express walks the list from top to bottom
   ↓
Finds: method = GET and path = "/about"  ✅
   ↓
Calls your function fn2(req, res)
   ↓
res.send("About page")
   ↓
Browser shows: About page
```

**5. `res.send()` does the boring work for you.**
It sets `Content-Type`, calculates `Content-Length`, sets status 200, then calls `res.end()`.

**6. No match?** Express reaches the end of the list and sends its own 404: `Cannot GET /xyz`.

## 💥 What Breaks?

| If you... | What happens | Why |
|---|---|---|
| Remove `res.send(...)` from a route | Browser **loads forever** ⏳ | Nobody ends the response, so the browser waits |
| Visit `/contact` (no route) | `Cannot GET /contact` | The list has no match, so Express uses its default 404 |
| Remove `app.listen(...)` | Program exits at once | Nothing opens the port, so nothing keeps Node alive |
| Change `app.get` to `app.post` for `/about` | Browser visit gives 404 | Browsers send `GET` when you type a URL. The method must match |

> 🧪 **Try each one yourself.** Seeing it break teaches more than reading about it.

---

## 🎮 Your Challenges

Type everything yourself. Do not copy and paste. ⌨️

**⚔️ Challenge 1: Foundation (20 XP)**
Write a **raw Node** server with three routes:
- `GET /` → "Welcome"
- `GET /hello` → "Hello, Bisrat"
- anything else → status 404 with "Page not found"

**⚔️ Challenge 2: Real-world (30 XP)**
Rewrite the same server in **Express**. Then answer in your own words: *who calls your route function, and when?*

**⚔️ Challenge 3: Brain stretch (50 XP)**
Predict first, then test. Your Express app has these routes in this order:

```js
app.get("/", (req, res) => res.send("A"));
app.get("/", (req, res) => res.send("B"));
```

1. What does the browser show for `/`?
2. Why? Use the "list" idea from above.
3. What happens to route B?

**Bonus XP:**
- 🏆 +10 XP per challenge solved with **no hint**
- 🧠 +20 XP for a good explain-back at the end

## 🪜 If You Get Stuck

1. Struggle for **20 minutes**. Read the error. Add `console.log` to see what runs.
2. Ask yourself: *"What did I expect? What happened instead?"*
3. Then ask me for `Hint 1`.

Don't forget: `git commit -m "Lesson 1: raw server vs express"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 | Day 1 |

**⏭️ Next lesson:** Lesson 2, Routes and HTTP Methods (`GET`, `POST`, `PUT`, `DELETE`) and the `req` object in depth.

Send me your code when you finish. I'll review it. 🚀