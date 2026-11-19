# 🔵 Level 4, Lesson 11: Relationships (`ref` and `populate`) 🔗

> 🎮 Same mode: 95% VS Code. ⚡ Mini Challenges in the middle. ⚔️ Main Challenges at the end. **Boss Battle #4** comes in Lesson 12.

> 💬 Quick note: your XP is still **0**. Today's Mini Challenge 2 is the best one to run first. It lets you **see** what `populate` really does, and it takes 5 minutes. 🔑

## 🤔 The "Why"

Real data is connected:
- A **post** has an **author** (a user)
- A **comment** belongs to a **post**

How do you store "this post was written by that user" in a database?

There are **two ways**:

| Way | Idea |
|---|---|
| **Embed** | Copy the user's data **inside** the post |
| **Reference** | Store only the user's **`_id`** inside the post |

## 🧠 Mental Model

> 📇 **A library card.**
> - **Embed** = photocopy the author's whole file and staple it to the book. Fast to read, but if the author changes their name, you must fix every copy.
> - **Reference** = write only the author's **card number** on the book. To see the author, go to the cabinet and look up that number. One place to change.

```
Post                          User
{ title: "Hello",             { _id: "u1",
  author: "u1"  ───────────►    name: "Sara" }
}
```

---

## 🔬 Under the Hood: `populate` Is NOT a SQL Join

When you write:

```js
const posts = await Post.find().populate("author");
```

Mongoose does this, step by step:

```
1. Query 1: Post.find()
   → posts, each with author: "u1" / "u2" / "u1"

2. Collect the unique ids: ["u1", "u2"]

3. Query 2: User.find({ _id: { $in: ["u1", "u2"] } })
   → the matching users

4. In memory (in your Node process): replace each id with its user
```

**Two separate queries**, then JavaScript stitches the results together. MongoDB itself does **not** join anything here. There is one extra query for **all** posts, not one per post.

**Important:** MongoDB has **no foreign keys**. It does not check that `author: "u1"` points to a real user. That check is **your job**.

---

## 🛠️ Part 1: Models with `ref`

Use your Lesson 10 project. Create these two models.

**`src/models/User.js`:**

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

**`src/models/Post.js`:**

```js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    body: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
```

**Line by line:**
- `type: mongoose.Schema.Types.ObjectId`: this field holds an `_id` of **another** document.
- `ref: "User"`: the **name of the model** to look in. It must match the string you gave to `mongoose.model("User", ...)` **exactly** (case counts).
- Without `ref`, `populate` has no idea which collection to look in.

Create a quick `POST /posts` controller. Check the author first:

```js
exports.create = asyncHandler(async (req, res, next) => {
  const { title, body, author } = req.body;

  const user = await User.findById(author);
  if (!user) return next(new AppError("author does not exist", 400));

  const post = await Post.create({ title, body, author });
  res.status(201).json(post);
});
```

**Why check the user?** Remember: no foreign keys. Without this check you can save a post whose author does not exist. It is called a **dangling reference**.

**What breaks?**
- Send `author: "abc"` → `CastError` (your Lesson 10 handler turns it into 400 ✅).
- Send a valid-looking id that doesn't exist → your check returns 400.
- Remove the check → the post is saved with a ghost author. 👻

### ⚡ Mini Challenge 1 (25 XP)
1. Create both models, `POST /users`, and `POST /posts`.
2. Create 2 users and 3 posts. Open **Compass**. What does the `author` field look like in a post: an object or an id?
3. Try three bad authors: `"abc"`, a missing field, and `"aaaaaaaaaaaaaaaaaaaaaaaa"`. Write the status for each.
4. Remove the user check. Post with `"aaaaaaaaaaaaaaaaaaaaaaaa"`. Does it save? Check Compass.

---

## 🛠️ Part 2: `populate` in Action

```js
exports.getAll = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "name email")
    .sort({ createdAt: -1 });
  res.json(posts);
});
```

- `populate("author", "name email")`: replace `author` with the user document, but keep **only** `name` and `email` (plus `_id`).
- Without the second argument, you'd get **every** field of the user. Later (Level 5) that includes the **password hash**. Always select only what you need. 🔒

**Before and after:**

```js
// raw
{ title: "Hello", author: "6740f1c2a9b3c4d5e6f70812" }

// populated
{ title: "Hello", author: { _id: "6740...", name: "Sara", email: "sara@x.com" } }
```

**See the two queries with your own eyes.** Add this once, near the top of `server.js`:

```js
const mongoose = require("mongoose");
mongoose.set("debug", true);
```

Call `GET /posts` and read the terminal. You will see `posts.find(...)` and `users.find({ _id: { $in: [...] } })`. That is the whole trick. Nothing is magic. 🔍

> ⚠️ Turn `debug` off in production. It prints all your queries.

**What breaks?**
- Typo `populate("autor")` → Mongoose ignores it (or throws, depending on settings). The field stays an id.
- Delete a user, then populate their posts → `author` becomes **`null`**. Code like `post.author.name` then **crashes**: `Cannot read properties of null`.
- Wrong `ref` string (`ref: "Users"`) → `MissingSchemaError: Schema hasn't been registered for model "Users"`.

### ⚡ Mini Challenge 2 (30 XP)
1. Turn on `mongoose.set("debug", true)`. Call `GET /posts` with and without `.populate(...)`. How many queries show up each time?
2. Add a **second** populate-less version that loops: for each post, `await User.findById(post.author)`. With 3 posts, how many queries now? This is called the **N+1 problem**: 1 query for the list plus N queries for N items. With 1,000 posts it is a disaster. 💥
3. Delete one user in Compass. Call `GET /posts`. What is `author` for that user's posts?
4. Break the ref: change it to `ref: "Users"`. Read the exact error. Fix it.

---

## 🛠️ Part 3: Comments (Children Referencing Their Parent)

For **many** children (a post can have 10,000 comments), the child holds the reference to the parent, **not** the other way around. Why? Putting 10,000 ids inside the post makes the post document grow without limit. And MongoDB has a **16 MB limit per document**.

**`src/models/Comment.js`:**

```js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
```

`index: true` creates an **index**, a sorted lookup table on `post`. Without it, "all comments of post X" scans **every** comment in the collection. With it, MongoDB jumps straight to the right ones. Like a book's index vs reading every page. 📖

**Routes** (use `mergeParams` from Lesson 7):

```js
// routes/comments.js
const router = express.Router({ mergeParams: true });
router.route("/").get(c.getAll).post(c.create);

// routes/posts.js
router.use("/:postId/comments", commentsRouter);
```

**Controller:**

```js
exports.getAll = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new AppError("Post not found", 404));

  const comments = await Comment.find({ post: post._id })
    .populate("author", "name")
    .sort({ createdAt: 1 });
  res.json(comments);
});

exports.create = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new AppError("Post not found", 404));

  const user = await User.findById(req.body.author);
  if (!user) return next(new AppError("author does not exist", 400));

  const comment = await Comment.create({
    post: post._id,
    author: user._id,
    text: req.body.text,
  });
  res.status(201).json(comment);
});
```

**Cascade delete:** MongoDB has no `ON DELETE CASCADE`. When you delete a post, **you** must delete its comments:

```js
exports.remove = asyncHandler(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  await Comment.deleteMany({ post: post._id });
  res.status(204).end();
});
```

**What breaks?**
- Forget `mergeParams: true` → `req.params.postId` is `undefined`. You saw this in Lesson 7!
- Delete a post without `deleteMany` → **orphan comments** that point to nothing. They stay in the database forever.
- Mount `/:postId/comments` **after** a route that already answered → never reached. Order matters, again. 🔁

### ⚡ Mini Challenge 3 (30 XP)
1. Build the comments model, router, and controller.
2. Add 3 comments to one post. Test `GET /posts/:postId/comments` with a **bad** post id (400), a **missing** post (404), and a **good** one.
3. Delete the post **without** the `deleteMany` line. Check Compass: are there orphan comments?
4. Add the `deleteMany`. Create new comments and repeat. Are they gone now?

---

## 🛠️ Part 4: Embed or Reference? 🤔

Neither is "best." It depends on **how the data is used**.

| Ask yourself | Embed | Reference |
|---|---|---|
| Is it always read together with the parent? | ✅ | |
| Is the child list **small and bounded**? | ✅ | |
| Can the child exist on its own? | | ✅ |
| Is the child used by **many** parents? | | ✅ |
| Can the list **grow without limit**? | | ✅ |
| Is the child updated often, separately? | | ✅ |

**Embed example** (a user's addresses, a post's tags):

```js
addresses: [{ city: String, street: String }]
```

**Reference example:** posts to users, comments to posts.

**The pain of copying:** if you copy `authorName: "Sara"` into every post and Sara renames herself, you must update **all** her posts. Embedding trades **easy reads** for **harder updates**.

