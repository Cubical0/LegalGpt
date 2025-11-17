"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Scale, Upload, Zap, MessageCircle, AlertCircle, FileText, CheckCircle2, Info } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasConversationStarted, setHasConversationStarted] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      createNewConversation();
      const savedQuery = localStorage.getItem("pendingQuery");
      if (savedQuery) {
        setQuery(savedQuery);
        localStorage.removeItem("pendingQuery");
      }
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewConversation = async () => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ title: "New Conversation" }),
      });

      const data = await res.json();
      if (data.success) {
        setConversationId(data.data._id);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return;

    try {
      await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ role, content }),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    setError("");

    try {
      const fileContent = await readFileAsText(file);

      if (!fileContent.trim()) {
        setError("File is empty or could not be read");
        return;
      }

      if (!session) {
        const fileContext = `Analyze this legal document:\n\n${fileContent}`;
        localStorage.setItem("pendingQuery", fileContext);
        router.push("/auth/signin");
        return;
      }

      const fileContext = `Analyze this legal document:\n\n${fileContent}`;
      const userMsgId = Date.now().toString();
      
      setLoading(true);
      setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: fileContext }]);
      setHasConversationStarted(true);

      const res = await fetch("/api/legal/guidance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({
          query: fileContext,
          type: "document_analysis",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to analyze document");
        setLoading(false);
        return;
      }

      const guidance = data.data.guidance;
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: guidance }]);
      setQuery("");

      await saveMessage("user", fileContext);
      await saveMessage("assistant", guidance);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to process document: ${err.message}`
          : "Failed to process document"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!query.trim()) {
      setError("Please enter a question or legal issue");
      return;
    }

    if (!session) {
      localStorage.setItem("pendingQuery", query);
      router.push("/auth/signin");
      return;
    }

    const userQuery = query;
    const userMsgId = Date.now().toString();
    
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: userQuery }]);
    setHasConversationStarted(true);
    setLoading(true);
    setError("");
    setQuery("");

    try {
      const res = await fetch("/api/legal/guidance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({
          query: userQuery,
          type: "question",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to get response");
        return;
      }

      const guidance = data.data.guidance;
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: guidance }]);

      await saveMessage("user", userQuery);
      await saveMessage("assistant", guidance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">
      {!session && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-blue-900 text-sm font-medium">
            <Link href="/auth/signin" className="font-bold hover:text-blue-700 underline underline-offset-2">
              Sign in
            </Link>
            {" "}to start getting AI-powered legal guidance
          </p>
        </div>
      )}

      {!hasConversationStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Heading Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100/60 rounded-full">
              <Scale className="w-4 h-4 text-blue-900" />
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">AI Legal Assistant</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
              Legal Guidance in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Seconds</span>
            </h1>
            <p className="text-gray-600 mt-4 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Paste a notice, upload a document, or describe your legal issue. Get instant, clear explanations powered by AI.
            </p>
          </div>

          {/* Input Container */}
          <div className="w-full max-w-3xl">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl bg-white shadow-xl border-2 transition-all duration-300 p-8 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 shadow-2xl scale-105"
                  : "border-gray-200 hover:shadow-2xl hover:border-gray-300"
              }`}
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {isDragging && (
                <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-blue-50/90 border-2 border-dashed border-blue-400 pointer-events-none gap-3">
                  <FileText className="w-12 h-12 text-blue-500" />
                  <p className="text-blue-700 font-semibold">Drop your document here</p>
                </div>
              )}

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste a legal notice, describe your issue, or ask a question…"
                className="w-full h-44 resize-none rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-white px-5 py-4 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                disabled={loading}
              />

              {/* Bottom Action Row */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={handleAsk}
                  disabled={loading}
                  className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition shadow-lg hover:shadow-xl disabled:shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin">
                        <Zap className="w-4 h-4" />
                      </div>
                      Processing...
                    </span>
                  ) : (
                    "Get Legal Guidance"
                  )}
                </button>

                <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                  {loading
                    ? <>
                        <Sparkles className="w-4 h-4" />
                        Analyzing with AI…
                      </>
                    : session
                    ? <>
                        <Zap className="w-4 h-4" />
                        Instant, clear answers
                      </>
                    : <>
                        <Info className="w-4 h-4" />
                        Sign in to proceed
                      </>}
                </span>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Drag & drop documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>AI-powered analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>Always available</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Input Area */}
          <div className="w-full md:w-1/3 flex flex-col border-r border-gray-200 p-6">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/60 rounded-full mb-2">
                <Scale className="w-3 h-3 text-blue-900" />
                <span className="text-xs font-semibold text-blue-900 uppercase">Chat</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
            </div>

            {/* Input Form */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex-1 rounded-2xl bg-white shadow-lg border-2 transition-all duration-300 p-6 flex flex-col ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 shadow-xl"
                  : "border-gray-200 hover:shadow-lg hover:border-gray-300"
              }`}
            >
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-xs font-medium">{error}</p>
                </div>
              )}

              {isDragging && (
                <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center bg-blue-50/90 border-2 border-dashed border-blue-400 pointer-events-none gap-2">
                  <FileText className="w-10 h-10 text-blue-500" />
                  <p className="text-blue-700 font-semibold text-sm">Drop document</p>
                </div>
              )}

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a follow-up question…"
                className="flex-1 resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                disabled={loading}
              />

              {/* Button */}
              <button
                onClick={handleAsk}
                disabled={loading}
                className="mt-4 w-full px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin">
                      <Zap className="w-4 h-4" />
                    </div>
                    Processing...
                  </span>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>

          {/* Right: Chat History */}
          <div className="hidden md:flex md:w-2/3 flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">Analyzing…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Legal Disclaimer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <p className="text-xs text-gray-500 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>No need to pay money to lawers when you can get the same quality of service for free!</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
