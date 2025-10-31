const API_BASE = 'http://localhost:5000';

interface MovieShort {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster?: string;
}

interface SearchResponse {
    Response: "True" | "False";
    Search?: MovieShort[];
    totalResults?: string;
    totalPages?: number;
    Error?: string;
}

interface DetailsResponse {
    Response: "True" | "False";
    Title?: string;
    Year?: string;
    imdbID?: string;
    Type?: string;
    Poster?: string;
    Released?: string;
    Genre?: string;
    Country?: string;
    Director?: string;
    Writer?: string;
    Actors?: string;
    Awards?: string;
    Plot?: string;
    imdbRating?: string;
    Error?: string;
}

const qInput = document.getElementById('q') as HTMLInputElement;
const typeSelect = document.getElementById('type') as HTMLSelectElement;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;
const resultsEl = document.getElementById('results') as HTMLElement;
const paginationEl = document.getElementById('pagination') as HTMLElement;
const modalRoot = document.getElementById('modalRoot') as HTMLElement;

const state = {
    q: '' as string,
    type: '' as string,
    page: 1 as number,
    totalPages: 0 as number,
    totalResults: 0 as number
};

function buildUrlSearch(q: string, type: string, page: number): string {
    const params = new URLSearchParams();
    params.set('q', q ?? '');
    if (type) params.set('type', type);
    params.set('page', String(page));
    return `${API_BASE}/api/search?${params.toString()}`;
}

function buildUrlDetails(id: string): string {
    return `${API_BASE}/api/details?id=${encodeURIComponent(id)}`;
}

function safeField<T = string>(obj: any, ...keys: string[]): T | undefined {
    for (const k of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== null && obj[k] !== undefined) {
            return obj[k] as T;
        }
    }
    return undefined;
}

