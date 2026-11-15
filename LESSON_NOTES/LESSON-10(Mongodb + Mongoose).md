# 🔵 Level 4, Lesson 10: MongoDB + Mongoose 🗄️

> 🎮 **Level 4 unlocked!** Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end.

> 💬 This is the lesson where your project starts to feel **real**. Use your **Notes API from Lesson 8** as the practice project. If you finished Boss Battle #3, use the Blog API instead.

## 🤔 The "Why"

Run your Notes API, add a note, then **restart the server**. The note is gone. 😱

Your data lives in a JavaScript array, and arrays live in **RAM**. When the program stops, RAM is cleared. We need to save data on **disk**, in a **database**.

## 🧠 Mental Model

> 🗄️ **A filing cabinet.**
> - **Database** = the cabinet
> - **Collection** = one drawer (like `notes`)
> - **Document** = one card in the drawer (one note, stored like a JSON object)
>
> **Mongoose** = a **form template** at the front of the drawer. A card must follow the form before it goes in.

```
Express → Controller → Store → Mongoose Model → MongoDB driver → network → MongoDB server → disk
```

**MongoDB** stores documents (JSON-like). **Mongoose** is a library that gives you schemas, validation, and easy methods on top of MongoDB.

---

## 🔬 Under the Hood: What Happens When You Query

1. `mongoose.connect(uri)` opens a **network connection** (TCP) to the MongoDB server and returns a **Promise**.
2. `Note.find()` does **not** talk to the database yet. It returns a **Query object**: a description of what you want.
3. The query runs when you `await` it (or call `.then()`). Then Mongoose sends a command over the connection, and the answer comes back as a Promise result.

```js
const query = Note.find();   // nothing sent yet
const notes = await query;   // NOW it is sent
```

> 🧩 **Connect to Lesson 6 and 8:** database calls are **async**, so your controllers need `asyncHandler` (or Express 5). This is exactly why we built it.

---

## 🛠️ Part 1: Connect

**Step 1:** get a database. Pick **one**:
- **MongoDB Atlas** (free cloud): create a free cluster, create a database user, and under **Network Access** allow your IP.
- **Local MongoDB**: URI is `mongodb://127.0.0.1:27017/lesson10`.

Also install **MongoDB Compass** (a GUI) so you can **see** your data. 👀

**Step 2:** in your Lesson 8 project:

```bash
npm install mongoose
```

Add to `.env` (never commit it!):

```
MONGODB_URI=mongodb://127.0.0.1:27017/lesson10
```

Add `MONGODB_URI=` (empty) to `.env.example`.

**`src/config/db.js`:**

```js
const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI is missing");
  await mongoose.connect(uri);
  console.log("MongoDB connected:", mongoose.connection.name);
}

module.exports = connectDB;
```

**`src/server.js`:**

```js
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`Running on ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

