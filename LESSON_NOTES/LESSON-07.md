# 🚀 PHASE 4 · LESSON 7: Express Meets MongoDB (Mongoose)

> 🎮 **Your XP Bar:** `[█████████░] 7875 / 10500 XP` *(if you finished Lessons 1-6)*
> **Current Level:** 🏛️ API Architect ✅ → 🗄️ **Database Hero** (unlocks at 9500 XP)

> 🎉 **Phase 3 complete. Phase 4 begins. This is the lesson your whole structure was built for.** 🎁

> 🔗 **Connection to Lessons 1-6:**
> - Lesson 1: server **speaks** 🗣️
> - Lesson 2: server **listens** 👂
> - Lesson 3: server **changes things** ✍️
> - Lesson 4: server gets **an assembly line** 🏭
> - Lesson 5: server gets **armor and settings** 🛡️
> - Lesson 6: server gets **a blueprint** 🏛️
> - Lesson 7: server gets **a memory that never forgets** 🧠💾

Remember the annoying truth since Lesson 3?

> *"Restart = reset. The data lives in memory."* 😩

Today that ends. And thanks to Lesson 6, the big swap touches **one layer**: your **store**. Routers barely change. Controllers just gain `async/await`. **This is why architecture matters.** 😎

---

## 🔁 Quick Warm-Up (Lessons 1-6)

From memory:

1. What's the difference between a **router**, a **controller**, and a **store**?
2. Why does `app.js` not call `listen()`?
3. Why do specific routes go **above** dynamic ones?
4. Why is `process.env.X` always a string?

Fuzzy? Re-read those recaps. 🧱

> 🐙 **Quest 0: Commit and push Lesson 6 (+50 XP)** before starting. Ritual: ⌨️ type it · 🔬 debug alone first · 🧪 Thunder Client · 🏗️ `my-project/` · 🐙 commit · 🧠 teach-back.

---

# 🍃 PART A: Why Mongoose?

## 🧠 1. You already know MongoDB

From your fundamentals:

| MongoDB term | Meaning |
|--------------|---------|
| **Database** | A container for collections |
| **Collection** | A group of documents (like a table) |
| **Document** | One record, stored as JSON-like data (BSON) |
| **`_id`** | A unique ID MongoDB gives every document |

MongoDB is **flexible**. You can save *any* shape in a collection. That's powerful, but dangerous. One typo (`titel` instead of `title`) and your database quietly fills with garbage. 😱

### 🛡️ Enter Mongoose

> **Mongoose is a library that sits between Express and MongoDB.** It adds **structure**, **validation**, and **convenient methods**.

Think of MongoDB as a **warehouse** 🏭 where anyone can drop any box anywhere, and Mongoose as the **warehouse manager** 📋 who says: *"Every box needs a label, a weight under 20kg, and goes on shelf B."*

| Mongoose gives you | Example |
|--------------------|---------|
| **Schema** | The shape of your data |
| **Model** | A tool to read/write that data |
| **Validation** | "title is required, max 120 characters" |
| **Defaults & timestamps** | `done: false`, `createdAt`, `updatedAt` |
| **Relationships** | Link members ↔ workouts |

---

# ☁️ PART B: Setup

## 🛠️ 2. Get a database

**Option A: MongoDB Atlas (free cloud)** ⭐ *recommended*

1. Create a free account at **mongodb.com/atlas** and create a **free (M0) cluster**.
2. **Database Access** → add a **database user** (username + password). Save the password somewhere safe.
3. **Network Access** → **Add IP Address** → add **your current IP**.
   > ⚠️ "Allow access from anywhere" (`0.0.0.0/0`) is okay for short learning sessions, **never** for real projects.
4. Click **Connect → Drivers** and copy the **connection string**. It looks like:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/express-journey?retryWrites=true&w=majority
```

> 📝 **Note:** Put your **database name** (`express-journey`) after the `/`. MongoDB creates it automatically on first write.
>
> 🚨 If your password has special characters (`@`, `#`, `:`, `/`), they must be **URL-encoded** (`@` → `%40`). Or just choose a simple alphanumeric password.

**Option B: Local MongoDB**

```
mongodb://127.0.0.1:27017/express-journey
```

> 📝 **Note:** Use `127.0.0.1` instead of `localhost`. Modern Node sometimes resolves `localhost` to IPv6 and fails to connect. A classic gotcha. 🐛

## 🔐 3. Secrets come first (Lesson 5 ✅)

Your connection string contains a **password**. Treat it like `ADMIN_KEY`:

**`.env`**
```
PORT=3000
NODE_ENV=development
ADMIN_KEY=my-super-secret-key-123
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/express-journey?retryWrites=true&w=majority
```

**`.env.example`** (committed, fake values):
```
MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/DBNAME
```

Update **`config.js`**:

```js
const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  adminKey: process.env.ADMIN_KEY,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI,
};

for (const key of ["adminKey", "mongodbUri"]) {
  if (!config[key]) {
    console.error(`❌ Missing required environment variable for: ${key}`);
    process.exit(1);
  }
}
```

> 🚨 **If you ever push your real URI to GitHub:** deleting the file isn't enough (Git remembers). **Change the database password immediately** in Atlas. Treat it as leaked.

Install Mongoose:

```bash
npm install mongoose
```

## 🔌 4. Connect (before you listen!)

Create **`src/config/db.js`**:

```js
const mongoose = require("mongoose");

async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log("🍃 MongoDB connected:", mongoose.connection.name);
}

module.exports = connectDB;
```

