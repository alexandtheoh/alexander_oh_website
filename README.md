# 🌐 Personal Website

This repository contains the code for my personal website. Follow the steps below to set up, generate embeddings, create a certificate, and run the development server.

---

## 🚀 1. Navigate to the Frontend

Start by moving into the frontend directory:

```bash
cd frontend
```

## ☝️ 2. Update JSON Files in `frontend/data`

Within the `frontend/data` directory, update the relevant JSON files while maintaining their existing formats:

- **records** → update this for embeddings.
- **projects, work_experience, system_prompt** → update these for the frontend content.


## 🧬 3. Generate embeddings based on the new records.json

```bash
 npx tsx src/offline_process/generate_embeddings.ts
```

## 📲 4. Install dependencies

```bash
npm install
```

## 🧞 5. Generate certificates for local hosting

```bash
mkdir cert

openssl req -x509 -newkey rsa:2048 -nodes -keyout cert/key.pem -out cert/cert.pem -days 365
```

## 🏃 6. Generate certificates for local hosting

```bash
npm run dev -- --host
```

