# 🎯 Lesson 7: Route Parameters In Depth

**Level 4 · Reward: 300 XP**

You know `:id`. Today you master it: multiple params, validation, optional params, and `router.param()`, a tool most beginners never find. 🔥

---

## 📝 Notes (copy into `lesson7.md`)

### Quick recap
```js
app.get("/users/:id", (req, res) => {
  req.params.id; // always a STRING
});
```

### What's new today

| Topic | Idea |
|---|---|
| Multiple params | `/users/:userId/posts/:postId` |
| Special characters | params are URL-decoded for you |
| Optional params | the route works with or without the param |
| `router.param()` | run code **once** whenever a param appears |
| Params vs query | `/users/5` (identity) vs `?sort=asc` (options) |

### ⚠️ Check your Express version first
```bash
npm ls express
```
- **Express 5** (default for new installs): optional params use `{}`, and regex inside paths is **not** supported.
- **Express 4**: optional params use `?`, and `:id(\\d+)` regex works.

Everything below works on both unless marked.

---

## 🔍 Under the hood

### 1. Params are captured text
For `/users/:userId/posts/:postId`, Express builds a pattern with **two capture groups**. For `/users/3/posts/12` it fills `req.params` with:

```js
{ userId: "3", postId: "12" }
```

Each `:name` matches **one segment** (text up to the next `/`).

### 2. Automatic decoding
URLs can't contain spaces, so browsers send `%20`. Express decodes params for you:

`/search/hello%20world` → `req.params.term === "hello world"`

If the encoding is broken (like `%E0%A4%A`), Express answers with a **400 error** before your handler runs.

### 3. How `router.param()` works
`router.param("id", fn)` registers a function tied to the **name** `id`. When a matched route contains `:id`, Express runs that function **before** the route handler:

```js
router.param("id", (req, res, next, value, name) => {
  // value = the param's text, name = "id"
  next();
});
```

It runs **once per request** for that param, no matter how many handlers follow. It's middleware with a **trigger**: the param name.

---

## 🛠️ Step 1: Multiple params

Create `lesson7/params.js`:

```js
const express = require("express");
const app = express();

app.get("/users/:userId/posts/:postId", (req, res) => {
  console.log(req.params);
  res.json(req.params);
});

app.get("/search/:term", (req, res) => {
  res.send(`You searched for: ${req.params.term}`);
});

app.listen(3000, () => console.log("Running on 3000"));
```

Test:
- `/users/3/posts/12`
- `/search/hello%20world`
- `/search/express+js`

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Add `GET /files/:name.:ext` that replies `Name: photo, Extension: png` for `/files/photo.png`. Does a dot work as a separator? Test it, and note what you find in a comment.

---

## 🛠️ Step 2: Validating params by hand

You've done this before (Lesson 3):

```js
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  res.json({ id });
});
```

It works, but you must **repeat it in every route**. That's the problem `router.param()` solves. 👇

### 🎯 Mini Challenge 2 (⚡ 20 XP)
`Number("")` is `0` and `Number("  ")` is `0`. Can you ever get an empty `:id`? Test `/users/ ` and `/users/0` and `/users/1.5`. Then improve the check so only **positive whole numbers** are accepted.

> 💡 Hint: `Number.isInteger()` exists.

---

## 🛠️ Step 3: `router.param()` (the pro move)

Create `lesson7/routes/students.js`:

```js
const express = require("express");
const router = express.Router();

const students = [
  { id: 1, name: "Abel" },
  { id: 2, name: "Sara" },
];

router.param("id", (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid id" });
  }
  req.studentId = id;
  next();
});

router.get("/:id", (req, res) => {
  const student = students.find((s) => s.id === req.studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

router.delete("/:id", (req, res) => {
  res.json({ message: `Deleted ${req.studentId}` });
});

module.exports = router;
```

Mount it in `lesson7/app.js` at `/students`.

