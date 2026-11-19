# 🛣️ Lesson 2: Basic Routing

**Level 1 · Reward: 150 XP**

Quick note before we start: you moved on without sending Lesson 1 challenges. I'll still unlock this lesson, but Challenge 3 from Lesson 1 (raw vs Express) is the one that makes this lesson click. Do it later today. 😉

---

## 📝 Notes (copy into `lesson2.md`)

### What is a route?
A route is a **rule**: *"When a request with this METHOD and this PATH arrives, run this function."*

```js
app.METHOD(PATH, HANDLER);
```

| Part | Example | Meaning |
|---|---|---|
| `app` | `app` | your Express app |
| `METHOD` | `get`, `post`, `put`, `delete` | the HTTP verb |
| `PATH` | `"/users"` | the URL part after the domain |
| `HANDLER` | `(req, res) => {}` | what to do |

### The 4 main methods (CRUD)

| Method | Express | Usually means |
|---|---|---|
| GET | `app.get()` | **Read** data |
| POST | `app.post()` | **Create** data |
| PUT | `app.put()` | **Update** data |
| DELETE | `app.delete()` | **Remove** data |

> 🧠 The browser address bar can only send **GET**. For the others you need a tool (curl, Thunder Client, or Postman, which is coming in a later lesson).

---

## 🔍 Under the hood: how Express picks a route

When a request arrives, Express checks your routes **from top to bottom**. For each route it asks two questions:

1. Does the **method** match?
2. Does the **path** match?

The **first** route where both are yes runs. Express then **stops** (as long as that handler sends a response).

If nothing matches, Express sends its built-in `Cannot GET /xyz` 404 page.

> ⚠️ **Order matters.** This is the number one source of routing bugs.

---

## 🛠️ Step 1: Same path, different methods

Create `lesson2/routes.js` and type it yourself:

```js
const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  res.send("GET: list of users");
});

app.post("/users", (req, res) => {
  res.send("POST: create a user");
});

app.put("/users", (req, res) => {
  res.send("PUT: update a user");
});

app.delete("/users", (req, res) => {
  res.send("DELETE: remove a user");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Same path `/users`, four different jobs. Express uses the **method** to tell them apart.

### Testing
- **GET:** open `http://localhost:3000/users` in the browser.
- **The others:** use Thunder Client in VS Code, or curl in a second terminal:

```bash
curl -X POST http://localhost:3000/users
curl -X PUT http://localhost:3000/users
curl -X DELETE http://localhost:3000/users
```

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Send a **PATCH** request to `/users` using curl or Thunder Client. What do you get back? Why? (Hint: think about the two questions Express asks.)

---

## 🛠️ Step 2: `res.status()` and `res.json()`

Real APIs don't just send text. They send **status codes** and **JSON**.

```js
app.post("/users", (req, res) => {
  res.status(201).json({ message: "User created" });
});
```

- `res.status(201)` sets the status code and **returns `res`**, so you can chain `.json()` after it.
- `res.json(obj)` converts the object to a JSON string and sets `Content-Type: application/json`.

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 404 | Not found |

### 🎯 Mini Challenge 2 (⚡ 20 XP)
Change your `DELETE /users` route to reply with status **200** and JSON `{ message: "User deleted" }`. Check the response in Thunder Client. Can you see both the status and the `Content-Type`?

---

## 🛠️ Step 3: `app.all()` and the 404 catch-all

`app.all(path, handler)` matches **every** method on that path.

The `*` path matches **everything**. Put it at the **bottom** and it becomes your custom 404:

```js
app.all("*", (req, res) => {
  res.status(404).send("Oops! Page not found 😢");
});
```

> ⚠️ If your Express version complains about `"*"`, you are on Express 5. Use `app.use((req, res) => {...})` instead, with no path. Check your version with `npm ls express`.

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Move the catch-all route to the **top** of your file, above all other routes. Test `/users`. What happens? Explain why in one sentence. Then put it back at the bottom.

---

## 🛠️ Step 4: Path patterns

Paths are **exact** by default: `/about` matches `/about`, but not `/about/team`.

Express also treats trailing slashes loosely and ignores letter case by default, so `/About` and `/about/` both hit `/about`. Try it and see. 👀

---

## 🧪 Quick Check (answer in your own words)

1. Two routes: `app.get("/a")` and `app.post("/a")`. Do they conflict? Why not?
2. You put `app.all("*")` first in the file. What breaks and why?
3. What is the difference between `res.send()` and `res.json()`?

---

## 🏆 Main Challenges

Do these **in VS Code**. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson2/challenge1.js` with a **books** server on port 4000:
- `GET /books` → `"All books"`
- `POST /books` → `"Book added"`
- `PUT /books` → `"Book updated"`
- `DELETE /books` → `"Book deleted"`

Test **all four** methods.

### 🟡 Challenge 2: Real-world (60 XP)
Create `lesson2/challenge2.js`. Build a mini API that sends **JSON** and correct **status codes**:
- `GET /health` → status 200, `{ status: "ok" }`
- `POST /tasks` → status **201**, `{ message: "Task created" }`
- `DELETE /tasks` → status 200, `{ message: "Task deleted" }`
- Any other route → a custom **404 JSON**: `{ error: "Route not found" }` with status 404

Bonus: use `app.all()` for something, and **don't** let the 404 route block the others.

### 🔴 Challenge 3: Brain-stretcher (100 XP, stacks Lesson 1 + 2)
Create `lesson2/challenge3.js`. Write the **same** `/ping` route twice, in two files:
1. `ping-raw.js` using Node's raw `http` module (check `req.method` and `req.url`)
2. `ping-express.js` using Express

Each should:
- reply `"pong"` for `GET /ping`
- reply 405 `"Method not allowed"` for any **other method** on `/ping`
- reply 404 for any other path

> 💡 Hint: in Express, think about how `app.all("/ping")` placed **after** `app.get("/ping")` behaves. Why does it only catch the other methods?

Then answer in comments: how many lines did each version take, and what did the raw version make you do manually?

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 2: basic routing"`
2. 🗣️ **Explain back:** in 3 sentences, how does Express decide which route to run?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

**Send me** your code and explain-back. I'll review it and unlock **Lesson 3: Advanced Routing** 🔓

Go! 🔥