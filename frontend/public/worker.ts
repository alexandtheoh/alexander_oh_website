import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Hookup an engine to a worker handler
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  try {
    handler.onmessage(msg);
  } catch (err) {
    // console.error("Worker sync error:", err);
  }
};


// // Catch async promise rejections
// self.addEventListener("unhandledrejection", (event) => {
//   console.error("Worker unhandled rejection:", event.reason);
// });

// // Catch global errors
// self.addEventListener("error", (event) => {
//   console.error("Worker global error:", event.message, event.filename, event.lineno, event.colno);
// });