Update **`src/server.js`**:

```js
const app = require("./app");
const config = require("./config/config");
const connectDB = require("./config/db");

async function start() {
  await connectDB(config.mongodbUri); // 1️⃣ database first
  app.listen(config.port, () => {     // 2️⃣ then accept requests
    console.log(`🚀 http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});
```

> 🧠 **Why connect first?** If the server accepted requests before the DB was ready, early requests would hang or fail. And **fail fast** (Lesson 5): if the DB is unreachable, crash with a clear message instead of limping along.

Run `npm run dev`. You should see:

```
🍃 MongoDB connected: express-journey
🚀 http://localhost:3000 (development)
```

> 🎮 **Quest 1: Set up Atlas (or local), connect, and see the success message (+100 XP).**
>
> 🧯 Stuck? Jump to the debugging table at the end. **Read the error slowly first.** 🔬

---

# 📐 PART C: Schemas and Models

## 🧠 5. Schema → Model → Document

```
Schema   =  the BLUEPRINT  (what shape is allowed?)
Model    =  the TOOL       (create, find, update, delete)
Document =  ONE RECORD     (one actual task)
```

Create **`src/models/Task.js`**:

```js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically ⏱️
  }
);

// Clean JSON output: drop __v, keep the "id" string, hide "_id"
taskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

module.exports = mongoose.model("Task", taskSchema);
```

### 🔍 What's new?

- **`new mongoose.Schema({...})`** defines the allowed fields and rules.
- **`required: [true, "message"]`**: the array form lets you write your **own error message**.
- **`trim: true`**: auto-removes spaces around the string.
- **`default`**: used when the field is missing.
- **`timestamps: true`**: Mongoose manages `createdAt` / `updatedAt` for you.
- **`mongoose.model("Task", schema)`**: creates the model. Mongoose **lowercases and pluralizes** the name for the collection: `Task` → `tasks`.
- **`toJSON` transform**: controls what `res.json(task)` sends. Without it, clients see `_id` and `__v` (an internal version counter nobody needs).

## 🧰 6. Schema cheat sheet

| Option | Example | What it does |
|--------|---------|--------------|
| `type` | `String`, `Number`, `Boolean`, `Date`, `[String]` | The data type |
| `required` | `required: [true, "msg"]` | Must be present |
| `default` | `default: false` | Value if missing |
| `trim` / `lowercase` | `lowercase: true` | Cleans strings |
| `minlength` / `maxlength` | `maxlength: 120` | String length limits |
| `min` / `max` | `min: 1` | Number limits |
| `enum` | `enum: ["basic", "premium"]` | Only these values |
| `match` | `match: /^\S+@\S+\.\S+$/` | Must match a regex |
| `unique` | `unique: true` | Creates a **unique index** (⚠️ see note) |
| `validate` | custom function | Your own rule |

> 📝 **Note on `unique`:** it is **not** a validator. It creates a **database index**. Violations produce a **duplicate key error (code `11000`)**, not a `ValidationError`. We'll translate it to a `409` soon (Lesson 3 ✅ meets Lesson 7).

> ⚠️ **Gotcha: Mongoose casts types.** If someone sends `{ "title": 42 }`, Mongoose quietly turns it into the string `"42"`. So your **controller's type checks (`typeof title !== "string"`) still matter**. Defense in depth. 🛡️

## 🆔 7. IDs changed. Pay attention. 🚨

MongoDB IDs are **not** `1, 2, 3` anymore. They're **ObjectIds**, 24-character hex strings:

```
665f1c2e8b3a4d0012a4b7c9
```

That breaks your Lesson 4/6 `validateId` (it used `Number()`). Update **`src/middleware/validateId.js`**:

```js
const { BadRequestError } = require("../errors/errors");

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

function validateId(req, res, next) {
  if (!OBJECT_ID.test(req.params.id)) {
    throw new BadRequestError("ID is not valid");
  }
  req.itemId = req.params.id; // stays a string now
  next();
}

module.exports = validateId;
```

> 📝 **Note:** Mongoose has `mongoose.isValidObjectId()`, but it also returns `true` for **any 12-character string** (like `"hello world!"`). Our strict 24-hex regex avoids that surprise. This is a **real** production gotcha. 🕵️

> 🧠 **Two different failures, two different codes:**
> - `/tasks/banana` → **bad format** → `400`
> - `/tasks/665f1c2e8b3a4d0012a4b7c9` (valid format, doesn't exist) → `404`

---

# 🔧 PART D: CRUD with Mongoose

## 📖 8. The methods you'll use constantly

| Operation | Mongoose method | Returns |
|-----------|----------------|---------|
| **Create** | `Task.create({ title })` | the new document |
| **Read many** | `Task.find(filter)` | array of documents |
| **Read one** | `Task.findById(id)` | the document, or `null` |
| **Update** | `Task.findByIdAndUpdate(id, changes, options)` | the document, or `null` |
| **Delete** | `Task.findByIdAndDelete(id)` | the deleted document, or `null` |
| **Count** | `Task.countDocuments(filter)` | a number |
| **Exists?** | `Task.exists(filter)` | `{ _id }` or `null` |

**Every one is asynchronous. You must `await` them.** 🚨

### Chaining modifiers

```js
await Task.find({ done: false })
  .sort({ createdAt: -1 })   // newest first (-1 = descending, 1 = ascending)
  .limit(10)                 // max 10 results
  .select("title done");     // only these fields
