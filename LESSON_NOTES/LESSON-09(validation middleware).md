# 🟠 Level 3, Lesson 9: Validation Middleware ✅

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges and **👹 Boss Battle #3** (your Level 3 mini project) at the end.

> 💬 **Coach note:** Boss Battle #3 is the biggest build so far, and it uses every lesson from 2 to 9. If you do **one thing** from this whole course, do that one. When you get stuck there, that is the exact moment you are training for. Send me your code, even broken. 💪

## 🤔 The "Why"

**Never trust the client.** Anyone can send anything: empty text, a number instead of a string, a 5 MB title, extra fields like `"isAdmin": true`.

Right now your controller does `if (!text)`. That is **not enough**. We need a proper **bouncer at the door**.

**Validation** = checking that data has the right shape. Bad data is stopped **before** the controller runs.

## 🧠 Mental Model

> 🚪 **A nightclub bouncer.** He checks ID, age, and dress code. Bad guests get sent home with a clear reason. Good guests go in, and he takes away anything they shouldn't carry (extra fields).

```
Request → [auth] → [VALIDATOR] → [controller]
                      │
                      └─ bad data? → next(AppError 400) → error handler
```

---

## 🔬 Under the Hood: A Validator Is a Factory

You know this pattern from Lesson 5. A validator is a **factory** that takes **rules** and returns a **middleware**:

```
validate(rules)  →  (req, res, next) => { check req.body; next() or next(err) }
```

Same idea as `requireHeader(name)`. Nothing new, just a new use. 🧩

---

## 🛠️ Part 1: Your Own `validate` Middleware

First, upgrade the error handler (from Lesson 8) so errors can carry **details**. In `src/app.js`:

```js
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Server error" : err.message,
    ...(err.details && { details: err.details }),
  });
});
```

`...(err.details && {...})` adds the `details` key **only if** it exists. (If `err.details` is `undefined`, spreading `undefined` adds nothing.)

Now **`src/middleware/validate.js`**:

```js
const AppError = require("../utils/AppError");

module.exports = function validate(rules) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];
    const clean = {};

    for (const [field, rule] of Object.entries(rules)) {
      let value = body[field];
      if (typeof value === "string") value = value.trim();

      if (value === undefined || value === "") {
        if (rule.required) errors.push(`${field} is required`);
        continue;
      }

      if (typeof value !== rule.type) {
        errors.push(`${field} must be a ${rule.type}`);
        continue;
      }

      if (rule.type === "string") {
        if (rule.min && value.length < rule.min) errors.push(`${field} must have at least ${rule.min} characters`);
        if (rule.max && value.length > rule.max) errors.push(`${field} must have at most ${rule.max} characters`);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || `${field} is invalid`);
        continue;
      }

      clean[field] = value;
    }

    if (errors.length > 0) {
      const err = new AppError("Validation failed", 400);
      err.details = errors;
      return next(err);
    }

    req.body = clean;
    next();
  };
};
```

**Line by line:**
- `req.body || {}`: if nobody parsed the body, `req.body` is `undefined`. Without this, `body[field]` would **crash** (a 500 instead of a clean 400).
- `Object.entries(rules)`: turns `{ text: {...} }` into `[["text", {...}]]` so we can loop.
- `.trim()`: `"   "` (only spaces) becomes `""` and counts as empty.
- We **collect all errors** and don't stop at the first. The user fixes everything in one try. 🙌
- `return next(err)`: `return` stops the function (Lesson 2 lesson, again).
- `req.body = clean`: **only fields we named survive**. Everything else is thrown away. (Part 3 shows why this matters.)

Use it in `routes/notes.js`. **Auth first, then validate:**

```js
const validate = require("../middleware/validate");

router.route("/").get(c.getAll).post(
  requireKey,
  validate({ text: { type: "string", required: true, min: 1, max: 200 } }),
  c.create
);
```

**Why auth before validate?** Don't do work for someone who isn't allowed in. And don't tell strangers what your rules look like.

