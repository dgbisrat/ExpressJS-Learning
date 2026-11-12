> 📌 **Honest note:** You now have **670 XP waiting** in unsolved challenges. Reading gives you ideas, but only coding gives you skill. Here is Lesson 4. Please clear the Boss Battle **before Lesson 5**. 💪

# 🟡 Level 2, Lesson 4: Middleware

## 🤔 The "Why"

**Problem:** You want to log every request. Or check a login on 10 different routes. Do you copy the same code into every route?

```js
app.get("/a", (req, res) => { console.log("log"); res.send("A"); });
app.get("/b", (req, res) => { console.log("log"); res.send("B"); });  // 😵 repeat, repeat
```

If you change the log later, you must change it in 10 places. This is how bugs are born.

**Solution:** write the code **once**, and let every request pass through it.

**Middleware** = a function that runs **between** the request arriving and the response being sent. It gets three things: `req`, `res`, and `next`.

## 🧠 Mental Model

> ✈️ **An airport.** You (the request) walk through checkpoints: ticket check, then security, then passport, then the gate.
>
> Each checkpoint can:
> - **Let you pass** → call `next()`
> - **Stop you** → send a response (no `next()`)

```
Request → [logger] → [check key] → [route] → Response
              ↓            ↓
           next()       or STOP: "401 Unauthorized"
```

## 💻 Tiny Example

```js
const express = require("express");
const app = express();

// Middleware
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};

app.use(logger);

app.get("/", (req, res) => {
  res.send("Home");
});

app.get("/about", (req, res) => {
  res.send("About");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Visit `/` and `/about`. Your terminal prints `GET /` and `GET /about`.

**Line by line:**
- `(req, res, next) => {...}`: the shape of a middleware. The third argument, `next`, is a function.
- `console.log(...)`: our work. We look at the request.
- `next()`: "I am done. Pass the request to the **next** thing in the list."
- `app.use(logger)`: add the function to the list. **For every method and every path.**

## 🔬 Under the Hood

**1. Remember the list from Lesson 1?**
Express keeps **one list**. Until now, only routes were in it. Now we reveal the full truth: **middleware and routes live in the same list**, in the order you wrote them.

```
List (top to bottom):
 1. app.use(logger)       → matches ANY method, ANY path
 2. app.get("/")          → matches only GET "/"
 3. app.get("/about")     → matches only GET "/about"
```

Each item is one **layer**.

**2. What does `next()` really do?**
It is not magic. It means: *"Express, move to the next layer in the list that matches this request."*

```
Request: GET /about
   ↓
Layer 1: logger matches (any request) → runs → calls next()
   ↓
Layer 2: GET "/" ? no ❌ skip
   ↓
Layer 3: GET "/about" ? yes ✅ → runs → res.send("About")
   ↓
Response closed.
```

**3. What changes if you never call `next()`?**
Express waits for you. Nobody moves forward. Nobody sends a response. The browser waits forever. ⏳

**4. `req` and `res` are the SAME objects all the way.**
The logger and the route get **the same `req`**. So a middleware can add something to `req`, and the route can use it:

```js
app.use((req, res, next) => {
  req.startedAt = Date.now();   // add a new property
  next();
});

app.get("/", (req, res) => {
  res.send(`Started at ${req.startedAt}`);  // read it here
});
```

This is how login systems work later: a middleware finds the user and saves it on `req.user`. Remember this idea. 🔑

**5. Middleware can STOP the request:**

```js
const checkKey = (req, res, next) => {
  if (req.headers["x-api-key"] !== "123") {
    return res.status(401).send("No key, no entry");
  }
  next();
};
```

- Wrong key: we send a response and **return**. The route never runs.
- `return` matters: it ends the function so `next()` below is not called after the response (that would try to continue and cause trouble).

**6. Middleware for ONE route only:**
Put it **between** the path and the final function:

```js
app.delete("/books/:id", checkKey, (req, res) => {
  res.send("Deleted");
});
```

Express runs `checkKey` first, then the last function (if `next()` was called). You can put many.

**7. Built-in middleware: `express.json()`**
In Lesson 2, `POST` just sent text. Real `POST` requests carry **data** in the **body**: for example `{ "title": "Dune" }`.

- **Body** = the data part of a request, sent after the headers.
- The body arrives in pieces (a stream) as **raw text**. Express does not read it for you by default.

`express.json()` is a middleware that does this work:

```
Raw text arrives:  '{"title":"Dune"}'
   ↓ express.json() collects the pieces, runs JSON.parse
   ↓
req.body = { title: "Dune" }
```

```js
app.use(express.json());

app.post("/books", (req, res) => {
  res.send(req.body);   // echo back what the client sent
});
```

Send this with Thunder Client: method `POST`, body type JSON, `{"title": "Dune"}`.

## 💥 What Breaks?

| If you... | What happens | Why |
|---|---|---|
| Forget `next()` in a middleware | Request hangs ⏳ | Nobody continues the chain or responds |
| Put `app.use(logger)` **after** the routes | The logger does not run for matched routes | First match wins. The route already sent the response |
| Call `next()` **and** `res.send()` in a middleware, then the route sends too | "Cannot set headers after they are sent" | Two responses for one request (Lesson 2) |
| Remove `app.use(express.json())` | `req.body` is `undefined` | Nobody turned the raw text into an object |
| Send a POST body without `Content-Type: application/json` | `req.body` is empty | `express.json()` only parses when this header says JSON |
| Put `express.json()` **after** the POST route | `req.body` is `undefined` | Order matters. The route ran before the parser |

> 📝 **Note:** The order of `app.use` is one of the most important ideas in Express. Draw the list on paper when something looks strange.

---

## 🎮 Your Challenges

Type all the code yourself. ⌨️

**⚔️ Challenge 1: Foundation (30 XP)**
Write a `logger` middleware. It prints: `[time] METHOD /path`. Use `new Date().toISOString()` for the time. Apply it to **all** routes. Test with two or three routes from earlier lessons.

**⚔️ Challenge 2: Real-world (50 XP)**
Write a `checkKey` middleware (use the code idea above). Apply it to **only** `DELETE /books/:id`, not to `GET` routes. Test three cases:
1. No key header → 401
2. Wrong key → 401
3. Key `123` → works

Then answer: *why does `GET /books` still work with no key?*

**⚔️ Challenge 3: Stack it all 🧠 (80 XP)**
Use **Lessons 1 to 4**. Extend your book API:

1. A middleware counts all requests and saves the number on `req.requestNumber`.
2. `GET /books` sends `{ requestNumber: ..., books: [...] }`.
3. Add `express.json()`.
4. `POST /books` reads `req.body`. If `title` or `author` is missing → status **400** with a message. If good → add the book to the array with a new id, and send status **201** with the new book.
5. Test that `GET /books` shows the new book. ✅
6. Keep `GET /books/:id`, `GET /books/latest` (careful with order!), and `DELETE` with `checkKey`.

**Bonus XP:**
- 🏆 +10 XP per challenge with no hint
- 🧠 +20 XP explain back: *"What is `next()`? What happens if I forget it?"*

## 🪜 Stuck?

Struggle **20 minutes** first:
- Add `console.log("middleware 1")`, `console.log("middleware 2")`, `console.log("route")`. The **order in the terminal** shows you the real order of the list.
- Check `console.log(req.body)` right at the top of your POST route.
- Then ask for `Hint 1`.

Commit: `git commit -m "Lesson 4: middleware"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (+830 XP waiting for you!) | Day 1 |

**⏭️ Next:** Lesson 5, **Error-handling middleware**: the special 4-argument function, `next(err)`, and how to make your API fail in a clean way. 🛡️