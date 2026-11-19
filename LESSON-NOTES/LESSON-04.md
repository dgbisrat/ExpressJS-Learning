# 🔬 Lesson 4: Req and Res Advanced Topics

**Level 2 · Reward: 250 XP**

Until now you used `req.params` and `res.send()`. Today you open the **full toolbox** of `req` and `res`. 🧰

---

## 📝 Notes (copy into `lesson4.md`)

### Useful `req` properties

| Property | Example value for `GET http://localhost:3000/shop/shoes?color=red` |
|---|---|
| `req.method` | `"GET"` |
| `req.url` | `"/shop/shoes?color=red"` (relative to the current router) |
| `req.originalUrl` | `"/shop/shoes?color=red"` (always the full original) |
| `req.path` | `"/shop/shoes"` (no query string) |
| `req.query` | `{ color: "red" }` |
| `req.hostname` | `"localhost"` |
| `req.protocol` | `"http"` |
| `req.ip` | the client's IP address |
| `req.headers` | an object of all headers (names are **lowercase**) |
| `req.get("User-Agent")` | one header, case-insensitive lookup |

### Useful `res` methods

| Method | Job |
|---|---|
| `res.send()` | send text/HTML/object/buffer |
| `res.json()` | send JSON |
| `res.status(code)` | set status (chainable) |
| `res.sendStatus(code)` | set status **and** send its text (`404` sends `"Not Found"`) |
| `res.set(name, value)` | set a response header |
| `res.type("html")` | set the Content-Type |
| `res.redirect(url)` | send the client to another URL |
| `res.sendFile(path)` | send a file |
| `res.download(path)` | make the browser download a file |

---

## 🔍 Under the hood

**`req` and `res` are Node's own objects, upgraded.** Node creates `req` (an `IncomingMessage`) and `res` (a `ServerResponse`). Express adds extra methods on top, like `res.json()` and `req.query`. That is why everything you learned in raw Node still works in Express.

**A response has two parts: headers first, then the body.**

```
HTTP/1.1 200 OK            ← status line
Content-Type: text/html    ← headers
                           ← blank line
<h1>Hello</h1>             ← body
```

Once Express sends the headers, they **cannot be changed**. That causes the most famous Express error:

> `Error: Cannot set headers after they are sent to the client`

It means you tried to respond **twice** to one request. You'll cause it on purpose in a minute. 😈

---

## 🛠️ Step 1: Inspect the request

Create `lesson4/req.js` and type it yourself:

```js
const express = require("express");
const app = express();

app.get("/inspect/:id", (req, res) => {
  console.log("method:", req.method);
  console.log("url:", req.url);
  console.log("originalUrl:", req.originalUrl);
  console.log("path:", req.path);
  console.log("params:", req.params);
  console.log("query:", req.query);
  console.log("hostname:", req.hostname);
  console.log("ip:", req.ip);
  console.log("user-agent:", req.get("User-Agent"));
  res.send("Check your terminal! 👀");
});

app.listen(3000, () => console.log("Running on 3000"));
```

Visit `http://localhost:3000/inspect/7?color=red&size=xl` and read your terminal.

### 🎯 Mini Challenge 1 (⚡ 20 XP)
Change the route so it **replies with JSON** containing `method`, `path`, `query`, and the `user-agent`. Open it in Chrome, then call it with curl:

```bash
curl http://localhost:3000/inspect/7?color=red
```

Did the `user-agent` change? Why?

---

## 🛠️ Step 2: Headers

**Reading** a header:

```js
app.get("/who", (req, res) => {
  const agent = req.get("User-Agent");
  res.send(`You are using: ${agent}`);
});
```

**Setting** a header:

```js
app.get("/custom", (req, res) => {
  res.set("X-Powered-By-Me", "Bisrat");
  res.send("Check the response headers!");
});
```

Open DevTools, then the Network tab, click the request, and look at **Response Headers**. 🔎

### 🎯 Mini Challenge 2 (⚡ 20 XP)
Create `GET /plain` that sends the text `<h1>Hello</h1>` **as plain text** (so the browser shows the tags, not a big heading). Then create `GET /html` that sends the same string as HTML.

> 💡 Hint: `res.type()` or `res.set("Content-Type", ...)`. What does `res.send()` guess for a string?

---

## 🛠️ Step 3: Status helpers and redirects

```js
app.get("/teapot", (req, res) => {
  res.sendStatus(418);
});

app.get("/old-page", (req, res) => {
  res.redirect("/new-page");
});

app.get("/new-page", (req, res) => {
  res.send("Welcome to the new page 🎉");
});
```

