# 🟠 Level 3, Lesson 7: `express.Router` (Split Your App into Small Files)

> 🎮 **Level 3 unlocked!** Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end.

> 💬 **Quick deal:** you have **0 XP** and over 1,500 XP waiting. Here is the smallest step: Lesson 6, **Mini Challenge 1** takes 2 minutes. Do it, then tell me what you saw. Starting small is how you beat the "I stop coding" habit. 🔑

## 🤔 The "Why"

Your Notes API is one file. Add users, bookmarks, and comments, and you get **one file with 800 lines**. 😵 You can't find anything. Two people can't work together.

We need to **split routes into files**, by topic.

## 🧠 Mental Model

> 🏢 **A company with departments.** The front desk (`app`) doesn't do the work. It looks at the request and says: *"Notes questions → Notes department. Users questions → Users department."*
>
> Each department (a **Router**) has its **own** list of routes and middleware. It is a **mini app**.

```
Request: GET /notes/5
   ↓
app (front desk): path starts with /notes → send to notesRouter
   ↓
notesRouter: I have a route GET /:id → run it
```

---

## 🔬 Under the Hood: A Router Is Just a Mini Stack

Remember `mini.js` from Lesson 4: a **list of functions** and a `next` that walks it?

`express.Router()` returns a **function `(req, res, next)`** with **its own list inside**. That's all.

```
app's list:   [morgan] [json] [notesRouter] [usersRouter] [404] [error handler]
                                   │
                                   └─ notesRouter's own list:
                                      [GET /] [GET /:id] [POST /]
```

When the request enters `notesRouter`:
1. It walks its **own** list.
2. A match → runs it.
3. No match → calls `next()` to **leave** the router and continue in the app's list.

A router **is middleware**. You already know how it works! 🧩

---

## 🛠️ Part 1: Your First Router

Create a new folder `lesson7` with this structure:

```
lesson7/
  app.js
  routes/
    notes.js
```

**`routes/notes.js`:**

```js
const express = require("express");
const router = express.Router();

const notes = [
  { id: 1, text: "Learn Express" },
  { id: 2, text: "Build an API" },
];

router.get("/", (req, res) => {
  res.json(notes);
});

router.get("/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

module.exports = router;
```

**`app.js`:**

```js
const express = require("express");
const notesRouter = require("./routes/notes");

const app = express();
app.use(express.json());

app.use("/notes", notesRouter);

app.listen(3000, () => console.log("Running on 3000"));
```

Run `node app.js`. Test `/notes` and `/notes/1`.

