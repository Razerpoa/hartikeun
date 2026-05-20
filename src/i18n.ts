export interface I18nDict {
  common: {
    back: string;
    copy: string;
  };
  landing: {
    hero: string;
    subHero: string;
    featureSubtitle: string;
    description: string;
    cta: string;
  };
  translator: {
    tagline: string;
    sidebar1: string;
    inputLabel: string;
    inputTitle: string;
    inputPlaceholder: string;
    charCount: string;
    transformBtn: string;
    processing: string;
    politeLabel: string;
    assertiveLabel: string;
    casualLabel: string;
    dailyLabel: string;
    awaiting: string;
    awaitingDesc: string;
    contextLabel: string;
    toneLabelOutput: string;
    tryExample: string;
    riskTitle: string;
    footerEngine: string;
    footerPrivacy: string;
    footerEnterprise: string;
    tokenContextLabel: string;
    imageBtn: string;
    imageDesc: string;
    removeBtn: string;
    discoveryTitle: string;
    detectedLangLabel: string;
    culturalNoteLabel: string;
    deepDiveLabel: string;
  };
  wordDetails: {
    pronunciation: string;
    origins: string;
    examples: string;
    synonyms: string;
    antonyms: string;
    deepDive: string;
    loading: string;
    error: string;
    dialectBadge: string;
    contextBadge: string;
  };
}

export const i18n: Record<'id' | 'en', I18nDict> = {
  en: {
    common: { back: "Back", copy: "Copy" },
    landing: {
      hero: "Got Confused by friends' slang",
      subHero: "Don't just nod along, find out what it means!",
      featureSubtitle: "Translate Gen-Z slang, regional dialects, Brainrot, or foreign languages — all into Indonesian with cultural insights.",
      description: "Hartikeun // ID - A multi-dialect cultural translator that ensures you'll never be lost in translation when your friends use regional slang or local dialects.",
      cta: "Find out what it means"
    },
    translator: {
      tagline: "Native Tongue? // No Problem!",
      sidebar1: "Daily Bridge",
      inputLabel: "Your Local Input",
      inputTitle: "What's the Meaning?",
      inputPlaceholder: "Type slang, dialect, Gen-Z lingo, or any language...",
      charCount: "characters",
      transformBtn: "Translate Meaning",
      processing: "Analyzing Culture...",
      politeLabel: "Balanced & Polite",
      assertiveLabel: "Precise & Clear",
      casualLabel: "Casual & Friendly",
      dailyLabel: "Everyday Indonesian",
      awaiting: "Awaiting Your Input",
      awaitingDesc: "Type any slang, dialect, or foreign language to see translations + cultural insights.",
      contextLabel: "Situation",
      toneLabelOutput: "Vibe",
      tryExample: "Try this:",
      riskTitle: "Word Meanings",
      footerEngine: "Hartikeun v5.2.0 // Polyglot",
      footerPrivacy: "Privacy",
      footerEnterprise: "Developers",
      tokenContextLabel: "Context & Meaning",
      imageBtn: "Add Image",
      imageDesc: "Upload or take a screenshot",
      removeBtn: "Remove",
      discoveryTitle: "Language Discovery",
      detectedLangLabel: "Detected Language",
      culturalNoteLabel: "Cultural Context",
      deepDiveLabel: "Deep Dive"
    },
    wordDetails: {
      pronunciation: "Pronunciation Guide",
      origins: "Origins & Culture",
      examples: "Usage Examples",
      synonyms: "Synonyms",
      antonyms: "Antonyms",
      deepDive: "Linguistic Deep Dive",
      loading: "Analyzing word...",
      error: "Failed to load word details.",
      dialectBadge: "Dialect",
      contextBadge: "Scenario"
    }
  },
  id: {
    common: { back: "Kembali", copy: "Salin" },
    landing: {
      hero: "Ga ngerti temen kamu ngomong apa",
      subHero: "Jangan cuma melongo, ayo cari tau hartina!",
      featureSubtitle: "Terjemahkan bahasa gaul Gen-Z, dialek daerah, Brainrot, atau bahasa asing — semuanya ke Bahasa Indonesia dengan wawasan budaya.",
      description: "Hartikeun // ID - Jembatan budaya multi-dialek yang bikin kamu nggak bakal bingung lagi denger bahasa gaul atau bahasa daerah temen-temen kamu.",
      cta: "Ayo Cari Artinya"
    },
    translator: {
      tagline: "Bahasa Daerah? // Bukan lagi masalah!",
      sidebar1: "Terjemahkan",
      inputLabel: "Masukin Bahasa Lokal Kamu",
      inputTitle: "Translate ke bahasa biasa",
      inputPlaceholder: "Ketik slang, dialek, bahasa Gen-Z, atau bahasa apa pun...",
      charCount: "karakter",
      transformBtn: "Artinya",
      processing: "Menganalisis Budaya...",
      politeLabel: "Seimbang & Sopan",
      assertiveLabel: "Tepat & Jelas",
      casualLabel: "Santai & Akrab",
      dailyLabel: "Bahasa Sehari-hari",
      awaiting: "Nungguin input kamu",
      awaitingDesc: "Ketik slang, dialek, atau bahasa asing untuk melihat terjemahan + wawasan budaya.",
      contextLabel: "Situasi",
      toneLabelOutput: "Vibe",
      tryExample: "Coba ini:",
      riskTitle: "Makna Kata",
      footerEngine: "Hartikeun v5.2.0 // Polyglot",
      footerPrivacy: "Privasi",
      footerEnterprise: "Pengembang",
      tokenContextLabel: "Konteks & Makna",
      imageBtn: "Tambah Gambar",
      imageDesc: "Unggah atau ambil tangkapan layar",
      removeBtn: "Hapus",
      discoveryTitle: "Penemuan Bahasa",
      detectedLangLabel: "Bahasa Terdeteksi",
      culturalNoteLabel: "Konteks Budaya",
      deepDiveLabel: "Deep Dive"
    },
    wordDetails: {
      pronunciation: "Cara Pengucapan",
      origins: "Asal-usul & Budaya",
      examples: "Contoh Penggunaan",
      synonyms: "Sinonim",
      antonyms: "Antonim",
      deepDive: "Deep Dive Linguistik",
      loading: "Menganalisis kata...",
      error: "Gagal memuat detail kata.",
      dialectBadge: "Dialek",
      contextBadge: "Situasi"
    }
  }
};

export const useI18n = (lang: 'id' | 'en') => i18n[lang];