```

### ⚠️ The two update options you MUST know

```js
await Task.findByIdAndUpdate(id, changes, {
  new: true,            // return the UPDATED document (default returns the OLD one!)
  runValidators: true,  // run schema rules on updates (OFF by default!)
});
```

Without `runValidators`, someone can `PATCH` a title to 500 characters and **bypass your schema**. 😱 Without `new: true`, your response shows the **old** data.

### 🔎 Filter operators (the "language" of queries)

```js
Task.find({ done: true })                         // equality
Workout.find({ minutes: { $gte: 30 } })           // ≥
Workout.find({ minutes: { $gt: 20, $lt: 60 } })   // between
Book.find({ year: { $gt: 2010 } })                // after
Book.find({ _id: { $nin: [id1, id2] } })          // NOT in a list
Book.find({ author: "Maaza Mengiste" })           // exact match
```

| Operator | Meaning |
|----------|---------|
| `$gt` / `$gte` | greater than / or equal |
| `$lt` / `$lte` | less than / or equal |
| `$ne` | not equal |
| `$in` / `$nin` | in / not in a list |

**Your Lesson 2 filters** (`?minRating=`, `?after=`) now become **database queries**, not `.filter()` on an array. Faster, and they scale to millions of records. 🚀

### 🕵️ Safety: partial-text search

```js
// ❌ DANGEROUS: user input directly inside a regex
Book.find({ title: { $regex: req.query.search, $options: "i" } });
```

A user could send regex special characters (like `.*` or worse) and cause chaos. **Escape** the input:

```js
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

Book.find({ title: { $regex: escapeRegex(search), $options: "i" } });
```

> 🧠 **Related danger, NoSQL injection:** if you put `req.body.x` straight into a filter and the client sends an **object** like `{ "$gt": "" }` instead of a string, the query changes meaning. **Always check `typeof` before using client data in a query.** (Lesson 3's "never trust the client", leveled up.)

---

# 🔄 PART E: The Big Swap

## 🎁 9. The payoff of Lesson 6

New structure:

```
src/
├── models/           ← 🆕 Mongoose schemas
│   └── Task.js
├── data/
│   └── tasks.store.js   ← rewritten (same function names!)
├── controllers/         ← gain async/await
├── routes/              ← UNCHANGED 🎉
└── middleware/          ← validateId + loadTask updated
```

### 📄 `src/data/tasks.store.js` (rewritten)

```js
const Task = require("../models/Task");

function findAll({ done } = {}) {
  const filter = {};
  if (done !== undefined) filter.done = done;
  return Task.find(filter).sort({ createdAt: 1 });
}

function findById(id) {
  return Task.findById(id);
}

function create(data) {
  return Task.create(data);
}

function update(id, changes) {
  return Task.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
}

async function remove(id) {
  const deleted = await Task.findByIdAndDelete(id);
  return deleted !== null;
}

module.exports = { findAll, findById, create, update, remove };
```

**Same function names as before.** The controller doesn't care *how* the store works. That was the promise of Lesson 6. ✅

### 📄 `src/middleware/loadTask.js`

```js
const store = require("../data/tasks.store");
const { NotFoundError } = require("../errors/errors");

async function loadTask(req, res, next) {
  const task = await store.findById(req.itemId);
  if (!task) throw new NotFoundError("Task");
  req.task = task;
  next();
}

module.exports = loadTask;
```

### 📄 `src/controllers/tasks.controller.js` (only `async`/`await` added)

```js
async function listTasks(req, res) {
  // ...same validation of ?done...
  const data = await store.findAll(filter);
  res.json({ count: data.length, data });
}

async function createTask(req, res) {
  // ...same title checks...
  const task = await store.create({ title: title.trim() });
  res.status(201).location(`/api/v1/tasks/${task.id}`).json(task);
}

async function updateTask(req, res) {
  // ...same whitelisting of title/done...
  const updated = await store.update(req.itemId, changes);
  res.json(updated);
}

async function deleteTask(req, res) {
  await store.remove(req.itemId);
  res.status(204).send();
}
```

`getTask` doesn't change at all (`res.json(req.task)`).

> 🏆 **Pro tip, Express 5 payoff (Lesson 5 ✅):** you wrote **no `try/catch`**. If the database throws, Express 5 sends the rejection to your central error handler automatically. In Express 4 tutorials, you'd see `try/catch` in every function. That's why your code looks so clean. 😎

### 🧪 The moment of truth

1. `POST /api/v1/tasks` (with your API key) → create a task.
2. **Stop the server. Start it again.**
3. `GET /api/v1/tasks` → **your task is still there.** 🎉🎉🎉

> 🎮 **Quest 2: Swap your store to Mongoose and survive a restart (+150 XP).**

### 🌱 Bonus tool: a seed script

Create **`src/seed.js`** to reset sample data in one command:

```js
const mongoose = require("mongoose");
const config = require("./config/config");
const Task = require("./models/Task");

