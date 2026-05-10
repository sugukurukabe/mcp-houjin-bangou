import { App, applyDocumentTheme } from '@modelcontextprotocol/ext-apps';
import {
  escapeText,
  formatAddress,
  renderAttribution,
  statusLabel,
  type Attribution,
  type Corporation,
} from '../shared';
import './styles.css';

interface SearchOutput {
  total?: number;
  page_number?: number;
  page_size?: number;
  next_cursor?: string | null;
  corporations?: Corporation[];
  attribution?: Attribution;
}

const app = new App({ name: 'houjin-bangou-search-results', version: '0.1.0' }, {});
const root = document.getElementById('app');

function render(output: SearchOutput): void {
  if (root === null) return;
  const corporations = output.corporations ?? [];
  if (corporations.length === 0) {
    root.innerHTML = `<p class="empty">該当する法人情報がありません。</p>${renderAttribution(output.attribution)}`;
    return;
  }

  const rows = corporations
    .map((c) => {
      const status = statusLabel(c);
      return `
        <tr class="result-row" data-corporate-number="${escapeText(c.corporate_number)}">
          <td><code>${escapeText(c.corporate_number)}</code></td>
          <td>${escapeText(c.name)}</td>
          <td>${escapeText(formatAddress(c))}</td>
          <td><span class="status ${escapeText(status.className)}">${escapeText(status.label)}</span></td>
        </tr>
      `;
    })
    .join('');

  root.innerHTML = `
    <section class="summary">
      <h1>検索結果</h1>
      <p>${escapeText(output.total ?? corporations.length)} 件 / page ${escapeText(output.page_number ?? 1)} of ${escapeText(output.page_size ?? 1)}</p>
    </section>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>法人番号</th>
            <th>名称</th>
            <th>本店所在地</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="hint">行を選択すると法人番号で詳細を再取得します。</p>
    ${output.next_cursor ? `<p class="next">次ページあり: <code>${escapeText(output.next_cursor)}</code></p>` : ''}
    <footer>${renderAttribution(output.attribution)}</footer>
  `;

  for (const row of Array.from(root.querySelectorAll<HTMLTableRowElement>('.result-row'))) {
    row.addEventListener('click', () => {
      const corporateNumber = row.dataset['corporateNumber'];
      if (corporateNumber !== undefined) {
        void lookupCorporate(corporateNumber);
      }
    });
  }
}

async function lookupCorporate(corporateNumber: string): Promise<void> {
  if (root === null) return;
  root.insertAdjacentHTML(
    'afterbegin',
    `<p class="loading">法人番号 ${escapeText(corporateNumber)} の詳細を取得しています...</p>`,
  );
  try {
    const result = await app.callServerTool({
      name: 'lookup_corporate_by_number',
      arguments: { corporate_numbers: [corporateNumber] },
    });
    if (result.isError) {
      root.querySelector('.loading')?.remove();
      root.insertAdjacentHTML('afterbegin', '<p class="empty">詳細取得に失敗しました。</p>');
      return;
    }
    render((result.structuredContent ?? {}) as SearchOutput);
  } catch (error) {
    root.querySelector('.loading')?.remove();
    root.insertAdjacentHTML(
      'afterbegin',
      `<p class="empty">${escapeText(error instanceof Error ? error.message : '詳細取得に失敗しました。')}</p>`,
    );
  }
}

app.onhostcontextchanged = (ctx) => {
  if (ctx.theme !== undefined) applyDocumentTheme(ctx.theme);
};

app.ontoolresult = (params) => {
  render((params.structuredContent ?? {}) as SearchOutput);
};

await app.connect();