**How a redirect works:** `res.redirect()` does **not** send a page. It sends a status (**302**) and a `Location: /new-page` header. The **browser** then makes a second request on its own.

Watch it in DevTools. You'll see **two** requests. 👀

### 🎯 Mini Challenge 3 (⚡ 30 XP)
Make `/old-page` a **permanent** redirect (status **301**) instead of 302.

> 💡 Hint: `res.redirect` can take a status code as its first argument. Check how in the Express docs (`res.redirect([status,] path)`).

---

## 🛠️ Step 4: Sending files

Create `lesson4/public/hello.txt` with any text inside, and then:

```js
const path = require("path");

app.get("/file", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "hello.txt"));
});

app.get("/download", (req, res) => {
  res.download(path.join(__dirname, "public", "hello.txt"));
});
```

**Why `path.join(__dirname, ...)`?** `sendFile` needs an **absolute path**. `__dirname` is the folder of the current file, so the path works no matter where you start Node from. A relative path like `"public/hello.txt"` throws an error.

### 🎯 Mini Challenge 4 (⚡ 30 XP)
Try `res.sendFile("public/hello.txt")` with a relative path. Read the error message. In a comment, explain it in your own words.

---

## 🛠️ Step 5: The double-response bug 😈

Type this on purpose:

```js
app.get("/oops", (req, res) => {
  res.send("First response");
  res.send("Second response");
});
```

Visit `/oops` and read the terminal error.

**The classic cause in real code:**

```js
if (!user) {
  res.status(404).send("Not found");   // ❌ keeps running after this!
}
res.send("User found");
```

**The fix:** add `return` so the function stops.

```js
if (!user) {
  return res.status(404).send("Not found");
}
```

### 🎯 Mini Challenge 5 (⚡ 30 XP)
Write `GET /check/:age` that:
- if `age` is not a number → **return** 400 `"Invalid age"`
- if `age` is under 18 → **return** 403 `"Too young"`
- otherwise → `"Welcome!"`

Then **remove the `return`s** and see what breaks.

---

## 🧪 Quick Check

1. What is the difference between `req.url` and `req.path`?
2. Why does `res.redirect()` show **two** requests in DevTools?
3. Why does `res.sendFile()` need an absolute path?
4. What causes "Cannot set headers after they are sent"?

---

## 🏆 Main Challenges

In VS Code. Try for 20 minutes before asking for a hint. 🪜

### 🟢 Challenge 1: Foundation (40 XP)
Create `lesson4/challenge1.js` on port 4000:
- `GET /info` → JSON with `method`, `path`, `hostname`, `ip`
- `GET /browser` → `"You use: <User-Agent>"`
- `GET /home` → redirects to `/`
- `GET /` → `"Home"`

### 🟡 Challenge 2: Real-world (80 XP)
Create `lesson4/challenge2.js`. Build a **file server**:
- `GET /docs/:name` → sends `public/<name>.txt` using `sendFile`
- `GET /docs/:name/download` → downloads it using `download`
- if the file does not exist → status **404**, JSON `{ error: "File not found" }`
- put 3 `.txt` files in `public/` to test

> 💡 Hint: `sendFile` accepts a **callback** as its last argument. It receives an error if something went wrong. Look it up in the docs. And be careful about double responses! ⚠️

### 🔴 Challenge 3: Brain-stretcher (110 XP, stacks Lessons 1 to 4)
Create `lesson4/challenge3.js`: a **request logger + API**.

- `logger` handler on every route (Lesson 3): prints `METHOD originalUrl`
- `GET /api/users/:id` → JSON `{ id, userAgent, ip }`, 400 if `id` isn't a number
- `GET /api/old` → **301** redirect to `/api/users/1`
- `GET /api/teapot` → `sendStatus(418)`
- a response header `X-Request-Path` on **every** `/api/...` route, containing `req.path`
- JSON 404 for everything else (Lesson 2)

Before coding, answer in comments: **what is the difference between `req.url` and `req.originalUrl`, and when would they differ?** (Don't Google first. Guess, then test.)

---

## 🧗 Final Steps

1. ✅ **Commit:** `git add . && git commit -m "lesson 4: req and res"`
2. 🗣️ **Explain back:** in 3 sentences, why can a request only get **one** response?
3. 📊 Tell me how long each challenge took and where you got stuck.

---

Send me your code and explain-back. I'll review it, award XP, and unlock **Lesson 5: Postman and `app.route()`** 🔓

Go! 🔥