async function seed() {
  await mongoose.connect(config.mongodbUri);
  await Task.deleteMany({});
  await Task.insertMany([
    { title: "Learn Express" },
    { title: "Learn Mongoose", done: true },
    { title: "Build an API" },
  ]);
  console.log("🌱 Database seeded");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

In `package.json`: `"seed": "node src/seed.js"` → run `npm run seed`.

> 🚨 `deleteMany({})` **erases everything** in that collection. Only run it against your **development** database. Never production.

---

# 🧯 PART F: Database Errors, the Central Handler Wins Again

## 💥 10. Three new error types

| Error | When | How to detect |
|-------|------|---------------|
| **ValidationError** | A schema rule is broken | `err.name === "ValidationError"` |
| **Duplicate key** | A `unique` field repeats | `err.code === 11000` |
| **CastError** | A value can't be converted (bad ObjectId) | `err.name === "CastError"` |

Without translation, these are "bugs" to your handler, so clients get `500`. Wrong! They're **client mistakes**. Teach the handler.

Update **`src/middleware/errorHandler.js`**:

```js
const config = require("../config/config");
const { AppError, BadRequestError, ConflictError } = require("../errors/errors");

// 🔄 Turn database errors into our own error classes
function normalizeError(err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new BadRequestError(messages.join(", "));
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    return new ConflictError(`That ${field} already exists`);
  }
  if (err.name === "CastError") {
    return new BadRequestError(`Invalid ${err.path}`);
  }
  return err; // not a database error, leave it alone
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  err = normalizeError(err);

  const status = err.status || 500;
  const isSafe = err instanceof AppError || err.expose === true;
  if (!isSafe) console.error("💥", err);

  const body = {
    error:
      err.type === "entity.parse.failed"
        ? "Invalid JSON in request body"
        : isSafe
        ? err.message
        : "Something went wrong on our side",
    status,
  };
  if (config.nodeEnv === "development" && !isSafe) body.stack = err.stack;

  res.status(status).json(body);
}

module.exports = errorHandler;
```

Now a 150-character title returns:

```json
{ "error": "Title cannot exceed 120 characters", "status": 400 }
```

**One handler. Every error. Same shape.** That's the Lesson 5 payoff, growing stronger. 💪

> 🎮 **Quest 3: Make all three database errors produce clean `400`/`409` responses (+100 XP).**
> *(To test the duplicate key, you'll need a model with a `unique` field. Try adding `email` to a test model.)*

---

# 🔗 PART G: Relationships

## 🧠 11. Two ways to connect data

| | **Embedding** | **Referencing** |
|---|---|---|
| **What** | Put the child **inside** the parent document | Store the child's **ID** in another document |
| **Example** | `member.workouts: [ {...}, {...} ]` | `workout.member = <member's _id>` |
| **Good when** | Data is small and always read together | Data grows, is shared, or queried on its own |
| **Risk** | Documents grow huge (16MB limit) | Needs extra lookups |

Workouts and loans **grow without limit** and are queried on their own → **reference** them.

## 🧩 12. Referencing in Mongoose

```js
// src/models/Workout.js
const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",              // ⚠️ must match the model name exactly
      required: [true, "Member is required"],
      index: true,                // faster lookups by member
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ["cardio", "strength", "flexibility"],
        message: "Type must be cardio, strength, or flexibility",
      },
    },
    minutes: {
      type: Number,
      required: true,
      min: [1, "Minutes must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Minutes must be a whole number",
      },
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
```

### `populate()`: replace an ID with the real document

```js
const workouts = await Workout.find().populate("member", "name plan");
```

Without `populate`:
```json
{ "member": "665f1c2e8b3a4d0012a4b7c9", "type": "cardio" }
```

With `populate("member", "name plan")`:
```json
{ "member": { "name": "Amina", "plan": "premium", "id": "665f..." }, "type": "cardio" }
```

(The second argument picks which member fields to include. Don't leak what clients don't need!)

### 🔙 Callback to Lesson 6: the `409` rule

> *"A member who still has workouts can't be deleted."*

```js
const hasWorkouts = await Workout.exists({ member: req.itemId });
if (hasWorkouts) throw new ConflictError("Member still has workouts");
```

Same idea. Now it's **one fast database query**.

## 📊 13. Aggregation: a first taste

For stats ("which member trained the most minutes?"), the database does the math:

```js
const top = await Workout.aggregate([
  { $group: { _id: "$member", totalMinutes: { $sum: "$minutes" } } },
  { $sort: { totalMinutes: -1 } },
  { $limit: 1 },
]);
// → [ { _id: <memberId>, totalMinutes: 335 } ]
```

Read it as an **assembly line** (Lesson 4 vibes! 🏭): group by member and sum minutes → sort descending → keep the first.

| Stage | Job |
|-------|-----|
| `$match` | Filter documents (like `find`) |
| `$group` | Group and calculate (`$sum`, `$avg`, `$max`) |
| `$sort` / `$limit` | Order and trim |

> ⚠️ **Gotcha:** inside `aggregate()`, Mongoose does **not** auto-convert string IDs. If you `$match` on a member ID, wrap it: `new mongoose.Types.ObjectId(id)`.

---

## 🧯 14. Debugging cheat sheet (Lesson 7 edition)

| Problem | Likely cause |
|---------|-------------|
| `MongooseServerSelectionError` | Can't reach the DB: wrong URI, **your IP isn't allowed in Atlas**, no internet, or local MongoDB isn't running |
| `bad auth` / `Authentication failed` | Wrong username/password, or special characters in the password aren't URL-encoded |
| `Operation buffering timed out after 10000ms` | You queried before connecting, or the connection failed. Connect **before** `listen()` |
| `res.json()` shows `{}` or a weird object | You forgot **`await`**, so you sent a Promise |
| `controller.x is not a function` | Export/import mismatch (Lesson 6 ✅) |
| `CastError: Cast to ObjectId failed` | A malformed ID reached a query. Validate IDs with `validateId` first |
| PATCH accepts invalid data | Missing **`runValidators: true`** |
| PATCH response shows **old** data | Missing **`new: true`** |
| Duplicate values allowed even with `unique: true` | The index wasn't built (duplicates existed already, or the collection was created before the schema change). Drop the collection and reseed in dev |
| `populate` returns just an ID | `ref` doesn't exactly match the model name, or you forgot `.populate()` |
| Clients see `_id` and `__v` | Add the `toJSON` transform to the schema |
| `MONGODB_URI` is `undefined` | `.env` missing, misspelled, or started from the wrong folder (Lesson 6 ✅) |

---

## ✅ 15. Quick recap

- **MongoDB** stores flexible documents. **Mongoose** adds **schemas, validation, and models**.
- Put the **URI in `.env`**, never in code. **Connect before `listen()`.**
- **Schema** = blueprint, **Model** = tool, **Document** = one record.
- IDs are now **24-char ObjectId strings**. Validate with a strict regex → `400` for bad format, `404` for missing.
- Core methods: `create`, `find`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`, `countDocuments`, `exists`. **Always `await`.**
- Updates need **`{ new: true, runValidators: true }`**.
- Mongoose **casts types**, so keep your controller checks.
- Translate **ValidationError → 400**, **duplicate key (11000) → 409**, **CastError → 400** in the **central handler**.
- **Reference** (`ref` + `populate`) for data that grows. **Embed** for small, always-together data.
- **Aggregation** pipelines let the database do the math.
- Thanks to Lesson 6, the swap touched **models + store**, and controllers only gained `async/await`. 🏛️

---

# ⚔️ THE CHALLENGES

> 🔗 **Stacking rule:** the Boss Fight combines **Lessons 1 + 2 + 3 + 4 + 5 + 6 + 7**. 👹
>
> **Ritual:** ⌨️ type it · 🔬 debug alone 10 min first · 🧪 Thunder Client · 🐙 commit after each challenge. Hints hidden. No full solutions unless you ask. 😎

---

## 🥉 CHALLENGE 1: Foundation · `+200 XP`

**Goal:** Swap an existing API from arrays to MongoDB.

Take your **Notes API** from Lesson 6 Challenge 1 and copy it to `lesson-7/challenge1/`. Port **4000**.

**Tasks:**

1. Create `models/Note.js`: `text` (required, trimmed, 1-500 characters), `pinned` (default `false`), `timestamps`. Add the `toJSON` transform.
2. Rewrite `notes.store.js` to use Mongoose. **Keep the same function names.**
3. Make `validateId` accept ObjectIds only. Make `loadNote` async.
4. Add `async`/`await` to the controllers. **Routes file must not change** (prove it with `git diff`).
5. Add the three error translations to `errorHandler`.
6. Write `src/seed.js` and an `npm run seed` script.
7. Update `config.js` (fail fast if `MONGODB_URI` is missing), `.env`, `.env.example`.

✅ **Success check:**

- Create notes, **restart the server**, and the notes are still there.
- `/notes/banana` → `400`. `/notes/665f1c2e8b3a4d0012a4b7c9` (valid format, missing) → `404`.
- Posting a 600-character note → `400` with **your schema's message**.
- `PATCH` with a 600-character note → still `400` (so `runValidators` works).
- `PATCH` returns the **updated** data (so `new: true` works).
- Clients never see `_id` or `__v`.
- `git diff` shows `notes.routes.js` unchanged. 🎉

<details>
<summary>💡 Hint 1</summary>

Your old store exported `findAll, findById, create, update, remove`. Export the **same names**, then the controller changes are tiny.

</details>

<details>
<summary>💡 Hint 2</summary>

If the PATCH validation test passes without `runValidators`, you probably validated only in the controller. Remove that check temporarily to test the **schema** layer on its own. 🔬

</details>

---

## 🥈 CHALLENGE 2: Real-World Application · `+400 XP`

**Goal:** Two linked collections, populate, and aggregation. 💪

Create `lesson-7/challenge2/`. Port **5000**. Rebuild your **Gym Tracker** (Lesson 6 Challenge 2) on MongoDB.

**Models:**

- `Member`: `name` (required), `email` (required, **unique**, lowercase, regex-validated), `plan` (enum `basic`/`premium`, default `basic`).
- `Workout`: `member` (ref → Member), `type` (enum), `minutes` (positive integer), `date` (default now).

**Routes** (same as Lesson 6, now persistent, plus new ones):

| Route | Behavior |
|-------|----------|
| `GET /api/v1/members` | Filter `?plan=`. Search `?search=` (**escaped regex**, case-insensitive on name). `?limit=` (positive integer, max 100) |
| `POST /api/v1/members` | 🔒 duplicate email → `409` |
| `GET/PATCH/DELETE /api/v1/members/:id` | DELETE → `409` if the member has workouts (`Workout.exists`) |
| `GET /api/v1/members/:memberId/workouts` | Filters `?type=`, `?after=YYYY-MM-DD`. Populated with member `name` |
| `POST /api/v1/members/:memberId/workouts` | 🔒 member loaded by middleware |
| `GET /api/v1/workouts` | Filters `?type=`, `?minMinutes=`, `?limit=`, sorted newest first |
| `GET /api/v1/admin/stats` | 🔒 router-level. Total members, total workouts, total minutes, and **most active member (with name)**, all using **database queries/aggregation**, not JavaScript loops |

✅ **Success check:**

- Posting two members with the same email (different capitalization!) → `409`.
- `/members?search=am` finds **Amina** regardless of case. `/members?search=.*` does **not** match everything. (Escaped regex! 🕵️)
- `/workouts?minMinutes=40&type=cardio` works as a combined filter.
- `/admin/stats` shows the correct most-active member name (needs aggregation **plus** a member lookup).
- Deleting a member with workouts → `409`. Deleting the workouts first, then the member → `204`.
- Everything survives a restart. A `seed` script creates 3 members + 6 workouts.

<details>
<summary>💡 Hint 1 (after-date filter)</summary>

`{ date: { $gte: new Date(after) } }`. Validate that `new Date(after)` isn't `Invalid Date` first. `Number.isNaN(date.getTime())` detects that.

</details>

<details>
<summary>💡 Hint 2 (stats)</summary>

Use `Workout.aggregate([...$group, $sort, $limit])` to get the top member's ID, then `Member.findById(...)` for the name. Use `Promise.all([...])` to run the independent counts **in parallel**. 🚀

</details>

<details>
<summary>💡 Hint 3 (unique email gotcha)</summary>

`lowercase: true` converts the email before saving, so `A@x.com` and `a@x.com` collide correctly. If duplicates still sneak in, the index may not exist yet. Drop the collection and reseed.

</details>

---

## 🥇 CHALLENGE 3: 👹 BOSS FIGHT: The Stacked Challenge · `+800 XP`

**Goal:** Merge **Lessons 1-7**. Move your **Library System** to MongoDB. 📚🍃

Create `lesson-7/boss/` with the full structure (`src/` with `config/`, `errors/`, `middleware/`, `models/`, `routes/`, `controllers/`, `data/`, `seed.js`) + `README.md` + `docs/`. Port **6000**.

**Models:**

```
Book   { title, author, year }                                (timestamps)
Member { name, email (unique) }                               (timestamps)
Loan   { book → Book, member → Member, borrowedAt, returnedAt (null until returned) }
```

> 🔄 `available` is **computed**, never stored (Lesson 6 ✅). With MongoDB, "available" = **no loan for that book with `returnedAt: null`**.

### 📋 Requirements

**🍃 Lesson 7 (new):**

1. **Mongoose models** with proper validation: title/author non-empty and length-limited, `year` an **integer** from `1000` to the current year (custom `validate` with a dynamic max!), `email` format + **unique**.
2. `config.js` fails fast on missing `MONGODB_URI` and `ADMIN_KEY`. Connect to the DB **before** `listen()`.
3. **Seed script:** 5 books, 2 members, 1 active loan, 1 returned loan.
4. **Central handler translates** `ValidationError` → `400` (all messages), duplicate key → `409`, `CastError` → `400`.
5. `GET /api/v1/health` → `{ "status": "ok", "db": "connected" | "disconnected" }`. *(Hint: `mongoose.connection.readyState === 1` means connected.)*
6. **Use database queries** for all filters. No array `.filter()` on whole collections.
7. `GET /api/v1/books?available=true|false` must be **computed from loans** using database queries.

**🏛️ Lesson 6 (architecture, all still working):**

8. Routers/controllers/stores for **books, members, loans**. `app.js` vs `server.js`. Everything under `/api/v1` except the `GET /` dashboard. `{ count, data }` list shape, `Location` header on `201`.
9. `/api/v1/admin/*` guarded with `router.use(requireApiKey)`.
10. Loans (purist REST): `POST /loans`, `POST /loans/:id/return`, `GET /loans` (`?active=`, `?memberId=`, `?bookId=`), `GET /loans/:id` (with **populated** book title and member name).
11. Nested: `GET /books/:id/loans`, `GET /members/:id/loans`.
12. Delete rules: a book or member with an **active** loan → `409`.

**🔙 Lessons 1-5 (all still working):**

13. Book filters: `?author=`, `?after=`, `?search=` (escaped regex on title), `?sort=year|title&order=asc|desc`, `?limit=`. `GET /books/newest`, `/books/count` (route order! 🌶️), `/authors/:name/books`.
14. Full CRUD with validation. Write operations need the admin key (`401`/`403`).
15. Infrastructure: `requestId`, **rate limiter** (limits from `.env`), `helmet`, `cors`, `morgan`, `express.json({ limit })`, custom error classes, **zero `res.status(4xx)` outside the handler**.
16. `GET /api/v1/reports/summary` (async): total books, active loans, **most borrowed book (with title)** via **aggregation** (`$group` on `book`, sorted by count).
17. `GET /` dashboard HTML with links and live counts. `GET /api/v1/status` with uptime calculated **by you** and counts from the database.

**📄 Docs & Git**

18. `README.md` (setup, env vars, seeding, endpoint table). Thunder Client collection exported to `docs/`.
19. **At least 7 meaningful commits.** Real secrets never in history. 🐙

**🌟 Bonus (+100 XP):**

20. **Prevent double-borrowing at the database level.** Two simultaneous `POST /loans` for the same book could both pass your "is it available?" check (a **race condition**). Research **partial unique indexes** and design a fix. *(Hint: you may need an `active: Boolean` field on Loan. What does that do to the "single source of truth" idea from Lesson 6? Write down the trade-off in your README.)*
21. If the DB is disconnected, return a clean `503` instead of timing out.

### ✅ Success check

- Borrow a book → it disappears from `?available=true` and appears in `?available=false`. Return it → reversed.
- Borrowing twice → `409`. Borrowing with a missing book/member → `404`. Invalid ID format → `400`.
- Deleting a borrowed book → `409`.
- `POST /books` with `year: 3000` → `400` with your message. `PATCH` the same → still `400`.
- Two members with the same email → `409`.
- `/books/newest`, `/books/count`, `/books/<id>` all work.
- Restart the server → **everything is still there**.
- Disconnect the DB (wrong URI) → server refuses to start with a clear message.
- `/reports/summary` names the right most-borrowed book.
- No giant `.filter()` over a whole collection anywhere. 🔎

### 🧠 Where to think

- **`?available=true`** means "books with **no** active loan." Think in two steps: *(1)* get the IDs of books with an active loan, *(2)* find books **not in** that list. Which Mongoose methods fit? *(Peek at `Loan.distinct(...)` and `$nin`.)*
- Is `Book.find()` + `Loan.find()` in **two queries** okay, or should one query do it all? What are the trade-offs? *(Simpler code vs one round-trip.)*
- In `GET /loans/:id`, which fields should `populate` return? *(Should the member's **email** be visible to every client?)* 🕵️
- Where should the "is this book available?" logic live now? *(Hint: Lesson 6, "stores never import other stores".)*
- What happens if the **book is deleted** while a loan still references it? Your `409` rule prevents active loans. What about **returned** loans? *(Real design question. Decide, and document it.)*

<details>
<summary>💡 Hint 1 (available filter)</summary>

```js
const activeBookIds = await Loan.distinct("book", { returnedAt: null });
// available=true  → Book.find({ _id: { $nin: activeBookIds } })
// available=false → Book.find({ _id: { $in: activeBookIds } })
```
Wrap this in **one** helper so every route reuses it.

</details>

<details>
<summary>💡 Hint 2 (dynamic max year)</summary>

`max: [() => new Date().getFullYear(), "Year cannot be in the future"]`. Using a **function** keeps it fresh every year. A hardcoded number breaks next January. (Lesson 3 callback!)

</details>

<details>
<summary>💡 Hint 3 (most borrowed book)</summary>

`Loan.aggregate([{ $group: { _id: "$book", borrows: { $sum: 1 } } }, { $sort: { borrows: -1 } }, { $limit: 1 }])`, then `Book.findById(result._id)` for the title.

</details>

<details>
<summary>💡 Hint 4 (health route)</summary>

`mongoose.connection.readyState`: `0` disconnected, `1` connected, `2` connecting, `3` disconnecting. Map `1` → `"connected"`, anything else → `"disconnected"`.

</details>

---

# 🏋️ THE PRACTICE ARENA (Lesson 7)

## 🔮 ZONE 1: Predict the Output · `+50 XP`

### Q1: The missing await

```js
async function listTasks(req, res) {
  const data = Task.find();
  res.json({ data });
}
```

What does the client receive?

<details>
<summary>👀 Answer</summary>

Not the tasks. `Task.find()` returns a **query/Promise**, not data. The response is a strange empty-ish object. Fix: `const data = await Task.find();`. This is the #1 Mongoose bug. 🐛

</details>

### Q2: Old or new?

```js
const task = await Task.findByIdAndUpdate(id, { done: true });
res.json(task);
```

The task was `done: false` before. What does `res.json` show?

<details>
<summary>👀 Answer</summary>

The **old** document (`done: false`)! The update happened in the database, but the default returns the document **before** the change. Add `{ new: true }`.

</details>

### Q3: Cast away

```js
await Task.create({ title: 42 });
```

Does it throw an error?

<details>
<summary>👀 Answer</summary>

No! Mongoose **casts** `42` to `"42"` and saves it. That's why your controller still checks `typeof title === "string"`. Schemas don't replace input validation.

</details>

---

## 🐛 ZONE 2: Bug Hunt · `+100 XP`

### 🐞 Bug 1: The leaky update (find 2)

```js
async function updateTask(req, res) {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body);
  res.json(updated);
}
```

<details>
<summary>👀 Answer</summary>

1. **Passes `req.body` straight in**, so clients can set *any* field (mass assignment). Whitelist fields (Lesson 3 ✅).
2. **No `runValidators`** → invalid values pass. **No `new: true`** → stale response.
3. **No ID validation** → a bad ID causes a `CastError` (should be a clean `400`).

</details>

### 🐞 Bug 2: The Premature Server

```js
app.listen(3000, () => console.log("Running"));
mongoose.connect(process.env.MONGODB_URI);
```

Early requests sometimes fail strangely. Why?

<details>
<summary>👀 Answer</summary>

The server accepts requests **before** the database is connected, and the connection **isn't awaited**, so connection failures are silent. Connect first (`await`), then `listen()`.

</details>

### 🐞 Bug 3: The Impostor ID

```js
if (!mongoose.isValidObjectId(req.params.id)) throw new BadRequestError("Bad ID");
```

A request to `/members/hello-world!` (12 characters) passes this check. Then what?

<details>
<summary>👀 Answer</summary>

`isValidObjectId` accepts **any 12-character string** (it treats it as raw bytes). The query then runs with a weird ID → normally a `404`, but it's inconsistent and confusing. Use the strict `/^[0-9a-fA-F]{24}$/` check.

</details>

### 🐞 Bug 4: The Published Password

```js
// db.js
mongoose.connect("mongodb+srv://bisrat:MyPass123@cluster0.abc.mongodb.net/app");
```

…committed and pushed. What are **all** the problems and the right response?

<details>
<summary>👀 Answer</summary>

1. Credentials hardcoded → move to `.env` → `process.env.MONGODB_URI`.
2. Pushed to GitHub → the password is public **forever in history**.
3. **Right response:** change the DB password **immediately** in Atlas (rotating the secret). Then fix the code. Rewriting Git history is optional, but rotating the password is mandatory. 🔐

</details>

---

## ⚡ ZONE 3: Speed Drills · `+50 XP each (200 XP)`

### ⚡ Drill 1: Schema Playground 🎨

Design a `Product` schema: `name` (required, 2-80 chars), `price` (number ≥ 0), `category` (enum of 4 values), `sku` (unique, uppercase, matches `/^[A-Z]{3}-\d{4}$/`), `tags` (array of strings), `inStock` (default true). Write a test script that tries to create **6 invalid products** and prints each error message.

### ⚡ Drill 2: Query Translator 🔎

Write the Mongoose query for each (use your Book model):

1. Books published **after 2010**
2. Books by **Maaza Mengiste**, **newest first**
3. The **3 oldest** books, only `title` and `year`
4. Books whose title **contains "king"** (case-insensitive, **escaped**)
5. How many books were published **before 2000**?
6. Books **not** written by Chimamanda Adichie

### ⚡ Drill 3: Seed and Reset 🌱

Make `seed.js` **idempotent**: running it twice leaves the DB in the same state (no duplicates). Add `npm run seed` and `npm run seed:clear` (empties collections).

### ⚡ Drill 4: The Rebuild Ritual 🔁

Close everything. From memory, rebuild: `config.js` (fail-fast), `db.js`, a model, a store, `validateId` (ObjectId regex), `normalizeError`. Note everything you peeked at. Commit. 🐙

🎮 **Badge: 🍃 Mongoose Tamer** after all 4 drills.

---

## 🏗️ ZONE 4: Your Own Project (Step 5) · `+200 XP`

In `my-project/`:

1. Add `MONGODB_URI` to `.env`, `.env.example`, and fail-fast `config.js`.
2. Create **models** for both resources with real validation and `toJSON` cleanup.
3. Rewrite your **stores** to use Mongoose.
4. Add `normalizeError` to your central handler.
5. Use a **reference** between your two resources, with `populate` in at least one route.
6. Write a **seed script**.
7. Update the Thunder Client collection, README, and **commit + push** (check `git status` to confirm `.env` is *not* staged!). 🐙

> 📝 **Note:** Your project is now a **persistent, structured, secure API**. That's a legitimate portfolio piece. 💼

---

## 🧠 ZONE 5: Teach-Back · `+50 XP`

Answer in your own words (2-4 sentences each):

1. What does Mongoose add on top of plain MongoDB? Invent your own analogy (not the warehouse!).
2. What's the difference between a **schema**, a **model**, and a **document**?
3. Why do updates need `runValidators: true` and `new: true`?
4. Why did we *not* have to rewrite the routes when we switched from arrays to MongoDB? Which lesson made that possible?
5. When would you **reference** data versus **embed** it? Give an example from an app you use.

---

## 🏁 YOUR XP BOARD

| Quest | XP |
|-------|----|
| Quest 0: Push Lesson 6 | 50 |
| Quest 1: Atlas setup + connect | 100 |
| Quest 2: Store swap + restart test | 150 |
| Quest 3: Database error translation | 100 |
| Challenge 1 🥉 | 200 |
| Challenge 2 🥈 | 400 |
| Boss Fight 🥇 | 800 |
| Bonus 🌟 | 100 |
| Practice Arena (Zones 1-3, 5) | 400 |
| Your Own Project (Zone 4) | 200 |
| **Lesson 7 Total** | **2500 XP** |

> 🗄️ Reach **9500 XP total** and you become a **Database Hero**.
> 🧮 With Lessons 1-6 done, you'll be at **10375 XP** after this lesson. 😎

### 🏅 Badges

| Badge | How to earn it |
|-------|----------------|
| 🍃 Mongoose Tamer | All 4 drills |
| 💾 Persistence Pro | Data survives restart in the boss |
| 🔗 Relationship Builder | Working `ref` + `populate` |
| 📊 Aggregator | Correct `$group` stats in Challenge 2 and the boss |
| 🔐 Vault Keeper | URI never committed, fail-fast config |
| ⚔️ Race Condition Slayer | Bonus: DB-level double-borrow protection |

---

## 🔮 Sneak Peek: Lesson 8

Your API is persistent, but **anyone can still read everything and one shared key protects writes**. 😬 **Lesson 8** goes deeper into **Mongoose in production**:

- 🧬 **Advanced schema features**: virtuals, instance methods, middleware hooks
- 🔍 **Better validation and data cleaning**
- 🧹 **Handling database errors** gracefully (timeouts, reconnects, `503`)
- 📚 **Pagination, sorting, and projections** for big collections *(warning: this is how real lists work 👀)*

Then **Phase 5**: real **users, passwords, and JWT login**. 🔐 The Lesson 8 boss fight stacks **Lessons 1-8**. 👹

---

## 📤 What to send me next

In **batches**:

1. **Teach-Back + Predict + Bug Hunt answers**
2. **Challenge 1 + drills**: code in code blocks
3. **Challenge 2 + Boss Fight + GitHub link** 🐙

For each: ✅ what worked, ❌ what broke (**exact error**), and 🔬 **what you tried** first.

I'll review your work, explain your mistakes, and unlock **Lesson 8**. 💪

**Your data used to vanish when the server slept. Now it remembers. Go build something that lasts.** 🍃🔥