start();
```

**Why connect **before** `listen`?** If the server accepts requests before the database is ready, the first users get errors. And if the database is down, we **fail fast** with a clear message instead of running half-broken.

**What breaks?**
- Wrong password in the URI → `Authentication failed` at startup.
- Atlas, and your IP is not allowed → a long wait (about 30 seconds) then `Server selection timed out`. The server **cannot find** a reachable database.
- Remove the `await` before `connectDB(...)` → `listen` runs at once. Queries are **queued** for about 10 seconds, then fail with `buffering timed out`.

### ⚡ Mini Challenge 1 (20 XP)
1. Connect successfully. Read the log line.
2. Break it **three ways**: wrong password, wrong host, and delete the `await`. Write down the exact error and the time it took for each.
3. Which one took longest? Why does that matter for a real deployment?

---

## 🛠️ Part 2: Schema and Model

**Schema** = the rules for the shape of a document. **Model** = a tool built from the schema to talk to one collection.

**`src/models/Note.js`:**

```js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "text is required"],
      trim: true,
      minlength: [1, "text is too short"],
      maxlength: [200, "text must be at most 200 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
```

**Line by line:**
- `type: String`: the value must be (or be cast to) a string.
- `required: [true, "message"]`: a rule, with **our** error message.
- `trim: true`: Mongoose removes spaces at the start and end (like the `.trim()` in your validator).
- `{ timestamps: true }`: Mongoose adds `createdAt` and `updatedAt` for you.
- `mongoose.model("Note", schema)`: creates the model. The collection name is **`notes`**: lowercase and plural. Mongoose does that automatically.

A saved document looks like this:

```json
{
  "_id": "6740f1c2a9b3c4d5e6f70812",
  "text": "Learn Express",
  "createdAt": "2026-11-13T10:30:00.000Z",
  "updatedAt": "2026-11-13T10:30:00.000Z",
  "__v": 0
}
```

- `_id`: a unique id that MongoDB makes (an **ObjectId**). It is **not** a number. Your old `Number(req.params.id)` code will break!
- `__v`: a version counter Mongoose uses internally.

**What breaks?**
- Save a document with a field **not** in the schema (`isAdmin`) → Mongoose **silently drops it** (strict mode). It is a built-in whitelist, like Lesson 9! 🔒
- Save `text: 123` → Mongoose **casts** it to `"123"`. Save `text: { a: 1 }` → a `CastError`.

### ⚡ Mini Challenge 2 (25 XP)
1. Create the model. In a scratch file `try.js`, connect and run:
   ```js
   const note = await Note.create({ text: "  hello  ", isAdmin: true });
   console.log(note);
   ```
2. What happened to the spaces? To `isAdmin`? Find the `_id`, `createdAt`, and `__v`.
3. Open **Compass** and find your document. Run the script again and see **two** documents.
4. Print `typeof note._id` and `note._id.toString()`. What is `_id`, really?

---

## 🛠️ Part 3: Replace the Store (the Payoff 💎)

Your **controllers** call store functions. We only rewrite `src/data/notesStore.js`. The names stay the same.

```js
const Note = require("../models/Note");

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.findAll = (search) => {
  const filter = search
    ? { text: { $regex: escapeRegex(search), $options: "i" } }
    : {};
  return Note.find(filter).sort({ createdAt: -1 });
};

exports.findById = (id) => Note.findById(id);
exports.add = (text) => Note.create({ text });
exports.update = (id, text) =>
  Note.findByIdAndUpdate(id, { text }, { new: true, runValidators: true });
exports.remove = (id) => Note.findByIdAndDelete(id);
```

**Line by line:**
- `{ $regex: ..., $options: "i" }`: "text matches this pattern, ignoring case." `$regex` is a **query operator**.
- `escapeRegex`: users type `.` or `(`, and in a regex those have special meaning. We escape them so we search for the **literal** text. Without this, a search for `(` crashes the query. 💥
- `new: true`: **return the document after the update**. Default is the **old** one!
- `runValidators: true`: **run the schema rules on updates too**. Default is **no**. Updates skip validation unless you ask. ⚠️
- The functions return **Query objects**. The controller `await`s them.

**Update `src/middleware/validateId.js`.** An ObjectId is 24 hex characters:

```js
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return next(new AppError("invalid id", 400));
  }
  next();
};
```

**Update the controller.** Every function is now `async`:

```js
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  res.json(await notesStore.findAll(req.query.search));
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const note = await notesStore.findById(req.params.id);
  if (!note) return next(new AppError("Note not found", 404));
  res.json(note);
});

