/**
 * 表記揺れ正規化 (T7 の核)
 * Company name normalization (T7 core logic)
 * Normalisasi nama perusahaan (inti T7)
 *
 * ポジショニング / Positioning:
 *   国税庁 API `target=1` が既にあいまい検索を内蔵する (第二編 §4.6.2):
 *     - ひらがな → カタカナ置換
 *     - 英小文字 → 英大文字置換
 *     - 中点 (・) や全角スペース削除
 *
 *   T7 はこれらを重複実装せず、国税庁が拾えない 7 パターンを補完:
 *     1. (株)/㈱/株式会社 表記揺れ (前株・後株・省略 の3展開)
 *     2. 法人種別 [株式/有限/合同/合名/合資/一般社団/...] の正規化 + 分離
 *     3. 英語法人名 → 日本語候補 (K.K. / Kabushiki Kaisha / Inc. 検出)
 *     4. 半角/全角英数字の正規化 (NFKC)
 *     5. 旧字体 → 新字体 (髙 → 高、齋 → 斎 等)
 *     6. 異体字セレクタ (IVS / VS) 除去
 *     7. 空白類の揃え (タブ・連続スペース・全角/半角スペース)
 */

export type KindHint =
  | 'state_agency'
  | 'local_government'
  | 'kabushiki_kaisha'
  | 'yugen_kaisha'
  | 'gomei_kaisha'
  | 'goshi_kaisha'
  | 'godo_kaisha'
  | 'ippan_shadan_hojin'
  | 'ippan_zaidan_hojin'
  | 'koueki_shadan_hojin'
  | 'koueki_zaidan_hojin'
  | 'npo_hojin'
  | 'other_registered'
  | 'foreign_company'
  | 'other'
  | 'unknown';

export type PrefixOrSuffix = 'mae_kabu' | 'ato_kabu' | 'none';

export interface NormalizedCandidate {
  /** 国税庁 API に投げる法人名候補 */
  name: string;
  /** 推定される法人種別 */
  kind_hint: KindHint;
  /** 法人種別の位置 (前株/後株/無し) */
  prefix_or_suffix: PrefixOrSuffix;
  /** 国税庁 API の target パラメータ推奨値 */
  suggested_target: '1' | '2' | '3';
  /** 信頼度 (0.0-1.0) */
  confidence: number;
  /** このルールで適用された補完パターン */
  applied_rules: string[];
}

export interface NormalizerResult {
  original: string;
  extracted_core_name: string;
  normalized_candidates: NormalizedCandidate[];
  fallback_note?: string;
}

/**
 * 旧字体 → 新字体 辞書 (JIS 第一・第二水準への縮退補助)
 * 根拠: 法務省「戸籍統一文字」「人名用漢字の新字旧字対応表」
 *
 * 国税庁 API の `target=1` (第二編 §4.6.2) は ひらがな↔カタカナ・英大小・中点削除は
 * 吸収するが、旧字体→新字体変換は未対応なので本 lookup で補う。
 */
const OLD_TO_NEW: Record<string, string> = {
  髙: '高',
  﨑: '崎',
  齋: '斎',
  齊: '斉',
  濵: '浜',
  濱: '浜',
  德: '徳',
  眞: '真',
  曻: '昇',
  晄: '晃',
  淸: '清',
  廣: '広',
  禮: '礼',
  藪: '薮',
  邉: '辺',
  邊: '辺',
  澤: '沢',
  國: '国',
  團: '団',
  寳: '宝',
  寶: '宝',
  應: '応',
  靑: '青',
  權: '権',
  氣: '気',
  專: '専',
  單: '単',
  學: '学',
  樂: '楽',
  劍: '剣',
  續: '続',
  圖: '図',
  鐵: '鉄',
  齒: '歯',
  歷: '歴',
  藝: '芸',
  戰: '戦',
  驛: '駅',
  檢: '検',
  營: '営',
  舊: '旧',
  醫: '医',
  號: '号',
  獨: '独',
  讀: '読',
  變: '変',
  體: '体',
};

