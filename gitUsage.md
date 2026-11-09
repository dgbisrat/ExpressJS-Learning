# 🌱 Git Plan: Get Back on Track

**Short answer:** Push **by project folder**, not file by file. Never one file at a time. 🙅

---

## 📁 How to Organize

**For your Express course:** make **one repo** with a folder per lesson.

```
express-learning/
├── lesson-01-intro/
├── lesson-02-routes/
├── lesson-03-.../
├── notes/          ← your .md files
└── .gitignore
```

**For real projects** (like your own mini project): **one repo per project.** 🏗️

---

## 🚨 Before Your First Push

Create a `.gitignore` file so you don't upload junk or secrets:

```
node_modules/
.env
```

> ⚠️ `node_modules` is huge and `.env` can contain passwords. Never push them!

---

## ⚡ The Commands

```bash
git init
git add .
git commit -m "Add lessons 1-4"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🔁 The Daily Habit

After **every lesson**:

```bash
git add .
git commit -m "Complete lesson 5: error handling"
git push
```

Small commits with clear messages = a nice progress history. 📈

---

## ✅ Done. I'll add this to your lessons

From the next lesson on, I'll include:

- 🔀 **Git Checkpoint** at the end of every lesson
- 🛠️ A step to work on **your own mini project**
- 🔍 A **"debug alone first"** rule for bug hunts
- ⌨️ A reminder to **type the code yourself**
- 🧪 **Postman / Thunder Client** tests for your routes
- 🎤 A **"teach it back"** question

---

## 🎮 Quest: +100 XP

Your turn! 💪

1. Create a new repo on GitHub called `express-learning`
2. Put your lesson files in folders
3. Add the `.gitignore`
4. Push it

**Hint:** if `git push` gives an error, read the message carefully first. It usually tells you the fix. 🔍

Tell me when it's pushed, or paste any error you get, and we'll continue with the next Express lesson! 🚀