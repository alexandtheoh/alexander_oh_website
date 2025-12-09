import { useState } from "react";
import ChatbotUI from "./Chat";
import '../App.css'

export default function ChatbotPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? "❌" : "💬"}
      </button>

      {/* Chat popup */}
      <div className={`chatbot-popup ${open ? "open" : "closed"}`}>
        <ChatbotUI />
      </div>
    </>
  );
}
