# 🟢 Level 1, Lesson 2: Routes and HTTP Methods

> 📌 Your Lesson 1 challenges are still open (+100 XP waiting). Do them when you can. This lesson builds on them.

## 🤔 The "Why"

**Problem:** A website has one URL, like `/books`. But users want to do many things with it: **see** books, **add** a book, **change** a book, **delete** a book.

Same address. Different actions. How does the server know which one?

**Answer:** The **HTTP method**.

**HTTP method** = a word in the request that says *what kind of action* the client wants.

## 🧠 Mental Model

> 📬 **URL = the address.** **Method = the verb.**
>
> Same address, "/books", but:
> - `GET` = "Show me"
> - `POST` = "Add new"
> - `PUT` = "Replace it"
> - `DELETE` = "Remove it"

| Method | Meaning | Example |
|---|---|---|
| `GET` | Read data | Show all books |
| `POST` | Create data | Add a new book |
| `PUT` | Update data | Change a book |
| `DELETE` | Delete data | Remove a book |

A **route** = one method + one path + one function. Express matches **both** method and path.

## 💻 Tiny Example

```js
// lesson2.js
const express = require("express");
const app = express();

app.get("/books", (req, res) => {
  res.send("Showing all books");
});

app.post("/books", (req, res) => {
  res.send("Adding a book");
});

app.put("/books", (req, res) => {
  res.send("Updating a book");
});

app.delete("/books", (req, res) => {
  res.send("Deleting a book");
});

app.listen(3000, () => console.log("Running on 3000"));
```

**Line by line:**
- `app.get("/books", fn)`: save a route. Run `fn` only when the method is `GET` **and** the path is `/books`.
- `app.post(...)`, `app.put(...)`, `app.delete(...)`: same idea, other methods.
- Four routes share one path. Express tells them apart by **method**.

## 🧪 How to Test Non-GET Routes

When you type a URL in the browser, it **always sends GET**. So you cannot test `POST` there.

Use one of these:
- **Thunder Client** (VS Code extension) or **Postman**
- **curl** in the terminal:

```bash
curl -X POST http://localhost:3000/books
curl -X DELETE http://localhost:3000/books
```

## 🔬 Under the Hood

**1. `app.get` is a shortcut.**
Inside Express, every method works the same way. It adds one item to the route list, now with the method saved:

```
[ GET    "/books" → fn1,
  POST   "/books" → fn2,
  PUT    "/books" → fn3,
  DELETE "/books" → fn4 ]
```

**2. The `req` object is Node's request, plus extras.**
In Lesson 1 you saw `req.method` and `req.url` in raw Node. Express uses the **same object** and adds helpers on top. That is why this works in both:

```js
req.method   // "POST"
req.headers  // all headers the client sent
```

Express adds more, like `req.path`, which is the URL **without** the `?query` part.

**3. The flow for `POST /books`:**

```
Client: POST /books
   ↓
Node receives it → calls app(req, res)
   ↓
Express walks the list from the top
   ↓
GET /books?     method ≠ POST ❌ skip
POST /books?    both match ✅
   ↓
Runs fn2 → res.send("Adding a book")
   ↓
Express STOPS looking. First match wins.
```

**4. One request = one response.**
After `res.send()`, the response is closed. If you call `res.send()` a second time, Node crashes that request with this error:

```
Cannot set headers after they are sent to the client
```

Why? A response has headers first, then the body. Once the body starts, you cannot change headers anymore. Remember this error. You will meet it many times. 👀

**5. Bonus tools:**
- `app.all("/books", fn)` runs for **every** method on that path.
- `res.send({ name: "Bisrat" })`: when you pass an object, Express turns it into JSON and sets `Content-Type: application/json` for you.

## 💥 What Breaks?

| If you... | What happens | Why |
|---|---|---|
| Visit `/books` in the browser, but only `app.post("/books")` exists | `Cannot GET /books` | Browser sends GET. The list has no GET route |
| Write `app.get("/Books")` and visit `/books` | Usually still matches | Express path matching ignores letter case by default |
| Call `res.send()` twice in one route | Error: "Cannot set headers after they are sent" | The response already closed after the first send |
| Add a trailing slash and visit `/books/` | Usually still matches | Express ignores a trailing slash by default |
| Use `app.get` twice for the same path | First one wins | Express stops at the first match (you saw this in Lesson 1) |

> 🧪 Test at least three of these yourself.

---

## 🎮 Your Challenges

Type all the code. No copy and paste. ⌨️

**⚔️ Challenge 1: Foundation (30 XP)**
Build routes for `/movies` with all four methods: `GET`, `POST`, `PUT`, `DELETE`. Each returns a different text. Test **all four** with Thunder Client, Postman, or curl.

**⚔️ Challenge 2: Real-world (40 XP)**
Add a route `GET /info`. It must send back an **object** with three things:
- the request method
- the request path
- the `user-agent` header

Hint: headers are inside `req.headers`, and the names are lowercase. *(Only Hint 0: read the table above. Ask if you need more.)*

**⚔️ Challenge 3: Bug Hunt 🐛 (60 XP)**
This code has **3 bugs**. Find them all **without running it first**. Then run it and check.

```js
const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  res.send("All users");
  res.send("Done");
});

app.post("/users", (req, res) => {
  console.log("Creating user");
});

app.get("/users", (req, res) => {
  res.send("Second users route");
});

app.listen(3000);
```

For each bug, tell me:
1. Where it is
2. What happens when a client calls it
3. **Why** it happens

**Bonus XP:**
- 🏆 +10 XP per challenge with no hint
- 🧠 +20 XP for a good explain-back: *"In my own words, how does Express choose which function to run?"*

## 🪜 Stuck?

Struggle **20 minutes** first. Try:
- Run the code. Read the error line by line.
- Add `console.log("route hit")` inside each route. See which ones run.
- Ask: *"What did I expect? What happened?"*

Then ask for `Hint 1`.

Commit: `git commit -m "Lesson 2: routes and methods"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (+230 XP waiting for you!) | Day 1 |

**⏭️ Next lesson:** Lesson 3, Route Parameters and Query Strings (`/users/42` and `/search?name=ali`). Then comes your first **Boss Battle** ⚔️🔥