"use client";

import { useState } from "react";
import { Globe, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  type ApiResult = Record<string, unknown> | null;
  const [result, setResult] = useState<ApiResult>(null);

  const handleIngest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url,maxPages: 200,concurrency: 10 }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/rag/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "unused", action: "regenerate" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = result && typeof result === 'object' && 'message' in result && !('error' in result);
  const isError = result && typeof result === 'object' && 'error' in result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                RAG Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your knowledge base and embeddings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid gap-6">
          {/* Ingest Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Globe size={20} />
                Ingest New Content
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                Crawl and index a website for RAG queries
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-all duration-200"
                />
                <button
                  onClick={handleIngest}
                  disabled={loading || !url}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium
                           hover:bg-indigo-700 active:bg-indigo-800
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                           shadow-md hover:shadow-lg
                           flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="hidden sm:inline">Ingesting...</span>
                      <span className="sm:hidden">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Globe size={18} />
                      Ingest
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-400">
                      <li>• Crawls up to 50 pages from the domain</li>
                      <li>• Extracts and chunks content automatically</li>
                      <li>• Generates embeddings for semantic search</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regenerate Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <RefreshCw size={20} />
                Fix Existing Documents
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Regenerate embeddings for documents without them
              </p>
            </div>
            
            <div className="p-6">
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium
                         hover:bg-green-700 active:bg-green-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                         shadow-md hover:shadow-lg
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Regenerate Embeddings
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Use this if you already have documents in the database but they&apos;re missing embeddings. 
                This will scan for documents with NULL embeddings and generate them.
              </p>
            </div>
          </div>

          {/* Result Card */}
          {result != null && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`px-6 py-4 flex items-center gap-2 ${
                isSuccess 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : isError
                  ? 'bg-gradient-to-r from-red-500 to-rose-600'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600'
              }`}>
                {isSuccess && <CheckCircle size={20} className="text-white" />}
                {isError && <AlertCircle size={20} className="text-white" />}
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {isSuccess ? 'Success' : isError ? 'Error' : 'Result'}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="relative">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs sm:text-sm 
                                 border border-gray-200 dark:border-gray-700
                                 max-h-96 font-mono leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-white dark:bg-gray-800 
                             border border-gray-300 dark:border-gray-600 rounded
                             text-xs text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}