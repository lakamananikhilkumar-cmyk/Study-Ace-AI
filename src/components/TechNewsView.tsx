import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  PlaySquare,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Share2,
  BookOpen,
  Award,
  Zap,
  CheckCircle2,
  Tv,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TechNewsArticle } from '../types';

export const TechNewsView: React.FC = () => {
  const { addXP } = useApp();
  const [articles, setArticles] = useState<TechNewsArticle[]>([]);
  const [trivia, setTrivia] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Today');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [likedArticles, setLikedArticles] = useState<{ [id: string]: boolean }>({});
  const [triviaAnswer, setTriviaAnswer] = useState<number | null>(null);
  const [hasGemini, setHasGemini] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [easyMode, setEasyMode] = useState<boolean>(true);

  const categories = [
    'All',
    'Artificial Intelligence',
    'Space & Astronomy',
    'Robotics & Hardware',
    'Cybersecurity',
    'Green Tech',
    'Student Coding'
  ];

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tech-news');
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
      if (data.trivia) {
        setTrivia(data.trivia);
      }
      if (data.lastUpdated) {
        setLastUpdated(data.lastUpdated);
      }
      setHasGemini(Boolean(data.hasGemini));
    } catch (err) {
      console.error('Failed to fetch tech news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleGenerateFreshNews = async () => {
    setIsGenerating(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/tech-news/generate', { method: 'POST' });
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
      setFeedbackMessage(data.message || 'Updated with fresh daily tech stories!');
      addXP(10, 'Discovered daily tech news');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate news:', err);
      setFeedbackMessage('Refreshed today’s stories.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedArticles[id]) return;

    setLikedArticles(prev => ({ ...prev, [id]: true }));
    setArticles(prev =>
      prev.map(art => (art.id === id ? { ...art, likes: (art.likes || 0) + 1 } : art))
    );

    try {
      await fetch(`/api/tech-news/${id}/like`, { method: 'POST' });
      addXP(5, 'Liked tech news article');
    } catch (err) {
      console.warn('Like request failed:', err);
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.tags.some(t => t.toLowerCase().includes(q)) ||
      art.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.find(a => a.featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-stone-800">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Newspaper className="w-3.5 h-3.5" />
                Daily Tech News
              </span>
              <span className="text-xs text-stone-300 flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-0.5 rounded-full border border-stone-700">
                <Clock className="w-3 h-3 text-amber-400" />
                {lastUpdated}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini AI Powered Feed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Outfit']">
              Everyday Tech News & Science Breakthroughs
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              Stay ahead with curated daily updates in Artificial Intelligence, Space, Robotics, and Green Tech. See how cutting-edge discoveries connect directly to your school curriculum!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="tech-news-refresh-btn"
              onClick={handleGenerateFreshNews}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition disabled:opacity-50"
              title="Generate new daily tech stories using Gemini AI"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Fetching Today’s News...' : 'Get Fresh Tech Updates'}</span>
            </button>
          </div>
        </div>

        {feedbackMessage && (
          <div className="mt-4 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input & Easy Mode Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setEasyMode(!easyMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              easyMode
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
            }`}
            title="Toggle simplified, easy student explanation mode"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${easyMode ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>Small & Easy Mode: {easyMode ? 'ON' : 'OFF'}</span>
          </button>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, tags..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-64 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-800 space-y-3">
          <Newspaper className="w-12 h-12 text-stone-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">No articles matched your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your category or search query to see today’s top science and technology developments.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Headline Story */}
          {featuredArticle && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-md relative overflow-hidden group">
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide border border-amber-500/30">
                      ★ Featured Story
                    </span>
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-['Outfit'] leading-snug">
                    {featuredArticle.title}
                  </h2>

                  {/* Easy Understanding Callout */}
                  {featuredArticle.simpleSummary && (
                    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 rounded-xl p-4 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 tracking-wide uppercase">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Daily Update In Easy Understanding Way
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200 font-semibold">
                          Simplified For Students
                        </span>
                      </div>
                      <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed">
                        {featuredArticle.simpleSummary}
                      </p>
                      {featuredArticle.whatItMeans && (
                        <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                          <span className="font-bold shrink-0">💡 What it means:</span>
                          <span className="leading-relaxed">{featuredArticle.whatItMeans}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  {/* Key Takeaways */}
                  {featuredArticle.keyTakeaways && featuredArticle.keyTakeaways.length > 0 && (
                    <div className="bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200 dark:border-stone-700 space-y-2">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Key Breakthrough Highlights:
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                        {featuredArticle.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Student Curriculum Relevance Callout */}
                  {featuredArticle.studentRelevance && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">School Science Connection:</span>
                        <p className="leading-normal">{featuredArticle.studentRelevance}</p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {featuredArticle.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Educational Video & Actions */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                  {/* Related YouTube video card */}
                  {featuredArticle.youtubeQuery && (
                    <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                          <PlaySquare className="w-4 h-4 text-red-600" />
                          Recommended Video Lesson:
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                          YouTube
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {featuredArticle.youtubeTitle || featuredArticle.title}
                      </p>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(featuredArticle.youtubeQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-xs transition"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    </div>
                  )}

                  {/* Actions & Source link */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      Source: <span className="font-semibold text-stone-700 dark:text-stone-300">{featuredArticle.source}</span>
                    </span>
                    <button
                      onClick={(e) => handleLike(featuredArticle.id, e)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
                        likedArticles[featuredArticle.id]
                          ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                          : 'border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{featuredArticle.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Daily Tech Stories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {regularArticles.map((art) => (
              <article
                key={art.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {art.category}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-['Outfit'] leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {art.title}
                  </h3>

                  {/* Easy Student Explanation */}
                  {easyMode && art.simpleSummary ? (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5">
                      <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-400 text-[11px] uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Easy Daily Summary:
                      </span>
                      <p className="leading-relaxed font-medium text-emerald-900 dark:text-emerald-100">
                        {art.simpleSummary}
                      </p>
                      {art.whatItMeans && (
                        <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 pt-1 border-t border-emerald-200 dark:border-emerald-900/40 leading-snug">
                          <strong>💡 Why it matters:</strong> {art.whatItMeans}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {art.summary}
                    </p>
                  )}

                  {/* Student Relevance Pill */}
                  {art.studentRelevance && (
                    <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-2.5 text-[11px] text-amber-950 dark:text-amber-200">
                      <span className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-400 mb-0.5">
                        <BookOpen className="w-3 h-3" /> Class STEM Insight:
                      </span>
                      <p className="line-clamp-2 leading-relaxed">{art.studentRelevance}</p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {art.tags.slice(0, 3).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer of Card: YouTube link & Like button */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                  {art.youtubeQuery ? (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(art.youtubeQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1.5"
                    >
                      <PlaySquare className="w-3.5 h-3.5" />
                      <span>Watch Lesson</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-stone-400 truncate">{art.source}</span>
                  )}

                  <button
                    onClick={(e) => handleLike(art.id, e)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition ${
                      likedArticles[art.id]
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{art.likes || 0}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Daily Interactive STEM Trivia Challenge */}
          {trivia && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-6 border border-amber-500/30 dark:border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-['Outfit']">
                      Daily Tech Concept Challenge
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Test your understanding of today’s technology breakthroughs
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full">
                  +10 XP
                </span>
              </div>

              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {trivia.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trivia.options.map((opt: string, idx: number) => {
                  const hasAnswered = triviaAnswer !== null;
                  const isChosen = triviaAnswer === idx;
                  const isCorrect = idx === trivia.correctIndex;

                  let btnStyle = 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-amber-400';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold';
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-200 line-through';
                    } else {
                      btnStyle = 'opacity-40 bg-stone-50 dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-700';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => {
                        setTriviaAnswer(idx);
                        if (isCorrect) {
                          addXP(10, 'Solved daily tech trivia');
                        }
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {triviaAnswer !== null && (
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
                  <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                    Scientific Explanation:
                  </span>
                  <p>{trivia.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