**What's happening:**
1. `GET /students/abc` → Express sees `:id` → runs the param function → sends 400. **The route handler never runs.**
2. `GET /students/2` → param function runs → sets `req.studentId = 2` → calls `next()` → the route handler runs.
3. One validation, **every** route with `:id` is protected. ✅

> 🧠 `req.studentId` is a **custom property** you attached to `req`. Handlers further down the chain can read it. This is a very common Express pattern.

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Upgrade the param function: it should **also look up the student** and attach it as `req.student`. If it doesn't exist, return 404 there. Then simplify both routes so they just use `req.student`. How many lines did you delete?

> 💡 Hint: the handlers shouldn't need `find` anymore.

---

## 🛠️ Step 4: Optional params and regex (version-specific)

**Express 5:**
```js
app.get("/products{/:category}", (req, res) => {
  res.send(req.params.category || "all categories");
});
```

**Express 4:**
```js
app.get("/products/:category?", (req, res) => { ... });
```

**Regex constraint, Express 4 only:**
```js
app.get("/users/:id(\\d+)", (req, res) => { ... });
```

On Express 5 regex was removed from paths. That's one more reason `router.param()` is the safer, version-independent tool. 💪

### 🎯 Mini Challenge 4 (⚡ 20 XP)
Make `GET /products` and `GET /products/shoes` both work with the **same** route for your installed version. Test both URLs.

---

## 🛠️ Step 5: Params vs query

| Use | Example |
|---|---|
| **Params** → which resource | `/users/5` |
| **Query** → how to show it | `/users?sort=asc&page=2` |

Rule of thumb: if removing it **changes which thing** you're talking about, it's a param. If it only changes **presentation or filtering**, it's a query. (Queries get a full lesson later.)

---

## 🧪 Quick Check

1. Why is `req.params.id` never a number automatically?
2. What does `router.param("id", fn)` do, and when does `fn` run?
3. Why is `router.param()` better than validating inside each route?
4. In `router.param`, what happens if you forget to call `next()`?

---

## 🏆 Main Challenges

In VS Code and Postman. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson7/challenge1.js` with:
- `GET /users/:userId/posts/:postId` → JSON `{ userId, postId }` as **numbers**
- `GET /add/:a/:b` → `{ result: a + b }`
- 400 JSON `{ error: ... }` if any param isn't a valid number

### 🟡 Challenge 2: Real-world (90 XP)
Create `lesson7/challenge2/` with `app.js` and `routes/products.js`.
- products array (id, name, price)
- `router.param("id")` validates the id **and** loads the product into `req.product` (400 / 404)
- `GET /products` → all
- `GET /products/:id` → one
- `PUT /products/:id` → update `name` and `price` (400 if missing)
- `DELETE /products/:id` → delete
- global JSON 404 in `app.js`

No route handler may contain its own id validation.

### 🔴 Challenge 3: Brain-stretcher (120 XP, stacks Lessons 1 to 7)
Create `lesson7/challenge3/`: a **forum API** with nested routers.

- `/threads` router: full CRUD with `router.route()`
- `/threads/:threadId/replies` router (`mergeParams`): GET, POST, DELETE `/:replyId`
- `router.param("threadId")` in the **threads** router loads the thread into `req.thread` (400 / 404)
- `router.param("replyId")` in the **replies** router validates and loads the reply from `req.thread.replies`
- global logger printing `METHOD originalUrl`
- header `X-Thread-Id` on every replies response
- JSON 404 at the end

Before coding, answer in comments: **When you call `DELETE /threads/1/replies/2`, which `param` functions run, in what order, and why?** Add logs to check your guess. 🕵️

> 💡 Hint: if the nested router can't see `req.thread`, think about **which** router's `param` function ran first, and whether `mergeParams` is in the right place.

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 7: route params in depth"`
2. 🗣️ **Explain back:** in 3 sentences, why does `router.param()` make your code cleaner?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

Send me your code and explain-back. I'll review it, award XP, and unlock **Lesson 8: Controllers In Depth** 🔓

Go! 🔥