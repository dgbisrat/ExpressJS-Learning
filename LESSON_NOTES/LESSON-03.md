# 🏋️ LESSON 3 · THE PRACTICE ARENA

> 🎮 **Your XP Bar:** `[█████░░░░░]` *(Practice XP counts toward **API Builder** 🏗️)*

> 🔗 **Why this exists:** Reading code feels like learning. **Writing, breaking, and fixing** code is real learning. Lesson 3 had a lot of new ideas (methods, `req.body`, validation, status codes), and they only stick through repetition. 🧠

**How to use this arena:**

1. Do the sections **in order**. They get harder. 📈
2. **Don't peek** at the hidden answers until you've committed to your own.
3. Write your answers down *first*, even if you're unsure. Guessing wrong is **good**. It makes the right answer stick.

---

## 🔮 ZONE 1: Predict the Output · `+50 XP`

**Goal:** Train your brain to *run code in your head* like a developer.

Don't run anything. Answer each question, then open the answer.

### Q1: The misplaced translator

```js
const express = require("express");
const app = express();

app.post("/hello", (req, res) => {
  res.json({ got: req.body });
});

app.use(express.json()); // 👈 placed AFTER the route

app.listen(3000);
```

A client sends `POST /hello` with body `{ "name": "Sam" }`. What does the response look like?

<details>
<summary>👀 Answer</summary>

`req.body` is **undefined**, so `JSON.stringify` drops the key and the response is `{}`.

Express runs top to bottom. The route handled the request **before** `express.json()` ever ran. Middleware must come **above** the routes that need it.

</details>

### Q2: Delete twice

```js
let tasks = [{ id: 1, title: "A" }];

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: "Not found" });
  tasks.splice(index, 1);
  res.status(204).send();
});
```

A client sends `DELETE /tasks/1` **two times in a row**. What are the two status codes?

<details>
<summary>👀 Answer</summary>

First: **`204`**. Second: **`404`**.

The final *state* is the same either way (the task is gone), which is what "idempotent" means. But the *response* can differ, because the second time there's nothing left to find.

</details>

### Q3: The number traps

What does each line print?

```js
console.log(Number(""));
console.log(Number("12abc"));
console.log(Number(null));
console.log(Number.isInteger(5.0));
console.log(Number.isInteger("5"));
```

<details>
<summary>👀 Answer</summary>

```
0       ← empty string becomes 0 (sneaky!)
NaN
0       ← null becomes 0
true    ← 5.0 is just 5
false   ← it's a string, not a number
```

⚠️ **Real-world danger:** `?limit=` (empty) becomes `Number("")` = `0`, which can sneak past a `Number.isNaN` check. Always check for **positive integers**, not just "not NaN."

</details>

### Q4: The empty body

```js
app.post("/tasks", (req, res) => {
  const { title } = req.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }
  res.status(201).json({ title });
});
```

What status code comes back for each request?

- **A)** `POST` with body `{ "title": "Hi" }`
- **B)** `POST` with body `{ "title": "   " }`
- **C)** `POST` with body `{ "title": 42 }`
- **D)** `POST` with **no body at all**

<details>
<summary>👀 Answer</summary>

- **A)** `201`
- **B)** `400` (after `trim()` it's empty)
- **C)** `400` (a number, not a string)
- **D)** `400` (`req.body ?? {}` prevents a crash, so `title` is `undefined`)

</details>

### Q5: Which route wins?

```js
app.get("/items/:id", (req, res) => res.send("by id"));
app.get("/items/latest", (req, res) => res.send("latest"));
app.post("/items/latest", (req, res) => res.send("posted latest"));
```

What does each request return?

- **A)** `GET /items/latest`
- **B)** `POST /items/latest`
- **C)** `DELETE /items/latest`

<details>
<summary>👀 Answer</summary>

- **A)** `"by id"` 😱 (`:id` is declared first and matches `latest`)
- **B)** `"posted latest"` (no `POST /items/:id` route exists, so the third route matches)
- **C)** `Cannot DELETE /items/latest`, a 404 (no route for that method)

Express matches **method + path** together, in order.

</details>

---

## 🐛 ZONE 2: Bug Hunt · `+100 XP`

**Goal:** Find the bugs. Real developers spend **more time reading broken code than writing new code**.

Each snippet has **at least 2 bugs**. Write down every bug you can find, *then* check.

### 🐞 Bug 1: The Notes POST

```js
let notes = [];

app.post("/notes", (req, res) => {
  const { text } = req.body;
  notes.push({ id: notes.length + 1, text });
  res.json({ message: "created" });
});
```

