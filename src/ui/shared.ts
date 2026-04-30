export interface Attribution {
  data_source: string;
  service_disclaimer: string;
  license: string;
  api_version: string;
  accessed_at: string;
}

export interface Corporation {
  corporate_number: string;
  name: string;
  kind: string;
  prefecture_name: string;
  city_name: string;
  street_number: string;
  post_code: string;
  assignment_date: string;
  update_date: string;
  latest: '0' | '1';
  hihyoji: '0' | '1';
  en_name: string;
  furigana: string;
  close_date: string;
}

export function escapeText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

export function formatAddress(c: Corporation): string {
  return `${c.prefecture_name}${c.city_name}${c.street_number}`;
}

export function kindLabel(code: string): string {
  const labels: Record<string, string> = {
    '101': '国の機関',
    '201': '地方公共団体',
    '301': '株式会社',
    '302': '有限会社',
    '303': '合名会社',
    '304': '合資会社',
    '305': '合同会社',
    '399': 'その他の設立登記法人',
    '401': '外国会社等',
    '499': 'その他',
  };
  return labels[code] ?? code;
}

export function statusLabel(c: Corporation): { label: string; className: string } {
  if (c.close_date !== '') return { label: 'Closed', className: 'closed' };
  if (c.hihyoji === '1') return { label: 'Excluded', className: 'excluded' };
  return { label: 'Active', className: 'active' };
}

export function renderAttribution(attribution: Attribution | undefined): string {
  if (attribution === undefined) {
    return '<p class="attribution">出典: 国税庁法人番号公表サイト</p>';
  }
  return `
    <p class="attribution">${escapeText(attribution.data_source)}</p>
    <p class="disclaimer">${escapeText(attribution.service_disclaimer)}</p>
  `;
}
