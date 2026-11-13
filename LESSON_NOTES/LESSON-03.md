# 🟢 Level 1, Lesson 3: The `res` Object, HTML, and Static Files

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges and your first **Boss Battle** at the end.

> 📌 I haven't seen your Lesson 2 code yet. That's where the real growth is. Stuck on something? Struggle 20 minutes, then send me what you tried. 💪

## 🤔 The "Why"

So far you sent **text** and **JSON**. Real apps also send **web pages**, **CSS files**, **images**, and **redirects**. Also, you must control the **headers** (the labels on a response).

## 🧠 Mental Model

> 📦 **A response is a package.**
> - 🏷️ **Status** = the stamp ("delivered", "not found")
> - 📝 **Headers** = labels on the box ("this is HTML", "this is 500 bytes")
> - 🎁 **Body** = what's inside
>
> You must put the stamp and labels on **before** you ship the box. After shipping, you can't change them.

```
HTTP/1.1 200 OK                      ← status
Content-Type: text/html              ← headers
Content-Length: 18

<h1>Hello</h1>                       ← body
```

**Under the hood:** `res` is Node's own response object, with extra Express methods added on top. Every Express method (`send`, `json`, `redirect`) does the same job in the end: set status, set headers, write the body, call `res.end()`.

---

## 🛠️ Part 1: See the Package

Create `lesson3.js`:

```js
const express = require("express");
const app = express();

app.get("/text", (req, res) => {
  res.send("Hello");
});

app.get("/html", (req, res) => {
  res.send("<h1>Hello</h1>");
});

app.get("/data", (req, res) => {
  res.send({ name: "Bisrat" });
});

app.listen(3000, () => console.log("Running on 3000"));
```

Run it. Then look at the **headers** with `curl -i`:

```bash
curl -i http://localhost:3000/html
curl -i http://localhost:3000/data
```

`-i` means "show me the headers too."

**What you'll notice:** `res.send()` **looks at what you give it**:

| You give | `Content-Type` it sets |
|---|---|
| String | `text/html` |
| Object | `application/json` |

That's why `<h1>` shows as a big heading in the browser. The browser reads the label and decides how to show the body. No magic. 🔍

**What breaks?** Change `/html` to use `res.send("<h1>Hello</h1>")` after `res.type("text/plain")`. The browser now shows the raw tags, because the label says "plain text."

### ⚡ Mini Challenge 1 (10 XP)
1. Make `GET /page` that sends an `<h1>` and a `<p>` in one string.
2. Run `curl -i` on it. Find the `Content-Type` line.
3. Now add `res.type("text/plain")` as the first line in the route. Predict what the browser shows. Then test.

---

## 🛠️ Part 2: Status, Headers, Redirect

```js
// Custom header
app.get("/secret", (req, res) => {
  res.set("X-Made-By", "Bisrat");
  res.send("Check the headers!");
});

// Status + body
app.get("/teapot", (req, res) => {
  res.status(418).send("I am a teapot ☕");
});

// Redirect
app.get("/old", (req, res) => {
  res.redirect("/new");
});

app.get("/new", (req, res) => {
  res.send("Welcome to the new page");
});
```

**How redirect works (step by step):**

```
Browser: GET /old
Server:  status 302 + header "Location: /new"   (no real body)
Browser: reads Location, sends a NEW request: GET /new
Server:  "Welcome to the new page"
```

Redirect does **not** move anything on the server. It tells the **browser** to ask again somewhere else. Test with `curl -i http://localhost:3000/old` and see the 302 and the `Location` line.

### ⚡ Mini Challenge 2 (15 XP)
1. Add `GET /go` that redirects to `/secret`.
2. Run `curl -i` on `/go`. What status code do you see?
3. Run `curl -iL` on `/go` (the `-L` means "follow redirects"). What changed?

---

## 🛠️ Part 3: Serving Files with `res.sendFile`

Make a folder `public` with a file `hello.html`:

```html
<!-- public/hello.html -->
<h1>I am a real file 📄</h1>
```

Now send it:

```js
const path = require("path");

app.get("/hello", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "hello.html"));
});
```