<details>
<summary>💡 Hint</summary>

Count the problems in these areas: crash safety, validation, ID generation, status code, and what you send back.

</details>

<details>
<summary>👀 All the bugs</summary>

1. **Crash risk:** if there's no body, `req.body` is `undefined` and destructuring throws. Use `req.body ?? {}`.
2. **No validation:** `text` could be empty, a number, or missing.
3. **Broken IDs:** `notes.length + 1` creates **duplicate IDs** after a delete. (Delete note 1 of 3, and the next note gets ID 3, which already exists.) Use a `nextId` counter.
4. **Wrong status:** creating something should return **`201`**, not `200`.
5. **Useless response:** the client needs the **created note** (with its ID), not just a message.

</details>

### 🐞 Bug 2: The Ghost Delete

```js
let notes = [{ id: 1, text: "hello" }];

app.delete("/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });

  notes = notes.filter((n) => n.id !== req.params.id);
  res.status(204).json({ message: "deleted" });
});
```

This code **always** returns 404, even for note 1. Why?

<details>
<summary>💡 Hint</summary>

Lesson 2's DANGER ZONE. What type is `req.params.id`? What type is `n.id`? What does `===` do with different types?

</details>

<details>
<summary>👀 All the bugs</summary>

1. **Type mismatch:** `1 === "1"` is `false`. The param is a **string**, the ID is a **number**. Convert with `Number()` first. This is why it always 404s.
2. **Same bug in `filter`:** it would delete nothing (every item "isn't equal" to the string).
3. **`204` with a body:** a `204` means *No Content*. Sending JSON with it is wrong. Use `.send()` empty.
4. **No ID validation:** `/notes/banana` should be a `400`, not a `404`.

</details>

### 🐞 Bug 3: The Shadowed Route

```js
app.get("/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

app.get("/notes/search", (req, res) => {
  const { q } = req.query;
  res.json(notes.filter((n) => n.text.includes(q)));
});
```

Visiting `/notes/search?q=hi` returns `{ "error": "Not found" }`. Why? Find **2** bugs.

<details>
<summary>👀 All the bugs</summary>

1. **Route order:** `/notes/:id` is first, so `search` is treated as an ID. `Number("search")` is `NaN`, nothing matches, and you get a 404. **Specific routes go above dynamic ones.**
2. **Crash:** if `q` is missing, `n.text.includes(undefined)` searches for the text `"undefined"`. Worse, with a non-string `q` types get confusing. Validate that `q` exists (return `400` if not).

</details>

### 🐞 Bug 4: The Careless PATCH

```js
app.patch("/notes/:id", (req, res) => {
  const note = notes.find((n) => n.id === Number(req.params.id));
  note.text = req.body.text;
  res.json(note);
});
```

Find **3** bugs.

<details>
<summary>👀 All the bugs</summary>

1. **Crash on missing note:** `find` returns `undefined`, so `note.text = ...` throws a `TypeError` (a `500`). Check `if (!note)` → `404`.
2. **Crash on missing body:** `req.body.text` throws if there's no body.
3. **`PATCH` that wipes data:** if the client sends `{}`, `note.text` becomes `undefined`. PATCH should only change fields that were **actually sent**.
4. **(Bonus)** no validation that `text` is a non-empty string.

</details>

### 🐞 Bug 5: The Double Response

```js
app.post("/login", (req, res) => {
  const { password } = req.body ?? {};

  if (password === "1234") {
    res.send("Welcome!");
  }

  res.status(401).send("Wrong password");
});
```

A correct password gives a server error in the terminal. What error, and why?

<details>
<summary>👀 Answer</summary>

`Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`

There's **no `return`** after the first `res.send`, so the function keeps running and tries to send a **second** response. Fix: `return res.send("Welcome!");`

> 📝 **Note:** Also, hardcoded passwords and plain-text comparison are terrible in real apps. We'll fix this properly in Phase 5 (hashing + JWT). 🔐

</details>

🎮 **Badge unlocked at 5/5 bugs fully found: 🐛 Bug Slayer**

---

## ⚡ ZONE 3: Speed Drills · `+40 XP each (200 XP)`

**Goal:** Build **fluency**. These are *small* on purpose. Aim for **10-15 minutes each**. The more you repeat the pattern, the less you'll need to think about it.

> ⏱️ **Rule:** Set a timer. If you're stuck for 5 minutes, open a hint.

### ⚡ Drill 1: Echo API · `l3_drill1.js`