**What breaks?**
- Remove `return` before `next(err)` → the error handler answers, **and** then `next()` runs the controller too. You create the note even though you said "no." 😱
- Put `validate` **after** `c.create` in the list → the controller already answered. The validator never runs.
- Forget `express.json()` → `req.body` is `undefined`. Thanks to `|| {}` you get a clean `"text is required"`, not a crash.

### ⚡ Mini Challenge 1 (25 XP)
Wire it up and test `POST /notes` with each body. Write the status and message for each:
1. `{}`
2. `{ "text": "" }`
3. `{ "text": "     " }`
4. `{ "text": 123 }`
5. `{ "text": "hello", "id": 999, "isAdmin": true }`
6. A text of 300 characters

For #5: what does the created note look like? (Which fields survived?)

### ⚡ Mini Challenge 2 (20 XP): Break it on purpose
1. Remove `return` before `next(err)`. Send `{}`. What shows in the response? What shows in the **terminal**? What does `GET /notes` show after?
2. Put it back. Now move `validate` **above** `requireKey`. Send a bad body **without** the key. Which error do you get first? Is that good? Why not?

---

## 🛠️ Part 2: Rules for More Fields

Your validator can now handle many fields. Try a **user** rule:

```js
validate({
  name: { type: "string", required: true, min: 2, max: 50 },
  email: {
    type: "string",
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "email is not valid",
  },
  age: { type: "number" },   // optional
})
```

Read the regex in pieces: `[^\s@]+` (one or more characters that are not space or `@`), then `@`, then the same, then `\.`, then the same. It is simple on purpose. Real email checking is complex, so we only block obvious mistakes.

### ⚡ Mini Challenge 3 (20 XP)
1. Add `POST /users` with the rules above (create `usersController`, router, and store like Lesson 8).
2. Test: a valid user, a bad email, `age: "20"` (a string), a missing name.
3. A user sends `"age": 20` as a JSON number, but a **form** sends `age=20` as a **string**. Does your validator accept it? What would you change if forms were allowed? *(Think first, then test.)*

---

## 🛠️ Part 3: The Whitelist (Why `req.body = clean` Matters) 🔒

**Mass assignment** = copying everything the user sends into your data.

Look at this "lazy" controller:

```js
exports.create = (req, res) => {
  const note = { id: nextId++, ...req.body };   // 😱
  notes.push(note);
  res.status(201).json(note);
};
```

A user sends:

```json
{ "text": "hi", "id": 1, "isAdmin": true }
```

Now the note has `id: 1`. That collides with an existing note. And in a real app, the same trick sets `role: "admin"` on a user. This is a **real, famous kind of attack**.

**The fix:** a **whitelist**. Keep **only** the fields you allow. Our validator already does this with `clean`. 🎯

### ⚡ Mini Challenge 4 (20 XP)
1. Temporarily remove `req.body = clean;` and write the lazy controller above.
2. Send `{ "text": "hi", "id": 1 }`. See the duplicate id.
3. Put the validator back. Send the same request. What happens now? Explain why in one sentence.

---

## 🛠️ Part 4: Validating Params and Query

Bodies are not the only input. **Params** and **query** come from the user too.

**`src/middleware/validateId.js`:**

```js
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return next(new AppError("id must be a positive integer", 400));
  }
  next();
};
```

Why `Number.isInteger`? `Number("1.5")` is `1.5` (a valid number, but not a valid id). And `Number("")` is `0`. We reject both.

**`src/middleware/parsePagination.js`:**

```js
module.exports = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
```

**Pagination** = sending data in pages, so one request doesn't return 100,000 items.

- `parseInt("abc", 10)` is `NaN`, and `NaN || 1` is `1`: a safe default.
- `Math.min(50, ...)`: a **cap**. Without it, `?limit=999999999` makes your server send everything.
- We store the result in **`req.pagination`**, a **new** property. We don't write back into `req.query`. In Express 5, `req.query` is read-only. A new property works in every version. 💡

Use it in a controller:

```js
exports.getAll = (req, res) => {
  const { page, limit, skip } = req.pagination;
  const all = notesStore.findAll(req.query.search);
  res.json({
    data: all.slice(skip, skip + limit),
    meta: { page, limit, total: all.length },
  });
};
```

