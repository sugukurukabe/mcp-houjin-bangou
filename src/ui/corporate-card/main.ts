import { App, applyDocumentTheme } from '@modelcontextprotocol/ext-apps';
import {
  escapeText,
  formatAddress,
  kindLabel,
  renderAttribution,
  statusLabel,
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
  root.innerHTML = `
    <section class="empty-state">
      <p>${escapeText(message)}</p>
      <small>lookup_corporate_by_number の結果を受け取ると、ここに法人カードが表示されます。</small>
    </section>
  `;
}

function renderCard(output: LookupOutput): void {
  if (root === null) return;
  const corporation = output.corporation ?? output.corporations?.[0] ?? null;
  if (corporation === null || corporation === undefined) {
    renderEmpty('該当する法人情報がありません。');
    return;
  }

  const address = formatAddress(corporation);
  const status = statusLabel(corporation);
  root.innerHTML = `
    <section class="header">
      <div>
        <h1>${escapeText(corporation.name)}</h1>
        ${corporation.en_name ? `<p class="en">${escapeText(corporation.en_name)}</p>` : ''}
      </div>
      <span class="status ${escapeText(status.className)}">${escapeText(status.label)}</span>
    </section>
    <dl class="facts">
      <dt>法人番号</dt><dd><code>${escapeText(corporation.corporate_number)}</code></dd>
      <dt>法人種別</dt><dd>${escapeText(kindLabel(corporation.kind))} <span class="muted">(${escapeText(corporation.kind)})</span></dd>
      <dt>本店所在地</dt><dd>${escapeText(address)}</dd>
      <dt>郵便番号</dt><dd>${escapeText(corporation.post_code)}</dd>
      <dt>法人番号指定年月日</dt><dd>${escapeText(corporation.assignment_date)}</dd>
      <dt>最終更新日</dt><dd>${escapeText(corporation.update_date)}</dd>
      <dt>フリガナ</dt><dd>${escapeText(corporation.furigana || '未登録')}</dd>
    </dl>
    <section class="actions">
      <button type="button" id="search-similar">類似商号を検索</button>
      <button type="button" id="copy-number">法人番号をコピー</button>
    </section>
    <footer>${renderAttribution(output.attribution)}</footer>
  `;

  document.getElementById('search-similar')?.addEventListener('click', () => {
    void searchSimilar(corporation.name);
  });
  document.getElementById('copy-number')?.addEventListener('click', () => {
    void navigator.clipboard?.writeText(corporation.corporate_number);
  });
}

async function searchSimilar(name: string): Promise<void> {
  renderEmpty('類似商号を検索しています...');
  try {
    const result = await app.callServerTool({
      name: 'search_corporate_by_name',
      arguments: {
        name,
        match_mode: 'partial',
        search_target: 'fuzzy',
      },
    });
    if (result.isError) {
      renderEmpty('検索に失敗しました。tool result を確認してください。');
      return;
    }
    renderCard((result.structuredContent ?? {}) as LookupOutput);
  } catch (error) {
    renderEmpty(error instanceof Error ? error.message : '検索に失敗しました。');
  }
}

app.onhostcontextchanged = (ctx) => {
  if (ctx.theme !== undefined) applyDocumentTheme(ctx.theme);
};

app.ontoolresult = (params) => {
  renderCard((params.structuredContent ?? {}) as LookupOutput);
};

await app.connect();