| Route | Behavior |
|-------|----------|
| `POST /echo` | Returns `{ "received": <body>, "keys": [<list of the body's keys>] }` with status `200` |

If the body is missing or has **zero keys** → `400` `{ "error": "Send some JSON!" }`.

<details>
<summary>💡 Hint</summary>

`Object.keys(obj)` returns an array of key names. Check `req.body` exists **before** calling it.

</details>

### ⚡ Drill 2: Counter API · `l3_drill2.js`

| Route | Behavior |
|-------|----------|
| `GET /counter` | `{ "value": <number> }` |
| `POST /counter/increment` | Adds 1, returns the new value |
| `POST /counter/reset` | Sets to 0, returns the new value |
| `PUT /counter` | Body `{ "value": <number> }`. Sets it. Must be an **integer** or → `400` |
| `GET /counter/add/:n` | Adds `n` (a **number** from the URL). Invalid → `400` |

**Think:** which of these routes are idempotent? Write your answer in a comment at the top of your file.

### ⚡ Drill 3: Calculator API · `l3_drill3.js`

| Route | Behavior |
|-------|----------|
| `POST /calc` | Body: `{ "a": 10, "b": 5, "op": "add" }` |

- `op` can be `add`, `sub`, `mul`, `div`.
- `a` and `b` must be **real numbers** (not strings!) or → `400`.
- Invalid `op` → `400` listing the valid options.
- Division by zero → `400`.
- Success → `{ "a": 10, "b": 5, "op": "add", "result": 15 }`.

<details>
<summary>💡 Hint</summary>

A `switch` statement is clean here. Or an object like `{ add: (a, b) => a + b, ... }` that you look up by `op`. 😏

</details>

### ⚡ Drill 4: Notes with Tags · `l3_drill4.js`

Start with:

```js
let notes = [
  { id: 1, text: "Buy milk", tags: ["home"] },
  { id: 2, text: "Finish Express lesson", tags: ["study", "coding"] },
];
let nextId = 3;
```

| Route | Behavior |
|-------|----------|
| `GET /notes` | All notes. Supports `?tag=study` (notes containing that tag) |
| `POST /notes` | Create. `text` required (string), `tags` optional (array of strings, defaults to `[]`) |
| `POST /notes/:id/tags` | Body `{ "tag": "urgent" }` adds a tag. If it already exists → `409` |
| `DELETE /notes/:id/tags/:tag` | Removes that tag. Tag not on note → `404` |

**Think:** a note ID *and* a tag name are both in the URL here. Which is a param, and could the tag name break anything?

### ⚡ Drill 5: THE REBUILD RITUAL 🔁 · `l3_drill5.js`

**This is the most important drill.**

Close the lesson. Close every tab. Open an empty file.

**Rebuild the full Task Manager** (GET all, GET one, POST, PUT, PATCH, DELETE, 404 catch-all) **from memory.**

- ✅ OK to look up syntax if you're truly stuck.
- ❌ Not OK to copy-paste from the lesson.
- 🎯 Every time you peek, make a note of **what** you forgot. That list is your personal study guide.

> 🧠 **Why this works:** Struggling to *recall* something strengthens memory far more than re-reading it. Developers call this "retrieval practice," and it's the best learning technique there is.

🎮 **Badge unlocked after all 5 drills: ⚡ Speed Coder**

---

## 🏗️ ZONE 4: Mini Projects (Stacked!)

> 🔗 These are **bigger** and combine **Lessons 1 + 2 + 3**. Do them *after* the drills. Take your time. Plan on paper first. 📝

---

### 🔥 PROJECT A: Habit Tracker · `+250 XP`

Create `l3_projectA.js` on **port 7000**. Track daily habits and streaks.

```js
let habits = [
  { id: 1, name: "Code for 1 hour", streak: 3, lastChecked: "2026-11-06", active: true },
  { id: 2, name: "Read 10 pages", streak: 0, lastChecked: null, active: true },
  { id: 3, name: "Morning walk", streak: 7, lastChecked: "2026-11-06", active: false },
];
let nextId = 4;
```

**🔙 Lesson 1 requirements:**

1. `GET /` → HTML page with the app name and clickable links.
2. `GET /stats` → JSON with `uptimeSeconds` (calculated by you), `totalHabits`, `activeHabits`, `bestStreak`.
3. `GET /admin` → `403` with an HTML message.
4. Unknown route → `404` JSON `{ "error": "Route not found", "status": 404 }`.

**🔙 Lesson 2 requirements:**

