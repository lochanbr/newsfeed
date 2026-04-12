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
    <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50 dark:from-slate-950 dark:to-slate-900 text-black dark:text-zinc-50 font-sans">
      {/* Filter Bar */}
      <div className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-zinc-200 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <LucideGlobe className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <motion.div layout className="flex gap-2 flex-1 md:flex-initial">
            <select
              className="rounded-lg px-3 py-2 bg-zinc-100 dark:bg-slate-800 border border-zinc-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              {ISO_COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </motion.div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <LucideSearch className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search country..."
            className="rounded-lg px-3 py-2 bg-zinc-100 dark:bg-slate-800 border border-zinc-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm w-full md:w-40"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Category Tabs */}
        <motion.div layout className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 w-full md:w-auto">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.key}
              layout
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                category === cat.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50 dark:bg-blue-500 dark:shadow-blue-500/50"
                  : "bg-zinc-200 dark:bg-slate-800 text-black dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-slate-700"
              }`}
              onClick={() => setCategory(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
      {/* News Feed */}
      <main className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full" />
              <p className="text-zinc-600 dark:text-zinc-400">Loading latest news...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-24">
            <p className="text-lg text-zinc-500 dark:text-zinc-400">No news found for this selection.</p>
          </div>
        ) : (
          news.map((article, index) => (
            <motion.div
              key={article.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600 border border-transparent"
            >
              <div className="relative w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex-1 p-5 flex flex-col gap-3">
                <h2 className="text-base font-semibold line-clamp-2 text-black dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{article.title}</h2>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{article.source}</div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleSimplify(article)}
                  disabled={simplifying}
                >
                  <LucideSparkles className="w-4 h-4" />
                  {simplifying ? "Simplifying..." : "Simplify"}
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </main>
      {/* Glassmorphism Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl p-8 max-w-2xl w-full backdrop-blur-xl border border-white/30 dark:border-slate-700/50"
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                ✨ Simplified News
              </motion.h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">Key Points</h4>
                <motion.ul className="space-y-2">
                  {modal.summary.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 text-sm"
                    >
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">•</span>
                      <span className="text-black dark:text-zinc-100">{b.replace(/•\s*/, "")}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-200 dark:border-slate-600">
                <p className="text-sm leading-relaxed text-black dark:text-zinc-100">
                  {modal.summary.paragraph}
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={modal.article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-3 rounded-lg border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all"
                >
                  Read Original
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                  onClick={() => setModal(null)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
