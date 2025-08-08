// Shadow root mounting point for future UI (pomodoro etc.)
const SHADOW_HOST_ID = 'adhd-learning-shadow-host';
const STYLE_TAG_ID = 'adhd-learning-hide-style';

function ensureShadowHost() {
  if (document.getElementById(SHADOW_HOST_ID)) return;
  const host = document.createElement('div');
  host.id = SHADOW_HOST_ID;
  host.style.all = 'initial';
  host.style.position = 'fixed';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  document.documentElement.appendChild(host);
  host.attachShadow({ mode: 'open' });
}

async function loadSelectorList() {
  try {
    const url = chrome.runtime.getURL('remove_div.txt');
    const text = await fetch(url).then((r) => r.text());
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));
    return lines;
  } catch (e) {
    return [];
  }
}

function buildCssFromClasses(classNames) {
  if (!classNames.length) return '';
  const selectors = classNames.map((cn) => `.${cssEscape(cn)}`);
  // Use visibility:hidden and display:none to ensure hide; prefer display:none per spec
  return `${selectors.join(',')} { display: none !important; visibility: hidden !important; }`;
}

// Minimal CSS.escape polyfill for class names
function cssEscape(ident) {
  // Basic escape: replace spaces and special chars
  return ident.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
}

let cachedClassNames = null;

async function getHideStyleElement() {
  let style = document.getElementById(STYLE_TAG_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.type = 'text/css';
    document.documentElement.appendChild(style);
  }
  if (!cachedClassNames) {
    cachedClassNames = await loadSelectorList();
  }
  style.textContent = buildCssFromClasses(cachedClassNames);
  return style;
}

async function applyHide() {
  await getHideStyleElement();
}

function removeHide() {
  const style = document.getElementById(STYLE_TAG_ID);
  if (style) style.remove();
}

function setLearningModeDom(enabled) {
  if (enabled) {
    applyHide();
  } else {
    removeHide();
  }
}

function listenForMutations() {
  const observer = new MutationObserver(() => {
    // Re-apply style text to handle dynamic content relying on CSS selectors
    const style = document.getElementById(STYLE_TAG_ID);
    if (style && style.textContent && style.parentNode) {
      // no-op; CSS continues to apply automatically
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

async function init() {
  ensureShadowHost();
  listenForMutations();

  // Query current state
  chrome.runtime.sendMessage({ type: 'LEARNING_MODE_GET' }, (resp) => {
    const enabled = Boolean(resp && resp.enabled);
    setLearningModeDom(enabled);
  });
}

// Message channel
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'LEARNING_MODE_SET') {
    const enabled = Boolean(message.payload?.enabled);
    setLearningModeDom(enabled);
  }
});

// Start early
init();


