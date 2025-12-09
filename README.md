### This is the git repo for my personal website

### start

cd frontend

### create embedding

generate embeddings with "npx tsx src/offline_process/generate_embeddings.ts"

### create cert

mkdir cert

openssl req -x509 -newkey rsa:2048 -nodes -keyout cert/key.pem -out cert/cert.pem -days 365

### run server

npm run dev -- --host