**Line by line:**
- `express.Router()`: creates the mini app.
- `module.exports = router`: **hands the router out** of the file so another file can `require` it. (Node's module system from your Node.js course.)
- `app.use("/notes", notesRouter)`: **mounts** the router. "Anything starting with `/notes` goes there."

**Why does `router.get("/")` match `/notes`?** When the request enters the router, Express **cuts the mount path off**:

```
Original URL:        /notes/5
Mount path (cut):    /notes
Inside the router:   /5         ← what the router sees
```

So inside the router, paths are **relative** to where it's mounted. Move the mount to `/api/v1/notes` and the router file doesn't change at all. 🎯

**What breaks?**
- Forget `module.exports = router` → `app.use` gets `{}` and throws `Router.use() requires a middleware function but got a Object`.
- Write `router.get("/notes", ...)` inside the router → the real URL becomes `/notes/notes`. You repeated the prefix.
- Mount with `app.use("/notes", ...)` **before** `express.json()` → `req.body` is empty inside the router. Order matters, again. 🔁

### ⚡ Mini Challenge 1 (20 XP)
Build the project above by typing it. Then:
1. Prove all three "What breaks?" lines yourself.
2. Change the mount to `app.use("/api/notes", notesRouter)`. What do you need to change **inside** `routes/notes.js`? (Nothing? Prove it.)

---

## 🛠️ Part 2: See the Cut-Off Happen

Add this at the top of `routes/notes.js`, before the routes:

```js
router.use((req, res, next) => {
  console.log("baseUrl:    ", req.baseUrl);
  console.log("url:        ", req.url);
  console.log("originalUrl:", req.originalUrl);
  next();
});
```

Visit `/notes/2?x=1` and read the terminal:

| Property | Value | Meaning |
|---|---|---|
| `req.baseUrl` | `/notes` | the part that was **cut off** (the mount path) |
| `req.url` | `/2?x=1` | what the router sees now |
| `req.originalUrl` | `/notes/2?x=1` | the **full** original URL, never changed |

That is the cut-off, made visible. Nothing is magic. 🔍

### ⚡ Mini Challenge 2 (15 XP)
1. Add the logger and visit `/notes`, `/notes/2`, `/notes/2?x=1`.
2. Predict `req.url` for `GET /notes` **before** testing. (Careful: is it `""` or `"/"`?)
3. Mount the same router at two paths: `app.use("/notes", notesRouter)` and `app.use("/memos", notesRouter)`. Does it work? What does this tell you about routers?

---

## 🛠️ Part 3: Router-Level Middleware

You can protect **just one router**:

```js
// routes/notes.js
function requireKey(req, res, next) {
  if (req.get("x-api-key") !== "secret123") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.get("/", getAll);                 // public
router.post("/", requireKey, create);    // protected (one route)

// or protect EVERYTHING below this line in the router:
router.use(requireKey);
```

`router.use(requireKey)` affects only routes **below it, inside this router**. Users routes in another router are not touched.

**What breaks?** Put `router.use(requireKey)` at the **bottom** of the file → it protects nothing. The routes above already answered. 🔓

### ⚡ Mini Challenge 3 (20 XP)
1. Add a `POST /` route to `routes/notes.js` that creates a note (use what you learned in Lesson 2).
2. Make **only** `POST` need the key. `GET` stays public.
3. Now create `routes/users.js` with `GET /` returning `["Sara", "Abel"]`. Mount it at `/users`. Prove that the notes key is **not** needed for `/users`.

---

## 🛠️ Part 4: Chaining with `router.route()`

When one path has many methods, don't repeat the path:

```js
router
  .route("/")
  .get((req, res) => res.json(notes))
  .post((req, res) => {
    const note = { id: notes.length + 1, text: req.body.text };
    notes.push(note);
    res.status(201).json(note);
  });
```

Same thing as two separate lines. It is only **cleaner** and avoids typos in the path.

### ⚡ Mini Challenge 4 (15 XP)
Rewrite your notes router so `/:id` uses `router.route("/:id")` with `.get()`, `.put()`, and `.delete()`. Test all three.

---

## 🛠️ Part 5: Nested Routers and the Params Trap 🪤

**Goal:** `GET /users/7/notes` → notes of user 7.

```js
// app.js
app.use("/users/:userId/notes", notesRouter);
```

```js
// routes/notes.js
router.get("/", (req, res) => {
  res.json({ userId: req.params.userId, notes });
});
```

Test `/users/7/notes`. Result: `userId` is **`undefined`**. 😮

**Why?** By default, each router sees **only its own** params. `:userId` was in the **parent** mount path, so it is hidden from the child.

**The fix:**

```js
const router = express.Router({ mergeParams: true });
```

Now the router also receives the parent's params.

### ⚡ Mini Challenge 5 (25 XP)
1. Reproduce the bug (see `undefined`).
2. Fix it with `mergeParams: true`.
3. Add a second param: mount at `/users/:userId/notes` and add `router.get("/:noteId")`. Return **both** `userId` and `noteId`.

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Take your Notes API (Lesson 2 to 6) and split it:

```
project/
  app.js              ← only setup: middleware, mounts, errors
  routes/notes.js     ← all /notes routes
  routes/users.js     ← GET /users, GET /users/:id
  middleware/auth.js  ← requireKey (exported!)
```

`app.js` should have **no route handlers** at all. Keep your error layer from Lesson 6 at the bottom.

**⚔️ Challenge 2: Real-world (40 XP)**
Add a **bookmarks** router, mounted at `/api/bookmarks`. Inside, `POST`, `PUT`, `DELETE` need `requireKey` (imported from `middleware/auth.js`). Add a **router-level logger** that prints `[bookmarks] GET /5` using `req.method` and `req.url`.

Bonus: mount a `/api/v1` router that **contains** the notes, users, and bookmarks routers (a router inside a router).

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
You have:

```js
app.use("/shop", shopRouter);
```

and inside `shopRouter`:

```js
router.use((req, res, next) => {
  console.log(req.baseUrl, req.url, req.originalUrl);
  next();
});
router.get("/items/:id", handler);
```

1. Request: `GET /shop/items/9?color=red`. Write the **three printed values** before running.
2. Request: `GET /shop`. What does `req.url` show? Predict first!
3. Request: `GET /shopping`. Does the shop router run? (Careful! Test it. Why?)

**⚔️ Challenge 4: Build Your Own Router (60 XP)** 🛠️
In plain Node, extend your `mini.js`:
- A `createRouter()` function that returns a function `(req, res, next)` with **its own `stack`**
- `router.get(path, fn)` that adds a method and path check
- When nothing matches inside, it calls the outer `next()`
- Mount it inside another stack and prove: **leaving the router continues the outer chain**

If you build this, you understand Express routers better than most developers. 🏆

**🐞 Bug Hunt (30 XP):** find **3 bugs** before running:

```js
// routes/users.js
const express = require("express");
const router = express.Router;

router.get("/users", (req, res) => {
  res.json(["Sara"]);
});
```

```js
// app.js
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);
```

*(Look at: `Router`, the path inside the router, and the export.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"Why does `router.get('/')` match `/notes`? What does Express cut off, and where does it go?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Print `req.baseUrl`, `req.url`, `req.originalUrl` to see where the request really is.
2. Ask: *"Which router is the request inside right now, and what path does it see?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 7: express.Router"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 3 (Architecture) | 0 (pile waiting: **~1,700 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 8, **Controllers and project structure**: separating *what the route is* from *what the route does*. Then **Lesson 9 + 👹 Boss Battle #3**.

Send me one small thing from any lesson: a screenshot, an error, or a broken line. I'll review it. 🚀