# 🟢 Level 1, Lesson 3: Route Parameters and Query Strings

## 🤔 The "Why"

**Problem:** You have 1,000 users. Do you write 1,000 routes?

```js
app.get("/users/1", ...);
app.get("/users/2", ...);   // 😵 no way
```

No. You need **one route** that works for **any** user. You also need a way to filter, like "only users named Ali."

Express gives you two tools:

- **Route parameter**: a *changing part* of the path. Example: `/users/42`
- **Query string**: extra *options* after a `?`. Example: `/search?name=ali&age=20`

## 🧠 Mental Model

> 🏠 **Route param = house number.** It tells you *which one* thing you want: `/users/42`.
>
> 🏷️ **Query string = sticky notes on the envelope.** They tell you *how* you want it: `?sort=new&limit=5`.

Rule of thumb:
- **Which item?** → param
- **Filter, sort, page?** → query

## 💻 Tiny Example

```js
const express = require("express");
const app = express();

// Route param
app.get("/users/:id", (req, res) => {
  res.send(`User number ${req.params.id}`);
});

// Query string
app.get("/search", (req, res) => {
  res.send(req.query);
});

app.listen(3000, () => console.log("Running on 3000"));
```

**Test it:**
- `/users/42` → `User number 42`
- `/search?name=ali&age=20` → `{"name":"ali","age":"20"}`

**Line by line:**
- `:id` in the path: the colon means "this part can be anything. Save it under the name `id`."
- `req.params`: an object that holds the saved parts. Here: `{ id: "42" }`.
- `req.query`: an object built from everything after the `?`. Here: `{ name: "ali", age: "20" }`.
- Passing an object to `res.send` turns it into JSON (Lesson 2).

## 🔬 Under the Hood

**1. How does `:id` match?**
When you write `"/users/:id"`, Express turns it into a **pattern**, like a stamp with a hole in it:

```
Pattern:  /users/ [ anything ]
Request:  /users/42
                 ↑
                 fits the hole → save "42" as id
```

Express splits the path by `/`, compares part by part, and fills `req.params`.

**2. How does `req.query` appear?**
Raw Node gives you only a string: `req.url = "/search?name=ali&age=20"`.

Express cuts the string at `?`, splits the rest by `&`, splits each piece by `=`, and builds an object:

```
"name=ali&age=20"
      ↓ split by &
["name=ali", "age=20"]
      ↓ split by =
{ name: "ali", age: "20" }
```

This is the parsing work you would do by hand in raw Node. 🎯

**3. Everything is a STRING.**
Even `42` arrives as `"42"`. Why? The URL is just text. There are no numbers in text. 

```js
"42" + 1        // "421"  😱 (joins text)
Number("42") + 1 // 43    ✅
```

> 📝 **Note:** Always convert with `Number()` when you need math.

**4. The flow for `GET /users/42?sort=new`:**

```
Client: GET /users/42?sort=new
   ↓
Express splits it:  path = "/users/42"   query = "sort=new"
   ↓
Walks the route list (method + path, first match wins)
   ↓
"/users/:id" matches → req.params = { id: "42" }
                       req.query  = { sort: "new" }
   ↓
Runs your function
```

Notice: the **query is NOT part of route matching**. `/users/42?sort=new` and `/users/42` both match the same route.

**5. Many params are fine:**

```js
app.get("/users/:userId/books/:bookId", (req, res) => {
  res.send(req.params);   // { userId: "5", bookId: "9" }
});
```

## 💥 What Breaks?

| If you... | What happens | Why |
|---|---|---|
| Visit `/users` (no id) with only `/users/:id` defined | `Cannot GET /users` | The hole needs something in it |
| Do `req.params.id + 1` for `/users/42` | `"421"` | Params are strings, `+` joins text |
| Read `req.query.name` when the URL has no `?name=` | `undefined` | Nothing was in the text to parse |
| Write `/users/:id` **before** `/users/new` and visit `/users/new` | The `:id` route runs with `id = "new"` 😱 | First match wins, and `:id` accepts anything |
| Visit `/search?tag=a&tag=b` | `tag` becomes an array `["a","b"]` | Same key twice: the parser collects both |

> ⚠️ **Row 4 is a classic real-world bug.** Rule: put **specific** routes before **general** ones.

> 📝 **Note:** To send a status code like 404, use `res.status(404).send("Not found")`. `res.status()` sets the number, then `send` sends it. It returns `res`, so you can chain them.

---

## 🎮 Your Challenges

Type all the code yourself. ⌨️

**⚔️ Challenge 1: Foundation (30 XP)**
Build two routes:
- `GET /greet/:name` → `Hello, <name>!`
- `GET /add/:a/:b` → the **sum** of a and b (as a number!)

Test `/add/5/7`. Do you get `12` or `57`? Why?

> 💡 `res.send(12)` has a special meaning in Express. Try it and see what happens. Then fix it. This is a real bug that bites many people.

**⚔️ Challenge 2: Real-world (50 XP)**
Use this array:

```js
const products = [
  { id: 1, name: "Laptop", category: "tech", price: 900 },
  { id: 2, name: "Phone", category: "tech", price: 500 },
  { id: 3, name: "Chair", category: "home", price: 120 },
  { id: 4, name: "Lamp", category: "home", price: 40 },
];
```

Build `GET /products`:
- no query → send all products
- `?category=tech` → only that category
- `?maxPrice=500` → only products with price ≤ 500
- both together must work: `?category=tech&maxPrice=500`

**⚔️ Challenge 3: Stack it all 🧠 (80 XP)**
Build a mini book API. It uses **Lessons 1, 2, and 3** together.

```js
const books = [
  { id: 1, title: "Atomic Habits", author: "James Clear" },
  { id: 2, title: "Deep Work", author: "Cal Newport" },
  { id: 3, title: "Clean Code", author: "Robert Martin" },
];
```

Routes:
1. `GET /books` → all books. With `?author=...` → only matching books.
2. `GET /books/:id` → one book. If it does not exist → status **404** with a message.
3. `POST /books` → send `"Book added"` (no real saving yet, we need more tools first).
4. `DELETE /books/:id` → send `"Deleted book <id>"`.
5. `GET /books/latest` → send the **last** book in the array.

⚠️ **Trap inside:** when you build route 5, test it. Does it work? If not, you know why from the table above. Fix it, and **explain the fix in your own words**.

**Bonus XP:**
- 🏆 +10 XP per challenge with no hint
- 🧠 +20 XP: explain back: *"What is the difference between a param and a query, and when do I use each?"*

## 🪜 Stuck?

Struggle **20 minutes**. Try this first:
- `console.log(req.params)` and `console.log(req.query)` at the top of the route. Look at what Express **really** gives you.
- Check the types: `console.log(typeof req.params.id)`.
- Then ask for `Hint 1`.

Commit: `git commit -m "Lesson 3: params and query"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (+390 XP waiting for you!) | Day 1 |

**⏭️ Next:** ⚔️ **Boss Battle #1**: a hard problem that mixes Lessons 1 to 3, no hints at first. After that, Lesson 4: **Middleware**, the heart of Express. 🔥