5. `GET /habits` with filters: `?active=true|false`, `?minStreak=3`. Both must be combinable.
6. `GET /habits/top` → the habit with the highest streak.
7. `GET /habits/:id` → `400` for an invalid ID, `404` for a missing one.

**🆕 Lesson 3 requirements:**

8. `POST /habits` → `name` required (non-empty string, **unique**, case-insensitive → else `409`). New habits start with `streak: 0`, `lastChecked: null`, `active: true`.
9. `PATCH /habits/:id` → can update `name` and `active` only. Anything else in the body is **ignored**. 
10. `POST /habits/:id/check` → marks the habit as done **today**:
    - If `lastChecked` is already today → `409` ("Already checked today").
    - If `lastChecked` was **yesterday** → streak + 1.
    - Otherwise → streak resets to **1**.
    - If the habit is inactive → `409` ("Habit is paused").
11. `DELETE /habits/:id` → `204`.

✅ **Success check:**

- Checking the same habit twice in a row → `200` then `409`.
- A habit checked yesterday has its streak go up. One checked 3 days ago restarts at 1.
- `/habits/top` works **and** `/habits/2` works. (Route order! 🌶️)
- `PATCH` with `{ "streak": 999 }` doesn't change the streak.

🧠 **Where to think:**

- How do you get today's date as `"YYYY-MM-DD"`? (`new Date().toISOString().slice(0, 10)`: test it in the console 🔬)
- How do you calculate "yesterday" **without** hardcoding a date? What does `new Date(Date.now() - 24*60*60*1000)` give you?
- Why is `PATCH` ignoring unknown fields safer than copying `req.body` into the habit directly? *(Think: what if someone sends `{ "id": 999 }`?)* 🕵️

<details>
<summary>💡 Hint 1 (date logic)</summary>

Write two small helper functions: `todayString()` and `yesterdayString()`. Then the check route is just three `if` comparisons against `habit.lastChecked`.

</details>

<details>
<summary>💡 Hint 2 (safe PATCH)</summary>

Pull out **only** the fields you allow: `const { name, active } = req.body ?? {};`. Never do `Object.assign(habit, req.body)`. That lets clients overwrite *anything*, including `id` and `streak`.

</details>

🎮 **Badge: 🔥 Streak Keeper**

---

### 🛒 PROJECT B: Mini Store (the capstone) · `+350 XP`

Create `l3_projectB.js` on **port 8000**. This one has **two connected resources** (products and a cart), which makes it feel like a real app.

```js
let products = [
  { id: 1, name: "Notebook", price: 45, stock: 20, category: "stationery" },
  { id: 2, name: "Pen Pack", price: 30, stock: 50, category: "stationery" },
  { id: 3, name: "Backpack", price: 850, stock: 5, category: "bags" },
  { id: 4, name: "Water Bottle", price: 120, stock: 0, category: "accessories" },
];
let nextProductId = 5;
let cart = []; // items look like: { productId: 1, quantity: 2 }
let orders = [];
let nextOrderId = 1;
```

**🔙 Lessons 1 and 2:**

1. `GET /` → HTML store front with links.
2. `GET /status` → uptime (**you** calculate it), product count, items in cart, orders placed.
3. `GET /products` with combinable filters: `?category=`, `?maxPrice=`, `?inStock=true`, plus `?sort=price&order=asc|desc`.
4. `GET /products/cheapest` and `GET /products/:id` (watch the order! 🌶️).
5. `GET /admin` → `403`. Unknown routes → `404` JSON.

**🆕 Lesson 3, products:**

6. `POST /products` → validates `name` (non-empty string), `price` (positive number), `stock` (non-negative integer), `category` (non-empty string). Error message names the **bad field**.
7. `PUT`, `PATCH`, and `DELETE /products/:id`. A product that is **in the cart** cannot be deleted → `409`.

**🆕 Lesson 3, cart:**

8. `GET /cart` → returns items **with** the product name, price, line total, and an overall `total`. ⚠️ Calculate this from the *current* product data, not stored values.
9. `POST /cart/items` → body `{ "productId": 1, "quantity": 2 }`:
    - Product must exist → else `404`.
    - `quantity` must be a positive integer → else `400`.
    - If it's already in the cart → **add to the existing quantity**.
    - Total quantity in cart cannot exceed `stock` → else `409` with a clear message.
11. `PATCH /cart/items/:productId` → body `{ "quantity": 3 }` sets the new quantity (same stock rules).
12. `DELETE /cart/items/:productId` → `204`, or `404` if it isn't in the cart.
13. `POST /checkout` → 
    - Empty cart → `400`.
    - Reduces each product's `stock`, creates an **order** `{ id, items, total, time }`, empties the cart, returns the order with `201`.
