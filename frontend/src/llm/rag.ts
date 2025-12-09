import { pipeline, FeatureExtractionPipeline } from "@huggingface/transformers";
import { loadRecords, loadEmbeddings } from "./db"
import { MinHeap } from "./min_heap"

let embedder: FeatureExtractionPipeline | null = null

async function meanPool(tokens: number[][]): Promise<Float32Array> {
  const seqLen = tokens.length;
  const hiddenDim = tokens[0].length;

  const output = new Float32Array(hiddenDim);

  for (let j = 0; j < hiddenDim; j++) {
    let sum = 0;
    for (let i = 0; i < seqLen; i++) {
      sum += tokens[i][j];
    }
    output[j] = sum / seqLen;
  }

  return output;
}

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  let nonNullEmbedder: FeatureExtractionPipeline

  if (!embedder) {
    nonNullEmbedder = await (pipeline as any)(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { dtype: "q4" }
    );

    embedder = nonNullEmbedder
  }
  return embedder;
}


export async function embedQuery(query: string): Promise<Float32Array> {
  // get embedder
  embedder = await getEmbedder()

  // vectorize query
  const tensor = await embedder(query);
  const tokens = tensor.tolist()[0];

  // mean pool vector
  const pooled = meanPool(tokens);

  return pooled;
}

// (A.B) / (|A||B|)
async function cosine(a: Float32Array, b: Float32Array): Promise<number> {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function getTopKRecords(query: string, K: number, threshold: number): Promise<string> {
  // load records and vectors
  const records = await loadRecords()
  const embeddings = await loadEmbeddings()

  // convert query to vector
  let queryVector = await embedQuery(query)

  // init heap
  const heap = new MinHeap<string>();

  // iterate through embeddings
  for (const [id, vector] of Object.entries(embeddings)) {
    // calculate cosine similarity
    let cosineSimilarity = await cosine(queryVector, vector)
    // only add if similarity is pass threshold
    if (cosineSimilarity >= threshold) {
      heap.push(id, cosineSimilarity);
    }

    // removes smallest similarity
    if (heap.size() > K) {
      heap.pop();
    }
  }

  const topKContext: { id: string; text: string }[] = [];

  // get top K from heap
  while (!heap.isEmpty()) {
    let id = heap.pop();
    if (id) {
      let text = records[id]
      topKContext.push({ id, text });
    }
  }

  // reverse top k to get most relevant data
  topKContext.reverse();

  // translate into json for llm
  const contextForLLM = JSON.stringify(topKContext, null, 2);
  
  return contextForLLM
}

