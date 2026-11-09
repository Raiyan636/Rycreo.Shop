import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit, FileText, Check, X, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StaticPage } from '../../types/store';
import { INITIAL_STATIC_PAGES } from '../../data/initialData';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';

export const StaticPageManager: React.FC = () => {
  const { 
    staticPages, 
    addStaticPage, 
    updateStaticPage, 
    deleteStaticPage,
    syncToCloudNow 
  } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const applyFormatting = (tagOpen: string, tagClose: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setContent(newValue);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 50);
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setActive(true);
    setEditingPage(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (page: StaticPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setActive(page.active !== false);
    setIsFormOpen(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Please enter both page title and content!", "error");
      return;
    }

    const generatedSlug = slug.trim() 
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') 
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingPage) {
      await updateStaticPage({
        ...editingPage,
        title: title.trim(),
        slug: generatedSlug,
        content: content.trim(),
        active
      });
      showToast(`Updated page "${title.trim()}" successfully!`, 'success');
    } else {
      await addStaticPage({
        title: title.trim(),
        slug: generatedSlug,
        content: content.trim(),
        active,
        order: staticPages.length + 1
      });
      showToast(`Created page "${title.trim()}" successfully! Visible in store menu.`, 'success');
    }

    resetForm();

    // Trigger instant cloud sync
    try {
      await syncToCloudNow();
    } catch (err) {
      console.warn("Background cloud sync notice:", err);
    }
  };

  const confirmDeletePage = async () => {
    if (pageToDelete) {
      const target = pageToDelete;
      setPageToDelete(null);
      await deleteStaticPage(target.id);
      showToast(`Deleted page "${target.title}"!`, 'success');
      try {
        await syncToCloudNow();
      } catch {}
    }
  };

  const handleRestoreDefaults = async () => {
    const existingSlugs = new Set(staticPages.map(p => p.slug));
    let restoredCount = 0;

    INITIAL_STATIC_PAGES.forEach(core => {
      if (!existingSlugs.has(core.slug)) {
        addStaticPage({
          title: core.title,
          slug: core.slug,
          content: core.content,
          active: true,
          order: core.order
        });
        restoredCount++;
      }
    });

    if (restoredCount > 0) {
      showToast(`Restored ${restoredCount} core policy pages!`, 'success');
      try {
        await syncToCloudNow();
      } catch {}
    } else {
      showToast("All 6 standard policy pages are already active in your store!", "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#38BDF8]" />
            <span>Store Policy & Informational Pages</span>
          </h3>
          <p className="text-xs text-slate-400">
            Edit About Us, Privacy Policy, Shipping, and custom pages. All active pages instantly display in the Customer Menu Drawer!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
            title="Restore any missing core policies (About Us, Privacy Policy, Terms, etc.)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restore Core Policies</span>
          </button>

          {!isFormOpen && (
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-black text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Page</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Drawer / Box */}
      {isFormOpen && (
        <div ref={formRef}>
          <form onSubmit={handleSave} className="bg-slate-800/95 border-2 border-[#38BDF8]/60 p-5 sm:p-6 rounded-2xl space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
                <h4 className="text-sm font-extrabold text-[#38BDF8] uppercase tracking-wider">
                  {editingPage ? `Editing Page: "${editingPage.title}"` : 'Create New Store Page'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-600 shadow-sm"
                  title="Close Form"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Page Title *</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingPage) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. About Us, Privacy Policy, Size Guide"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">URL Identifier Slug</label>
                <input 
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. about-us, privacy-policy"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Page Content / Guidelines *</label>
                  <span className="text-[10px] text-slate-400">Supports plain text & rich HTML formatting</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-t-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Formatting:</span>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<strong>', '</strong>')}
                    className="px-2.5 py-1 rounded bg-slate-800 text-white font-extrabold text-xs hover:bg-slate-700 cursor-pointer"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<u>', '</u>')}
                    className="px-2.5 py-1 rounded bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 cursor-pointer underline"
                    title="Underline"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<span style="color: #38BDF8; font-weight: bold;">', '</span>')}
                    className="px-2 py-1 rounded bg-sky-600/30 text-sky-300 font-bold text-xs hover:bg-sky-600/40 cursor-pointer border border-sky-500/20"
                    title="Sky Blue"
                  >
                    Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<span style="color: #10B981; font-weight: bold;">', '</span>')}
                    className="px-2 py-1 rounded bg-emerald-600/30 text-emerald-300 font-bold text-xs hover:bg-emerald-600/40 cursor-pointer border border-emerald-500/20"
                    title="Emerald Green"
                  >
                    Green
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('<span style="color: #F59E0B; font-weight: bold;">', '</span>')}
                    className="px-2 py-1 rounded bg-amber-600/30 text-amber-300 font-bold text-xs hover:bg-amber-600/40 cursor-pointer border border-amber-500/20"
                    title="Amber Gold"
                  >
                    Gold
                  </button>
                </div>

                <textarea 
                  ref={textareaRef}
                  required
                  rows={9}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter full text content for this page. Break lines with Enter..."
                  className="w-full bg-slate-900 border-x border-b border-slate-700 rounded-b-xl p-3 text-xs text-white outline-none focus:border-[#38BDF8] font-sans leading-relaxed"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center">
                <input 
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#38BDF8]"
                />
                <span className="text-xs font-bold text-slate-200">
                  Active (Display in Store Menu Drawer)
                </span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-black shadow-lg shadow-sky-500/20 cursor-pointer hover:opacity-95"
                >
                  {editingPage ? 'Save Changes' : 'Create & Publish Page'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {staticPages.map(page => {
          return (
            <div 
              key={page.id}
              className={`bg-slate-800 rounded-2xl border p-4 space-y-3 transition-all ${
                editingPage?.id === page.id 
                  ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 bg-slate-800/90' 
                  : page.active !== false 
                    ? 'border-slate-700' 
                    : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-white text-sm truncate">{page.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">/{page.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(page)}
                    className="p-1.5 rounded-lg bg-sky-500/20 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-slate-950 transition-colors cursor-pointer border border-[#38BDF8]/30"
                    title="Edit Page Content"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setPageToDelete({ id: page.id, title: page.title })}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer border border-rose-500/30"
                    title="Delete Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80">
                <p className="text-xs text-slate-300 line-clamp-3 font-normal leading-relaxed">
                  {page.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  page.active !== false 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {page.active !== false ? '● Visible in Menu' : '○ Hidden'}
                </span>

                <button
                  onClick={() => handleStartEdit(page)}
                  className="text-xs font-extrabold text-[#38BDF8] hover:underline cursor-pointer"
                >
                  Edit Page →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pageToDelete}
        title="Delete Static Page?"
        message={`Are you sure you want to permanently delete page "${pageToDelete?.title}"?`}
        confirmLabel="Yes, Delete Page"
        onConfirm={confirmDeletePage}
        onCancel={() => setPageToDelete(null)}
      />
    </div>
  );
};
