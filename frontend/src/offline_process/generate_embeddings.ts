import { loadRecords } from '../llm/db.ts'
import type { EmbeddingsStore } from '../llm/db.ts'
import { embedQuery } from '../llm/rag.ts'
import { writeFileSync } from "fs";


// for offline embedding of database records
async function embedRecords(): Promise<EmbeddingsStore> {
  // load records
  let records = await loadRecords()

  // declare embedding array
  let embeddings: EmbeddingsStore = {};

  if (records) {
    for (const [id, text] of Object.entries(records)) {
      let recordTensor = await embedQuery(id + " " + text)
      embeddings[id] = recordTensor
    }
  }

  return embeddings
}

function serializeEmbeddings(store: EmbeddingsStore): Record<string, number[]> {
  const json: Record<string, number[]> = {};
  for (const [id, vec] of Object.entries(store)) {
    json[id] = Array.from(vec); // convert to number[]
  }
  return json;
}


export async function generateEmbeddingsJson() {
  const store = await embedRecords();
  const json = serializeEmbeddings(store);

  writeFileSync("./embeddings.json", JSON.stringify(json, null, 2), "utf8");

  console.log("Saved embeddings.json");
}

await generateEmbeddingsJson()