**What breaks?**
- Remove the cap → `?limit=1000000` becomes legal.
- Use `req.query.limit` directly in `slice(0, req.query.limit)`: it's a **string** `"2"`. `slice` converts it, but `"abc"` becomes `0`. Silent, strange behavior. Always parse and validate.

### ⚡ Mini Challenge 5 (25 XP)
1. Add `validateId` to `GET /notes/:id` (and use it on `PUT` and `DELETE` when you have them).
2. Add `parsePagination` to `GET /notes`. Create 5+ notes. Test:
   - `/notes?page=1&limit=2`, `/notes?page=2&limit=2`
   - `/notes?limit=abc`, `/notes?limit=-5`, `/notes?limit=9999`, `/notes?page=0`
3. For each, write what you got, and what the clamp did.

---

## 🛠️ Part 5: Libraries (Same Idea, More Power)

In real projects, many people use a library for validation: **Zod**, **Joi**, or **express-validator**. They do the same job as your `validate`, with more rules and less code.

A taste with Zod (`npm install zod`):

```js
const { z } = require("zod");

const noteSchema = z.object({
  text: z.string().trim().min(1).max(200),
});

const validateWith = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const err = new AppError("Validation failed", 400);
    err.details = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return next(err);
  }
  req.body = result.data;
  next();
};
```

See it? It is **the same shape** as your validator: a factory, `next(err)` on failure, and a clean `req.body` on success. Because you built the manual version first, the library is **not magic**. 🔍

### ⚡ Mini Challenge 6 (20 XP)
1. Install Zod and rewrite the notes validator with `validateWith(noteSchema)`.
2. Send the same six bodies from Mini Challenge 1. Do the messages match?
3. Which one do you prefer for a big project, yours or Zod's? Write **two reasons** with your opinion.

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Add to your **extended validator** (from Part 1):
- `type: "number"` support with `min` and `max` (for numbers, these compare the value, not the length)
- `enum: ["draft", "published"]` support
- `type: "array"` support (use `Array.isArray`), with `maxItems` and a check that every item is a string

Then use it on a `POST /articles` with `title`, `views` (number ≥ 0), `status` (enum), `tags` (array).

**⚔️ Challenge 2: Real-world (40 XP)**
Add **sorting** to `GET /notes`: `?sort=text` or `?sort=-text` (a minus means descending).
- Only allow a **whitelist** of sort fields (`id`, `text`).
- An unknown field, like `?sort=password`, returns `400` with a clear message.
- Put the logic in a middleware `parseSort(allowedFields)`, another **factory**.

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Your route is `GET /notes?search=...` and your store does this:

```js
function findAll(search) {
  if (!search) return notes;
  return notes.filter((n) => n.text.toLowerCase().includes(search.toLowerCase()));
}
```

1. **Predict:** what happens for `GET /notes?search=a&search=b`? (The same key twice!)
2. Test it. Print `typeof req.query.search` and `req.query.search` in the controller. What is it?
3. Which status does the user get? Is that a good answer?
4. Fix it **in the right layer** (route validation, not inside the store) so the user gets a clean `400`.

*(This is a real bug found in real apps. Later, with MongoDB, a similar trick can become a security hole. Remember it.)* 🔒

**⚔️ Challenge 4: Build Your Own Mini-Zod (60 XP)** 🛠️
In **plain Node**, build a tiny schema library with method chaining:

```js
const schema = {
  name: v.string().required().min(2),
  age:  v.number().min(0).max(120),
};
const { errors, clean } = validateObject(schema, { name: "S", age: 200 });
```

Each `v.string()` and `v.number()` returns an object whose methods (`required`, `min`, `max`) **return `this`**, so calls chain. `validateObject` loops over the schema and returns `{ errors, clean }`. Then plug it into an Express middleware. If you can build this, you understand how Zod works inside. 🏆

**🐞 Bug Hunt (30 XP):** find **3 bugs** before running:

```js
function validate(req, res, next) {
  const { title } = req.body;
  if (!title || title.length < 3) {
    res.status(400).json({ error: "title too short" });
  }
  next();
}
router.post("/", validate, c.create);
```

