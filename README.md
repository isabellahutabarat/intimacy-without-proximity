## Intimacy Without Proximity — Archive Website

Desktop-first, brutalist, text-focused archive with sortable table, expandable rows, slide-in About panel, and a Submit overlay that can fetch metadata (via optional serverless endpoint) or accept manual entry.

### Getting started
1. Use a local web server (e.g., VS Code Live Server) and open `index.html`.
2. Initial data lives in `data/data.json`. Replace with your dataset (same schema).
3. Global styling and behavior tokens are in `config.js`. Adjust values there only.

### Configuration (edit `config.js`)
- `typography`: fonts and sizes (body 18px, about 28px by default)
- `colors`: black/white palette and the green underline/hover color
- `spacing`: page/table paddings and 1px line width
- `layout`: About panel width (as viewport percentage) and column widths
- `animation`: durations and typewriter speed
- `authorGlyph`: three-dot glyph that prefixes Author cells
- `data.url`: path to dataset JSON
- `submit.scraperEndpoint`: optional serverless URL for metadata scraping

### Fonts and glyph
- EB Garamond Italic is loaded from Google Fonts for interaction states.
- ABC Diatype is self-hosted via `@font-face` (Regular + Regular Italic) pointing to `ABC Diatype copy 2/`. Adjust if your filenames differ.
- Three-dot glyph uses `3dot-glyph.svg`. Change or remove via `config.js`.

### Accessibility
- Keyboard sorting: focus headers and press Enter/Space.
- Row expand/collapse: focus any row and press Enter/Space.
- Visited state is kept per session using `sessionStorage`.

### Submit overlay and metadata
- Click “submit” to open. Enter a URL, click “fetch metadata” (if `scraperEndpoint` is configured) or edit fields manually.
- On submit, the entry is appended in-memory and re-rendered (no persistence by default).

### Serverless scraping (optional)
To enable metadata fetching for arbitrary URLs (bypassing browser CORS), provide a serverless endpoint in `config.js`:
```text
submit: { scraperEndpoint: 'https://your-domain/.netlify/functions/scrape' }
```
The endpoint should return JSON like:
```json
{ "title": "", "author": "", "year": "", "description": "", "image": "" }
```
Populate these by reading Open Graph tags, standard `<meta>` tags, and fallbacks (page `<title>`, first `<h1>`, etc.).

### Data schema
```json
{
  "id": 1,
  "year": "2021",
  "title": "Example Title",
  "author": "Author Name",
  "description": "Abstract/intro text...",
  "url": "https://example.com",
  "image": "optional-image.jpg",
  "visited": false
}
```

### Notes
- 18px page padding on all sides; 7px text padding above/below between row lines; no outer borders.
- Header and rows are aligned using consistent paddings controlled by `config.js`:
  - `gapIdDatePx`, `gapDateTitlePx`, `titleInsetLeftPx`, `gapTitleAuthorPx`.


