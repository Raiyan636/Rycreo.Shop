import smartwatchImg from '../assets/images/preorder_smartwatch_pro_1794543635576.jpg';
import headphonesImg from '../assets/images/preorder_anc_headphones_1794543635863.jpg';
import poloComboImg from '../assets/images/buymore_polo_combo_1794543636471.jpg';
import leatherComboImg from '../assets/images/buymore_leather_combo_1794543635554.jpg';
import sneakersImg from '../assets/images/preorder_sneakers_minimal_1794543635858.jpg';
import cottonSocksImg from '../assets/images/upcoming_cotton_socks_1794573189023.jpg';
import kidsComboSetImg from '../assets/images/upcoming_kids_combo_set_1794573190201.jpg';
import glassJarsImg from '../assets/images/upcoming_glass_jars_1794573190026.jpg';
import badmintonCorksImg from '../assets/images/badminton_feather_corks_1794573993654.jpg';
import kidsCapSocksImg from '../assets/images/kids_cap_socks_set_1794573993354.jpg';
import kidsBeanieSocksImg from '../assets/images/kids_beanie_socks_set_1794573994095.jpg';
import ankleSocksImg from '../assets/images/ankle_sport_socks_pack_1794573994327.jpg';
import glassSpiceJarsImg from '../assets/images/glass_spice_jars_set_1794573996251.jpg';

const ASSET_MAP: Record<string, string> = {
  '/src/assets/images/preorder_smartwatch_pro_1794543635576.jpg': smartwatchImg,
  '/src/assets/images/preorder_anc_headphones_1794543635863.jpg': headphonesImg,
  '/src/assets/images/buymore_polo_combo_1794543636471.jpg': poloComboImg,
  '/src/assets/images/buymore_leather_combo_1794543635554.jpg': leatherComboImg,
  '/src/assets/images/preorder_sneakers_minimal_1794543635858.jpg': sneakersImg,
  '/src/assets/images/upcoming_cotton_socks_1794573189023.jpg': cottonSocksImg,
  '/src/assets/images/upcoming_kids_combo_set_1794573190201.jpg': kidsComboSetImg,
  '/src/assets/images/upcoming_glass_jars_1794573190026.jpg': glassJarsImg,
  '/src/assets/images/badminton_feather_corks_1794573993654.jpg': badmintonCorksImg,
  '/src/assets/images/kids_cap_socks_set_1794573993354.jpg': kidsCapSocksImg,
  '/src/assets/images/kids_beanie_socks_set_1794573994095.jpg': kidsBeanieSocksImg,
  '/src/assets/images/ankle_sport_socks_pack_1794573994327.jpg': ankleSocksImg,
  '/src/assets/images/glass_spice_jars_set_1794573996251.jpg': glassSpiceJarsImg,
};

export function resolveStoreAssetUrl(url?: string): string {
  if (!url) return '';
  return ASSET_MAP[url] || url;
}