**Why `path.join(__dirname, ...)`?**
- `__dirname` = the folder where **this JS file lives**.
- If you wrote `"public/hello.html"` (a relative path), Node looks from the folder where you **ran** `node`. Run it from another folder and the file is not found.
- `path.join` builds the path safely for Windows (`\`) and Linux (`/`).

**What breaks?**
- Use `res.sendFile("public/hello.html")` → error: `path must be absolute`. Express refuses relative paths on purpose, for safety.

### ⚡ Mini Challenge 3 (15 XP)
1. Create `public/about.html` with some content.
2. Serve it from `GET /about`.
3. Now run your server from a **different folder** using `node ../path/to/lesson3.js`. Does it still work? Why?

---

## 🛠️ Part 4: `express.static`: A Whole Folder at Once

Writing one route per file is boring. Use:

```js
app.use(express.static(path.join(__dirname, "public")));
```

Now every file in `public` is available by name:

```
public/hello.html   →  /hello.html
public/about.html   →  /about.html
public/style.css    →  /style.css
public/index.html   →  /        (index.html is the default for "/")
```

**Under the hood:** `express.static` is a **middleware**: a function that sits in Express's list like a route. For each request it does this:

```
Request: GET /style.css
   ↓
Does public/style.css exist?
   ├─ YES → send the file, STOP ✅
   └─ NO  → call next()  (meaning: "I can't help, ask the next item in the list")
```

`next()` is how one item in the list passes the request to the next one. We study this deeply in Level 2. 🔑

**What breaks?**
- Put `express.static` **below** your routes. Routes with the same path would win first. **Order matters, again!**
- Delete `public/style.css` → the request falls through to the rest of the list and ends in `Cannot GET /style.css`.

### ⚡ Mini Challenge 4 (20 XP)
1. Create `public/index.html` that links to `style.css`.
2. Create `public/style.css` that changes the page's background color.
3. Add `express.static`. Visit `http://localhost:3000/`.
4. Open DevTools → **Network** tab. How many requests did the browser send for this one page? Why more than one?

---

## 🛠️ Part 5: The "Nothing Matched" Route

```js
// Put this at the very BOTTOM, after all routes
app.use((req, res) => {
  res.status(404).send("<h1>404: Nothing here 🕳️</h1>");
});
```

`app.use(fn)` with no path matches **every method and every path**. At the bottom of the list, it only runs if **nothing above it** handled the request. It is your own custom 404 page.

**What breaks?** Move it to the **top**. Now every request gets the 404, and no other route ever runs.

### ⚡ Mini Challenge 5 (20 XP)
Add the 404 route at the bottom. Then **break it on purpose**: move it to the top, test `/hello`, and explain in one sentence why it fails.

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (30 XP)**
Build a small static site in a new project folder:
- `public/index.html` (home), `public/about.html`, `public/style.css`
- Links between the pages
- Use `express.static`
- Add a custom 404 page that **also** uses your CSS (hint to think about: what does the 404 HTML need to link to?)

**⚔️ Challenge 2: Real-world (40 XP)**
Add these routes to the same project:
- `GET /old-page` → redirects to `/about.html`
- `GET /api/time` → returns JSON: `{ "time": "..." }` with the current time
- `GET /api/time` must also send a custom header `X-Server: my-express`

Test every route with `curl -i` and write down each status code.

**⚔️ Challenge 3: Brain stretch (60 XP)**
You have **both** of these in your app, in this order:

```js
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.send("From the route"));
```

And `public/index.html` exists.

1. **Predict:** what does `/` show?
2. Test it. Was your prediction right?
3. Explain **why** with the list idea.
4. Swap the two lines. What changes now?

**🐞 Bug Hunt (30 XP):** find **2 bugs** before running:

```js
app.get("/report", (req, res) => {
  res.sendFile("public/report.html");
  res.send("Done");
});
```

*(Think about: path type, and what happens when you send twice.)*

---

## 👹 BOSS BATTLE #1 (100 XP + 50 bonus for no hints)

**Mix of Lessons 1, 2, and 3. No hints at first!**

Take your **Notes API** from Lesson 2 and give it a face:

1. Serve `public/index.html` with a title, a text input, an "Add" button, and an empty list.
2. The page uses `fetch("/notes")` to load notes and show them in the list.
3. The "Add" button sends a `POST /notes` with the input's text, then refreshes the list.
4. A second input does a search using `GET /notes?search=...`.
5. Unknown URLs show your custom 404 page.

**Rules:**
- ⏱️ Struggle at least **20 minutes** before asking for any hint.
- 📝 Write down every bug you hit and how you found it. That is training for your "don't quit when it's hard" skill.
- 🧠 +20 XP when you finish: explain the **full flow** of one click on "Add", from button to server and back.

**Bonus XP:** 🏆 +10 per challenge with no hint.

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 1 (Newbie) | 0 (Lessons 2 and 3 XP waiting: up to **~600 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 4, **Middleware**: how `next()` really works, and how to write your own. This is the heart of Express. ❤️

Send me your code, one challenge at a time, and I'll review it. 🚀