const KIND_KEYWORDS_JA: Array<{ word: string; hint: KindHint }> = [
  { word: '株式会社', hint: 'kabushiki_kaisha' },
  { word: '㈱', hint: 'kabushiki_kaisha' },
  { word: '（株）', hint: 'kabushiki_kaisha' },
  { word: '(株)', hint: 'kabushiki_kaisha' },
  { word: '有限会社', hint: 'yugen_kaisha' },
  { word: '（有）', hint: 'yugen_kaisha' },
  { word: '(有)', hint: 'yugen_kaisha' },
  { word: '㈲', hint: 'yugen_kaisha' },
  { word: '合同会社', hint: 'godo_kaisha' },
  { word: '合名会社', hint: 'gomei_kaisha' },
  { word: '合資会社', hint: 'goshi_kaisha' },
  { word: '一般社団法人', hint: 'ippan_shadan_hojin' },
  { word: '一般財団法人', hint: 'ippan_zaidan_hojin' },
  { word: '公益社団法人', hint: 'koueki_shadan_hojin' },
  { word: '公益財団法人', hint: 'koueki_zaidan_hojin' },
  { word: '特定非営利活動法人', hint: 'npo_hojin' },
  { word: 'NPO法人', hint: 'npo_hojin' },
];

const EN_SUFFIX_PATTERNS: Array<{ regex: RegExp; hint: KindHint }> = [
  { regex: /\b(K\.?\s*K\.?)\b/gi, hint: 'kabushiki_kaisha' },
  { regex: /\bKabushiki\s*Kaisha\b/gi, hint: 'kabushiki_kaisha' },
  { regex: /\bCo\.?\s*,?\s*Ltd\.?\b/gi, hint: 'kabushiki_kaisha' },
  { regex: /\bCorp\.?\b/gi, hint: 'other_registered' },
  { regex: /\bInc\.?\b/gi, hint: 'foreign_company' },
  { regex: /\bLLC\b/gi, hint: 'godo_kaisha' },
];

/**
 * 文字列を正規化して法人名候補リストを生成
 *
 * @param raw 入力文字列 (名刺OCR や手入力の揺れを含む)
 * @returns 最大10件の正規化候補
 */
