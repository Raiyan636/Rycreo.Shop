import React, { useState } from 'react';
import { 
  Facebook, 
  Youtube, 
  Instagram, 
  Share2, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Globe,
  Video
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../common/Toast';

export const MediaManager: React.FC = () => {
  const { storeConfig, updateStoreConfig } = useStore();
  const { showToast } = useToast();

  const [links, setLinks] = useState({
    facebook: storeConfig.socialLinks?.facebook || '',
    youtube: storeConfig.socialLinks?.youtube || '',
    tiktok: storeConfig.socialLinks?.tiktok || '',
    instagram: storeConfig.socialLinks?.instagram || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreConfig({
        socialLinks: links
      });
      showToast('Media social links updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update social links', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Media & Social Media Settings</h2>
            <p className="text-sm text-slate-500">
              Set links for Facebook, YouTube, TikTok, and Instagram. These logos will appear across the site and link directly to your pages.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700">Facebook Page / Group</span>
                </div>
                {links.facebook && (
                  <a 
                    href={links.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Test <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={links.facebook}
                onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* YouTube */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700">YouTube Channel</span>
                </div>
                {links.youtube && (
                  <a 
                    href={links.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    Test <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={links.youtube}
                onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* TikTok */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700">TikTok Profile</span>
                </div>
                {links.tiktok && (
                  <a 
                    href={links.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-slate-800 hover:underline flex items-center gap-1"
                  >
                    Test <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={links.tiktok}
                onChange={(e) => setLinks({ ...links, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@yourhandle"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
              />
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700">Instagram Profile</span>
                </div>
                {links.instagram && (
                  <a 
                    href={links.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                  >
                    Test <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                value={links.instagram}
                onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>Saving Changes...</>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Media Links
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
