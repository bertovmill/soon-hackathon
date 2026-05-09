# Getting Started

## 1. Clone the repo

```bash
git clone https://github.com/bertovmill/soon-hackathon.git
cd soon-hackathon
```

## 2. Daily workflow

Before you start working, always pull the latest changes:

```bash
git pull
```

After making changes, push them up:

```bash
git add .
git commit -m "describe what you changed"
git push
```

## 3. If you get a merge conflict

This happens when two people edit the same file. Git will mark the conflicts in the file. Open it, pick the version you want, then:

```bash
git add .
git commit -m "resolve merge conflict"
git push
```

## 4. Useful commands

| Command | What it does |
|---------|-------------|
| `git status` | See what files you changed |
| `git pull` | Get the latest code from GitHub |
| `git push` | Send your commits to GitHub |
| `git log --oneline` | See recent commits |