*(Think about: what runs after the response? What if `title` is `12345`? What if no JSON arrived at all?)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"Why do I whitelist fields? What attack does it stop? And why check `params` and `query`, not only `body`?"*

---

## 👹 BOSS BATTLE #3: The Structured Blog API (200 XP, +100 bonus for no hints)

**This is your Level 3 mini project. Lessons 2 to 9. No hints at first!**

Build a **Blog API** from scratch, in a **new folder**, with a real structure:

```
blog-api/
  src/
    app.js            ← middleware, mounts, 404, error handler
    server.js         ← dotenv + listen
    routes/           ← posts.js, comments.js, index.js
    controllers/
    data/             ← stores
    middleware/       ← auth, validate, validateId, parsePagination, parseSort
    utils/            ← AppError, asyncHandler
  .env  .env.example  .gitignore  requests.http  README.md
```

**Endpoints:**

1. `GET /api/health` → `{ "status": "ok", "uptime": <seconds> }`
2. `GET /api/posts`:
   - `?search=` (title contains it; **validate** it is a single string)
   - `?page=&limit=` (capped), `?sort=createdAt` or `-createdAt` (whitelist)
   - returns `{ data, meta: { page, limit, total } }`
3. `GET /api/posts/:id`: bad id → `400`, missing → `404`
4. `POST /api/posts`: `title` (3 to 100), `body` (10 to 5000), `tags` (optional array of strings, max 5). Whitelist fields. Success → `201`, with `id` and `createdAt` added by the **server**.
5. `PUT /api/posts/:id` and `DELETE /api/posts/:id`: need the `x-api-key` header. Delete also deletes that post's comments.
6. **Nested comments** (use `mergeParams`, from Lesson 7):
   - `GET /api/posts/:postId/comments`
   - `POST /api/posts/:postId/comments` (`author` 2 to 40, `text` 1 to 500)
   - `DELETE /api/posts/:postId/comments/:commentId` (needs the key)
   - Missing post → `404` for **all** comment routes

**Rules of the build:**
- Controllers contain **no** data-array code. They call store functions.
- Store functions **return Promises** (use a tiny `setTimeout` delay to mimic a database). Use `asyncHandler` in the controllers. Level 4 will swap this layer for MongoDB with **zero** controller changes. That's the payoff! 💎
- `morgan`, `cors` (origin from `.env`), `express.json()`: in the correct order.
- **One** central error handler: `{ error, details? }`. A JSON 404 for unknown routes. Bad JSON → friendly `400`. No stack in production.
- `API_KEY`, `PORT`, `CORS_ORIGIN` come from `.env`. The app **refuses to start** if `API_KEY` is missing. `.env.example` is committed. `.env` is **ignored**.
- `requests.http` (use the **REST Client** extension for VS Code) has **every** success and failure case, at least **20 requests**.
- `README.md` has a table of all endpoints.

**Process rules:**
- ⏱️ Struggle **20 minutes** before any hint.
- 📝 Keep a **bug diary**: bug, how you found it, what fixed it. (This is your anti-quitting training. Send it to me.)
- 🧠 +40 XP: explain back the **full journey** of `POST /api/posts/3/comments` with a body that has a bad `author`: every middleware it touches, in order, and where it stops. Draw it as a text diagram.

**Bonus XP:** 🏆 +10 per challenge with no hint.

## 🪜 Stuck?

1. Struggle **20 minutes**. Add `console.log("reached X")` and print `req.baseUrl`, `req.params`, `req.body` to see where the request is.
2. Ask: *"Which layer is this bug in: route, middleware, controller, or store?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 9: validation + boss battle 3 blog api"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 3 (Architecture) | 0 (pile waiting: **~2,800 XP**) | Day 1 |

**⏭️ Next lesson:** 🔵 **Level 4 starts!** Lesson 10: **MongoDB + Mongoose**: connect, define a schema, and replace your fake store with a real database. 🗄️

Send me anything: your bug diary, a folder screenshot, or one failing request. I'll review it. 🚀