# 🚀 Express.js Quest, Lesson 1: What is Express & Life Before It

**Level 1 · Reward: 100 XP**

Hey Bisrat! This lesson covers the first four parts of the video: intro, what Express is, life before Express, and your first app. Most of it happens in VS Code. 💻

---

## 📝 Notes (copy into `lesson1.md`)

### What is Express.js?
Express is a **minimal web framework for Node.js**. It sits on top of Node's built-in `http` module and makes it easier to:
- handle **routes** (URL + method)
- read **requests** and send **responses**
- plug in **middleware**

> 🧠 Express is **not** a new language or a separate server. It is JavaScript code that wraps Node's `http` module.

### Before Express (raw Node)
With plain Node you had to do everything by hand:
- check `req.url` and `req.method` with `if/else`
- set headers yourself
- write status codes yourself
- end the response yourself with `res.end()`

Every new route meant more `if` blocks. 😵

---

## 🛠️ Step 1: Setup

```bash
mkdir express-quest
cd express-quest
npm init -y
```

Open the folder in VS Code. Create a folder `lesson1` for today's files.

---

## ⚔️ Step 2: The old way (raw Node)

Create `lesson1/raw.js` and **type this yourself** (don't paste!):

```js
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Home page");
  } else if (req.url === "/about" && req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("About page");
  } else {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("Raw server running on port 3000");
});
```

Run it: `node lesson1/raw.js`. Then open `http://localhost:3000` and `http://localhost:3000/about`.

### 🔍 Under the hood
- `http.createServer(callback)` creates a server. Node calls your callback **every time a request arrives**.
- `req` is an object describing what the client sent (URL, method, headers).
- `res` is an object you use to build the reply. Nothing is sent until you call `res.end()`.
- `server.listen(3000)` tells the OS: "send traffic for port 3000 to this program."

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Without Googling, add a `/contact` route to `raw.js` that replies `"Contact page"`. Then count how many lines you had to write for **one** new route. Remember that number. 👀

---

## ⚔️ Step 3: The Express way

Install Express:

```bash
npm install express
```

> 🧠 **What just happened?** npm downloaded Express into `node_modules/` and added it to `dependencies` in `package.json`. That is how `require("express")` knows where to look.

Create `lesson1/app.js`:

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.listen(3000, () => {
  console.log("Express server running on port 3000");
});
```

(Stop the raw server first with `Ctrl + C`, or the port will be busy.)

### 🔍 Under the hood
- `express()` returns `app`, which is really a **function** shaped like `(req, res) => {...}`. That is why Express can hand it to Node's `http` server.
- `app.get(path, handler)` registers: "when a **GET** request comes for this **path**, run this handler."
- `res.send()` sets the status (200), guesses the `Content-Type`, and ends the response for you. It does all the lines you wrote by hand in `raw.js`.
- `app.listen()` is a shortcut: it calls `http.createServer(app).listen(...)` internally.

### 🎯 Mini Challenge 2 (⚡ 20 XP)
Add `/contact` to `app.js`. Compare the number of lines with Mini Challenge 1. Which felt better?

---

## 🧪 Quick Check (answer in your own words, no Googling)

1. What does `res.send()` do for you that `res.end()` doesn't?
2. Why can `app` be passed to `http.createServer`?
3. What happens if you visit a route you never defined in Express? (Try it, then look at the response.)

---

## 🏆 Main Challenges

Do these **in VS Code**. Struggle for about 20 minutes before asking for help. If you get stuck, I'll give you hints, not the solution. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson1/challenge1.js`, an Express server on port **4000** with:
- `GET /` → `"Welcome to my server"`
- `GET /hello` → `"Hello, Express!"`
- `GET /bye` → `"Goodbye!"`

Test all three in the browser.

### 🟡 Challenge 2: Real-world (60 XP)
Create `lesson1/challenge2.js`. Build a small "portfolio" server:
- `GET /` → an HTML welcome message with an `<h1>` containing your name
- `GET /skills` → a list of your skills (an HTML `<ul>`)
- `GET /projects` → a list of 3 projects you built

Then **look at the Network tab** in the browser DevTools. What `Content-Type` did Express send? Write the answer in a comment in your file.

### 🔴 Challenge 3: Brain-stretcher (100 XP)
Create `lesson1/challenge3.js` and **write the same 3-route server twice**:
- once with raw `http` (`/`, `/about`, and a 404)
- once with Express

Then answer in comments at the top of the file:
1. How does the raw version decide a route does not exist?
2. What 404 does Express send automatically?
3. Name **two things** Express did for you that raw Node didn't.

> 💡 Hint: open DevTools and compare the response **headers** from both versions.

---

## 🧗 Final Steps

1. ✅ **Commit to GitHub**: `git add . && git commit -m "lesson 1: first express app"`
2. 🗣️ **Explain it back**: in 3 to 4 sentences, tell me why Express exists.
3. 📊 Tell me how long each challenge took you.

---

**Send me:** your code for Challenges 1 to 3 (or where you got stuck), plus your explain-back. Then I'll review it, award your XP, and unlock **Lesson 2: Basic Routing** 🔓

Ready? Start with Step 1. Go! 🔥