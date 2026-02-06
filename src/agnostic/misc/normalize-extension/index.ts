/**
 * Default mapping of file extensions to their canonical forms.
 *
 * Includes common image, audio, video, font, web, document, archive,
 * code, configuration, and miscellaneous file extensions.
 */
const defaultAliases: Record<string, string> = {
  // Images
  jpeg: 'jpg',
  jpe: 'jpg',
  jfif: 'jpg',
  pjpeg: 'jpg',
  pjp: 'jpg',

  tiff: 'tif',
  svgz: 'svg',

  // Audio
  m4a: 'aac',
  mp2: 'mp3',
  mpeg3: 'mp3',
  wave: 'wav',
  aif: 'aiff',
  aifc: 'aiff',
  opus: 'ogg',
  oga: 'ogg',

  // Video
  m4v: 'mp4',
  mpe: 'mpg',
  mpeg: 'mpg',
  ogv: 'webm',
  mov: 'qt',
  m2ts: 'ts',
  tsx: 'ts',
  mkv: 'webm', // often used similarly

  // Fonts
  truetype: 'ttf',
  opentype: 'otf',
  svgfont: 'svg',
  eotfont: 'eot',

  // Web / Source Files
  htm: 'html',
  xhtml: 'html',
  js: 'javascript',
  mjs: 'js',
  cjs: 'js',
  yml: 'yaml',
  text: 'txt',
  mdown: 'md',
  markdown: 'md',
  map: 'json',

  // Documents
  doc: 'docx',
  xls: 'xlsx',
  ppt: 'pptx',
  rtf: 'doc',
  odt: 'docx',
  ods: 'xlsx',
  odp: 'pptx',

  // Archives
  tgz: 'tar.gz',
  tbz: 'tar.bz2',
  tbz2: 'tar.bz2',
  txz: 'tar.xz',
  gz: 'gzip',
  bz2: 'bzip2',
  z: 'zip',

  // Code & Scripting
  pyw: 'py',
  ipynb: 'json',
  'c++': 'cpp',
  'h++': 'hpp',
  cc: 'cpp',
  cxx: 'cpp',
  hxx: 'hpp',
  sh: 'bash',
  bashrc: 'bash',
  zshrc: 'zsh',
  ps1: 'powershell',

  // Configuration
  env: 'conf',
  ini: 'conf',
  toml: 'conf',

  // Misc
  plist: 'xml',
  xsl: 'xml',
  xslt: 'xml',
  svgx: 'svg'
}

/**
 * Normalizes a file extension to its canonical form, using an optional alias map.
 *
 * Converts the extension to lowercase, removes a leading dot if present,
 * and applies alias mapping if defined.
 *
 * @param {string} extWithoutDot - File extension to normalize (may include or omit leading dot).
 * @param {Record<string, string>} [aliasesWithoutDot=defaultAliases] - Optional mapping of aliases to canonical extensions.
 * @returns {string} The normalized file extension, without leading dot.
 */
export function normalizeExtension (
  extWithoutDot: string,
  aliasesWithoutDot: Record<string, string> = defaultAliases
): string {
  const cleaned = extWithoutDot.toLowerCase().replace(/^\./, '')
  return aliasesWithoutDot[cleaned] ?? cleaned
}
