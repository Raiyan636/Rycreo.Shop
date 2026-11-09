import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Check, Upload, Layers, Eye, EyeOff, Tag, Image as ImageIcon, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage } from '../../storageService';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, moveCategory } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [imageUrl, setImageUrl] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcatInput, setSubcatInput] = useState('');
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageDrawerOpen, setIsImageDrawerOpen] = useState(false);

  const presetCategoryImages = [
    { name: 'Apparel & Clothing', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
    { name: 'Festive & Traditional', url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600' },
    { name: 'Pants & Chinos', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600' },
    { name: 'Polo T-Shirts', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600' },
    { name: 'Hoodies & Winter', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600' },
    { name: 'Watches & Accessories', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' }
  ];

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setName('');
    setSlug('');
    setIcon('Tag');
    setImageUrl('');
    setSubcategories([]);
    setSubcatInput('');
    setActive(true);
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || 'Tag');
    setImageUrl(cat.image || '');
    setSubcategories(cat.subcategories || []);
    setActive(cat.active);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    try {
      const downloadUrl = await uploadImageToStorage(file, 'categories');
      if (downloadUrl) {
        setImageUrl(downloadUrl);
        showToast("Category image uploaded successfully!", "success");
      } else {
        const fallback = await compressImage(file, 800, 0.80);
        setImageUrl(fallback);
        showToast("Category image processed successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to upload image", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSubcat = () => {
    if (subcatInput.trim() && !subcategories.includes(subcatInput.trim())) {
      setSubcategories([...subcategories, subcatInput.trim()]);
      setSubcatInput('');
    }
  };

  const handleRemoveSubcat = (subToRemove: string) => {
    setSubcategories(subcategories.filter(s => s !== subToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter a category name!", "error");
      return;
    }

    const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        slug: generatedSlug,
        icon,
        image: imageUrl.trim() || undefined,
        subcategories,
        active
      });
      showToast(`Updated category "${name.trim()}" successfully!`, 'success');
    } else {
      addCategory({
        name: name.trim(),
        slug: generatedSlug,
        icon,
        image: imageUrl.trim() || undefined,
        subcategories,
        active,
        order: categories.length + 1
      });
      showToast(`Created category "${name.trim()}" successfully!`, 'success');
    }

    resetForm();
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      showToast(`Deleted category "${categoryToDelete.name}"!`, 'success');
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Category & Subcategory Management</h3>
          <p className="text-xs text-slate-400">Manage store taxonomy, parent categories, icons, and nested subcategories.</p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {/* Form Drawer / Box */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-600 shadow-sm"
                title="Close Form / বন্ধ করুন"
              >
                <span>✕ Close</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Category Name *</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                  }
                }}
                placeholder="Clothing, Watches, Electronics, Shoes"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">URL Slug</label>
              <input 
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="clothing, watches"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Category Image (Direct Device Gallery Upload Only)
              </label>
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Optimizing photo...' : '📸 গ্যালারি থেকে ক্যাটাগরি ছবি সিলেক্ট করুন'}</span>
                </button>
                {imageUrl && (
                  <div className="flex items-center gap-2">
                    <img src={imageUrl} alt="Category preview" className="w-10 h-10 rounded-lg object-cover border border-[#38BDF8]" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      ছবি মুছুন
                    </button>
                  </div>
                )}
              </div>

              {/* Automatic Category Image Drawer */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsImageDrawerOpen(!isImageDrawerOpen)}
                  className="text-xs text-[#38BDF8] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isImageDrawerOpen ? '🔼 Close Automatic Category Image Drawer' : '🖼️ Open Automatic Category Image Drawer (Preset Library)'}</span>
                </button>

                {isImageDrawerOpen && (
                  <div className="mt-3 bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2 animate-fade-in">
                    <p className="text-[11px] text-slate-400 font-medium">Select a professional preset category image instantly:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {presetCategoryImages.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setImageUrl(preset.url);
                            setIsImageDrawerOpen(false);
                            showToast(`Assigned preset image for ${preset.name}`, 'success');
                          }}
                          className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-[#38BDF8] cursor-pointer transition-all aspect-video bg-slate-950"
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subcategories tag management */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Nested Subcategories
            </label>

            <div className="flex gap-2">
              <input 
                type="text"
                value={subcatInput}
                onChange={(e) => setSubcatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcat();
                  }
                }}
                placeholder="Type subcategory and press Add or Enter..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
              <button
                type="button"
                onClick={handleAddSubcat}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#38BDF8] rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Subcategory
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {subcategories.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No subcategories created yet.</span>
              ) : (
                subcategories.map(sub => (
                  <span 
                    key={sub}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcat(sub)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded accent-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Category Active in Storefront</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors cursor-pointer border border-slate-600"
              >
                ✕ Close Form / ফর্ম বন্ধ করুন
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
              >
                {editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-16">
        {categories.map(cat => {
          return (
            <div 
              key={cat.id}
              className={`bg-slate-800 rounded-2xl border p-4 space-y-3 transition-all ${
                cat.active ? 'border-slate-700' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700" 
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[#38BDF8]">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">/{cat.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex flex-col">
                    <button onClick={() => moveCategory(cat.id, 'up')} className="p-0.5 hover:text-[#38BDF8] cursor-pointer" title="Move Up"><ChevronUp className="w-3 h-3" /></button>
                    <button onClick={() => moveCategory(cat.id, 'down')} className="p-0.5 hover:text-[#38BDF8] cursor-pointer" title="Move Down"><ChevronDown className="w-3 h-3" /></button>
                  </div>

                  <button
                    onClick={() => updateCategory({ ...cat, active: !cat.active })}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      cat.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
                    }`}
                    title={cat.active ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                  >
                    {cat.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCategoryToDelete({ id: cat.id, name: cat.name })}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories pills */}
              <div className="pt-2 border-t border-slate-700/80">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                  Subcategories ({cat.subcategories?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.subcategories && cat.subcategories.length > 0 ? (
                    cat.subcategories.map(sub => (
                      <span key={sub} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">None</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Category?"
        message={`Are you sure you want to permanently delete category "${categoryToDelete?.name}"? Products under this category will remain, but the category taxonomy will be removed.`}
        confirmLabel="Yes, Delete Category"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