14. `GET /orders` and `GET /orders/:id`.

✅ **Success check:**

- Add 3 Backpacks (stock 5) → OK. Add 3 more → `409`.
- Checkout → stock drops, cart empties, `/orders` shows the order.
- Checkout again with an empty cart → `400`.
- Trying to buy the Water Bottle (stock 0) → `409`.
- Changing a product's price with `PATCH` changes the **cart total** automatically.

🧠 **Where to think:**

- `/cart/items/:productId` uses a **product ID**, not a cart-item ID. Is that okay? Why might it be fine here?
- In checkout, what if you reduce stock for item 1, then discover item 2 is out of stock? You've now changed data halfway. **Validate everything first, change data second.** 🛡️
- Where would a helper like `getCartWithTotals()` save you from repeating yourself?

<details>
<summary>💡 Hint 1 (cart total)</summary>

Use `.map()` to build each line (join each cart item with its product via `find`), then `.reduce()` to sum the line totals.

</details>

<details>
<summary>💡 Hint 2 (safe checkout)</summary>

Loop through the cart **once** to check stock for everything. Only if all pass, loop a **second** time to actually reduce stock. Two passes = no half-finished orders.

</details>

<details>
<summary>💡 Hint 3 (stock rule on add)</summary>

Find the existing quantity first (or `0`), compute `existing + quantity`, and compare it to `product.stock` **before** you change anything.

</details>

🎮 **Badge: 🛒 Store Architect**

---

## 🧠 ZONE 5: Teach-Back · `+50 XP`

**Goal:** If you can *explain* it simply, you truly understand it.

Answer these **in your own words**. Short is fine (2-4 sentences each). Pretend you're explaining to a friend who just finished HTML and CSS.

1. What's the difference between `req.params`, `req.query`, and `req.body`? When do you use each?
2. Why does `req.body` become `undefined` if you forget `express.json()`?
3. Explain `PUT` vs `PATCH` using an example **you** invent (not a task list).
4. Why is it wrong to trust data from the client? Give an example of what could go wrong.
5. Why do `409` and `404` mean different things? Give one example of each from an app you use daily.

Send me your answers. I'll tell you what's **solid ✅**, what's **fuzzy ⚠️**, and what needs **a second look 🔁**.

---

## 🗓️ Suggested Practice Plan

Don't try to do all this in one night. Here's a rhythm that works:

| Day | Do this | Time |
|-----|---------|------|
| **Day 1** | Re-read Lesson 3 + Zone 1 (Predict) | ~40 min |
| **Day 2** | Zone 2 (Bug Hunt) + Drills 1-2 | ~60 min |
| **Day 3** | Drills 3-4 + Lesson 3 Challenge 1 and 2 | ~90 min |
| **Day 4** | Drill 5 (Rebuild Ritual) + Lesson 3 Boss Fight | ~2 hours |
| **Day 5** | Project A | ~2 hours |
| **Day 6** | Project B | ~3 hours |
| **Day 7** | Zone 5 (Teach-Back) + send me everything 📤 | ~45 min |

> 📝 **Note:** Consistency beats intensity. 45 focused minutes every day beats one 6-hour panic session. This is the Atomic Habits idea again: make starting **easy**, keep the standard **high**. 💪

---

## 🏁 PRACTICE XP BOARD

| Zone | XP | Badge |
|------|----|-------|
| Predict the Output | 50 | |
| Bug Hunt | 100 | 🐛 Bug Slayer |
| Speed Drills (5 × 40) | 200 | ⚡ Speed Coder |
| Project A: Habit Tracker | 250 | 🔥 Streak Keeper |
| Project B: Mini Store | 350 | 🛒 Store Architect |
| Teach-Back | 50 | |
| **Practice Total** | **1000 XP** | |

> 🏗️ **Finish Lesson 3's main challenges + this arena, and you're not just an API Builder. You're dangerous.** 😎

---

## 📤 What to send me

You don't need to send everything at once. Send in **batches**:

1. **Zones 1, 2, and 5** (your written answers): quick to review
2. **Drills + Lesson 3 challenges**: your code in code blocks
3. **Projects A and B**: when you finish them

For each: ✅ what worked, ❌ what broke (paste the **exact error**).

I'll review, explain your mistakes, and when you're ready, we unlock **Lesson 4: Middleware**, where all that repeated code finally disappears. 🔧✨

**Start with Zone 1. Predict first, run later.** 🔮🔥