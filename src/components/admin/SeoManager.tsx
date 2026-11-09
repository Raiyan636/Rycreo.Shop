import React, { useState } from 'react';
import { Download, Globe, Search, FileText, CheckCircle, Sparkles, Smartphone, Monitor, Share2, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateRobotsTxt, generateSitemapXml } from '../../utils/seo';

export const SeoManager: React.FC = () => {
  const { storeConfig, updateStoreConfig, products, syncToCloudNow } = useStore();

  const RECOMMENDED_TITLE = "RycreoShop | Trusted Multi-Category E-Commerce Store in Bangladesh";
  const RECOMMENDED_DESC = "Shop at RycreoShop - Bangladesh's most trusted online shopping destination. Discover premium smart gadgets, trending fashion, fine jewelry, lifestyle accessories, and daily essentials with fast express nationwide delivery and cash on delivery.";
  const RECOMMENDED_KEYWORDS = "RycreoShop, Rycreo, trusted online shopping Bangladesh, smart gadgets BD, wireless earbuds, smart watches, premium audio, mens fashion, ladies fashion, jewelry BD, gold plated jewelry, lifestyle accessories, home essentials, cash on delivery Bangladesh, fast delivery Dhaka, Chittagong, Sylhet, best online shop BD, multi product e-commerce";

  const [metaTitle, setMetaTitle] = useState(storeConfig.metaTitle || RECOMMENDED_TITLE);
  const [metaDescription, setMetaDescription] = useState(storeConfig.metaDescription || RECOMMENDED_DESC);
  const [metaKeywords, setMetaKeywords] = useState(storeConfig.metaKeywords || RECOMMENDED_KEYWORDS);
  const [savedMsg, setSavedMsg] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const keywordCategories = [
    {
      label: "Smart Gadgets & Electronics",
      tags: ["smart gadgets BD", "wireless earbuds", "smart watches", "bluetooth speakers", "fast chargers", "mobile accessories"]
    },
    {
      label: "Fashion & Luxury Apparel",
      tags: ["mens fashion Bangladesh", "drop shoulder t-shirts", "premium polo shirts", "chino pants", "festive kurtas", "winter hoodies"]
    },
    {
      label: "Fine Jewelry & Ornaments",
      tags: ["jewelry BD", "gold plated jewelry", "ladies necklace", "fashion earrings", "luxury rings", "bridal jewelry BD"]
    },
    {
      label: "Trust & BD Delivery",
      tags: ["cash on delivery Bangladesh", "fast delivery Dhaka", "inside Dhaka 60", "nationwide delivery 120", "trusted online store BD"]
    }
  ];

  const handleApplyPreset = () => {
    setMetaTitle(RECOMMENDED_TITLE);
    setMetaDescription(RECOMMENDED_DESC);
    setMetaKeywords(RECOMMENDED_KEYWORDS);
  };

  const handleAddKeyword = (tag: string) => {
    const currentList = metaKeywords.split(',').map(s => s.trim().toLowerCase());
    if (!currentList.includes(tag.toLowerCase())) {
      const updated = metaKeywords ? `${metaKeywords}, ${tag}` : tag;
      setMetaKeywords(updated);
    }
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreConfig({
      metaTitle,
      metaDescription,
      metaKeywords
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);

    try {
      await syncToCloudNow();
    } catch {}
  };

  const handleDownloadRobots = () => {
    const content = generateRobotsTxt(storeConfig.storeName || 'RycreoShop');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSitemap = () => {
    const content = generateSitemapXml(storeConfig.storeName || 'RycreoShop', products);
    const blob = new Blob([content], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#38BDF8]" />
            <span>Search Engine Optimization & Google Ranking (SEO)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure RycreoShop meta tags for Gadgets, Fashion, Jewelry, and Multi-Product rankings across Google and social media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>SEO Settings Saved & Synced!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleApplyPreset}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Load optimized RycreoShop multi-category defaults"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Apply Recommended SEO Preset</span>
          </button>
        </div>
      </div>

      {/* Main SEO Form */}
      <form onSubmit={handleSaveSeo} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200">
              Global Title Tag (&lt;title&gt;) *
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {metaTitle.length} characters (Optimal: 50-65)
            </span>
          </div>
          <input 
            type="text"
            required
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-[#38BDF8]"
            placeholder="e.g. RycreoShop | Trusted Multi-Category E-Commerce Store in Bangladesh"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200">
              Meta Description (&lt;meta name="description"&gt;) *
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {metaDescription.length} characters (Optimal: 140-160)
            </span>
          </div>
          <textarea 
            rows={3}
            required
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-[#38BDF8] leading-relaxed"
            placeholder="Comprehensive description covering smart gadgets, apparel, jewelry, and express shipping..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200">
              Target SEO Keywords (Comma separated) *
            </label>
            <span className="text-[10px] text-slate-400">
              Keywords index your store for specific search queries
            </span>
          </div>
          <textarea 
            rows={3}
            required
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-[#38BDF8] font-mono leading-relaxed"
            placeholder="RycreoShop, smart gadgets BD, wireless earbuds, fashion apparel, jewelry BD..."
          />
        </div>

        {/* Quick Keyword Injector Categories */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-3">
          <p className="text-[11px] uppercase font-bold text-[#38BDF8] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> 1-Click Keywords Injector (Click to add to your list)
          </p>

          <div className="space-y-2">
            {keywordCategories.map((cat, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 mr-1 min-w-[170px]">{cat.label}:</span>
                {cat.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddKeyword(tag)}
                    className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-[#38BDF8]/20 hover:text-[#38BDF8] text-slate-300 border border-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 hover:opacity-95 transition-all cursor-pointer"
          >
            Save & Update Global SEO Settings
          </button>
        </div>
      </form>

      {/* Google SERP Preview Card */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Live Google Search Result Preview
          </h4>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                previewDevice === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              <Monitor className="w-3 h-3" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${
                previewDevice === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-3 h-3" /> Mobile
            </button>
          </div>
        </div>

        <div className={`bg-white p-4 sm:p-5 rounded-2xl text-slate-900 font-sans shadow-inner ${
          previewDevice === 'mobile' ? 'max-w-md mx-auto border border-slate-200' : ''
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center text-[10px] font-black text-[#38BDF8]">
              R
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700 leading-none">RycreoShop Bangladesh</p>
              <p className="text-[10px] text-slate-400 leading-none truncate">https://rycreoshop.com</p>
            </div>
          </div>

          <h5 className="text-base sm:text-lg font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
            {metaTitle || 'RycreoShop | Trusted Multi-Category E-Commerce Store'}
          </h5>

          <p className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
            {metaDescription || 'Discover premium smart gadgets, trending fashion, fine jewelry, and everyday essentials on RycreoShop.'}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px] text-emerald-700 font-medium">
            <span>✓ 100% Verified Authentic</span>
            <span>✓ Cash on Delivery</span>
            <span>✓ Express Shipping</span>
          </div>
        </div>
      </div>

      {/* Auto-Generated Search Engine Files */}
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
        <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Search Engine Crawler & Sitemap Files
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
            <h5 className="font-bold text-white text-xs">robots.txt (Web Crawler Directives)</h5>
            <p className="text-[11px] text-slate-400">Guides Googlebot and Bingbot to index your public store and products.</p>
            <button
              type="button"
              onClick={handleDownloadRobots}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8] hover:text-slate-900 transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download robots.txt</span>
            </button>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
            <h5 className="font-bold text-white text-xs">sitemap.xml ({products.length} Products Included)</h5>
            <p className="text-[11px] text-slate-400">Structured XML map submitting all active product URLs to Google Search Console.</p>
            <button
              type="button"
              onClick={handleDownloadSitemap}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8] hover:text-slate-900 transition-colors font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