function renderResults(list: MovieShort[] | undefined): void {
    resultsEl.innerHTML = '';
    if (!list || list.length === 0) {
        resultsEl.innerHTML = `<p class="small-muted">No results</p>`;
        return;
    }

    for (const item of list) {
        const poster = safeField<string>(item, 'Poster') ?? 'N/A';
        const type = safeField<string>(item, 'Type') ?? 'unknown';
        const title = safeField<string>(item, 'Title') ?? '—';
        const year = safeField<string>(item, 'Year') ?? '—';
        const imdbID = safeField<string>(item, 'imdbID') ?? '';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
      <div class="poster">
        ${poster !== 'N/A' ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(title)} poster">` : `<div class="small-muted">No poster</div>`}
      </div>
      <div class="meta">
        <div class="small-muted">${escapeHtml(type)}</div>
        <div class="title">${escapeHtml(title)}</div>
        <div class="year">${escapeHtml(year)}</div>
        <button class="details-btn" data-id="${escapeHtml(imdbID)}">Details</button>
      </div>
    `;
        resultsEl.appendChild(card);
    }
}

function renderPagination(): void {
    paginationEl.innerHTML = '';
    if (state.totalPages <= 1) return;

    const createBtn = (text: string, page: number, active = false, disabled = false): HTMLButtonElement => {
        const btn = document.createElement('button');
        btn.textContent = text;
        if (active) btn.classList.add('active');
        if (disabled) btn.disabled = true;
        btn.dataset.page = String(page);
        return btn;
    };

    const prev = createBtn('<<', Math.max(1, state.page - 1), false, state.page === 1);
    paginationEl.appendChild(prev);

    const maxButtons = 7;
    let start = Math.max(1, state.page - Math.floor(maxButtons / 2));
    let end = Math.min(state.totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

    for (let p = start; p <= end; p++) {
        const btn = createBtn(String(p), p, p === state.page);
        paginationEl.appendChild(btn);
    }

    const next = createBtn('>>', Math.min(state.totalPages, state.page + 1), false, state.page === state.totalPages);
    paginationEl.appendChild(next);
}

async function doSearch(q = '', type = '', page = 1): Promise<void> {
    resultsEl.innerHTML = `<p class="small-muted">Loading...</p>`;
    try {
        const url = buildUrlSearch(q.trim(), type, page);
        const res = await fetch(url);
        const data = (await res.json()) as SearchResponse;

        if (data.Response === "False") {
            state.totalResults = 0;
            state.totalPages = 0;
            renderResults([]);
            paginationEl.innerHTML = `<p class="small-muted">${escapeHtml(data.Error ?? 'Error')}</p>`;
            return;
        }

        state.q = q;
        state.type = type;
        state.page = page;
        state.totalResults = Number.parseInt(data.totalResults ?? '0', 10);
        state.totalPages = Math.ceil(state.totalResults / 10) || (data.totalPages ?? 1);

        renderResults(data.Search ?? []);
        renderPagination();
    } catch (err) {
        console.error('Search error:', err);
        resultsEl.innerHTML = `<p class="small-muted">Error: ${(err as Error).message}</p>`;
        paginationEl.innerHTML = '';
    }
}

async function showDetails(imdbID: string): Promise<void> {
    modalRoot.innerHTML = '';
    modalRoot.setAttribute('aria-hidden', 'false');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="left">
        <div class="poster" id="modalPoster">Loading poster...</div>
      </div>
      <div class="right">
        <button class="close-btn" id="closeModal" aria-label="Close modal">Close</button>
        <div id="modalContent">Loading...</div>
      </div>
    </div>
  `;
    modalRoot.appendChild(backdrop);
    modalRoot.classList.remove('hidden');

    const closeBtn = document.getElementById('closeModal') as HTMLButtonElement | null;
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
    backdrop.addEventListener('click', (ev) => { if (ev.target === backdrop) closeModal(); });

    try {
        const res = await fetch(buildUrlDetails(imdbID));
        const data = (await res.json()) as DetailsResponse;

        const poster = safeField<string>(data, 'Poster') ?? 'N/A';
        const title = safeField<string>(data, 'Title') ?? '—';

        const modalPoster = document.getElementById('modalPoster') as HTMLElement;
        const modalContent = document.getElementById('modalContent') as HTMLElement;

        if (modalPoster) {
            modalPoster.innerHTML = poster !== 'N/A'
                ? `<img src="${escapeHtml(poster)}" alt="${escapeHtml(title)} poster">`
                : `<div class="small-muted">No poster</div>`;
        }

        if (modalContent) {
            modalContent.innerHTML = `
        <h3>${escapeHtml(title)}</h3>
        <p class="small-muted">Released: ${escapeHtml(safeField<string>(data, 'Released') ?? '—')}</p>
        <p><strong>Genre:</strong> ${escapeHtml(safeField<string>(data, 'Genre') ?? '—')}</p>
        <p><strong>Country:</strong> ${escapeHtml(safeField<string>(data, 'Country') ?? '—')}</p>
        <p><strong>Director:</strong> ${escapeHtml(safeField<string>(data, 'Director') ?? '—')}</p>
        <p><strong>Writer:</strong> ${escapeHtml(safeField<string>(data, 'Writer') ?? '—')}</p>
        <p><strong>Actors:</strong> ${escapeHtml(safeField<string>(data, 'Actors') ?? '—')}</p>
        <p><strong>Awards:</strong> ${escapeHtml(safeField<string>(data, 'Awards') ?? '—')}</p>
        <p><strong>Plot:</strong> ${escapeHtml(safeField<string>(data, 'Plot') ?? '—')}</p>
        <p><strong>IMDb Rating:</strong> ${escapeHtml(safeField<string>(data, 'imdbRating') ?? '—')}</p>
      `;
        }
    } catch (err) {
        console.error('Details error:', err);
        const modalContent = document.getElementById('modalContent') as HTMLElement | null;
        if (modalContent) modalContent.innerHTML = `<p class="small-muted">Error: ${(err as Error).message}</p>`;
    }

    function closeModal(): void {
        modalRoot.classList.add('hidden');
        modalRoot.innerHTML = '';
        modalRoot.setAttribute('aria-hidden', 'true');
    }
}

searchBtn.addEventListener('click', () => {
    const q = qInput.value;
    const type = typeSelect.value;
    void doSearch(q, type, 1);
});

qInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchBtn.click(); });

paginationEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    if (!btn) return;
    const page = Number(btn.dataset.page);
    if (page && page !== state.page) {
        void doSearch(state.q, state.type, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

resultsEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.details-btn') as HTMLButtonElement | null;
    if (!btn) return;
    const id = btn.dataset.id;
    if (id) void showDetails(id);
});

let typingTimer: number | undefined;
qInput.addEventListener('input', () => {
    if (typingTimer) window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => {
        void doSearch(qInput.value.trim(), typeSelect.value, 1);
    }, 600);
});

document.addEventListener('DOMContentLoaded', () => {
    void doSearch('', '', 1);
});

function escapeHtml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}