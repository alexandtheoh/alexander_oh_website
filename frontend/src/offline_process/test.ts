export async function loadSystemPrompt() {
  const res = await fetch("../../data/system_prompt.md");
  if (!res.ok) throw new Error("Failed to load markdown file");
  const markdownString = await res.text();
  return markdownString;
}

await loadSystemPrompt()