exports.create = asyncHandler(async (req, res) => {
  const note = await notesStore.add(req.body.text);
  res.status(201).json(note);
});
```

Notice `req.params.id` is passed as a **string**. No `Number(...)` anymore.

**What breaks?**
- Forget `await` in `getOne` → `note` is a **Query object**, always truthy. The 404 never triggers, and `res.json(query)` gives weird output.
- Keep `Number(req.params.id)` → `NaN` → Mongoose `CastError`.
- Forget `asyncHandler` on Express 4 → a rejected promise hangs the request (Lesson 6!).
- Use an id with the right shape that doesn't exist (`aaaaaaaaaaaaaaaaaaaaaaaa`) → `findById` returns `null` → your 404 branch. Good.

### ⚡ Mini Challenge 3 (30 XP)
1. Swap in the new store and controller. Test all of these:
   - `GET /notes`, `GET /notes/<real _id>`, `GET /notes/abc` (400), `GET /notes/aaaaaaaaaaaaaaaaaaaaaaaa` (404)
   - `POST /notes` (with the key, and without)
2. **Restart the server.** Does `GET /notes` still show your notes? ✅ (That's the whole point!)
3. Remove one `await` on purpose. Describe what the response looks like.

---

## 🛠️ Part 4: Database Errors → Clean HTTP Errors

Two layers of protection now: your `validate` middleware (stops bad input early) **and** the schema (the last guard). The schema throws **its own kinds of errors**, and we must translate them.

Add to `src/app.js` (replace your error handler):

```js
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  let details = err.details;

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "Duplicate value";
  }

  res.status(status).json({
    error: status === 500 ? "Server error" : message,
    ...(details && { details }),
  });
});
```

| Error | Meaning | Status |
|---|---|---|
| `ValidationError` | schema rule broken | 400 |
| `CastError` | value can't become the schema type (bad `_id`) | 400 |
| `code 11000` | **duplicate key** (a `unique` field is repeated) | 409 |

**Under the hood:** MongoDB error code `11000` comes from the **database**, not Mongoose, when a **unique index** is violated. A `unique: true` field creates an **index**: a lookup structure the database uses to also reject duplicates. This is more reliable than checking in code, because two requests at the same moment can both pass a code check. 🏁

**What breaks?** Without these `if` branches, `ValidationError` has no `status`, so it becomes **500**: "Server error" for what is really the client's mistake. Wrong blame!

### ⚡ Mini Challenge 4 (25 XP)
1. **Temporarily remove** the `validate(...)` middleware from `POST /notes`. Send `{ "text": "" }` and a 300-character text. What status do you get **without** the new `if` branches? Then add them. What do you get now?
2. Create `src/models/User.js` with `email: { type: String, required: true, unique: true, lowercase: true }` and `name`. Add a quick `POST /users` route.
3. Create the same user **twice**. What happens? Look at the error in your terminal. Then check Compass → Indexes. Is there an `email_1` index?

---

## 🛠️ Part 5: Search Safety (NoSQL Injection) 🔒

Remember **Lesson 9, Brain Stretch**: `?search=a&search=b` gave an **array**. Express can also parse **objects** from the query string, using bracket syntax:

```
GET /notes?search[$ne]=x
```

Depending on your Express version and its `query parser` setting, `req.query.search` may become `{ $ne: "x" }`. In MongoDB, `$ne` means "not equal". If you put that **object** straight into a query, an attacker changes **the meaning of the query**. This is **NoSQL injection**.

Our store calls `escapeRegex(search)`. If `search` is an object, `.replace` doesn't exist and the request **crashes with 500**. Safe from injection, but ugly. The right fix is to **reject** non-strings at the door:

```js
// controller
const { search } = req.query;
if (search !== undefined && typeof search !== "string") {
  return next(new AppError("search must be a single text value", 400));
}
```

### ⚡ Mini Challenge 5 (25 XP)
1. Check your Express version with `npm ls express`.
2. Test `GET /notes?search[$ne]=x` and `GET /notes?search=a&search=b`. Print `typeof req.query.search` for each.
3. Add the type check (or better: write a reusable middleware `requireStringQuery("search")`, a **factory**, of course).
4. Test `GET /notes?search=(` with and without `escapeRegex`. Describe the difference.

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (35 XP)**
Finish Notes on MongoDB:
- `PUT /notes/:id` and `DELETE /notes/:id` (`404` if missing)
- Pagination in the **store**: `find(filter).sort(...).skip(skip).limit(limit)` and `Note.countDocuments(filter)` for `total`
- Keep the same response shape: `{ data, meta: { page, limit, total } }`

*(Think: you have `parsePagination` from Lesson 9. Where does `skip` go now?)*

**⚔️ Challenge 2: Real-world (45 XP)**
Build a **Posts** resource on MongoDB (model + store + controller + router, same layers):
- Fields: `title` (3 to 100), `body` (10 to 5000), `tags` (array of strings, max 5), `status` (enum `draft` / `published`, default `draft`)
- `GET /posts?status=published&search=...` (validate `status` against the enum before using it)
- A **unique** `slug` made from the title. A duplicate returns `409`.

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Predict each result **before** running:

```js
const a = await Note.findByIdAndUpdate(id, { text: "new" });
console.log(a.text);

const b = await Note.findByIdAndUpdate(id, { text: "" }, { new: true });
console.log(b.text);
```

1. What does `a.text` print, the **old** or the **new** text? Why?
2. Does the second call accept an empty `text`, even though the schema says `required`? Why?
3. What **one option** fixes problem 2?
4. Bonus: what does `findById` return if the id has the right shape but doesn't exist? `undefined`, `null`, or an error?

**⚔️ Challenge 4: Build Your Own Tiny Database (60 XP)** 🛠️
In **plain Node**, build `jsonStore(filePath)` with `fs.promises`:
- `findAll()`, `findById(id)`, `add(obj)`, `update(id, obj)`, `remove(id)`: all **async**
- Data is saved in a JSON file, so it **survives restarts**
- ids are unique strings (try `crypto.randomUUID()`)
- Plug it into your Notes controllers instead of Mongoose. If the interface matches, the controllers need **zero** changes.

Then answer: what problems would you hit with **two requests writing at the same time**? (This is why real databases are hard.) 🏆

**🐞 Bug Hunt (30 XP):** find **4 bugs** before running:

```js
exports.getAll = async (req, res) => {
  const notes = Note.find();
  res.json(notes);
};

exports.getOne = async (req, res) => {
  const note = await Note.findById(Number(req.params.id));
  res.json(note);
};
```

*(Look at: a missing `await`, the id type, the missing 404, and what protects against a rejected promise on Express 4.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"What is the difference between a schema and a model? Why can `Note.find()` be sent later than it is written?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Open **Compass** and look at what is **really** stored. Print `console.log(await Note.find())` to see real data.
2. Ask: *"Is the problem in my code, in the connection, or in the data?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 10: mongodb + mongoose"` 💾 *(Check first: is `.env` in `.gitignore`? It holds your database password!)*

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 4 (Express + MongoDB) | **0** (pile waiting: **~3,300 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 11, **Relationships**: users, posts, comments, `ref`, and `populate` (SQL "joins" the MongoDB way). Then Lesson 12 + **👹 Boss Battle #4**.

Send me one thing from today, like a Compass screenshot or an error message. I'll review it. 🚀