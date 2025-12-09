import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngineInterface | null = null;

export async function initLLM(onProgress?: (prog: any) => void) {
  if (engine) return;
  
  const worker = new Worker(new URL("/worker.ts?worker_file&type=module", import.meta.url), { type: "module" });

  engine = await webllm.CreateWebWorkerMLCEngine(
    worker,
    "gemma-2-2b-it-q4f16_1-MLC",
    // "SmolLM2-360M-Instruct-q4f16_1-MLC",
    {
      initProgressCallback: (progress) => {
        if (onProgress) {

          // update progress on screen
          onProgress((prevProgress: number) => {
            if (progress.progress > prevProgress) {
              return progress.progress
            } else {
              return prevProgress
            }
          });
          
          console.log("LLM loading:", progress);
        }
      }
    }
  );
}

export async function sendPrompt(messages: webllm.ChatCompletionMessageParam[]) {
  if (!engine) throw new Error("LLM not initialized");
  console.log(messages)

  const request: webllm.ChatCompletionRequest = {
    messages,
    stream: true,
    temperature: 0,
  };

  const completion = await engine.chat.completions.create(request);
  return completion
}
