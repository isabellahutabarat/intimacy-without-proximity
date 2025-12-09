/* Global configuration: tweak values here without touching core code */
/* These values are applied to CSS variables at runtime by app.js */
window.CONFIG = {
  typography: {
    fontBody: '"ABC Diatype", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontItalic: '"EB Garamond", serif',
    sizeBodyPx: 17,
    sizeAboutPx: 28
  },
  colors: {
    text: '#ffffff',
    background: '#000000',
    green: '#00ff00',
    greyBar: '#3a3a3a'
  },
  spacing: {
    pagePaddingX: 18, // px (also used vertically)
    rowPaddingY: 9, // px from lines to top/bottom of text (increased for more breathing room)
    cellPaddingX: 12, // px horizontal padding between date/title/author
    gapDateTitlePx: 87, // exact gap between Date and Title
    gapTitleAuthorPx: 150, // space between Title and Author
    gapIdDatePx: 87, // exact gap between # and Date
    titleInsetLeftPx: 0, // no extra inset on Title start
    offsetDatePx: 0, // add left offset for Date column without changing width
    offsetTitlePx: 25, // add left offset for Title column without changing width
    offsetAuthorPx: 180, // add left offset for Author column without changing Title width
    lineWidthPx: 0.5 // Lighter line weight
  },
  layout: {
    aboutWidthVw: 25, // percent of viewport widthno
    colIdWidthPx: 150, // standard ID width
    colYearWidthPx: 150,
    colAuthorWidthPx: 250,
    titleColPercent: 40 // percent of table width for Title column
  },
  animation: {
    durationMs: 280,
    typewriterMsPerChar: 8
  },
  // Three-dot glyph settings (using white glyph)
  authorGlyphSvg: './WHITE3dot-glyph.svg',
  authorGlyphSvgHover: './greenglyph.svg',
  authorGlyph: '⋯',
  data: {
    url: './data/data.json'
  },
  submit: {
    scraperEndpoint: '' // optional serverless function URL
  }
};


