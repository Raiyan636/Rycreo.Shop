import React, { useState, useRef } from 'react';
import { Trash2, Edit, CheckCircle, XCircle, Star, MessageSquare, Image as ImageIcon, Filter, Plus, X, User, Upload, ZoomIn, ChevronUp, ChevronDown, Pin, ArrowUpDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Review } from '../../types/store';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { compressImage } from '../../utils/imageCompressor';
import { ReviewImageLightbox } from '../common/ReviewImageLightbox';

export const ReviewManager: React.FC = () => {
  const { 
    reviews, 
    products, 
    updateReviewStatus, 
    deleteReview, 
    deleteReviews, 
    editReview, 
    addReview,
    moveReview,
    updateReviewPosition,
    pinReviewToTop
  } = useStore();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; customerName: string } | null>(null);

  // Bulk Selection State for Reviews
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [isBulkDeleteReviewsOpen, setIsBulkDeleteReviewsOpen] = useState(false);

  // Review Image Lightbox State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openReviewLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Edit State
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  // New Review Form State
  const [newProductId, setNewProductId] = useState(products[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newVerified, setNewVerified] = useState(true);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const reviewFileRef = useRef<HTMLInputElement | null>(null);

  const handleReviewPhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImage(files[0], 600, 0.85);
      setNewImages(prev => [...prev, compressed]);
      showToast("Customer photo uploaded from gallery!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload photo", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const [sortBy, setSortBy] = useState<'priority' | 'latest' | 'rating'>('priority');

  const filteredReviews = (filter === 'all'
    ? [...reviews]
    : reviews.filter(r => r.status === filter)
  ).sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Default: 'priority' order (admin sequence that directly controls storefront order)
    const posA = a.position !== undefined ? a.position : (a.order !== undefined ? a.order : 9999);
    const posB = b.position !== undefined ? b.position : (b.order !== undefined ? b.order : 9999);
    if (posA !== posB) return posA - posB;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const handleStartEdit = (rev: Review) => {
    setEditingReview(rev);
    setEditComment(rev.comment);
    setEditRating(rev.rating);
    setIsAddingReview(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    editReview({
      ...editingReview,
      comment: editComment.trim(),
      rating: editRating
    });
    showToast(`Updated review for ${editingReview.customerName}!`, 'success');
    setEditingReview(null);
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newComment.trim()) {
      showToast("Please enter Customer Name and Review Comment!", "error");
      return;
    }

    const selectedProd = products.find(p => p.id === (newProductId || products[0]?.id));

    addReview({
      productId: newProductId || (products[0]?.id ?? 'prod-1'),
      productTitle: selectedProd ? selectedProd.title : 'Store Apparel',
      customerName: newCustomerName.trim(),
      customerPhone: newCustomerPhone.trim() || undefined,
      rating: newRating,
      comment: newComment.trim(),
      images: newImages.length > 0 ? newImages : undefined,
      status: 'approved',
      verifiedPurchase: newVerified
    });

    showToast(`Published customer review from ${newCustomerName.trim()}!`, 'success');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewComment('');
    setNewRating(5);
    setNewImages([]);
    setIsAddingReview(false);
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      deleteReview(reviewToDelete.id);
      showToast(`Deleted review from ${reviewToDelete.customerName}!`, 'success');
      setSelectedReviewIds(prev => prev.filter(id => id !== reviewToDelete.id));
      setReviewToDelete(null);
    }
  };

  const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const isAllFilteredReviewsSelected = filteredReviews.length > 0 && filteredReviews.every(r => selectedReviewIds.includes(r.id));

  const toggleSelectAllReviews = () => {
    if (isAllFilteredReviewsSelected) {
      const filteredIds = new Set(filteredReviews.map(r => r.id));
      setSelectedReviewIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const filteredIds = filteredReviews.map(r => r.id);
      setSelectedReviewIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const confirmBulkDeleteReviews = () => {
    if (selectedReviewIds.length === 0) return;
    const count = selectedReviewIds.length;
    const success = deleteReviews(selectedReviewIds);
    if (success) {
      showToast(`Successfully deleted ${count} selected review(s)!`, 'success');
      setSelectedReviewIds([]);
    }
    setIsBulkDeleteReviewsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Customer Reviews & Testimonial Moderation</h3>
          <p className="text-xs text-slate-400">Moderate product ratings, inspect high-res photos, and bulk-manage reviews.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {filteredReviews.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAllReviews}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                isAllFilteredReviewsSelected
                  ? 'bg-sky-500 text-slate-950 hover:bg-sky-400'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title="Select / Deselect all visible reviews"
            >
              <span>{isAllFilteredReviewsSelected ? '✓ Deselect All' : `Select All (${filteredReviews.length})`}</span>
            </button>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-slate-400 font-bold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            >
              <option value="priority" className="bg-slate-900 text-white">Priority Order (Custom Top-to-Bottom)</option>
              <option value="latest" className="bg-slate-900 text-white">Latest First (Newest Submitted)</option>
              <option value="rating" className="bg-slate-900 text-white">Highest Rating First</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
            {(['all', 'approved', 'pending', 'rejected'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  filter === st ? 'bg-[#38BDF8] text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st} ({reviews.filter(r => st === 'all' || r.status === st).length})
              </button>
            ))}
          </div>

          {!isAddingReview && !editingReview && (
            <button
              onClick={() => setIsAddingReview(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Review Form */}
      {isAddingReview && (
        <form onSubmit={handleCreateReview} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Authentic Customer Review / Testimonial
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingReview(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Product *</label>
              <select
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title} (৳{p.price})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Customer Full Name *</label>
              <input 
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Tanvir Hossain"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number (Optional)</label>
              <input 
                type="text"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Rating Stars (1-5)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-400 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">{newRating} Stars</span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-4">
              <input 
                type="checkbox"
                checked={newVerified}
                onChange={(e) => setNewVerified(e.target.checked)}
                className="w-4 h-4 rounded accent-[#10B981]"
              />
              <span className="text-xs font-bold text-emerald-400">Verified Buyer Badge</span>
            </label>
          </div>

          {/* Customer Photos Direct Upload (No Link Option) */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
              <span>Customer Attached Photos (Direct Gallery Upload Only)</span>
            </label>
            <input 
              ref={reviewFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleReviewPhotoUpload(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => reviewFileRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#38BDF8] border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'Uploading...' : '📸 Upload Photo From Gallery'}</span>
              </button>

              {newImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <button
                    type="button"
                    onClick={() => openReviewLightbox(newImages, idx)}
                    className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-400 cursor-zoom-in transition-all relative block"
                    title="Click to inspect photo in full-screen & zoom"
                  >
                    <img src={img} alt="review attachment" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[10px] cursor-pointer shadow-md"
                    title="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Customer Review Comment *</label>
            <textarea 
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Fabric quality is amazing! Stitching and fitting are 10/10. Received delivery inside Dhaka in 24 hours."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-700 pt-3">
            <button
              type="button"
              onClick={() => setIsAddingReview(false)}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
            >
              Publish Review
            </button>
          </div>
        </form>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <form onSubmit={handleSaveEdit} className="bg-slate-800/95 border border-slate-700 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h4 className="text-sm font-bold text-[#38BDF8] uppercase tracking-wider">
              Edit Customer Review ({editingReview.customerName})
            </h4>
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Rating Stars (1-5)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  className="p-1 text-amber-400 cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= editRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-400 ml-2">{editRating} Stars</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Customer Review Comment</label>
            <textarea 
              rows={3}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingReview(null)}
              className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Dynamic Bulk Action Bar for Selected Reviews */}
      {selectedReviewIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/90 to-slate-900 border-2 border-rose-500/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-fadeIn sticky top-4 z-20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md animate-pulse">
              {selectedReviewIds.length}
            </span>
            <div>
              <p className="text-sm font-extrabold text-white">
                {selectedReviewIds.length} {selectedReviewIds.length === 1 ? 'Review' : 'Reviews'} Selected
              </p>
              <p className="text-[11px] text-slate-300">
                Bulk remove selected customer reviews and testimonials in one click.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedReviewIds([])}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteReviewsOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/40 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedReviewIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No reviews found matching filter "{filter}".
          </div>
        ) : (
          filteredReviews.map(rev => {
            const product = products.find(p => p.id === rev.productId);
            const isSelected = selectedReviewIds.includes(rev.id);

            return (
              <div
                key={rev.id}
                className={`bg-slate-800 rounded-2xl p-4 sm:p-5 border space-y-3 transition-all ${
                  isSelected ? 'border-rose-500/80 bg-slate-800/90 ring-1 ring-rose-500/30' : 'border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox for selecting review */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleReviewSelection(rev.id)}
                      className="w-5 h-5 mt-1 rounded border-slate-600 bg-slate-900 text-[#38BDF8] focus:ring-cyan-400 cursor-pointer accent-[#38BDF8] shrink-0"
                      title="Select this review"
                    />

                    {/* Product Thumbnail */}
                    {product?.images?.[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.title} 
                        className="w-12 h-12 object-cover rounded-xl border border-slate-700 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-extrabold text-[#38BDF8] text-sm">
                        Product: {rev.productTitle || product?.title || 'Unknown Product'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-white text-xs">{rev.customerName}</span>
                        {rev.customerPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">({rev.customerPhone})</span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          rev.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {rev.status}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-[#38BDF8] font-bold flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Position & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Position / Up-Down Order Controls */}
                    <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-700/80">
                      <span className="text-[10px] text-slate-400 font-bold">Pos:</span>
                      <input
                        type="number"
                        min="1"
                        value={rev.position !== undefined ? rev.position : (rev.order !== undefined ? rev.order : '')}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            updateReviewPosition(rev.id, val);
                            showToast(`Set review position to #${val}!`, 'success');
                          }
                        }}
                        className="w-10 text-center bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold rounded py-0.5 focus:border-[#38BDF8] outline-none"
                        title="Position on storefront (1 = Top)"
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            moveReview(rev.id, 'up');
                            showToast(`Moved review from ${rev.customerName} UP!`, 'success');
                          }}
                          className="p-0.5 rounded bg-slate-700 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Move Up (Display Higher)"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            moveReview(rev.id, 'down');
                            showToast(`Moved review from ${rev.customerName} DOWN!`, 'success');
                          }}
                          className="p-0.5 rounded bg-slate-700 hover:bg-[#38BDF8] text-slate-300 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Move Down (Display Lower)"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          pinReviewToTop(rev.id);
                          showToast(`Pinned review from ${rev.customerName} to the TOP (#1)!`, 'success');
                        }}
                        className="p-1 rounded bg-slate-700 hover:bg-amber-400 text-slate-300 hover:text-slate-950 transition-colors cursor-pointer ml-0.5"
                        title="Pin to Top (#1 on Storefront)"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Actions & Status buttons */}
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => {
                          updateReviewStatus(rev.id, 'approved');
                          showToast(`Approved review from ${rev.customerName}!`, 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    )}

                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          updateReviewStatus(rev.id, 'rejected');
                          showToast(`Rejected review from ${rev.customerName}!`, 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleStartEdit(rev)}
                      className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setReviewToDelete({ id: rev.id, customerName: rev.customerName })}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rating & Comment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-1.5">{rev.rating}.0</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  {/* Attached Customer Photos with Interactive Lightbox Zoom */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        <ZoomIn className="w-3 h-3 text-[#38BDF8]" />
                        <span>Attached Review Photos ({rev.images.length}) - Click to inspect in Full Screen:</span>
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {rev.images.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openReviewLightbox(rev.images || [], i)}
                            className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md cursor-zoom-in hover:border-cyan-400 transition-all hover:scale-105 active:scale-95"
                            title="Click to view full-screen & zoom"
                          >
                            <img src={img} alt="customer feedback" className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <ZoomIn className="w-5 h-5 text-cyan-300" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Single Review Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently delete the review from "${reviewToDelete?.customerName}"?`}
        confirmLabel="Yes, Delete Review"
        onConfirm={confirmDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />

      {/* Bulk Delete Reviews Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteReviewsOpen}
        title={`Delete ${selectedReviewIds.length} Selected Reviews?`}
        message={`Are you sure you want to permanently delete all ${selectedReviewIds.length} selected customer reviews? This action cannot be undone.`}
        confirmLabel={`Yes, Delete ${selectedReviewIds.length} Reviews`}
        cancelLabel="No, Keep Reviews"
        isDestructive={true}
        onConfirm={confirmBulkDeleteReviews}
        onCancel={() => setIsBulkDeleteReviewsOpen(false)}
      />

      {/* Full-Screen Lightbox Image Viewer */}
      <ReviewImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        title="Customer Review Photo (Inspection)"
      />
    </div>
  );
};
