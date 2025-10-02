# Preface

Crystal clear. No assumptions. No skipping steps. Here’s how a **Google Sr Eng would hand a naïve but hungry grasshopper** a **step-by-step tech doc** for creating and running `setup_memory.sh` **in Cloud Shell**, ADR-style, with all prerequisites laid out.

---

# 📝 ADR-0001: Repo Memory Automation Setup

**Status**: Accepted
**Context**: We need a reproducible, foolproof way to set up and maintain the memory archive (`docs/ARCHIVE`, `docs/CURRENT_STATUS.md`) in the `LivHana-SoT` repo. Previous attempts failed because instructions assumed prior knowledge.

**Decision**: Create a one-shot setup script (`setup_memory.sh`) stored at repo root. Layman-safe steps documented below.

---

## 🔑 Prerequisites (do these first, always)

1. **Be inside your repo**:

   ```bash
   cd ~/LivHana-SoT
   ```

   → Check you’re in the right place:

   ```bash
   pwd   # should show /home/high/LivHana-SoT
   ls -a # should list .git among files
   ```

2. **Be authenticated to GitHub** (so pushes don’t fail):

   ```bash
   gh auth login
   gh auth setup-git
   ```

   → Follow the prompts, choose **GitHub.com**, protocol **HTTPS**, and log in.

---

## 🪜 Step-by-Step: Create and Run `setup_memory.sh`

### 1. Create the script file

In Cloud Shell, type this exactly:

```bash
cat > setup_memory.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Running setup_memory.sh..."

# Ensure gh login is active
gh auth status || gh auth login
gh auth setup-git

# Force correct remote
git remote set-url origin https://github.com/RND-Technology/LivHana-SoT.git

# Ensure memory archive exists
mkdir -p docs/ARCHIVE

# Add CURRENT_STATUS.md if missing
if [ ! -f docs/CURRENT_STATUS.md ]; then
  echo -e "# Current Status\n\n- Repo clean and synced." > docs/CURRENT_STATUS.md
fi

# Add first archive snapshot if missing
if [ ! -f docs/ARCHIVE/week-01.md ]; then
  echo -e "# Archive – Week 01\n\n- Initial setup complete." > docs/ARCHIVE/week-01.md
fi

# Stage, commit, push
git add docs/
git commit -m "Ensure memory archive exists (CURRENT_STATUS + week-01)" || echo "Nothing new to commit."
git push origin main
EOF
```

👉 What just happened? You created a new file in your repo called `setup_memory.sh` and filled it with the script contents.

---

### 2. Make the script executable

```bash
chmod +x setup_memory.sh
```

---

### 3. Run the script

```bash
./setup_memory.sh
```

👉 Expected output:

* It confirms you’re logged in.
* It creates `docs/ARCHIVE/week-01.md` and `docs/CURRENT_STATUS.md` if missing.
* It commits and pushes to your GitHub repo.

---

## 📂 After running, repo will contain

* `docs/ARCHIVE/week-01.md`
* `docs/CURRENT_STATUS.md`
* `setup_memory.sh` (your reusable tool)

You can now re-run `./setup_memory.sh` any time — it won’t break, won’t overwrite, just ensures memory structure stays intact.

---

## 📌 Consequences

* Layman-safe process, no assumptions.
* Script lives in repo for repeatability.
* No copy-paste fallacies: only commands inside **\`\`\`bash** blocks go into Cloud Shell.

---

✅ ADR complete. This doc itself can be saved into your repo as `docs/ADR/ADR-0001-setup-memory.md`.

---

Do you want me to **generate that ADR file right now** and give you a working download link so you can drop it directly into `docs/ADR/`?

<!-- Last verified: 2025-10-02 -->
