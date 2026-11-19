# 🧭 Lesson 3: Advanced Routing

**Level 2 · Reward: 200 XP**

Today your routes get **dynamic**. Instead of one route per user, you write one route for **all** users. 🔥

---

## 📝 Notes (copy into `lesson3.md`)

### Route parameters
A **route parameter** is a part of the URL that changes. You mark it with a colon.

```js
app.get("/users/:id", (req, res) => {
  res.send(`User id is ${req.params.id}`);
});
```

| URL | `req.params` |
|---|---|
| `/users/5` | `{ id: "5" }` |
| `/users/abc` | `{ id: "abc" }` |

> ⚠️ **Params are always strings.** `"5"` is not `5`. This causes real bugs.

### Multiple handlers and `next()`
A route can have **more than one function**. The first one runs, then calls `next()` to pass control to the next one.

```js
app.get("/secret", checkSomething, (req, res) => {
  res.send("You got in!");
});
```

---

## 🔍 Under the hood: how `:id` works

Express uses a library called **path-to-regexp**. It converts your path string into a regular expression.

Roughly:
- `/users/:id` becomes something like `^/users/([^/]+)/?$`
- the part in parentheses is a **capture group**
- Express reads the captured text and stores it in `req.params.id`

So `:id` means: *"match any text up to the next slash, and remember it under the name `id`."*

That is why `/users/5/extra` does **not** match `/users/:id`. The `/extra` breaks the pattern.

> 🧠 No magic. It's a regex with a name tag.

---

## 🛠️ Step 1: Your first param route

Create `lesson3/params.js` and type it yourself:

```js
const express = require("express");
const app = express();

app.get("/users/:id", (req, res) => {
  console.log(req.params);
  res.send(`User id: ${req.params.id}`);
});

app.listen(3000, () => console.log("Running on 3000"));
```

Visit `/users/1`, `/users/99`, `/users/hello`. Watch your terminal each time.

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Add a route `GET /products/:category/:id` that replies:
`Category: shoes, Product: 42` for `/products/shoes/42`.

> 💡 Hint: a path can have more than one `:name`. Check `console.log(req.params)` first.

---

## 🛠️ Step 2: Params are strings

Add this route:

```js
app.get("/double/:n", (req, res) => {
  const n = req.params.n;
  res.send(`Double is ${n + n}`);
});
```

Visit `/double/5`. You get `55`, not `10`. 😱

**Why?** `"5" + "5"` is string concatenation in JavaScript.

### 🎯 Mini Challenge 2 (⚡ 30 XP)
Fix `/double/:n` so `/double/5` returns `10`. Then handle `/double/abc`: reply with status **400** and `"Please send a number"`.

> 💡 Hint: you need to convert the string to a number, then check if the result is valid. Which JS function tells you "this is not a number"?

---

## 🛠️ Step 3: Route order with params

Type this:

```js
app.get("/users/:id", (req, res) => {
  res.send(`User ${req.params.id}`);
});

app.get("/users/new", (req, res) => {
  res.send("Create user form");
});
```

Visit `/users/new`. Which route answers? 🤔

The first one wins, so `new` gets treated as an `id`. The fix is to put **specific** routes **before** **dynamic** ones.

> ⚠️ Rule: **specific first, dynamic last.**

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Fix the order so `/users/new` shows the form and `/users/7` shows user 7. Explain in a comment *why* the order matters, using what you learned in Lesson 2.

---

## 🛠️ Step 4: Multiple handlers and `next()`

```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

app.get("/hello", logger, (req, res) => {
  res.send("Hello!");
});
```

What happens, step by step:
1. Request arrives at `/hello`.
2. Express runs `logger`. It prints a line.
3. `logger` calls `next()`. Express moves to the **next function** in the list.
4. The second function sends the response.

> 🧠 If `logger` never calls `next()` **and** never sends a response, the request **hangs forever**. The browser keeps loading. Try it by deleting `next()`.

You can also pass several functions:

```js
app.get("/x", first, second, third);
```

### 🎯 Mini Challenge 4 (⚡ 30 XP)
Write a handler called `checkAdmin` that:
- reads `req.params.role`
- if it equals `"admin"`, calls `next()`
- otherwise replies with status **403** and `"Access denied"`

Use it on `GET /dashboard/:role`.

---

## 🧪 Quick Check

1. What data type is `req.params.id`?
2. Why does `/users/new` break if `/users/:id` comes first?
3. What happens if a handler neither calls `next()` nor sends a response?

---

## 🏆 Main Challenges

Do these in VS Code. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson3/challenge1.js` on port 4000:
- `GET /greet/:name` → `"Hello, <name>!"`
- `GET /square/:n` → the square of `n`

Test with several values, including a non-number for `/square`.

### 🟡 Challenge 2: Real-world (80 XP)
Create `lesson3/challenge2.js`. Build a **students API** with this array at the top:

```js
const students = [
  { id: 1, name: "Abel" },
  { id: 2, name: "Sara" },
  { id: 3, name: "Dawit" },
];
```

Routes:
- `GET /students` → all students as JSON
- `GET /students/:id` → that student as JSON
- if the id doesn't exist → status **404**, `{ error: "Student not found" }`
- if the id isn't a number → status **400**, `{ error: "Invalid id" }`
- `GET /students/top` → `{ message: "Top students" }` (careful with the order! ⚠️)
- any other route → JSON 404 (Lesson 2)

> 💡 Hint: array methods you already know can search `students`. Remember that `req.params.id` is a string and `student.id` is a number.

### 🔴 Challenge 3: Brain-stretcher (100 XP, stacks Lessons 1, 2 and 3)
Create `lesson3/challenge3.js`: a **protected notes API**.

- `checkKey` handler: reads `req.params.key`. If it isn't `"letmein"`, reply 401 `{ error: "Invalid key" }`. Otherwise call `next()`.
- `GET /:key/notes` → uses `checkKey`, returns a JSON list of notes
- `POST /:key/notes` → uses `checkKey`, replies 201 `{ message: "Note created" }`
- `DELETE /:key/notes/:id` → uses `checkKey`, replies with `Note <id> deleted`
- Add a `logger` handler to **every** route (print method + url)
- Custom 404 JSON at the bottom

Before you code, write in comments: **in what order does Express run the functions for `DELETE /letmein/notes/3`?**

---

## ⚠️ Version note

Check your Express version with `npm ls express`. Express 5 changed some **path syntax** (wildcards and optional parts). Everything in this lesson works on both, but we'll handle those special patterns later, when you need them.

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 3: route params"`
2. 🗣️ **Explain back:** in 3 sentences, how does Express turn `/users/:id` into `req.params.id`?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

Send me your code and explain-back. I'll review it, award XP, and unlock **Lesson 4: Req and Res Advanced Topics** 🔓

Go! 🔥