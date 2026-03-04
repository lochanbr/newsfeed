"use client";

import { useState, useEffect } from "react";
import { fetchNews, NewsArticle } from "../lib/news";
import { simplifyNews } from "../lib/gemini";
import { LucideGlobe, LucideSearch, LucideSparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";


const ISO_COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "in", name: "India" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  // ...add more ISO country codes as needed
];

const CATEGORIES = [
  { key: "top", label: "Top" },
  { key: "world", label: "World" },
  { key: "technology", label: "Technology" },
  { key: "business", label: "Business" },
  { key: "science", label: "Science" },
];

export default function Home() {
  const [country, setCountry] = useState("us");
  const [category, setCategory] = useState("top");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ article: NewsArticle; summary: { bullets: string[]; paragraph: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [simplifying, setSimplifying] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNews(country, category)
      .then(setNews)
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setNews([]);
      })
      .finally(() => setLoading(false));
  }, [country, category]);

  const handleSimplify = async (article: NewsArticle) => {
    setSimplifying(true);
    try {
      const summary = await simplifyNews(article.description || article.title);
      setModal({ article, summary });
    } catch (err) {
      console.error("Simplification failed:", err);
      alert("AI Simplification failed. Please try again.");
    } finally {
      setSimplifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-50 font-sans">
      {/* Filter Bar */}
      <div className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/80 dark:bg-black/80 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2">
          <LucideGlobe className="w-5 h-5" />
          <motion.div layout>
            <select
              className="rounded px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              {ISO_COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </motion.div>
          <LucideSearch className="w-4 h-4 ml-2" />
          <input
            type="text"
            placeholder="Search country..."
            className="rounded px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${category === cat.key ? "bg-blue-600 text-white dark:bg-blue-400 dark:text-black" : "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-zinc-50"}`}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      {/* News Feed */}
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16">Loading news...</div>
        ) : news.length === 0 ? (
          <div className="col-span-full text-center py-16">No news found for this selection.</div>
        ) : (
          news.map(article => (
            <div key={article.url} className="bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden flex flex-col">
              <div className="relative w-full h-48 bg-zinc-200 dark:bg-zinc-800">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if the image URL itself is broken
                    (e.target as any).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2">
                <h2 className="text-lg font-semibold line-clamp-2">{article.title}</h2>
                <div className="text-xs text-zinc-500">{article.source}</div>
                <button
                  className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50"
                  onClick={() => handleSimplify(article)}
                  disabled={simplifying}
                >
                  <LucideSparkles className="w-4 h-4" />
                  {simplifying ? "Simplifying..." : "✨ Simplify"}
                </button>
              </div>
            </div>
          ))
        )}
      </main>
      {/* Glassmorphism Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl p-8 max-w-lg w-full glassmorphism border border-zinc-200 dark:border-zinc-700"
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Simplified News</h3>
              <ul className="mb-4 list-disc pl-6 space-y-2">
                {modal.summary.bullets.map((b, i) => (
                  <li key={i}>{b.replace(/•\s*/, "")}</li>
                ))}
              </ul>
              <p className="mb-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">{modal.summary.paragraph}</p>
              <div className="flex gap-3">
                <a
                  href={modal.article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 rounded-full border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Read Original
                </a>
                <button
                  className="flex-1 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  onClick={() => setModal(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
