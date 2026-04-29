import { App, applyDocumentTheme } from '@modelcontextprotocol/ext-apps';
import {
  escapeText,
  formatAddress,
  renderAttribution,
  type Attribution,
  type Corporation,
} from '../shared';
import './styles.css';

interface LookupOutput {
  corporations?: Corporation[];
  corporation?: Corporation | null;
  attribution?: Attribution;
}

const app = new App({ name: 'houjin-bangou-corporate-card', version: '0.1.0' }, {});
const root = document.getElementById('app');

function renderEmpty(message: string): void {
  if (root === null) return;
  root.innerHTML = `<p class="empty">${escapeText(message)}</p>`;
}

function renderCard(output: LookupOutput): void {
  if (root === null) return;
  const corporation = output.corporation ?? output.corporations?.[0] ?? null;
  if (corporation === null || corporation === undefined) {
    renderEmpty('該当する法人情報がありません。');
    return;
  }

  const address = formatAddress(corporation);
  const status =
    corporation.close_date !== '' ? 'Closed' : corporation.hihyoji === '1' ? 'Excluded' : 'Active';
  root.innerHTML = `
    <section class="header">
      <div>
        <h1>${escapeText(corporation.name)}</h1>
        ${corporation.en_name ? `<p class="en">${escapeText(corporation.en_name)}</p>` : ''}
      </div>
      <span class="status">${escapeText(status)}</span>
    </section>
    <dl class="facts">
      <dt>法人番号</dt><dd><code>${escapeText(corporation.corporate_number)}</code></dd>
      <dt>法人種別コード</dt><dd>${escapeText(corporation.kind)}</dd>
      <dt>本店所在地</dt><dd>${escapeText(address)}</dd>
      <dt>郵便番号</dt><dd>${escapeText(corporation.post_code)}</dd>
      <dt>法人番号指定年月日</dt><dd>${escapeText(corporation.assignment_date)}</dd>
      <dt>最終更新日</dt><dd>${escapeText(corporation.update_date)}</dd>
      <dt>フリガナ</dt><dd>${escapeText(corporation.furigana || '未登録')}</dd>
    </dl>
    <footer>${renderAttribution(output.attribution)}</footer>
  `;
}

app.onhostcontextchanged = (ctx) => {
  if (ctx.theme !== undefined) applyDocumentTheme(ctx.theme);
};

app.ontoolresult = (params) => {
  renderCard((params.structuredContent ?? {}) as LookupOutput);
};

await app.connect();
