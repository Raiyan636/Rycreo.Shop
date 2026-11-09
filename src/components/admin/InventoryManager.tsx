import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, Search, Filter, Plus, Minus, Layers, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { getProductStockStatus } from '../../utils/stockHelper';

const StockInputCell: React.FC<{
  initialValue: number;
  onSave: (val: number) => void;
  className?: string;
}> = ({ initialValue, onSave, className }) => {
  const [val, setVal] = useState<string>(String(initialValue));

  useEffect(() => {
    setVal(String(initialValue));
  }, [initialValue]);

  return (
    <input 
      type="number"
      min={0}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        if (e.target.value !== '') {
          const num = parseInt(e.target.value, 10);
          if (!isNaN(num) && num >= 0) {
            onSave(num);
          }
        }
      }}
      onBlur={() => {
        if (val === '' || isNaN(parseInt(val, 10))) {
          setVal(String(initialValue));
        } else {
          onSave(Math.max(0, parseInt(val, 10)));
        }
      }}
      className={className || "w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-xs font-bold text-white focus:border-[#38BDF8] outline-none"}
    />
  );
};

export const InventoryManager: React.FC = () => {
  const { 
    products, 
    updateProduct, 
    updateProductStock,
    inventorySearch: search,
    setInventorySearch: setSearch
  } = useStore();

  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Quick stats using unified getProductStockStatus
  const totalStockCount = products.reduce((sum, p) => {
    return sum + getProductStockStatus(p).totalStock;
  }, 0);

  const lowStockProducts = products.filter(p => {
    const st = getProductStockStatus(p);
    return st.isLowStock || st.hasLowStockVariant;
  });
  const outOfStockProducts = products.filter(p => {
    const st = getProductStockStatus(p);
    return st.isOutOfStock || st.hasOutOfStockVariant;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const handleStockChange = (productId: string, delta: number, variationId?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (variationId && prod.variations) {
      const v = prod.variations.find(x => x.id === variationId);
      if (v) {
        const newVStock = Math.max(0, v.stock + delta);
        updateProductStock(productId, newVStock, variationId);
      }
    } else {
      const currentStock = getProductStockStatus(prod).totalStock;
      const newStock = Math.max(0, currentStock + delta);
      updateProductStock(productId, newStock);
    }
  };

  const handleDirectStockInput = (productId: string, val: number, variationId?: string) => {
    const finalVal = Math.max(0, isNaN(val) ? 0 : val);
    updateProductStock(productId, finalVal, variationId);
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Units In Stock</span>
            <Package className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <p className="text-2xl font-black text-white font-['Outfit']">{totalStockCount} pcs</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
            <span>Low Stock Alert (&lt;= 5 pcs)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-['Outfit']">{lowStockProducts.length} items</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold">
            <span>Out of Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 font-['Outfit']">{outOfStockProducts.length} items</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">WooCommerce Stock & Inventory Controller</h3>
          <p className="text-xs text-slate-400">Manage master inventory and per-variation stock quantities with inline controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or SKU..."
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:border-[#38BDF8]"
            />
          </div>


        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Variations</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Total Quantity</th>
                <th className="p-3.5 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredProducts.map(prod => {
                const stockStatus = getProductStockStatus(prod);
                const isOutOfStock = stockStatus.isOutOfStock;
                const isLowStock = stockStatus.isLowStock;
                const totalStock = stockStatus.totalStock;
                const hasVariations = prod.variations && prod.variations.length > 0;
                const isExpanded = expandedProduct === prod.id;

                return (
                  <React.Fragment key={prod.id}>
                    <tr className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img 
                          src={prod.images[0]} 
                          alt="" 
                          className="w-10 h-12 object-cover rounded-lg bg-slate-900 border border-slate-700 shrink-0" 
                        />
                        <div>
                          <p className="font-bold text-white text-xs leading-snug">{prod.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku || prod.id}</p>
                        </div>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-300">{prod.category}</td>

                      <td className="p-3.5">
                        {hasVariations ? (
                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : prod.id)}
                            className={`px-2.5 py-1 rounded-lg bg-slate-900 border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                              prod.variations?.some(v => (v.stock || 0) === 0) 
                                ? 'text-rose-400 border-rose-500/40 hover:bg-rose-950/20 animate-pulse' 
                                : 'text-[#38BDF8] border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            <span>{prod.variations?.length} Variations {isExpanded ? '▲' : '▼'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Standard Product</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isOutOfStock ? 'bg-rose-500/20 text-rose-400' :
                          isLowStock ? 'bg-amber-500/20 text-amber-400' :
                          stockStatus.hasOutOfStockVariant ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          stockStatus.hasLowStockVariant ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : 
                           isLowStock ? 'Low Stock' : 
                           stockStatus.hasOutOfStockVariant ? `${stockStatus.outOfStockVariantsCount || 1} Variant Finished` :
                           stockStatus.hasLowStockVariant ? `${stockStatus.lowStockVariantsCount || 1} Variant Low` :
                           'In Stock'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            min={0}
                            value={totalStock}
                            onChange={(e) => handleDirectStockInput(prod.id, parseInt(e.target.value) || 0)}
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-xs font-bold text-white"
                          />
                          <span className="text-[10px] text-slate-400">pcs</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStockChange(prod.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center justify-center font-bold"
                            title="Decrease Stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockChange(prod.id, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center justify-center font-bold"
                            title="Increase Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Variations Sub-Table if expanded */}
                    {hasVariations && isExpanded && (
                      <tr className="bg-slate-900/90">
                        <td colSpan={6} className="p-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
                                <span>Product Variations & Variant Stock Breakdown for: <span className="text-white">{prod.title}</span></span>
                              </p>
                              <span className="text-[10px] text-slate-400">Showing picture, variation combination, and stock status</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {prod.variations?.map(v => {
                                const comboText = Object.entries(v.combination).map(([k, val]) => `${k}: ${val}`).join(' / ');
                                const vIsOut = (v.stock || 0) === 0 || v.inStock === false;
                                const vIsLow = (v.stock || 0) > 0 && (v.stock || 0) <= 5;
                                const varImg = v.image || prod.images[0];

                                return (
                                  <div
                                    key={v.id}
                                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                      vIsOut ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20' :
                                      vIsLow ? 'bg-amber-950/20 border-amber-500/40' :
                                      'bg-slate-900 border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <img 
                                        src={varImg} 
                                        alt="" 
                                        className="w-11 h-12 object-cover rounded-lg bg-slate-900 border border-slate-700 shrink-0" 
                                      />
                                      <div className="min-w-0">
                                        <p className="font-bold text-white text-xs truncate" title={comboText}>{comboText}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] text-slate-400 font-mono">৳{v.salePrice || v.price}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                                            vIsOut ? 'bg-rose-500/20 text-rose-400' :
                                            vIsLow ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                          }`}>
                                            {vIsOut ? 'Out of Stock' : vIsLow ? 'Low Stock' : `${v.stock} pcs`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        onClick={() => handleStockChange(prod.id, -1, v.id)}
                                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                                        title="Decrease"
                                      >
                                        -
                                      </button>
                                      <input 
                                        type="number"
                                        min={0}
                                        value={v.stock}
                                        onChange={(e) => handleDirectStockInput(prod.id, parseInt(e.target.value) || 0, v.id)}
                                        className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-center text-xs font-bold text-white"
                                      />
                                      <button
                                        onClick={() => handleStockChange(prod.id, 1, v.id)}
                                        className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                                        title="Increase"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
