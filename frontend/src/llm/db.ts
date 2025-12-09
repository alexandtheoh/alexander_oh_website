import recordsData from '../../data/records.json' with { type: 'json' };
import embeddingsData from '../../data/embeddings.json' with { type: 'json' };
import systemPromptData from '../../data/system_prompt.json' with { type: 'json' };
import expsData from '../../data/work_experiences.json' with { type: 'json' };
import projsData from '../../data/projects.json' with { type: 'json' };

// load records
interface Record {
  [id: string]: string,
}

let records: Record | null = null

export async function loadRecords(): Promise<Record> {
  if (records) return records
  
  records = recordsData as Record;

  return records
}

// load embeddings
export interface EmbeddingsStore {
  [id: string]: Float32Array;
}

let embeddings: EmbeddingsStore | null = null

export async function loadEmbeddings(): Promise<EmbeddingsStore> {
  if (embeddings) return embeddings

  // Convert number[] arrays to Float32Array
  const convertedData: EmbeddingsStore = {};
  
  for (const [key, value] of Object.entries(embeddingsData)) {
    convertedData[key] = new Float32Array(value);
  }

  embeddings = convertedData;
  return embeddings;
}


// load system prompt
interface SystemPrompt {
  [id: string]: string,
}

let SYSTEM_PROMPT: SystemPrompt| null = null

export async function loadSystemPrompt(): Promise<string> {
  if (SYSTEM_PROMPT) return SYSTEM_PROMPT['SYSTEM_PROMPT']
  
  SYSTEM_PROMPT = systemPromptData as SystemPrompt;

  return SYSTEM_PROMPT['SYSTEM_PROMPT']
}


// load experiences
export interface WorkExp {
  name: string,
  description: string,
  website: string,
}

let workExps: WorkExp[]| null = null

export async function loadWorkExps(): Promise<WorkExp[]> {
  if (workExps) return workExps
  
  workExps = expsData as WorkExp[];

  return workExps
}

// load projects
export interface ProjExp {
  name: string,
  description: string,
  link: string,
}

let projExps: ProjExp[]| null = null

export async function loadProjExps(): Promise<ProjExp[]> {
  if (projExps) return projExps
  
  projExps = projsData as ProjExp[];

  return projExps
}