### ⚡ Mini Challenge 4 (15 XP): Decide and explain
For each, choose **embed** or **reference**, and write one sentence why:
1. A user's list of up to 3 phone numbers
2. Orders and the products inside them (products also have their own page)
3. A blog post and its comments
4. A product and its up to 5 image URLs
5. A school and its students

Check with the table. Disagree? Explain your reasoning. A good argument earns bonus XP. 🧠

---

## ⚔️ Main Challenges

**⚔️ Challenge 1: Foundation (35 XP)**
Add to your API:
- `GET /users/:id/posts`: all posts by one user (`404` if the user doesn't exist)
- `GET /posts?author=<userId>`: filter by author (validate that it is a real ObjectId **before** using it, so a bad value is a clean `400`, not a `CastError` surprise)
- `GET /posts/:id`: one post with `author` populated (`name`, `email` only)

**⚔️ Challenge 2: Real-world (45 XP)**
Make `GET /posts/:id` return the post **and** its comments in one JSON:

```json
{ "post": { ... }, "comments": [ ... ], "commentCount": 3 }
```

- Run the two independent queries with `Promise.all([...])`. It starts both at once. Why is that faster than two `await`s in a row? Try both and measure with `console.time`.
- Add `GET /posts?withCounts=true`. For each post, include `commentCount`. Do it **without** the N+1 problem. *(Hint to think about: one query that groups comments by `post`, or `countDocuments` in `Promise.all`. Check the debug log: how many queries?)*

**⚔️ Challenge 3: Brain stretch (60 XP)** 🧠
Predict **before** running:

```js
const post = await Post.findById(id);
console.log(post.author.name);                 // (a)

const populated = await Post.findById(id).populate("author", "name");
console.log(populated.author.name);            // (b)
// ...now someone deletes that user, then:
const again = await Post.findById(id).populate("author", "name");
console.log(again.author.name);                // (c)
```

1. What do (a), (b), (c) do? Print, `undefined`, or crash?
2. Why? *(Think about what `author` holds in each case.)*
3. Write **two different guards** so (c) never crashes the server: one in the controller, one in the response shape (for example, `author: null` → `"Deleted user"`).
4. In which **status code** would an unguarded crash end up, and why is that unfair to the client?

**⚔️ Challenge 4: Build Your Own `populate` (60 XP)** 🛠️
In **plain Node** (no Mongoose), write `populate(items, field, lookupList)`:

```js
const users = [{ _id: "u1", name: "Sara" }, { _id: "u2", name: "Abel" }];
const posts = [
  { title: "A", author: "u1" },
  { title: "B", author: "u2" },
  { title: "C", author: "u1" },
  { title: "D", author: "ghost" },
];
```

- Build a `Map` from `lookupList` **once**, so each lookup is fast (no nested loops).
- Replace each `author` id with its user. Unknown ids become `null`.
- Prove with a counter that you did **one** pass to build the map, plus one per item.

If you can build this, `populate` is no longer a mystery. 🏆

**🐞 Bug Hunt (30 XP):** find **3 bugs** before running:

```js
const postSchema = new mongoose.Schema({
  title: String,
  author: { type: String, ref: "user" },
});

exports.getAll = async (req, res) => {
  const posts = Post.find().populate("author");
  res.json(posts);
};
```

*(Look at: the field type, the `ref` string, and one missing keyword.)*

**Bonus XP:**
- 🏆 +10 XP per challenge with **no hint**
- 🧠 +20 XP: explain back: *"What does `populate` really do under the hood? Why is a loop with `findById` worse? Why does MongoDB let me save a post with a ghost author?"*

## 🪜 Stuck?

1. Struggle **20 minutes**. Turn on `mongoose.set("debug", true)` and read the real queries.
2. Ask: *"Which query did Mongoose actually send? What did it return?"*
3. Then ask me for `Hint 1`.

Commit: `git commit -m "Lesson 11: relationships and populate"` 💾

---

## 📊 Status

| 🏅 Level | ⭐ XP | 🔥 Streak |
|---|---|---|
| 4 (Express + MongoDB) | **0** (pile waiting: **~3,800 XP**) | Day 1 |

**⏭️ Next lesson:** Lesson 12, **Query power-ups**: filters (`$gt`, `$in`), indexes, and a first look at aggregation, plus **👹 Boss Battle #4**: the **Task Manager API**, your Level 4 mini project.

Send me one thing from today: the debug log of `GET /posts`, or an error you hit. I'll review it. 🚀