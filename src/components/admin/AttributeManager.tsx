import React, { useState } from 'react';
import { Plus, Trash2, Edit, Tag, X, Check, Sliders, CheckSquare, Square } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductAttribute } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';

export const AttributeManager: React.FC = () => {
  const { attributes, categories, addAttribute, updateAttribute, deleteAttribute } = useStore();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<ProductAttribute | null>(null);
  const [attrToDelete, setAttrToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductAttribute['type']>('button');
  const [values, setValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState('');
  const [isVariation, setIsVariation] = useState(true);
  const [assignedCategories, setAssignedCategories] = useState<string[]>(['all']);

  const resetForm = () => {
    setName('');
    setType('button');
    setValues([]);
    setValueInput('');
    setIsVariation(true);
    setAssignedCategories(['all']);
    setEditingAttr(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (attr: ProductAttribute) => {
    setEditingAttr(attr);
    setName(attr.name);
    setType(attr.type);
    setValues(attr.values || []);
    setIsVariation(attr.isVariation);
    setAssignedCategories(attr.assignedCategories || ['all']);
    setIsFormOpen(true);
  };

  const handleAddValue = () => {
    if (valueInput.trim() && !values.includes(valueInput.trim())) {
      setValues([...values, valueInput.trim()]);
      setValueInput('');
    }
  };

  const handleRemoveValue = (valToRemove: string) => {
    setValues(values.filter(v => v !== valToRemove));
  };

  const toggleCategory = (catName: string) => {
    if (catName === 'all') {
      setAssignedCategories(['all']);
      return;
    }
    const current = assignedCategories.filter(c => c !== 'all');
    if (current.includes(catName)) {
      const updated = current.filter(c => c !== catName);
      setAssignedCategories(updated.length === 0 ? ['all'] : updated);
    } else {
      setAssignedCategories([...current, catName]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Please enter an Attribute Name (e.g., RAM, Material, Processor, Size)!", "error");
      return;
    }

    if (values.length === 0) {
      showToast("Please add at least one Option Value for this attribute!", "error");
      return;
    }

    if (editingAttr) {
      updateAttribute({
        ...editingAttr,
        name: name.trim(),
        type,
        values,
        isVariation,
        assignedCategories
      });
      showToast(`Updated attribute "${name.trim()}"!`, 'success');
    } else {
      addAttribute({
        name: name.trim(),
        type,
        values,
        isVariation,
        assignedCategories
      });
      showToast(`Created new attribute "${name.trim()}"!`, 'success');
    }

    resetForm();
  };

  const confirmDeleteAttribute = () => {
    if (attrToDelete) {
      deleteAttribute(attrToDelete.id);
      showToast(`Deleted attribute "${attrToDelete.name}"!`, 'success');
      setAttrToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Manage Product Attributes & Custom Fields</h3>
          <p className="text-xs text-slate-400">Create custom product fields (e.g., RAM, Material, Processor, Storage, Fabric, Sizes) and link them to specific product categories dynamically.</p>
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
            <span>Create New Attribute</span>
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
              {editingAttr ? 'Edit Product Attribute' : 'Create Custom Product Attribute'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Attribute Name *</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Color, Size, Storage, RAM, Processor, Material"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Display Control Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="button">Selection Buttons / Pills (Sizes, RAM, Storage)</option>
                <option value="color">Color Swatches (Hex codes or color names)</option>
                <option value="select">Dropdown Select Menu</option>
                <option value="text">Plain Text Specification (Processor, Fabric)</option>
              </select>
            </div>
          </div>

          {/* Option Values List */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Attribute Values / Options (e.g., 8GB, 16GB, 100% Combed Cotton, M, L, XL) *
            </label>

            <div className="flex gap-2">
              <input 
                type="text"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="Type option and press Add or Enter..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#38BDF8] rounded-xl text-xs font-bold cursor-pointer"
              >
                + Add Value
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {values.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No values added yet.</span>
              ) : (
                values.map(val => (
                  <span 
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium"
                  >
                    <span>{val}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(val)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Category Assignment Multi-checkbox */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Link Attribute to Categories (Dynamic Category Fields):
            </label>
            <p className="text-[11px] text-slate-400">
              When adding or editing a product, this field will only appear when one of these assigned categories is chosen.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => toggleCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  assignedCategories.includes('all')
                    ? 'bg-[#38BDF8] text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Categories (Universal)
              </button>

              {categories.map(c => {
                const isChecked = assignedCategories.includes(c.name);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isChecked
                        ? 'bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variations Flag & Actions */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={isVariation}
                onChange={(e) => setIsVariation(e.target.checked)}
                className="w-4 h-4 rounded accent-[#38BDF8]"
              />
              <span className="text-xs font-bold text-slate-300">Used for Product Variations (Cart / Sizing / Stock combinations)</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
              >
                {editingAttr ? 'Update Attribute' : 'Save Attribute'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Attributes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map(attr => {
          return (
            <div key={attr.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#38BDF8]" />
                    <span>{attr.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full font-mono">
                      {attr.type}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Categories: {attr.assignedCategories.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(attr)}
                    className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Attribute"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAttrToDelete({ id: attr.id, name: attr.name })}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="Delete Attribute"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Values */}
              <div className="pt-2 border-t border-slate-700/80">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Options ({attr.values.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {attr.values.map(val => (
                    <span key={val} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!attrToDelete}
        title="Delete Product Attribute?"
        message={`Are you sure you want to permanently delete custom attribute "${attrToDelete?.name}"? It will be unlinked from product category forms.`}
        confirmLabel="Yes, Delete Attribute"
        onConfirm={confirmDeleteAttribute}
        onCancel={() => setAttrToDelete(null)}
      />
    </div>
  );
};
