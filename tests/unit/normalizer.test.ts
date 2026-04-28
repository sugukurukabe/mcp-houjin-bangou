/**
 * T7 normalizer テスト
 * 国税庁 target=1 が吸収しない 7 パターンの検証
 */

import { describe, it, expect } from 'vitest';
import { normalizeCompanyName } from '../../src/domain/normalizer.js';

describe('normalizeCompanyName - Rule 1: (株)/㈱/株式会社 位置揺れ', () => {
  it('前株を検出する', () => {
    const r = normalizeCompanyName('株式会社スグクル');
    expect(r.extracted_core_name).toBe('スグクル');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('kabushiki_kaisha');
    expect(r.normalized_candidates[0]?.prefix_or_suffix).toBe('mae_kabu');
  });

  it('後株を検出する', () => {
    const r = normalizeCompanyName('スグクル株式会社');
    expect(r.extracted_core_name).toBe('スグクル');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('kabushiki_kaisha');
    expect(r.normalized_candidates[0]?.prefix_or_suffix).toBe('ato_kabu');
  });

  it('(株) を株式会社として認識', () => {
    const r = normalizeCompanyName('(株)スグクル');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('kabushiki_kaisha');
  });

  it('（株）全角カッコ版も認識', () => {
    const r = normalizeCompanyName('（株）スグクル');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('kabushiki_kaisha');
  });

  it('㈱ 合字も認識', () => {
    const r = normalizeCompanyName('㈱スグクル');
    const candidates = r.normalized_candidates.map((c) => c.kind_hint);
    expect(candidates).toContain('kabushiki_kaisha');
  });

  it('前株を後株に反転した候補を含む', () => {
    const r = normalizeCompanyName('株式会社スグクル');
    const inverted = r.normalized_candidates.find(
      (c) => c.prefix_or_suffix === 'ato_kabu' && c.name === 'スグクル株式会社',
    );
    expect(inverted).toBeDefined();
  });
});

describe('normalizeCompanyName - Rule 2: 法人種別の識別', () => {
  it('有限会社', () => {
    const r = normalizeCompanyName('有限会社テスト');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('yugen_kaisha');
  });

  it('合同会社', () => {
    const r = normalizeCompanyName('合同会社テスト');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('godo_kaisha');
  });

  it('一般社団法人', () => {
    const r = normalizeCompanyName('一般社団法人テスト');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('ippan_shadan_hojin');
  });

  it('特定非営利活動法人', () => {
    const r = normalizeCompanyName('特定非営利活動法人テスト');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('npo_hojin');
  });

  it('NPO法人', () => {
    const r = normalizeCompanyName('NPO法人テスト');
    const hints = r.normalized_candidates.map((c) => c.kind_hint);
    expect(hints).toContain('npo_hojin');
  });
});

describe('normalizeCompanyName - Rule 3: 英語法人名検出', () => {
  it('K.K. を認識', () => {
    const r = normalizeCompanyName('Sugukuru K.K.');
    const hasEnCandidate = r.normalized_candidates.some((c) => c.suggested_target === '3');
    expect(hasEnCandidate).toBe(true);
  });

  it('Kabushiki Kaisha を認識', () => {
    const r = normalizeCompanyName('Sugukuru Kabushiki Kaisha');
    const hasEnCandidate = r.normalized_candidates.some((c) => c.suggested_target === '3');
    expect(hasEnCandidate).toBe(true);
  });

  it('Co.,Ltd. を認識', () => {
    const r = normalizeCompanyName('Sugukuru Co., Ltd.');
    const hasEnCandidate = r.normalized_candidates.some((c) => c.suggested_target === '3');
    expect(hasEnCandidate).toBe(true);
  });

  it('Inc. を foreign_company として認識', () => {
    const r = normalizeCompanyName('Sugukuru Inc.');
    const hasForeign = r.normalized_candidates.some(
      (c) => c.kind_hint === 'foreign_company' || c.suggested_target === '3',
    );
    expect(hasForeign).toBe(true);
  });

  it('LLC を合同会社として認識', () => {
    const r = normalizeCompanyName('Sugukuru LLC');
    const hasGodo = r.normalized_candidates.some((c) => c.kind_hint === 'godo_kaisha');
    expect(hasGodo).toBe(true);
  });
});

describe('normalizeCompanyName - Rule 4: NFKC 正規化', () => {
  it('全角英字を半角に', () => {
    const r = normalizeCompanyName('ＡＢＣ株式会社');
    expect(r.normalized_candidates[0]?.name.includes('ABC')).toBe(true);
    expect(r.normalized_candidates[0]?.applied_rules).toContain('rule4_nfkc');
  });

  it('全角数字を半角に', () => {
    const r = normalizeCompanyName('株式会社１２３');
    expect(r.normalized_candidates[0]?.name.includes('123')).toBe(true);
  });
});

describe('normalizeCompanyName - Rule 5: 旧字体→新字体', () => {
  it('髙 → 高 の候補を生成', () => {
    const r = normalizeCompanyName('髙橋商事');
    const hasNew = r.normalized_candidates.some((c) => c.name.includes('高橋'));
    expect(hasNew).toBe(true);
  });

  it('齋 → 斎 の候補を生成', () => {
    const r = normalizeCompanyName('齋藤商店');
    const hasNew = r.normalized_candidates.some((c) => c.name.includes('斎藤'));
    expect(hasNew).toBe(true);
  });

  it('﨑 → 崎 の候補を生成', () => {
    const r = normalizeCompanyName('﨑田物産');
    const hasNew = r.normalized_candidates.some((c) => c.name.includes('崎田'));
    expect(hasNew).toBe(true);
  });
});

describe('normalizeCompanyName - Rule 7: 空白類の揃え', () => {
  it('タブを半角スペースに', () => {
    const r = normalizeCompanyName('株式会社\tスグクル');
    expect(r.normalized_candidates[0]?.applied_rules).toContain('rule7_whitespace');
  });

  it('連続スペースを単一に', () => {
    const r = normalizeCompanyName('株式会社   スグクル');
    expect(r.normalized_candidates[0]?.applied_rules).toContain('rule7_whitespace');
  });

  it('全角スペースを半角に', () => {
    const r = normalizeCompanyName('株式会社\u3000スグクル');
    expect(r.normalized_candidates[0]?.applied_rules).toContain('rule7_whitespace');
  });
});

describe('normalizeCompanyName - 境界値', () => {
  it('空文字列は候補なし', () => {
    const r = normalizeCompanyName('');
    expect(r.normalized_candidates.length).toBe(0);
    expect(r.fallback_note).toBeDefined();
  });

  it('空白のみは候補なし', () => {
    const r = normalizeCompanyName('   ');
    expect(r.normalized_candidates.length).toBe(0);
  });

  it('候補は最大10件', () => {
    const r = normalizeCompanyName('髙﨑齋齊濵德藪禮Test K.K.');
    expect(r.normalized_candidates.length).toBeLessThanOrEqual(10);
  });

  it('法人種別なしのコア名のみ', () => {
    const r = normalizeCompanyName('スグクル');
    expect(r.normalized_candidates[0]?.kind_hint).toBe('unknown');
    expect(r.extracted_core_name).toBe('スグクル');
  });
});
