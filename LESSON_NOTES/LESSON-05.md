# 🟡 Level 2, Lesson 5: Built-in and Third-Party Middleware

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end.

> 📌 Your Lesson 3 Boss Battle and Lesson 4 challenges are still waiting for you. Stuck on one? Struggle 20 minutes, then send me what you tried. 💪

## 🤔 The "Why"

In Lesson 4 you wrote your own middleware. But many jobs are the **same in every project**: read JSON, read form data, log requests, allow other websites to call your API.

Nobody should rewrite these each time. So Express and the community give us **ready-made middleware**.

**Built-in** = comes inside Express. **Third-party** = a package you install from npm.

## 🧠 Mental Model

> 🧰 **A toolbox for your airport checkpoints.** Each tool is a station you can plug into the line: `express.json()`, `express.urlencoded()`, `morgan`, `cors`.

Every one of them is **just a function** `(req, res, next)`. You already know how they work. 🔑

---

## 🔬 Part 1: A Surprise About Parentheses

Look closely:

```js
app.use(express.json());   // with ()
```

But in Lesson 4 you wrote `app.use(logger)` without `()`. Why?

`express.json()` is a **factory**: a function that **returns** a middleware function. It lets you pass settings.

```js
function logger(prefix) {            // factory
  return (req, res, next) => {       // the real middleware
    console.log(prefix, req.method, req.url);
    next();
  };
}

app.use(logger("[MY APP]"));
```

- `logger("[MY APP]")` runs **once** at startup. It returns the middleware.
- The returned function runs **on every request**. It remembers `prefix` (this is a JavaScript **closure**, from your JS course).

**What breaks?** Write `app.use(logger)` without calling it. Express would call `logger(req, res, next)`, so `prefix` becomes the request object, and `next` is never called. The page hangs. ⏳

### ⚡ Mini Challenge 1 (20 XP)
Create `lesson5.js`. Write a factory `requireHeader(name)`:
- It returns a middleware that checks `req.get(name)`.
- If the header is missing → `400` with `{ error: "Missing header: <name>" }`.
- Otherwise → `next()`.

Use it on `GET /protected` with `requireHeader("x-token")`. Test with and without the header using `curl -H "x-token: abc" ...`.

---

## 🛠️ Part 2: `express.json()` Revisited (Open the Box)

You used it in Lesson 2. Now you can understand it. It does this:

```
Request arrives with body bytes (in small chunks)
   ↓
Check header: Content-Type: application/json ?
   ├─ NO  → skip, call next()  (req.body stays empty/undefined)
   └─ YES → collect all chunks → join → JSON.parse → req.body = result → next()
```

A plain-Node version (type it and run it in a new file `raw-body.js`):

```js
const http = require("http");

http.createServer((req, res) => {
  let data = "";
  req.on("data", (chunk) => { data += chunk; });
  req.on("end", () => {
    console.log("Raw text:", data);
    res.end("got it");
  });
}).listen(3001);
```

- `req.on("data", fn)`: Node calls `fn` each time a **chunk** of the body arrives.
- `req.on("end", fn)`: Node calls `fn` when **all chunks** have arrived.

Test: `curl -X POST -d "hello" http://localhost:3001`

**What breaks?**
- Send invalid JSON to an Express app with `express.json()` (`{ bad json`). Express answers with an error (status 400). The JSON parser **fails safely** and the request never reaches your route.
- Send a body with `Content-Type: text/plain` → the JSON parser skips it. `req.body` is not filled.

### ⚡ Mini Challenge 2 (20 XP)
1. Run `raw-body.js` and send three different bodies with curl.
2. Send a **big** body (paste a long text). Do you see "Raw text" printed once or many times? Why? *(Think about chunks and `"end"`.)*

---

## 🛠️ Part 3: `express.urlencoded()` (HTML Forms)

HTML forms don't send JSON. A form sends text like this:

```
name=Bisrat&age=20
```

The label is `Content-Type: application/x-www-form-urlencoded`. This middleware reads that text and turns it into an object.

```js
app.use(express.urlencoded({ extended: false }));

app.post("/contact", (req, res) => {
  console.log(req.body);
  res.send(`Thanks, ${req.body.name}!`);
});
```

Put this in `public/form.html` (with `express.static` from Lesson 3):

```html
<form action="/contact" method="POST">
  <input name="name" placeholder="Your name" />
  <input name="age" placeholder="Your age" />
  <button>Send</button>
</form>
```

**Key detail:** the `name="..."` attribute on each input becomes the **key** in `req.body`. No `name` → the field is not sent.

**What breaks?**
- Remove `express.urlencoded(...)` → `req.body` is empty/`undefined`. The raw text arrives but nobody parsed it.
- Remove `name="age"` from the input → `req.body.age` is `undefined`.

### ⚡ Mini Challenge 3 (20 XP)
Build the form above. Then:
1. Submit it and look at `req.body` in the terminal.
2. Send the same form data with curl: `curl -X POST -d "name=Sara&age=22" http://localhost:3000/contact`
3. Now send JSON to the same route. Does `req.body` work? Why or why not? *(What do you need so **both** formats work?)*

---

## 🛠️ Part 4: `morgan` (Professional Logging)

