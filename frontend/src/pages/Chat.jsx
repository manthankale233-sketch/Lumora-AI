import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../utils/soundEffects";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Edit2,
  Sparkles,
  User,
  Check,
  X,
  Mic,
  MicOff,
  Volume2,
  Menu,
  Copy,
  Camera
} from "lucide-react";

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState("openai"); // Default to OpenAI
  const [stream, setStream] = useState(true);
  
  // Loading states
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // Voice / Audio states
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState(null);
  const recognitionRef = useRef(null);

  // Editing states
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchChats();

    // Initialize Web Speech API safely
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setInput((prev) => prev + (prev ? " " : "") + transcript);
        };

        recognitionRef.current = rec;
      }
    } catch (err) {
      console.warn("Speech recognition is not supported or blocked by security policy in this browser:", err);
    }
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    } else {
      setMessages([]);
    }
    // Cancel speech safely when switching chats
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setActiveSpeechText(null);
      }
    } catch (err) {
      console.warn("Speech synthesis cancel failed:", err);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (activeSpeechText === text) {
          setActiveSpeechText(null);
          return;
        }
      }

      // Strip markdown formatting characters for clean speech
      const cleanText = text.replace(/[\*#`_\-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.onend = () => {
        setActiveSpeechText(null);
      };
      utterance.onerror = () => {
        setActiveSpeechText(null);
      };

      setActiveSpeechText(text);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis playback failed:", err);
      setActiveSpeechText(null);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await api.get("/chats");
      setChats(res.data.chats);
      if (res.data.chats.length > 0) {
        setCurrentChatId(res.data.chats[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setChatsLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setMessagesLoading(true);
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const res = await api.post("/chats", { title: `New Conversation #${chats.length + 1}` });
      setChats([res.data.chat, ...chats]);
      setCurrentChatId(res.data.chat._id);
    } catch (err) {
      console.error("Failed to create chat", err);
    }
  };

  const handleRenameChat = async (chatId) => {
    if (!editTitleInput.trim()) return;
    try {
      const res = await api.patch(`/chats/${chatId}`, { title: editTitleInput });
      setChats(chats.map((c) => (c._id === chatId ? res.data.chat : c)));
      setEditingChatId(null);
      setEditTitleInput("");
    } catch (err) {
      console.error("Failed to rename chat", err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await api.delete(`/chats/${chatId}`);
      const remaining = chats.filter((c) => c._id !== chatId);
      setChats(remaining);
      if (currentChatId === chatId) {
        setCurrentChatId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = [];
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const preMatch = text.substring(lastIndex, match.index);
      if (preMatch) {
        parts.push(renderInlineFormatting(preMatch, `pre-${match.index}`));
      }
      
      parts.push(
        <pre key={match.index} className="bg-dark-deep p-4 rounded-xl border border-dark-border font-mono text-xs text-brand-pink my-3 overflow-x-auto select-all relative">
          <div className="absolute top-2 right-2 text-[9px] text-dark-muted font-bold uppercase tracking-wider">code</div>
          <code>{match[1].trim()}</code>
        </pre>
      );
      
      lastIndex = codeBlockRegex.lastIndex;
    }

    const postMatch = text.substring(lastIndex);
    if (postMatch) {
      parts.push(renderInlineFormatting(postMatch, `post-${lastIndex}`));
    }

    return parts;
  };

  const renderInlineFormatting = (text, key) => {
    const boldRegex = /\*\*([\s\S]*?)\*\*/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      const preMatch = text.substring(lastIndex, match.index);
      if (preMatch) {
        segments.push(preMatch);
      }
      segments.push(<strong key={match.index} className="font-bold text-white">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    const postMatch = text.substring(lastIndex);
    if (postMatch) {
      segments.push(postMatch);
    }

    return <span key={key} className="whitespace-pre-wrap leading-relaxed">{segments}</span>;
  };

  const sendMessageDirectly = async (textToSend) => {
    if (!textToSend.trim() || sending) return;

    let activeId = currentChatId;
    setSending(true);
    playSound("sent");

    try {
      // 1. If there's no active chat, create one first!
      if (!activeId) {
        const createRes = await api.post("/chats", { title: textToSend.substring(0, 30) || "New Conversation" });
        const newChat = createRes.data.chat;
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat._id);
        activeId = newChat._id;
      }

      const tempUserMessage = {
        _id: `temp-${Date.now()}`,
        sender: "user",
        content: textToSend || "Product Photo Uploaded",
        image: selectedImage || "",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
      setSelectedImage(null);

      if (stream) {
        setStreamingText(" ");
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/chats/${activeId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: textToSend, stream: true, provider, image: tempUserMessage.image }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to initiate stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === "chunk") {
                  setStreamingText((prev) => prev + data.content);
                } else if (data.type === "done") {
                  setMessages((prev) => [
                    ...prev.filter((m) => !m._id.startsWith("temp-")),
                    data.message,
                  ]);
                  setStreamingText("");
                  playSound("received");
                } else if (data.type === "error") {
                  alert(`AI Error: ${data.message}`);
                }
              } catch (e) {
                // Ignore incomplete JSONs
              }
            }
          }
        }
      } else {
        const res = await api.post(`/chats/${activeId}/messages`, {
          content: textToSend,
          stream: false,
          provider,
          image: tempUserMessage.image,
        });
        setMessages((prev) => [
          ...prev.filter((m) => !m._id.startsWith("temp-")),
          res.data.userMessage,
          res.data.aiMessage,
        ]);
        playSound("received");
      }
    } catch (err) {
      console.error("Send message error", err);
      setMessages((prev) => [
        ...prev,
        { _id: `err-${Date.now()}`, sender: "ai", content: `Error: ${err.message}` },
      ]);
      setStreamingText("");
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = input;
    setInput("");
    sendMessageDirectly(text);
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex bg-dark-card/30 rounded-3xl border border-dark-border overflow-hidden relative">
      
      {/* Mobile Conversations Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-80 bg-[#05030a] border-r border-dark-border z-50 p-4 flex flex-col space-y-4 lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Conversations</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-dark-muted hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              {/* New Conversation Button */}
              <button
                onClick={() => {
                  handleCreateChat();
                  setMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-violet/20 text-white rounded-xl py-3.5 text-sm font-semibold transition-all duration-300"
              >
                <Plus size={16} className="text-brand-violet" />
                <span>New Conversation</span>
              </button>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {chatsLoading ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl shimmer" />)
                ) : chats.length === 0 ? (
                  <div className="text-center py-8 text-xs text-dark-muted">No conversations yet</div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat._id}
                      className={`group flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all relative ${
                        currentChatId === chat._id
                          ? "bg-brand-violet/10 text-white border border-brand-violet/20"
                          : "text-dark-muted hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setCurrentChatId(chat._id);
                          setMobileSidebarOpen(false);
                        }}
                        className="flex items-center space-x-3 text-left truncate flex-1"
                      >
                        <MessageSquare size={16} className={currentChatId === chat._id ? "text-brand-violet" : "text-dark-muted"} />
                        <span className="truncate">{chat.title}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1. Conversations Sidebar (Desktop) */}
      <div className="w-80 border-r border-dark-border bg-dark-card/20 flex flex-col h-full hidden lg:flex">
        <div className="p-4 border-b border-dark-border">
          <button
            onClick={handleCreateChat}
            className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-violet/20 text-white rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 group"
          >
            <Plus size={16} className="text-brand-violet transition-transform group-hover:scale-110" />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {chatsLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl shimmer" />)
          ) : chats.length === 0 ? (
            <div className="text-center py-8 text-xs text-dark-muted">No conversations yet</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`group flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all relative ${
                  currentChatId === chat._id
                    ? "bg-brand-violet/10 text-white border border-brand-violet/20"
                    : "text-dark-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                {editingChatId === chat._id ? (
                  <div className="flex items-center space-x-1 w-full">
                    <input
                      type="text"
                      value={editTitleInput}
                      onChange={(e) => setEditTitleInput(e.target.value)}
                      className="bg-dark-deep border border-brand-violet text-white text-xs rounded-lg px-2 py-1 outline-none w-full focus:ring-1 focus:ring-brand-purple"
                      autoFocus
                    />
                    <button onClick={() => handleRenameChat(chat._id)} className="p-1 text-brand-emerald"><Check size={14} /></button>
                    <button onClick={() => setEditingChatId(null)} className="p-1 text-red-400"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentChatId(chat._id)}
                      className="flex items-center space-x-3 text-left truncate flex-1"
                    >
                      <MessageSquare size={16} className={currentChatId === chat._id ? "text-brand-violet" : "text-dark-muted"} />
                      <span className="truncate pr-4">{chat.title}</span>
                    </button>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1 absolute right-2 bg-dark-card/90 px-1 py-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => {
                          setEditingChatId(chat._id);
                          setEditTitleInput(chat.title);
                        }}
                        className="p-1 text-dark-muted hover:text-white"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteChat(chat._id)}
                        className="p-1 text-dark-muted hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-dark-card/10 relative">
        
        {/* Workspace Header */}
        <div className="h-20 border-b border-dark-border px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile Conversations Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 bg-white/5 border border-white/5 rounded-xl text-dark-muted hover:text-white lg:hidden transition-all cursor-pointer"
              title="Open conversations"
            >
              <Menu size={18} />
            </button>

            <img src="/annu_avatar.jpg" alt="Annu" className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover glow-violet border border-brand-violet/25" />
            <div>
              <h3 className="font-bold text-white text-sm md:text-base flex items-center space-x-1">
                <span>Annu</span>
                <span className="text-brand-violet">💜</span>
              </h3>
              <span className="text-[10px] md:text-xs text-dark-muted font-bold uppercase tracking-wider">AI Care Advisor</span>
            </div>
          </div>

          <div className="flex items-center bg-dark-deep border border-dark-border rounded-xl p-1.5 space-x-2">
            <button
              onClick={() => setProvider("gemini")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                provider === "gemini"
                  ? "bg-brand-violet text-white glow-violet"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => setProvider("openai")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                provider === "openai"
                  ? "bg-brand-pink text-white glow-pink"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              GPT-4o
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-48">
          {messagesLoading ? (
            <div className="flex flex-col justify-center items-center h-full space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-violet" />
              <span className="text-xs text-dark-muted">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-6">
              <img src="/annu_avatar.jpg" alt="Annu" className="w-20 h-20 rounded-2xl object-cover glow-violet border border-brand-violet/20 mb-2 animate-bounce" />
              <h3 className="text-2xl font-bold text-white">Ask Annu 💜 anything!</h3>
              <p className="text-sm text-dark-muted leading-relaxed font-medium">
                Get advice on acne, routines, product ingredients, or hair care. Annu is here to help!
              </p>

              {/* Suggestion Chips */}
              <div className="grid grid-cols-2 gap-3 w-full pt-4">
                {[
                  { text: "☀️ Build a morning routine", prompt: "Annu, can you build a custom morning routine for my skin?" },
                  { text: "🧴 How do I layer Retinol?", prompt: "How should I layer Retinol in my PM routine?" },
                  { text: "🧬 Check Niacinamide safety", prompt: "What is the safety rating and benefits of Niacinamide?" },
                  { text: "🍂 Fix my dry hair", prompt: "Annu, how can I fix my dry hair and scalp issues?" }
                ].map((chip) => (
                  <button
                    key={chip.text}
                    onClick={() => {
                      sendMessageDirectly(chip.prompt);
                    }}
                    className="glass-light hover:bg-white/5 border border-white/5 hover:border-brand-violet/25 text-left p-3.5 rounded-2xl text-xs font-semibold text-white transition-all duration-300 shadow-md"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex items-start space-x-4 max-w-3xl ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold bg-brand-violet text-white">
                      <User size={18} />
                    </div>
                  ) : (
                    <img src="/annu_avatar.jpg" alt="Annu" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-dark-border" />
                  )}

                  <div
                    className={`p-4 rounded-2xl text-base font-medium leading-relaxed relative group/msg ${
                      msg.sender === "user"
                        ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/10"
                        : "glass text-white border border-white/5"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Product upload"
                        className="max-w-xs max-h-48 rounded-xl object-cover mb-3 border border-white/10 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                    )}
                    {renderMessageContent(msg.content)}

                    {msg.sender === "ai" && (
                      <div className="absolute -bottom-6 right-2 flex items-center space-x-2 opacity-0 group-hover/msg:opacity-100 transition-opacity z-10">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.content)}
                          className="bg-dark-deep/80 hover:bg-dark-deep border border-dark-border text-dark-muted hover:text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                        >
                          <Volume2 size={10} />
                          <span>{activeSpeechText === msg.content ? "Stop" : "Speak"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMessageId(msg._id);
                            setTimeout(() => setCopiedMessageId(null), 2000);
                          }}
                          className="bg-dark-deep/80 hover:bg-dark-deep border border-dark-border text-dark-muted hover:text-white px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedMessageId === msg._id ? <Check size={10} className="text-brand-emerald" /> : <Copy size={10} />}
                          <span>{copiedMessageId === msg._id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {streamingText && (
                <div className="flex items-start space-x-4 max-w-3xl">
                  <img src="/annu_avatar.jpg" alt="Annu" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-dark-border" />
                  <div className="p-4 rounded-2xl text-base font-medium leading-relaxed glass text-white border border-brand-violet/20 glow-violet">
                    {renderMessageContent(streamingText)}
                    <span className="inline-block w-1.5 h-4 bg-brand-violet animate-pulse ml-1" />
                  </div>
                </div>
              )}

              {sending && !streamingText && (
                <div className="flex items-start space-x-4 max-w-3xl animate-pulse">
                  <img src="/annu_avatar.jpg" alt="Annu" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-dark-border" />
                  <div className="p-4 rounded-2xl glass text-white border border-white/5 flex items-center space-x-1.5 py-3.5 px-5">
                    <span className="w-2 h-2 bg-brand-violet rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-brand-pink rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            {/* Image Preview Thumbnail */}
            {selectedImage && (
              <div className="mb-3 bg-dark-deep/85 backdrop-blur-lg border border-dark-border rounded-2xl p-2.5 flex items-center space-x-3 shadow-2xl w-fit">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
                <div className="pr-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Product Photo</span>
                  <span className="text-[9px] text-dark-muted font-medium block">Annu will analyze this photo 📸</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative flex items-center bg-dark-deep/85 backdrop-blur-lg border border-dark-border rounded-full p-2.5 pl-6 pr-2.5 shadow-2xl focus-within:border-brand-violet transition-all duration-300 gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-white/5 border border-white/5 text-dark-muted hover:text-white rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
                title="Upload product photo"
              >
                <Camera size={16} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message Annu using ${provider === "gemini" ? "Gemini" : "GPT-4o"}...`}
                disabled={sending}
                className="flex-1 bg-transparent text-white placeholder-dark-muted outline-none text-sm pr-12 py-2"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3.5 rounded-full transition-all duration-300 flex items-center justify-center border ${
                  isListening
                    ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse"
                    : "bg-white/5 border-white/5 text-dark-muted hover:text-white"
                }`}
                title="Dictate message"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                type="submit"
                disabled={sending || (!input.trim() && !selectedImage)}
                className="bg-brand-violet hover:bg-brand-purple text-white p-3.5 rounded-full transition-all duration-300 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="flex items-center justify-center space-x-4 mt-2.5 text-[10px] text-dark-muted font-semibold uppercase tracking-wider">
              <span>{provider === "gemini" ? "Gemini 1.5 Flash" : "GPT-4o Mini"}</span>
              <span>•</span>
              <span>Friendly AI Skincare Assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Annu 3D Avatar Side Panel */}
      <div className="w-72 border-l border-dark-border bg-dark-card/20 flex flex-col items-center justify-between p-6 h-full hidden xl:flex">
        <div className="space-y-6 text-center w-full">
          <div className="flex items-center space-x-2 text-brand-violet justify-center">
            <Sparkles size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Interactive Assistant</span>
          </div>

          {/* Floating 3D Avatar */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 1, 0, -1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut"
            }}
            className="relative w-48 h-64 mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-brand-violet/20 via-brand-pink/10 to-transparent p-[2px] glow-violet group"
          >
            <img
              src="/annu_standing_avatar.jpg"
              alt="Annu Standing Avatar"
              className="w-full h-full object-cover rounded-[22px] group-hover:scale-105 transition-transform duration-500"
            />
            {/* Holographic scanner effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-violet/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-violet/40 animate-[bounce_4s_infinite] pointer-events-none" />
          </motion.div>

          {/* Interactive Speech Bubble */}
          <div className="relative bg-dark-deep border border-dark-border/80 rounded-2xl p-4 text-xs font-semibold text-white shadow-lg">
            <div className="absolute -left-2 top-6 w-4 h-4 bg-dark-deep border-l border-b border-dark-border/80 rotate-45" />
            <p className="leading-relaxed text-dark-muted">
              {sending
                ? "Analyzing ingredients and formulating the best advice for you..."
                : isListening
                ? "Listening carefully... Speak clearly into your microphone! 🎤"
                : input
                ? "I'm ready to answer! Click send when you are done. 💜"
                : "Hi! I'm Annu, your AI skincare companion. Ask me anything about your routine! ☀️"}
            </p>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-brand-violet/5 border border-brand-violet/10 rounded-2xl p-4 text-center w-full">
          <h5 className="text-xs font-bold text-white mb-1">Premium Skincare AI</h5>
          <p className="text-[10px] text-dark-muted leading-relaxed font-medium">
            Equipped with clinical knowledge databases to analyze formulations and ingredients.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Chat;
