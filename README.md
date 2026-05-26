# ⬡ Aetheris Research

**Auditor-Grade AI Document Intelligence**

Aetheris Research is a multimodal AI-powered platform for deep document analysis, synthesis, and insight generation. Upload PDFs, research papers, financial reports, or images and extract structured, expert-level intelligence — powered by Claude.

---

## ✨ Features

- **Document Upload** — PDF, PNG, JPG via drag-and-drop (up to 50 pages)
- **Deep Analysis Engine** — Extracts key insights across research, finance, and technical domains
- **Multi-turn Conversations** — Ask follow-up questions about the same document
- **Session Management** — Sidebar tracks your analysis history
- **Document Repository** — Centralized file management panel
- **Multimodal Intelligence** — Handles text, images, and structured data (v1.5)

---

## 🚀 Quick Start (Local)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/aetheris-research.git
cd aetheris-research
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy to GitHub Pages

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aetheris-research.git
git push -u origin main
```

### Step 2 — Add your API key as a GitHub Secret

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `REACT_APP_ANTHROPIC_API_KEY`
4. Value: your Anthropic API key

### Step 3 — Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 4 — Trigger deployment

Push any change to `main`, or go to **Actions → Deploy to GitHub Pages → Run workflow**.

Your app will be live at:
```
https://YOUR_USERNAME.github.io/aetheris-research/
```

---

## 🔒 Security Note

- Your API key is embedded in the built frontend bundle — suitable for **personal/private use**
- For a **public-facing app**, proxy API calls through a backend (Node.js/FastAPI) so the key stays server-side
- Never commit `.env` to git (it's in `.gitignore`)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| AI | Anthropic Claude (claude-sonnet-4) |
| Fonts | Syne · DM Sans · DM Mono |
| Deploy | GitHub Pages + GitHub Actions |

---

## 📁 Project Structure

```
aetheris-research/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # All styles
│   └── index.js         # React entry point
├── .github/
│   └── workflows/
│       └── deploy.yml   # Auto-deploy to GitHub Pages
├── .env.example         # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 License

MIT