export function normalizeCompanyName(raw: string): NormalizerResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      original: raw,
      extracted_core_name: '',
      normalized_candidates: [],
      fallback_note: 'Empty input',
    };
  }

  const appliedRules: string[] = [];

  // Rule 7: 空白類の揃え (NFKC で全角→半角 の前段、連続空白の除去)
  let work = trimmed.replace(/[\t\u3000]+/g, ' ').replace(/ {2,}/g, ' ');
  if (work !== trimmed) appliedRules.push('rule7_whitespace');

  // Rule 4: NFKC 正規化 (半角/全角英数字の揃え)
  const beforeNfkc = work;
  work = work.normalize('NFKC');
  if (work !== beforeNfkc) appliedRules.push('rule4_nfkc');

  // Rule 6: 異体字セレクタ除去 (BMP Variation Selectors + Supplementary IVS)
  // 注意: \uE0100 は 4 hex digit 評価 + 余剰トークンになり char class を破壊するため
  //       \u{...} 表記を u フラグ下で使用する必要がある
  const beforeVs = work;
  work = work.replace(/[\uFE00-\uFE0F]|[\u{E0100}-\u{E01EF}]/gu, '');
  if (work !== beforeVs) appliedRules.push('rule6_ivs_removed');

  // Rule 5: 旧字体 → 新字体 (候補として別バージョンも保持)
  let newVariant: string | null = null;
  const newWork = applyOldToNew(work);
  if (newWork !== work) {
    newVariant = newWork;
    appliedRules.push('rule5_old_to_new_char');
  }

  // Rule 1/2: 法人種別検出 + 前株/後株判定
  const kindDetection = detectKind(work);

  // Rule 3: 英語法人名検出
  const enDetection = detectEnglishKind(work);

  // ターゲット推定
  const suggestedTarget: '1' | '2' | '3' = enDetection.hint !== null ? '3' : '1';

  // コア名 (法人種別を取り除いた部分)
  const coreName = stripKindFromName(work, kindDetection);

  // 候補生成
  const candidates: NormalizedCandidate[] = [];

  // a. 正規化済みの元のまま (core name 保持)
  candidates.push({
    name: work,
    kind_hint: kindDetection.hint ?? enDetection.hint ?? 'unknown',
    prefix_or_suffix: kindDetection.position,
    suggested_target: suggestedTarget,
    confidence: 0.95,
    applied_rules: [...appliedRules],
  });

  // b. 法人種別を除去したコア名のみ
  if (coreName !== work && coreName.length > 0) {
    candidates.push({
      name: coreName,
      kind_hint: kindDetection.hint ?? 'unknown',
      prefix_or_suffix: 'none',
      suggested_target: suggestedTarget,
      confidence: 0.9,
      applied_rules: [...appliedRules, 'rule2_kind_separated'],
    });
  }

  // c. 前株 ↔ 後株 の反転候補 (株式会社のみ)
  if (kindDetection.hint === 'kabushiki_kaisha' && coreName.length > 0) {
    if (kindDetection.position === 'mae_kabu') {
      candidates.push({
        name: `${coreName}株式会社`,
        kind_hint: 'kabushiki_kaisha',
        prefix_or_suffix: 'ato_kabu',
        suggested_target: suggestedTarget,
        confidence: 0.75,
        applied_rules: [...appliedRules, 'rule1_kabu_position_inverted'],
      });
    } else if (kindDetection.position === 'ato_kabu') {
      candidates.push({
        name: `株式会社${coreName}`,
        kind_hint: 'kabushiki_kaisha',
        prefix_or_suffix: 'mae_kabu',
        suggested_target: suggestedTarget,
        confidence: 0.75,
        applied_rules: [...appliedRules, 'rule1_kabu_position_inverted'],
      });
    }
  }

  // d. 英語法人名が検出された場合、英語表記での検索候補
  if (enDetection.hint !== null) {
    const enCore = enDetection.stripped;
    candidates.push({
      name: enCore,
      kind_hint: enDetection.hint,
      prefix_or_suffix: 'none',
      suggested_target: '3',
      confidence: 0.7,
      applied_rules: [...appliedRules, 'rule3_english_detected'],
    });
  }

  // e. 旧字体→新字体の候補
  if (newVariant !== null) {
    candidates.push({
      name: newVariant,
      kind_hint: kindDetection.hint ?? 'unknown',
      prefix_or_suffix: kindDetection.position,
      suggested_target: '1',
      confidence: 0.8,
      applied_rules: [...appliedRules, 'rule5_old_to_new_applied'],
    });
  }

  // 重複除去 + 10件上限
  const seen = new Set<string>();
  const uniqueCandidates = candidates
    .filter((c) => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    })
    .slice(0, 10);

  return {
    original: raw,
    extracted_core_name: coreName,
    normalized_candidates: uniqueCandidates,
  };
}

interface KindDetection {
  hint: KindHint | null;
  position: PrefixOrSuffix;
  matchedWord: string | null;
}

function detectKind(text: string): KindDetection {
  for (const { word, hint } of KIND_KEYWORDS_JA) {
    const idx = text.indexOf(word);
    if (idx === -1) continue;
    const atStart = idx === 0;
    const atEnd = idx + word.length === text.length;
    let position: PrefixOrSuffix = 'none';
    if (atStart) position = 'mae_kabu';
    else if (atEnd) position = 'ato_kabu';
    return { hint, position, matchedWord: word };
  }
  return { hint: null, position: 'none', matchedWord: null };
}

function stripKindFromName(text: string, detection: KindDetection): string {
  if (detection.matchedWord === null) return text;
  return text.replace(detection.matchedWord, '').trim();
}

interface EnglishDetection {
  hint: KindHint | null;
  stripped: string;
  matchedSuffix: string | null;
}

function detectEnglishKind(text: string): EnglishDetection {
  for (const { regex, hint } of EN_SUFFIX_PATTERNS) {
    const freshRegex = new RegExp(regex.source, regex.flags);
    const match = freshRegex.exec(text);
    if (match !== null) {
      const stripped = text
        .replace(freshRegex, '')
        .replace(/\s+,?\s*$/, '')
        .trim();
      return { hint, stripped, matchedSuffix: match[0] };
    }
  }
  return { hint: null, stripped: text, matchedSuffix: null };
}

function applyOldToNew(text: string): string {
  let result = text;
  for (const [oldChar, newChar] of Object.entries(OLD_TO_NEW)) {
    if (result.includes(oldChar)) {
      result = result.split(oldChar).join(newChar);
    }
  }
  return result;
}
