import { MangaSFXItem } from '../types/manga';

export interface SampleImageItem {
  id: string;
  title: string;
  genre: string;
  url: string;
  description: string;
}

export const SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'portrait-man',
    title: 'Portrait (Male)',
    genre: 'Photo to Manga Hero',
    url: '/src/assets/images/portrait_man_casual_1791888129498.jpg',
    description: 'Clean portrait photograph ready to transform into a Shonen or Seinen manga character',
  },
  {
    id: 'portrait-woman',
    title: 'Portrait (Female)',
    genre: 'Photo to Shojo Heroine',
    url: '/src/assets/images/portrait_woman_casual_1791888129620.jpg',
    description: 'Natural portrait photo ready to transform into a Shojo or Anime manga heroine',
  },
  {
    id: 'cyberpunk-samurai',
    title: 'Neon Ronin',
    genre: 'Cyberpunk Seinen',
    url: '/src/assets/images/sample_cyberpunk_samurai_1791883057177.jpg',
    description: 'Solitary cybernetic swordsman in rain-drenched Shibuya alleyway',
  },
  {
    id: 'shonen-climax',
    title: 'Summit Duel',
    genre: 'Martial Shonen',
    url: '/src/assets/images/sample_shonen_climax_1791883058059.jpg',
    description: 'Mid-air martial clash amidst storm clouds and lightning strikes',
  },
  {
    id: 'tokyo-street',
    title: 'Rainy Shibuya',
    genre: 'Slice-of-Life',
    url: '/src/assets/images/sample_tokyo_street_1791883057721.jpg',
    description: 'Twilight crossing crowded with umbrellas and glowing billboards',
  },
];

export interface SFXCatalogItem {
  text: string;
  romaji: string;
  meaning: string;
  category: 'action' | 'tension' | 'emotion' | 'ambience';
  style: 'bold-impact' | 'menacing-curve' | 'sparkle' | 'comic';
}

export const SFX_PRESETS: SFXCatalogItem[] = [
  {
    text: 'ドォォン!',
    romaji: 'DOOON!',
    meaning: 'Sudden colossal impact / reveal',
    category: 'action',
    style: 'bold-impact',
  },
  {
    text: 'ゴゴゴ...',
    romaji: 'GOGOGO...',
    meaning: 'Menacing presence / ominous tension',
    category: 'tension',
    style: 'menacing-curve',
  },
  {
    text: 'ドドドド',
    romaji: 'DODODO',
    meaning: 'Rapid approach / heavy rumble',
    category: 'action',
    style: 'bold-impact',
  },
  {
    text: 'ズバッ!!',
    romaji: 'ZUBAT!!',
    meaning: 'Decisive sword slash / clean slice',
    category: 'action',
    style: 'bold-impact',
  },
  {
    text: 'バキッ!',
    romaji: 'BAKI!',
    meaning: 'Bone-crunching blow / snap',
    category: 'action',
    style: 'bold-impact',
  },
  {
    text: 'ガーン...',
    romaji: 'GAAN...',
    meaning: 'Shock / devastating realization',
    category: 'emotion',
    style: 'comic',
  },
  {
    text: 'ドキドキ',
    romaji: 'DOKI DOKI',
    meaning: 'Heart racing with tension or love',
    category: 'emotion',
    style: 'sparkle',
  },
  {
    text: 'ピカーン!',
    romaji: 'PIKAAN!',
    meaning: 'Lightning flash / brilliant inspiration',
    category: 'action',
    style: 'sparkle',
  },
  {
    text: 'ニヤリ...',
    romaji: 'NIYARI...',
    meaning: 'Smug sinister grin',
    category: 'tension',
    style: 'menacing-curve',
  },
  {
    text: 'シュッ!',
    romaji: 'SHU!',
    meaning: 'High-speed vanish / swift dash',
    category: 'action',
    style: 'bold-impact',
  },
  {
    text: 'シーン...',
    romaji: 'SHIIN...',
    meaning: 'Dead, eerie silence',
    category: 'ambience',
    style: 'menacing-curve',
  },
  {
    text: 'ザザーッ',
    romaji: 'ZAZAA',
    meaning: 'Heavy downpour / torrent of rain',
    category: 'ambience',
    style: 'bold-impact',
  },
];