Install: `npm install morgan`

```js
const morgan = require("morgan");
app.use(morgan("dev"));
```

Output example:

```
GET /notes 200 3.512 ms - 120
```

That's method, URL, status, response time, response size. You wrote something like this in Lesson 4!

**Under the hood:** `morgan` does **not** log at once. It remembers the start time, calls `next()`, then **waits until the response is finished**. Only then it knows the status code and total time, so it prints. 🤯 This is the same idea as the "2 and 4 come at the end" brain stretch from Lesson 4.

**What breaks?** Put `morgan` **below** your routes. Routes that already responded never reach it, so there are **no logs**. Order matters!

### ⚡ Mini Challenge 4 (15 XP)
1. Add `morgan("dev")` as the very **first** middleware.
2. Visit a route that exists, one that doesn't (404), and one that sends status 418. Compare the logs.
3. Change `"dev"` to `"tiny"` and then `"combined"`. What is different?

---

## 🛠️ Part 5: `cors` (Why Your Frontend Can't Reach Your API)

**Problem:** you build a React app on `localhost:5173` and an API on `localhost:3000`. React calls the API and gets this in the browser console:

```
Blocked by CORS policy
```

**Why?** Browsers have a safety rule called the **same-origin policy**: a page can only **read** responses from its **own origin**. An origin = protocol + domain + **port**. `5173` and `3000` are different origins.

**The surprising truth:** the request **still reaches your server**, and your server **still runs your route**. The **browser** hides the result from the page. Only the server can give permission, by adding a header:

```
Access-Control-Allow-Origin: http://localhost:5173
```

The `cors` package adds this header for you.

Install: `npm install cors`

```js
const cors = require("cors");

app.use(cors());                                      // allow ANY origin (fine for learning)
// app.use(cors({ origin: "http://localhost:5173" })) // allow ONE origin (safer)
```

**Under the hood:** `cors` is a middleware that sets the `Access-Control-Allow-*` headers. For special requests, the browser first sends a "preflight": an `OPTIONS` request that asks "may I?" `cors` answers that with status 204 and **stops the chain** (no `next()`). You now know exactly why!

### ⚡ Mini Challenge 5 (30 XP): Cause the error yourself 😈
1. In VS Code, create `client/index.html` that does:
   ```html
   <script>
     fetch("http://localhost:3000/notes")
       .then(r => r.json())
       .then(data => console.log(data));
   </script>
   ```
2. Open it with the **Live Server** extension (it runs on port 5500).
3. Open DevTools → Console. See the CORS error. Then check your **server terminal**: did the request arrive? (Yes! That is the surprise.)
4. Add `app.use(cors())` to the server. Refresh. See the data. ✅
5. Change it to `cors({ origin: "http://localhost:9999" })`. What happens now? Why?

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Create a **Contact Form app**:
- `public/index.html` has a form (`name`, `email`, `message`)
- `POST /contact` saves the form in an array
- `GET /messages` returns all saved messages as JSON
- Use `morgan("dev")` and `express.urlencoded`
- If any field is empty → status `400` with a clear message

**⚔️ Challenge 2: Real-world (40 XP)**
Upgrade your **Notes API** (Lesson 2 and 4):
- Add `morgan`, `cors` (only for `http://localhost:5500`), and `express.json()`
- Your own factory `requireHeader("x-api-key")` protects `POST`, `PUT`, `DELETE`
- Build a small page in `client/` (Live Server) that loads notes with `fetch`
- Prove that a request from a **different origin** (change the cors origin) gets blocked

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Your API has **no** `cors`. A page on `localhost:5500` runs:

```js
fetch("http://localhost:3000/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello" }),
});
```

1. **Predict:** does the note get **added** to the array? Does the page see the response?
2. How many requests does the server see (look at morgan)? What methods are they?
3. Test and explain **why**. *(Hint to think about: this is a "non-simple" request. What does the browser send first?)*

**⚔️ Challenge 4: Build Your Own `express.json()` (60 XP)** 🛠️
In **plain Node** (no Express), write a function `parseJson(req, res, next)` that:
- reads the body with `req.on("data")` and `req.on("end")`
- uses `JSON.parse` inside `try/catch`
- sets `req.body`
- on bad JSON, sends status `400` and **stops** (no `next()`)

Plug it into your `mini.js` chain from Lesson 4. 🏆

**🐞 Bug Hunt (30 XP):** find **3 bugs** before running:

```js
const express = require("express");
const cors = require("cors");
const app = express();

app.post("/notes", (req, res) => {
  res.status(201).json({ saved: req.body.text });
});

app.use(express.json);
app.use(cors());

app.listen(3000);
```

*(Look at: order, parentheses, and what happens to the first line of `req.body`.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"What is CORS, and who actually blocks the request: the server or the browser?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Use DevTools **Network** tab and `console.log(req.headers)` to see what really arrives.
2. Ask: *"What did the browser send? What did the server answer?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 5: builtin and 3rd party middleware"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 2 (Middleware) | 0 (pile waiting: **~1000 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 6, **Error-handling middleware** (the special 4-argument function) and **👹 Boss Battle #2**.

Send me your code and I'll review it. 🚀