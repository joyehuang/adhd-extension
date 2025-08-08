const LEARNING_MODE_KEY = 'learningModeEnabled';

async function getLearningMode() {
  const { [LEARNING_MODE_KEY]: enabled } = await chrome.storage.sync.get(LEARNING_MODE_KEY);
  return Boolean(enabled);
}

async function setLearningMode(enabled) {
  await chrome.storage.sync.set({ [LEARNING_MODE_KEY]: Boolean(enabled) });
  await broadcastLearningMode(enabled);
}

async function broadcastLearningMode(enabled) {
  const tabs = await chrome.tabs.query({ url: ['https://*.bilibili.com/*'] });
  await Promise.allSettled(
    tabs.map((tab) =>
      tab.id ? chrome.tabs.sendMessage(tab.id, { type: 'LEARNING_MODE_SET', payload: { enabled } }).catch(() => {}) : undefined
    )
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  const enabled = await getLearningMode();
  await setLearningMode(Boolean(enabled));
});

chrome.action.onClicked.addListener(async () => {
  const current = await getLearningMode();
  await setLearningMode(!current);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-learning-mode') {
    const current = await getLearningMode();
    await setLearningMode(!current);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'LEARNING_MODE_GET') {
    getLearningMode().then((enabled) => sendResponse({ enabled }));
    return true; // async
  }
  if (message?.type === 'LEARNING_MODE_SET') {
    const enabled = Boolean(message.payload?.enabled);
    setLearningMode(enabled).then(() => sendResponse({ ok: true }));
    return true; // async
  }
});


