const LEARNING_MODE_KEY = 'learningModeEnabled';

async function getLearningMode() {
  const { [LEARNING_MODE_KEY]: enabled } = await chrome.storage.sync.get(LEARNING_MODE_KEY);
  return Boolean(enabled);
}

async function setLearningMode(enabled) {
  await chrome.storage.sync.set({ [LEARNING_MODE_KEY]: Boolean(enabled) });
  await chrome.runtime.sendMessage({ type: 'LEARNING_MODE_SET', payload: { enabled } });
}

function updateStatus(enabled) {
  const el = document.getElementById('status');
  el.textContent = `学习模式：${enabled ? '开启' : '关闭'}`;
}

document.getElementById('toggle').addEventListener('click', async () => {
  const current = await getLearningMode();
  const next = !current;
  await setLearningMode(next);
  updateStatus(next);
});

// Init
(async () => {
  const enabled = await getLearningMode();
  updateStatus(enabled);
})();


