"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Scale, Upload, Zap, MessageCircle, AlertCircle, FileText, CheckCircle2, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CountrySelector } from "@/components";
import { COUNTRIES, Country } from "@/lib/constants";

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
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
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
          country: selectedCountry.code,
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
          country: selectedCountry.code,
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
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="inline-flex items-center gap-2 mb-4 px-3 md:px-4 py-2 bg-blue-100/60 rounded-full">
              <Scale className="w-3 md:w-4 h-3 md:h-4 text-blue-900" />
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">AI Legal Assistant</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
              Legal Guidance in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Seconds</span>
            </h1>
            <p className="text-gray-600 mt-3 md:mt-4 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              Paste a notice, upload a document, or describe your legal issue. Get instant, clear explanations powered by AI.
            </p>
          </div>

          {/* Input Container */}
          <div className="w-full max-w-3xl px-4">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-lg md:rounded-2xl bg-white shadow-lg md:shadow-xl border-2 transition-all duration-300 p-4 md:p-8 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 shadow-2xl md:scale-105"
                  : "border-gray-200 hover:shadow-2xl hover:border-gray-300"
              }`}
            >
              {error && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl flex items-start gap-2 md:gap-3">
                  <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-xs md:text-sm font-medium">{error}</p>
                </div>
              )}

              {isDragging && (
                <div className="absolute inset-0 rounded-lg md:rounded-2xl flex flex-col items-center justify-center bg-blue-50/90 border-2 border-dashed border-blue-400 pointer-events-none gap-2 md:gap-3">
                  <FileText className="w-8 md:w-12 h-8 md:h-12 text-blue-500" />
                  <p className="text-blue-700 font-semibold text-sm md:text-base">Drop your document here</p>
                </div>
              )}

              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Select Constitution</label>
                <CountrySelector value={selectedCountry} onChange={setSelectedCountry} />
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paste a legal notice, describe your issue, or ask a question…"
                className="w-full h-32 md:h-44 resize-none rounded-lg md:rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-white px-3 md:px-5 py-3 md:py-4 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                disabled={loading}
              />

              {/* Bottom Action Row */}
              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <button
                  onClick={handleAsk}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 md:px-7 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-xs md:text-sm hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition shadow-lg hover:shadow-xl disabled:shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin">
                        <Zap className="w-3 md:w-4 h-3 md:h-4" />
                      </div>
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Loading...</span>
                    </span>
                  ) : (
                    "Get Legal Guidance"
                  )}
                </button>

                <span className="text-gray-500 text-xs md:text-sm font-medium flex items-center gap-1 order-last sm:order-none">
                  {loading
                    ? <>
                        <Sparkles className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Analyzing with AI…</span>
                        <span className="sm:hidden">Analyzing…</span>
                      </>
                    : session
                    ? <>
                        <Zap className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Instant, clear answers</span>
                        <span className="sm:hidden">Ready</span>
                      </>
                    : <>
                        <Info className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Sign in to proceed</span>
                        <span className="sm:hidden">Sign in</span>
                      </>}
                </span>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-4 md:mt-6 flex flex-wrap gap-3 md:gap-4 justify-center text-xs md:text-sm text-gray-600">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Upload className="w-3 md:w-4 h-3 md:h-4 text-blue-500 flex-shrink-0" />
                <span>Drag & drop docs</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Zap className="w-3 md:w-4 h-3 md:h-4 text-blue-500 flex-shrink-0" />
                <span>AI analysis</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <MessageCircle className="w-3 md:w-4 h-3 md:h-4 text-blue-500 flex-shrink-0" />
                <span>Always available</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto pb-40 md:pb-48">
            <div className="max-w-3xl mx-auto w-full p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/60 rounded-full mb-3">
                        <Scale className="w-3 h-3 text-blue-900" />
                        <span className="text-xs font-semibold text-blue-900 uppercase">Chat Started</span>
                      </div>
                      <p className="text-gray-500 text-sm md:text-base">Start asking questions or drop documents to get legal guidance</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-lg md:rounded-2xl px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm max-w-lg ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-900 rounded-bl-none"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          ) : (
                            <div className="markdown-content">
                              <ReactMarkdown
                                components={{
                                  p: ({node, ...props}: any) => <p className="my-1 leading-relaxed" {...props} />,
                                  strong: ({node, ...props}: any) => <strong className="font-bold" {...props} />,
                                  em: ({node, ...props}: any) => <em className="italic" {...props} />,
                                  ul: ({node, ...props}: any) => <ul className="list-disc list-inside my-2 ml-2" {...props} />,
                                  ol: ({node, ...props}: any) => <ol className="list-decimal list-inside my-2 ml-2" {...props} />,
                                  li: ({node, ...props}: any) => <li className="my-1" {...props} />,
                                  a: ({node, ...props}: any) => <a className="text-blue-600 hover:underline" {...props} />,
                                  h1: ({node, ...props}: any) => <h1 className="text-lg font-bold my-2" {...props} />,
                                  h2: ({node, ...props}: any) => <h2 className="text-base font-bold my-2" {...props} />,
                                  h3: ({node, ...props}: any) => <h3 className="font-bold my-1" {...props} />,
                                  code: ({node, inline, ...props}: any) => inline ? 
                                    <code className="bg-gray-200 px-1 rounded text-xs" {...props} /> :
                                    <code className="bg-gray-200 p-2 rounded block my-1 text-xs overflow-x-auto" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 rounded-lg md:rounded-2xl rounded-bl-none px-3 md:px-5 py-2 md:py-3">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin">
                              <Zap className="w-3 md:w-4 h-3 md:h-4 text-blue-600" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600">Analyzing…</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fixed Input Area */}
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/80 border-t border-gray-200 p-4 md:p-6 z-10">
            <div className="max-w-3xl mx-auto">
              {error && (
                <div className="mb-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-3 md:w-4 h-3 md:h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700">Constitution</label>
                </div>
                <CountrySelector value={selectedCountry} onChange={setSelectedCountry} />
              </div>

              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-lg md:rounded-xl bg-white shadow-lg border-2 transition-all duration-300 p-3 md:p-4 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 shadow-xl"
                    : "border-gray-200 hover:shadow-lg hover:border-gray-300"
                }`}
              >
                {isDragging && (
                  <div className="absolute inset-0 rounded-lg md:rounded-xl flex flex-col items-center justify-center bg-blue-50/90 border-2 border-dashed border-blue-400 pointer-events-none gap-2">
                    <FileText className="w-6 md:w-8 h-6 md:h-8 text-blue-500" />
                    <p className="text-blue-700 font-semibold text-xs md:text-sm">Drop document</p>
                  </div>
                )}

                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a follow-up question or paste a legal notice…"
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400 max-h-24"
                  disabled={loading}
                  rows={2}
                />

                {/* Button */}
                <div className="mt-2 md:mt-3 flex justify-end">
                  <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-xs md:text-sm hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin">
                          <Zap className="w-3 h-3" />
                        </div>
                        <span className="hidden sm:inline">Processing</span>
                      </span>
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>Get clear legal guidance without expensive lawyers!</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
