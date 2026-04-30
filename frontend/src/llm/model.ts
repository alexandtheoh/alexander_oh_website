import * as webllm from "@mlc-ai/web-llm";
import type { ChatCompletionMessageParam, ChatCompletionRequest } from "@mlc-ai/web-llm/lib/openai_api_protocols/chat_completion";

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
          // console.log("LLM loading:", progress);
        }
      }
    }
  );
}

export async function sendPrompt(messages: ChatCompletionMessageParam[]) {
  if (!engine) throw new Error("LLM not initialized");
  // console.log(messages)

  const request: ChatCompletionRequest = {
    messages,
    stream: true,
    temperature: 0,
  };

  const completion = await engine.chat.completions.create(request);
  return completion
}


// Summarizes old messages into a single summary node, keeping the last `keepLast` messages intact.
// Triggers only when messages.length > keepLast + 1 (system counts as 1).
export async function consolidateConvo(
  messages: ChatCompletionMessageParam[],
  keepLast: number = 8
): Promise<ChatCompletionMessageParam[]> {
  if (messages.length <= keepLast + 1) return messages;

  const systemMsg = messages[0];
  const toSummarize = messages.slice(1, messages.length - keepLast);
  const recent = messages.slice(messages.length - keepLast);

  const summaryRequest: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "Summarize the following conversation in 2-3 sentences, preserving key facts about the user's questions and answers given.",
    },
    {
      role: "user",
      content: toSummarize
        .map((m) => `${m.role}: ${typeof m.content === "string" ? m.content : ""}`)
        .join("\n"),
    },
  ];

  let summary = "";
  const stream = await sendPrompt(summaryRequest);
  for await (const chunk of stream) {
    summary += chunk.choices[0]?.delta?.content || "";
  }

  return [
    systemMsg,
    { role: "assistant", content: `[Conversation summary: ${summary}]` },
    ...recent,
  ];
}
