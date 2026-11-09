import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit, Upload, Eye, EyeOff, X, ArrowUp, ArrowDown, Sparkles, Tag, Check, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { QuickCategoryShortcut } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageToStorage } from '../../storageService';

export const QuickCategoryManager: React.FC = () => {
  const { quickCategories, categories, addQuickCategory, updateQuickCategory, deleteQuickCategory, reorderQuickCategories } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickCategoryShortcut | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; label: string } | null>(null);

  // Form State
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('✨');
  const [image, setImage] = useState('');
  const [tag, setTag] = useState('');
  const [targetCategory, setTargetCategory] = useState(categories[0]?.name || 'Clothing');
  const [colorGradient, setColorGradient] = useState('from-amber-500 to-amber-700');
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const colorPresets = [
    { label: 'Gold Amber', value: 'from-amber-500 to-amber-700' },
    { label: 'Electric Sky', value: 'from-sky-500 to-indigo-600' },
    { label: 'Slate Charcoal', value: 'from-slate-700 to-slate-900' },
    { label: 'Royal Blue', value: 'from-blue-600 to-indigo-700' },
    { label: 'Emerald Mint', value: 'from-emerald-600 to-teal-800' },
    { label: 'Purple Violet', value: 'from-purple-600 to-pink-600' },
    { label: 'Crimson Rose', value: 'from-rose-600 to-orange-600' },
  ];

  const resetForm = () => {
    setLabel('');
    setIcon('✨');
    setImage('');
    setTag('');
    setTargetCategory(categories[0]?.name || 'Clothing');
    setColorGradient('from-amber-500 to-amber-700');
    setActive(true);
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (item: QuickCategoryShortcut) => {
    setEditingItem(item);
    setLabel(item.label);
    setIcon(item.icon || '✨');
    setImage(item.image || '');
    setTag(item.tag || '');
    setTargetCategory(item.targetCategory);
    setColorGradient(item.colorGradient || 'from-amber-500 to-amber-700');
    setActive(item.active);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    try {
      const downloadUrl = await uploadImageToStorage(file, 'quick-categories');
      if (downloadUrl) {
        setImage(downloadUrl);
        showToast("Logo / Icon photo uploaded successfully!", "success");
      } else {
        const fallback = await compressImage(file, 400, 0.80);
        setImage(fallback);
        showToast("Logo / Icon photo processed successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to upload image. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      showToast("Please enter a Title / Label for this category shortcut!", "error");
      return;
    }

    if (editingItem) {
      updateQuickCategory({
        ...editingItem,
        name: targetCategory,
        label: label.trim(),
        icon: icon.trim() || undefined,
        image: image || undefined,
        tag: tag.trim() || undefined,
        targetCategory,
        colorGradient,
        active
      });
      showToast(`Updated shortcut "${label.trim()}" successfully!`, 'success');
    } else {
      addQuickCategory({
        name: targetCategory,
        label: label.trim(),
        icon: icon.trim() || undefined,
        image: image || undefined,
        tag: tag.trim() || undefined,
        targetCategory,
        colorGradient,
        active,
        order: quickCategories.length + 1
      });
      showToast(`Created shortcut "${label.trim()}" successfully!`, 'success');
    }

    resetForm();
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      deleteQuickCategory(itemToDelete.id);
      showToast(`Deleted shortcut "${itemToDelete.label}"!`, 'success');
      setItemToDelete(null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= quickCategories.length) return;

    const updated = [...quickCategories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    reorderQuickCategories(reordered);
    showToast("Reordered shortcuts!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Daraz-Style Banner Category Shortcuts</h3>
          <p className="text-xs text-slate-400">
            Manage the circular visual shortcuts under the hero banner. Add custom title, badges, logos from device gallery, or delete anytime.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#38BDF8] text-slate-900 font-extrabold text-xs flex items-center gap-2 hover:bg-sky-400 transition-colors shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shortcut</span>
          </button>
        )}
      </div>

      {/* Form Drawer (Shutter) */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          {/* Shutter Top Bar with Roll-Up Button */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{editingItem ? 'Edit Category Shortcut' : 'Create New Category Shortcut'}</span>
            </h4>

            {/* Form Close button */}
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-600"
              title="Close Form"
            >
              <span>✕ Close Form</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Shortcut Display Title *</label>
              <input 
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Festive Drops, Drop-Shoulder"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Store Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Badge Tag</label>
              <input 
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="HOT, 30% OFF"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8] font-bold"
              />
            </div>
          </div>

          {/* Image & Logo Upload from Device Gallery (No Link Option!) */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
              <span>Shortcut Logo / Photo (Direct Device Gallery Upload Only)</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Select any photo or logo directly from your device gallery. If no photo is selected, the icon/emoji will be displayed.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Optimizing photo...' : '📸 Upload Photo / Logo from Gallery'}</span>
              </button>

              {image ? (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#38BDF8] bg-slate-950 shadow-md flex items-center justify-center p-1">
                    <img src={image} alt="Uploaded logo" className="w-full h-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-xs"
                    title="Remove Photo"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Or use Emoji / Icon:</span>
                  <input 
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="✨, 👕, 👖, ⌚, 🎧"
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-lg text-white outline-none focus:border-[#38BDF8]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Gradient Preset */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Background Gradient Theme</label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setColorGradient(preset.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                    colorGradient === preset.value
                      ? 'border-[#38BDF8] text-white bg-slate-800 shadow-xs'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${preset.value}`} />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active status & Bottom Shutter Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded accent-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Active under Banner</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
              >
                {editingItem ? 'Update Shortcut' : 'Save Shortcut'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Shortcuts Grid / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickCategories.map((item, index) => {
          return (
            <div 
              key={item.id}
              className={`bg-slate-800 rounded-2xl p-4 border transition-all space-y-3 ${
                item.active ? 'border-slate-700' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-600 bg-slate-900 shrink-0 flex items-center justify-center p-1">
                      <img src={item.image} alt={item.label} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.colorGradient || 'from-slate-700 to-slate-900'} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                      {item.icon || '✨'}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.tag && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          {item.tag}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: <span className="text-[#38BDF8] font-bold">{item.targetCategory}</span>
                    </p>
                  </div>
                </div>

                {/* Status Toggle & Reorder buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === quickCategories.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => updateQuickCategory({ ...item, active: !item.active })}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      item.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500'
                    }`}
                    title={item.active ? 'Active (Click to Hide)' : 'Inactive (Click to Show)'}
                  >
                    {item.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Shortcut"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setItemToDelete({ id: item.id, label: item.label })}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="Delete Shortcut"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Delete Category Shortcut?"
        message={`Are you sure you want to delete "${itemToDelete?.label}" from the banner shortcuts? It will be immediately removed from the customer storefront.`}
        confirmLabel="Yes, Delete Shortcut"
        onConfirm={confirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
