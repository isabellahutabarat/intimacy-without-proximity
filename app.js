(() => {
  const state = {
    data: [],
    sort: { key: 'id', dir: 'asc' },
    newlyAddedId: null
  };

  const els = {
    aboutPanel: document.getElementById('aboutPanel'),
    submitPanel: document.getElementById('submitPanel'),
    aboutContent: document.getElementById('aboutContent'),
    mainColumn: document.getElementById('mainColumn'),
    siteTitle: document.getElementById('siteTitle'),
    closeAbout: document.getElementById('closeAbout'),
    table: document.getElementById('archiveTable'),
    tbody: document.getElementById('archiveTbody'),
    thButtons: () => Array.from(document.querySelectorAll('.th-btn')),
    submitBtn: document.getElementById('submitBtn'),
    closeSubmit: document.getElementById('closeSubmit'),
    scrapeBtn: document.getElementById('scrapeBtn'),
    submitForm: document.getElementById('submitForm'),
    inputUrl: document.getElementById('inputUrl'),
    inputTitle: document.getElementById('inputTitle'),
    inputAuthor: document.getElementById('inputAuthor'),
    inputYear: document.getElementById('inputYear'),
    inputDescription: document.getElementById('inputDescription')
  };

  // Apply CONFIG to CSS variables
  function applyConfig() {
    const r = document.documentElement.style;
    const c = window.CONFIG;
    r.setProperty('--font-body', c.typography.fontBody);
    r.setProperty('--font-italic', c.typography.fontItalic);
    r.setProperty('--font-size-body', `${c.typography.sizeBodyPx}px`);
    r.setProperty('--font-size-about', `${c.typography.sizeAboutPx}px`);
    r.setProperty('--color-text', c.colors.text);
    r.setProperty('--color-bg', c.colors.background);
    r.setProperty('--color-grey-bar', c.colors.greyBar);
    r.setProperty('--color-green', c.colors.green);
    r.setProperty('--page-padding-x', `${c.spacing.pagePaddingX}px`);
    r.setProperty('--row-padding-y', `${c.spacing.rowPaddingY}px`);
    r.setProperty('--cell-padding-x', `${c.spacing.cellPaddingX}px`);
    r.setProperty('--gap-date-title', `${c.spacing.gapDateTitlePx}px`);
    r.setProperty('--gap-title-author', `${c.spacing.gapTitleAuthorPx}px`);
    r.setProperty('--gap-id-date', `${c.spacing.gapIdDatePx}px`);
    r.setProperty('--title-inset-left', `${c.spacing.titleInsetLeftPx}px`);
    r.setProperty('--offset-date', `${c.spacing.offsetDatePx}px`);
    r.setProperty('--offset-title', `${c.spacing.offsetTitlePx}px`);
    r.setProperty('--offset-author', `${c.spacing.offsetAuthorPx}px`);
    r.setProperty('--line-width', `${c.spacing.lineWidthPx}px`);
    r.setProperty('--about-width', `${c.layout.aboutWidthVw}vw`);
    r.setProperty('--anim-ms', `${c.animation.durationMs}ms`);
    r.setProperty('--col-id-w', `${c.layout.colIdWidthPx}px`);
    r.setProperty('--col-year-w', `${c.layout.colYearWidthPx}px`);
    r.setProperty('--col-author-w', `${c.layout.colAuthorWidthPx}px`);
    r.setProperty('--title-col-pct', `${c.layout.titleColPercent}%`);
  }

  function getVisitedSet() {
    try {
      const raw = sessionStorage.getItem('visitedIds') || '[]';
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  }
  function setVisited(id) {
    const s = getVisitedSet();
    s.add(String(id));
    sessionStorage.setItem('visitedIds', JSON.stringify(Array.from(s)));
  }

  function compare(a, b, key) {
    if (key === 'id' || key === 'year') {
      const na = Number(a[key]);
      const nb = Number(b[key]);
      return na - nb;
    }
    return String(a[key]).localeCompare(String(b[key]), undefined, { sensitivity: 'base' });
  }

  function render() {
    const visited = getVisitedSet();
    // Sort copy of data
    const sorted = [...state.data].sort((a, b) => {
      const res = compare(a, b, state.sort.key);
      return state.sort.dir === 'asc' ? res : -res;
    });

    // Update header indicators
    els.thButtons().forEach(btn => {
      btn.removeAttribute('data-state');
      if (btn.dataset.sort === state.sort.key) {
        btn.setAttribute('data-state', state.sort.dir);
      }
    });

    // Render rows
    els.tbody.innerHTML = '';
    for (const item of sorted) {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      tr.setAttribute('tabindex', '0');
      tr.dataset.clickable = 'true';
      tr.dataset.id = String(item.id);
      if (visited.has(String(item.id))) tr.classList.add('visited');
      
      // Add highlight animation to newly added row
      if (state.newlyAddedId && String(item.id) === String(state.newlyAddedId)) {
        tr.classList.add('newly-added');
        // Clear the newlyAddedId after applying the class
        setTimeout(() => {
          state.newlyAddedId = null;
        }, 3000);
      }

      const idCell = document.createElement('td');
      idCell.className = 'cell-id';
      idCell.textContent = `[${String(item.id).padStart(2, '0')}]`;

      const yearCell = document.createElement('td');
      yearCell.className = 'cell-year';
      yearCell.textContent = String(item.year);

      const titleCell = document.createElement('td');
      titleCell.className = 'cell-title';
      if (item.url) {
        const a = document.createElement('a');
        a.href = item.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = item.title;
        titleCell.appendChild(a);
      } else {
        titleCell.textContent = item.title;
      }

      const authorCell = document.createElement('td');
      authorCell.className = 'cell-author';
      // Prefer SVG glyph if configured, else fallback to text glyph
      const svgPath = (window.CONFIG.authorGlyphSvg || '').trim();
      const svgHover = (window.CONFIG.authorGlyphSvgHover || '').trim();
      if (svgPath) {
        // Render only the white glyph - CSS filter will turn it green on hover/active
        const img = document.createElement('img');
        img.src = svgPath;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.className = 'author-glyph';
        authorCell.appendChild(img);
        const span = document.createElement('span');
        span.textContent = ` ${item.author || ''}`.trim();
        authorCell.appendChild(span);
      } else {
        const glyph = window.CONFIG.authorGlyph || '';
        const prefixed = item.author?.startsWith(glyph) ? item.author : `${glyph} ${item.author || ''}`.trim();
        authorCell.textContent = prefixed;
      }

      tr.appendChild(idCell);
      tr.appendChild(yearCell);
      tr.appendChild(titleCell);
      tr.appendChild(authorCell);
      els.tbody.appendChild(tr);

      // Click/keyboard to expand
      function onActivate(e) {
        if (e.type === 'keydown' && !['Enter', ' '].includes(e.key)) return;
        e.preventDefault?.();
        toggleExpansion(tr, item);
      }
      tr.addEventListener('click', onActivate);
      tr.addEventListener('keydown', onActivate);
    }
  }

  function toggleExpansion(row, item) {
    const existing = row.nextElementSibling;
    const isExpansion = existing && existing.classList.contains('expansion-row');
    // Collapse if already open
    if (isExpansion) {
      existing.remove();
      row.classList.remove('active-row');
      window.setupJitter && window.setupJitter();
      return;
    }
    // Otherwise open: first, close any other open expansion and active row
    const open = els.tbody.querySelector('.expansion-row');
    if (open) open.previousElementSibling?.classList.remove('active-row');
    if (open) open.remove();

    // Mark visited
    setVisited(item.id);
    row.classList.add('visited');
    row.classList.add('active-row');

    const tr = document.createElement('tr');
    tr.className = 'expansion-row';
    const td = document.createElement('td');
    td.colSpan = 4;

    const wrap = document.createElement('div');
    wrap.className = 'expand-wrap';
    const content = document.createElement('div');
    content.className = 'expand-content';
    const desc = document.createElement('p');
    desc.className = 'expand-description';
    const descText = (item.description || '').trim();
    const titleText = (item.title || '').trim();
    const showDesc = descText && descText.toLowerCase() !== titleText.toLowerCase();
    if (showDesc) desc.textContent = descText;
    const link = document.createElement('div');
    link.className = 'expand-link';
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = item.url;
      link.appendChild(a);
    }

    if (showDesc) content.appendChild(desc);
    if (item.url) content.appendChild(link);

    wrap.appendChild(document.createElement('div')); // grid col 1 spacer
    wrap.appendChild(document.createElement('div')); // grid col 2 spacer
    wrap.appendChild(content);

    const imgCol = document.createElement('div');
    imgCol.className = 'expand-image';
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title ? `Image for ${item.title}` : 'Image';
      imgCol.appendChild(img);
    }
    wrap.appendChild(imgCol);

    td.appendChild(wrap);
    tr.appendChild(td);
    row.insertAdjacentElement('afterend', tr);
    requestAnimationFrame(() => tr.classList.add('show'));
    // Re-seed jitter to include new expansion text
    window.setupJitter && window.setupJitter();
  }

  // Sorting
  function onSortClick(e) {
    const key = e.currentTarget.dataset.sort;
    if (state.sort.key === key) {
      state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.key = key;
      state.sort.dir = 'asc';
    }
    render();
  }

  // About panel toggle with typewriter
  function toggleAbout() {
    const isOpen = els.aboutPanel.classList.contains('open');
    if (isOpen) {
      // Blur any focused element inside the panel to avoid aria-hidden warning
      if (els.aboutPanel.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      els.aboutPanel.classList.remove('open');
      els.siteTitle.setAttribute('aria-expanded', 'false');
      els.aboutPanel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('about-open');
      // re-seed jitter after layout change
      window.setupJitter && window.setupJitter();
    } else {
      els.aboutPanel.classList.add('open');
      els.siteTitle.setAttribute('aria-expanded', 'true');
      els.aboutPanel.setAttribute('aria-hidden', 'false');
      document.body.classList.add('about-open');
      // re-seed jitter after layout change
      window.setupJitter && window.setupJitter();
    }
  }

  // Close About panel (for X button)
  function closeAbout() {
    // Blur any focused element inside the panel to avoid aria-hidden warning
    if (els.aboutPanel.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    els.aboutPanel.classList.remove('open');
    els.siteTitle.setAttribute('aria-expanded', 'false');
    els.aboutPanel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('about-open');
    window.setupJitter && window.setupJitter();
  }

  // Submit panel toggle
  function toggleSubmit() {
    const isOpen = els.submitPanel.classList.contains('open');
    if (isOpen) {
      closeSubmit();
    } else {
      openSubmit();
    }
  }
  
  function openSubmit() {
    document.body.classList.add('submit-open');
    els.submitPanel.classList.add('open');
    els.submitPanel.setAttribute('aria-hidden', 'false');
    els.submitBtn.setAttribute('aria-expanded', 'true');
    // Don't auto-focus to prevent keyboard from showing on mobile
  }
  function closeSubmit() {
    // Blur any focused element inside the panel to avoid aria-hidden warning
    if (els.submitPanel.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    document.body.classList.remove('submit-open');
    els.submitPanel.classList.remove('open');
    els.submitPanel.setAttribute('aria-hidden', 'true');
    els.submitBtn.setAttribute('aria-expanded', 'false');
    els.submitForm.reset();
  }

  /**
   * Scrapes metadata from a URL using a CORS proxy
   * 
   * How it works:
   * 1. Uses AllOrigins.win as a CORS proxy to fetch the page HTML
   * 2. Parses the HTML with DOMParser
   * 3. Extracts Open Graph tags (og:title, og:description, etc.)
   * 4. Falls back to standard meta tags and page title
   * 5. Returns structured metadata for form population
   * 
   * Resources:
   * - Open Graph Protocol: https://ogp.me/
   * - DOMParser API: https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
   * - AllOrigins CORS Proxy: https://github.com/gnuns/allorigins
   */
  async function scrapeMetadata(url) {
    try {
      // Use CORS proxy to fetch the page
      // Try corsproxy.io which tends to be more reliable
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      // corsproxy.io returns HTML directly (not JSON)
      const html = await response.text();
      
      // Parse the HTML using DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Helper function to get meta tag content
      const getMeta = (name) => {
        // Try Open Graph tags first (og:title, og:description, etc.)
        let tag = doc.querySelector(`meta[property="${name}"]`);
        if (tag) return tag.getAttribute('content');
        
        // Try Twitter Card tags (twitter:title, twitter:description, etc.)
        tag = doc.querySelector(`meta[name="${name}"]`);
        if (tag) return tag.getAttribute('content');
        
        return null;
      };
      
      // Extract metadata with fallbacks
      const title = getMeta('og:title') || 
                   getMeta('twitter:title') || 
                   doc.querySelector('title')?.textContent || 
                   '';
      
      let description = getMeta('og:description') || 
                         getMeta('twitter:description') || 
                         getMeta('description') || 
                         '';
      
      const image = getMeta('og:image') || 
                   getMeta('twitter:image') || 
                   '';
      
      // Try to extract author from meta tags, JSON-LD, or common selectors
      let author = getMeta('author') || 
                  getMeta('article:author') || 
                  '';
      
      // Try to extract year from published date
      let year = '';
      
      // Try JSON-LD structured data for better metadata
      const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        try {
          const jsonLd = JSON.parse(jsonLdScript.textContent);
          // Handle both single objects and arrays
          const data = Array.isArray(jsonLd) ? jsonLd[0] : jsonLd;
          
          if (data.author && !author) {
            author = typeof data.author === 'string' ? data.author : data.author.name;
          }
          if (data.datePublished && !year) {
            const yearMatch = data.datePublished.match(/(\d{4})/);
            if (yearMatch) year = yearMatch[1];
          }
          if (data.description && !description) {
            description = data.description;
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD:', e);
        }
      }
      
      // Extract year from meta tags if not found in JSON-LD
      const publishedDate = getMeta('article:published_time') || 
                          getMeta('published_time') || 
                          getMeta('date') ||
                          getMeta('datePublished');
      if (publishedDate) {
        const yearMatch = publishedDate.match(/(\d{4})/);
        if (yearMatch) year = yearMatch[1];
      }
      
      // Additional fallback: look for common patterns in the page
      if (!author) {
        const authorEl = doc.querySelector('[class*="author"], [itemprop="author"]');
        if (authorEl) author = authorEl.textContent.trim();
      }
      if (!year) {
        const dateEl = doc.querySelector('[class*="date"], [class*="published"], time');
        if (dateEl) {
          const text = dateEl.textContent || dateEl.getAttribute('datetime') || '';
          const yearMatch = text.match(/(\d{4})/);
          if (yearMatch) year = yearMatch[1];
        }
      }
      
      // AGGRESSIVE FALLBACK: Search page text for patterns
      const bodyText = doc.body ? doc.body.textContent : '';
      
      // Look for "Author: Name" or "Author/Editor: Name" pattern
      if (!author && bodyText) {
        const authorPatterns = [
          /Author:\s*([^\n]{3,80}?)(?:\n|$)/i,
          /By\s+([A-Z][a-z]+(?:\s+[A-Z][.]?\s*)?[A-Z][a-z]+)/,
          /Author\/Editor\s*(?:Bios)?:\s*([^\n]{3,80}?)(?:\n|Back to Top)/i
        ];
        for (const pattern of authorPatterns) {
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            author = match[1].trim();
            // Clean up common suffixes
            author = author.replace(/\s*Back to Top.*/i, '').trim();
            break;
          }
        }
      }
      
      // Look for "Published: Month Year" pattern
      if (!year && bodyText) {
        const pubMatch = bodyText.match(/Published:\s*(\w+\s+)?(\d{4})/i);
        if (pubMatch && pubMatch[2]) {
          year = pubMatch[2];
        }
      }
      
      // Enhanced description fallback: look for article content
      if (!description) {
        // Try article-specific selectors first
        const articleSelectors = [
          'article p',
          '[class*="content"] p',
          '[class*="article"] p',
          '[class*="body"] p',
          '[class*="post"] p',
          'main p',
          '.entry-content p',
          '#content p'
        ];
        
        for (const selector of articleSelectors) {
          const paragraphs = Array.from(doc.querySelectorAll(selector));
          for (const p of paragraphs) {
            const text = p.textContent.trim();
            // Look for substantial paragraphs that look like article content
            // Skip navigation, buttons, short snippets, copyright, dates
            if (text.length > 80 && 
                text.length < 2000 && 
                !text.match(/^(Copyright|©|\d{4}|Subscribe|Sign up|Click|Read more)/i) &&
                !text.match(/^(Home|About|Contact|Menu|Navigation)/i)) {
              description = text;
              break;
            }
          }
          if (description) break;
        }
        
        // If still no description, try any substantial paragraph as last resort
        if (!description) {
          const allParagraphs = Array.from(doc.querySelectorAll('p'));
          for (const p of allParagraphs) {
            const text = p.textContent.trim();
            if (text.length > 100 && 
                text.length < 2000 && 
                !text.match(/^(Copyright|©|\d{4}|Subscribe|Sign up|Click|Read|Menu|Home|About)/i)) {
              description = text;
              break;
            }
          }
        }
      }
      
      // Clean and validate year - must be exactly 4 digits
      let cleanYear = year.trim();
      const yearMatch = cleanYear.match(/(\d{4})/);
      if (yearMatch) {
        cleanYear = yearMatch[1]; // Extract just the 4 digits
      } else {
        cleanYear = ''; // If no valid 4-digit year found, leave empty
      }
      
      return {
        title: title.trim(),
        author: author.trim(),
        year: cleanYear,
        description: description.trim()
      };
      
    } catch (error) {
      console.warn('Metadata scraping failed:', error);
      // Return empty object so user can manually enter data
      return {
        title: '',
        author: '',
        year: '',
        description: ''
      };
    }
  }

  function nextId() {
    return (Math.max(0, ...state.data.map(d => Number(d.id) || 0)) + 1);
  }

  // LocalStorage management for user-submitted items
  const STORAGE_KEY = 'userSubmittedItems';
  const MAX_REFRESHES = 5;

  function saveUserItem(item) {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    stored.push({
      item: item,
      refreshCount: 0,
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  function loadUserItems() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return stored.map(entry => entry.item);
  }

  function incrementRefreshCounts() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = stored
      .map(entry => ({
        ...entry,
        refreshCount: entry.refreshCount + 1
      }))
      .filter(entry => entry.refreshCount < MAX_REFRESHES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated.map(entry => entry.item);
  }

  /**
   * Typewriter effect: types text into an input/textarea character by character
   * @param {HTMLElement} element - The input or textarea element
   * @param {string} text - The text to type
   * @param {number} speed - Milliseconds per character (default: 30)
   * @returns {Promise} Resolves when typing is complete
   */
  function typewriterEffect(element, text, speed = 30) {
    return new Promise((resolve) => {
      if (!text) {
        element.value = '';
        resolve();
        return;
      }
      
      element.value = '';
      let index = 0;
      
      const typeNextChar = () => {
        if (index < text.length) {
          element.value += text[index];
          index++;
          setTimeout(typeNextChar, speed);
        } else {
          resolve();
        }
      };
      
      typeNextChar();
    });
  }

  /**
   * Populates multiple fields sequentially with typewriter effect
   * @param {Array} fields - Array of {element, text} objects
   */
  async function typewriterPopulate(fields) {
    for (const field of fields) {
      if (field.text) {
        await typewriterEffect(field.element, field.text);
      }
    }
  }

  function bindEvents() {
    els.siteTitle.addEventListener('click', toggleAbout);
    els.closeAbout.addEventListener('click', closeAbout);
    els.thButtons().forEach(btn => {
      btn.addEventListener('click', onSortClick);
      btn.addEventListener('keydown', e => {
        if (['Enter', ' '].includes(e.key)) {
          e.preventDefault();
          onSortClick({ currentTarget: btn });
        }
      });
    });
    // Submit overlay
    els.submitBtn.addEventListener('click', toggleSubmit);
    els.closeSubmit.addEventListener('click', closeSubmit);
    els.scrapeBtn.addEventListener('click', async () => {
      const url = els.inputUrl.value.trim();
      if (!url) return;
      
      // Disable button during scraping
      els.scrapeBtn.disabled = true;
      els.scrapeBtn.textContent = 'fetching...';
      
      const meta = await scrapeMetadata(url);
      
      // Reset button
      els.scrapeBtn.disabled = false;
      els.scrapeBtn.textContent = 'fetch metadata';
      
      // Populate fields with typewriter effect
      // Only include year if it's a valid 4-digit year
      await typewriterPopulate([
        { element: els.inputTitle, text: meta.title },
        { element: els.inputAuthor, text: meta.author },
        { element: els.inputYear, text: meta.year || '' }, // Already validated as 4 digits or empty
        { element: els.inputDescription, text: meta.description }
      ]);
    });
    els.submitForm.addEventListener('submit', e => {
      e.preventDefault();
      const newId = nextId();
      const item = {
        id: newId,
        year: (els.inputYear.value || '').trim(),
        title: (els.inputTitle.value || '').trim() || (els.inputUrl.value || '').trim(),
        author: (els.inputAuthor.value || '').trim(),
        description: (els.inputDescription.value || '').trim(),
        url: (els.inputUrl.value || '').trim(),
        image: '',
        visited: false
      };
      state.data.push(item);
      saveUserItem(item); // Save to localStorage for persistence
      state.newlyAddedId = newId; // Mark this item for highlight animation
      closeSubmit();
      render();
      
      // Scroll to bottom to show the newly added item
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 300); // Wait for render and panel close animation
    });
  }

  async function init() {
    applyConfig();
    bindEvents();
    setupJitter();
    
    // Load main dataset
    try {
      const res = await fetch(window.CONFIG.data.url, { cache: 'no-store' });
      state.data = await res.json();
    } catch (e) {
      console.warn('Failed to load dataset; using empty list.', e);
      state.data = [];
    }
    
    // Load and merge user-submitted items (increment refresh count)
    const userItems = incrementRefreshCounts();
    state.data = [...state.data, ...userItems];
    
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// --- Jitter text effect (span wrapping + subtle offsets) ---
(function jitterModule() {
  const targets = [];
  let rafId = null;
  let seeds = [];
  const freq = 0.0022; // frequency of oscillation
  const amp = 1.6; // base amplitude in px

  function wrapTextNodes(rootOrList, group = 'default') {
    if (!rootOrList) return [];
    const roots = Array.isArray(rootOrList) ? rootOrList : [rootOrList];
    const spans = [];
    for (const root of roots) {
      if (!root) continue;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement && node.parentElement.closest('.jitter-char')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      for (const node of textNodes) {
        const frag = document.createDocumentFragment();
        const chars = node.textContent.split('');
        chars.forEach((ch, idx) => {
          const span = document.createElement('span');
          span.className = 'jitter-char';
          span.textContent = ch;
          span.dataset.seed = `${Math.random() * 1000}-${idx}`;
          span.dataset.group = group;
          frag.appendChild(span);
          spans.push(span);
        });
        node.parentNode.replaceChild(frag, node);
      }
    }
    return spans;
  }

  function sampleSeed(span) {
    const seed = span.dataset.seed || '0';
    // simple hash to get deterministic offsets
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return h;
  }

  function ensureSeeds(spans) {
    seeds = spans.map(span => {
      const h = sampleSeed(span);
      return {
        span,
        group: span.dataset.group || 'default',
        sx: (h % 17) / 17,
        sy: ((h >> 3) % 17) / 17
      };
    });
  }

  function tick(ts) {
    const t = ts || performance.now();
    for (const { span, sx, sy, group } of seeds) {
      const mult =
        group === 'about' ? 2.0 :
        group === 'expand' ? 1.6 :
        1.2;
      const viewScale = Math.min(window.innerWidth || 1200, 1600) / 1600;
      const dx = Math.sin(t * freq + sx * Math.PI * 2) * amp * mult * viewScale;
      const dy = Math.cos(t * freq * 1.2 + sy * Math.PI * 2) * amp * mult * viewScale;
      span.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  // Disabled jitter: no-op
  function setupJitter() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.setupJitter = setupJitter;
})();


