import { useState, useEffect, useRef } from "react";
import { initLLM, sendPrompt, consolidateConvo } from "../llm/model"
import { getContextAwareTopKRecords } from "../llm/rag"
import { loadSystemPrompt } from "../llm/db"
import '../App.css'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm/lib/openai_api_protocols/chat_completion";

export default function ChatbotUI() {
  // for messages
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [input, setInput] = useState("");
  const [messageCount, setMessageCount] = useState(0)
  const [systemPrompt, setSystemPrompt] = useState('')

  // for llm engine progress
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const renderProgress = (prog: number): string => {
    if (prog == 0) {
      return 'LLM loading...'
    } else if (prog == 1 && !loading) {
      return 'Ask me anything!'
    } else {
      return `Loading: ${(prog * 100).toFixed(2)}%`
    }
  }

  // load llm engine
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await initLLM(setProgress);
      } catch (err) {

        let errorStr = '';

        // set error message
        if (err instanceof Error) {
          errorStr = err.message;
        } else if (typeof err === 'string') {
          errorStr = err;
        } else {
          errorStr = 'An unknown error occurred';
        }

        setError(errorStr);
        
        // load error in chat
        const errorMsg: ChatCompletionMessageParam = {
          role: "assistant",
          content: "Error loading model. Your device might not be compatible with WebGPU."
        }
        setMessages([errorMsg])
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array = run once on mount



  // for messages
  const sendMessage = async () => {
    if (!input.trim()) return;

    // context-aware retrieval: embed recent conversation + current query together
    const context = await getContextAwareTopKRecords(messages, input, 8, 0);

    // consolidate long conversations before adding a new turn
    const base = messageCount > 0 ? await consolidateConvo([...messages]) : [...messages];

    // create user message
    const userMsg: ChatCompletionMessageParam = {
      role: "user",
      content: input,
    };

    let messagesToSend: ChatCompletionMessageParam[] = base;

    // only add system prompt if first message, combine system and context message as one
    if (messageCount === 0) {
      const systemPrompt = await loadSystemPrompt();
      setSystemPrompt(systemPrompt);

      const systemPromptMsg: ChatCompletionMessageParam = {
        role: "system",
        content: `${systemPrompt}
    Current Date: ${new Date().toISOString()}
    Retrieved Context:
    ${context}`,
      };
      messagesToSend.push(systemPromptMsg, userMsg);
    } else {
      messagesToSend[0].content = `${systemPrompt}
    Current Date: ${new Date().toISOString()}
    Retrieved Context:
    ${context}`,
      messagesToSend.push(userMsg);
    }

    // increment count
    setMessageCount(x => x + 1)

    // set messages
    setMessages(messagesToSend);
    setInput("");

    try {
      // Send the updated messages array (with user message)
      const replyStream = await sendPrompt(messagesToSend);
      
      let fullResponse = "";
      
      // Process stream and update UI incrementally
      for await (const chunk of replyStream) {
        const chunkContent = chunk.choices[0]?.delta?.content || "";
        fullResponse += chunkContent;
        
        // Create temporary assistant message
        const tempAssistantMsg: ChatCompletionMessageParam = {
          role: "assistant",
          content: fullResponse,
        };
        
        // Update UI with streaming response
        setMessages([...messagesToSend, tempAssistantMsg]);
      }
      
      // Final update with complete message
      const finalAssistantMsg: ChatCompletionMessageParam = {
        role: "assistant",
        content: fullResponse,
      };
      setMessages([...messagesToSend, finalAssistantMsg]);
      
    } catch (error) {
      // Add error message to chat
      const errorMsg: ChatCompletionMessageParam = {
        role: "assistant",
        content: "Sorry, an error occurred while processing your message.",
      };
      setMessages([...messagesToSend, errorMsg]);
    }
  };

  // for message scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottomMessages = () => {
    const container = messagesEndRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottomMessages();
  }, [messages]);

  // helpers
  const renderContent = (msg: ChatCompletionMessageParam) => {
    let renderedContent: string = ""
    if (!msg.content) renderedContent = "";
    if (typeof msg.content === "string") renderedContent = msg.content;
    
    if (msg.role == 'assistant') {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {renderedContent}
        </ReactMarkdown>
      );
    } else {
      return renderedContent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title" style={{ padding: '8px' }} >
          <h2>Alex AI</h2>
          <span className="status" >{renderProgress(progress)}</span>
          <span className="status">{loading || error ? 'Offline': 'Online'}</span>
        </div>
      </div>

      <div className="messages-container" ref={messagesEndRef}>
        {messages.filter((message) => message.role != "system").map((message, index) => (
          <div
            key={index}
            className={`message-wrapper ${message.role}`}
          >
            <div className="message">
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{renderContent(message)}</div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message-wrapper assistant">
            <div className="message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="chat-input"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`send-button ${input.trim() && !loading ? 'active' : ''}`}
          >
            Send
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send • Shift + Enter for new line
        </div>
      </div>
    </div>
    
  );
}
