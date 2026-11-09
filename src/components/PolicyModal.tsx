import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Mail, MapPin, Phone, Truck, Info, Heart, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PolicyModal: React.FC = () => {
  const { activePolicyModal, setActivePolicyModal, storeConfig, staticPages, modificationWindowHours } = useStore();

  const lockHours = modificationWindowHours || Number(storeConfig?.orderLockDurationHours) || 24;

  const dynamicAbout = staticPages?.find(p => p.slug === 'about-us' || p.slug === 'about' || p.slug.includes('about'));
  const dynamicShipping = staticPages?.find(p => p.slug === 'shipping-policy' || p.slug === 'shipping' || p.slug.includes('ship'));
  const dynamicTerms = staticPages?.find(p => p.slug === 'terms-and-conditions' || p.slug === 'terms-of-service' || p.slug.includes('term'));
  const dynamicPrivacy = staticPages?.find(p => p.slug === 'privacy-policy' || p.slug === 'privacy' || p.slug.includes('privac'));
  const dynamicContact = staticPages?.find(p => p.slug === 'contact-us' || p.slug === 'contact' || p.slug.includes('contact'));

  if (!activePolicyModal) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setActivePolicyModal(null)}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 relative p-6 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setActivePolicyModal(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Router */}

        {/* 1. About Us */}
        {activePolicyModal === 'about' && (
          <div className="space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#38BDF8]">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#38BDF8] flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                  {dynamicAbout?.title || `About ${storeConfig.storeName || 'RycreoShop'}`}
                </h2>
                <p className="text-xs text-slate-400">Our Heritage, Craftsmanship & Story</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 space-y-3">
              {dynamicAbout ? (
                <div className="text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {dynamicAbout.content}
                </div>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">
                    Welcome to <strong>{storeConfig.storeName}</strong> — Bangladesh's premier modern luxury apparel and curated lifestyle destination.
                  </p>
                  <p className="text-slate-600">
                    Founded with a relentless obsession for quality, we bridge contemporary street aesthetics with timeless festive craftsmanship — from heavyweight 240+ GSM drop-shoulder tees and tailored stretch chino pants to royal mandarin-collar festive fusion kurtas.
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Founder & Visionary
                </h4>
                <p className="text-xs text-slate-600">
                  <strong>Founder & Owner: {storeConfig.ownerName || 'Rayan'}</strong> — driven by passion for authentic fabrics, bespoke fits, and elevated Bangladeshi design.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" /> Engineering & Technology
                </h4>
                <p className="text-xs text-slate-600">
                  Engineered & Developed by{' '}
                  <a 
                    href="https://rycreoplus.online" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#38BDF8] font-bold underline hover:text-sky-600"
                  >
                    Rycreoplus
                  </a>
                  . Built with enterprise-grade React architecture and instant ordering workflows.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-sm pt-2">Our Quality Promise</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>100% Combed Compact Cotton & Premium Linen Blends</li>
              <li>Pre-shrunk, bio-washed fabrics ensuring zero color bleed</li>
              <li>Hassle-free 7 days size exchange across all districts</li>
              <li>Direct WhatsApp care and real-time shipment tracking</li>
            </ul>
          </div>
        )}

        {/* 2. Delivery System */}
        {activePolicyModal === 'delivery' && (
          <div className="space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#10B981]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Our Delivery System & Shipping</h2>
                <p className="text-xs text-slate-400">Fast, safe nationwide parcel dispatch</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Inside Dhaka</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#38BDF8] text-slate-900 font-black text-xs">৳60</span>
                </div>
                <p className="text-xs text-slate-600">
                  Delivered within <strong>24 to 48 hours</strong> directly to your home or office address. Full Cash on Delivery available.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Outside Dhaka</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6366F1] text-white font-black text-xs">৳120</span>
                </div>
                <p className="text-xs text-slate-600">
                  Delivered within <strong>2 to 4 business days</strong> via premium courier partners (Pathao, Steadfast, RedX) to all 64 districts.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-sm pt-2">How It Works:</h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-slate-800">Order Verification:</strong> Once you click Order on our website or WhatsApp, our customer care verifies your phone and address.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-slate-800">Quality Check & Dispatch:</strong> Every item is inspected, ironed, and sealed in water-resistant luxury polybags.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <strong className="text-slate-800">Delivery & Cash on Delivery:</strong> The delivery rider hands over your package. Check the item before paying cash or bKash/Nagad.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Privacy Policy */}
        {activePolicyModal === 'privacy' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#38BDF8]">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#38BDF8] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Our Privacy Policy</h2>
                <p className="text-xs text-slate-400">Last updated: 2026</p>
              </div>
            </div>

            <p>At <strong>{storeConfig.storeName}</strong>, we respect your privacy and are committed to protecting the personal data of our customers across Bangladesh.</p>
            
            <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
            <p>We collect essential delivery information including your full name, mobile number, alternative phone, shipping address, and payment preferences solely to fulfill your orders.</p>

            <h3 className="font-bold text-slate-900 text-sm">2. Use of Information</h3>
            <p>Your details are strictly used for order processing, dispatching couriers, sending WhatsApp shipping updates, and providing customer care.</p>

            <h3 className="font-bold text-slate-900 text-sm">3. Security Guarantee</h3>
            <p>We do not share, sell, or rent customer personal data to third-party marketing agencies. All records are safeguarded with strict access controls.</p>
          </div>
        )}

        {/* 4. Terms & Conditions */}
        {activePolicyModal === 'terms' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#6366F1]">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Our Terms & Conditions</h2>
                <p className="text-xs text-slate-400">Store terms of purchase & service</p>
              </div>
            </div>

            <p>By browsing or placing an order on <strong>{storeConfig.storeName}</strong>, you agree to the following terms:</p>

            <h3 className="font-bold text-slate-900 text-sm">1. Ordering & Pricing</h3>
            <p>All prices are listed in Bangladeshi Taka (৳). Orders placed via Cash on Delivery, bKash Personal, or Nagad require valid phone numbers for rider dispatch.</p>

            <h3 className="font-bold text-slate-900 text-sm">2. Order Confirmation</h3>
            <p>Our verification team may contact you via call or WhatsApp to confirm your sizing and shipping address prior to courier dispatch.</p>

            <h3 className="font-bold text-slate-900 text-sm">3. Sizing & Fit</h3>
            <p>Please refer to our dynamic size guide chart on each product page before ordering. If in doubt, message our WhatsApp helpline for personalized sizing suggestions.</p>
          </div>
        )}

        {/* 5. Return & Refund Policy */}
        {activePolicyModal === 'refund' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#F59E0B]">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Return & Exchange Policy</h2>
                <p className="text-xs text-slate-400">7 Days Hassle-Free Size & Quality Swap</p>
              </div>
            </div>

            <p>We offer hassle-free size exchanges and returns for our products within 7 days of delivery.</p>

            <h3 className="font-bold text-slate-900 text-sm">1. Eligibility for Exchange</h3>
            <p>Products must be unworn, unwashed, and in original packaging with price tags intact.</p>

            <h3 className="font-bold text-slate-900 text-sm">2. Exchange Process</h3>
            <p>To request a size swap, simply message us on WhatsApp with your Order ID. Our courier will pick up the current item and deliver the replacement size simultaneously.</p>

            <h3 className="font-bold text-slate-900 text-sm">3. Order Modification & Cancellation Window ({lockHours} Hours)</h3>
            <p>
              Customers can modify their delivery address, phone number, add additional items, or cancel an order within <strong>{lockHours} hours</strong> of placement via our Track My Order tool. After {lockHours} hours, orders are locked for courier handover.
            </p>
          </div>
        )}

        {/* 6. Contact Us */}
        {activePolicyModal === 'contact' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2.5 text-[#10B981]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Customer Support & Hotline</h2>
                <p className="text-xs text-slate-400">We are here to assist you 7 days a week</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <a 
                href={`tel:${storeConfig.contactPhone}`} 
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Customer Helpline</p>
                  <p className="font-bold text-slate-900">{storeConfig.contactPhone}</p>
                </div>
              </a>

              <a 
                href={`https://wa.me/${storeConfig.whatsappNumber}?text=Hi%20${encodeURIComponent(storeConfig.storeName || 'RycreoShop')}%2C%20I%20have%20an%20inquiry!`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <div className="w-5 h-5 text-[#10B981] font-bold">💬</div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-600">WhatsApp Official Desk</p>
                  <p className="font-bold text-emerald-900">+{storeConfig.whatsappNumber} (Instant Response)</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-2 rounded-xl">
                <Mail className="w-5 h-5 text-[#6366F1]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Official Email</p>
                  <p className="font-bold text-slate-900">{storeConfig.contactEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl">
                <MapPin className="w-5 h-5 text-[#F59E0B]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Flagship Studio & Dispatch HQ</p>
                  <p className="font-semibold text-slate-900">House 88, Road 11, Block D, Banani, Dhaka-1213, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6">
          <button
            onClick={() => setActivePolicyModal(null)}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
