// Popup script for USD to INR Converter

document.addEventListener('DOMContentLoaded', async () => {
  const rateEl = document.getElementById('rate');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const refreshBtn = document.getElementById('refreshBtn');

  // Load cached rate
  async function loadRate() {
    try {
      const { exchangeRate, lastFetchTime } = await chrome.storage.local.get(['exchangeRate', 'lastFetchTime']);

      if (exchangeRate) {
        rateEl.textContent = exchangeRate.toFixed(2);
        document.querySelector('.rate-currency').textContent = `1 USD = ${exchangeRate.toFixed(2)} INR`;

        if (lastFetchTime) {
          const date = new Date(lastFetchTime);
          lastUpdatedEl.textContent = `Last updated: ${date.toLocaleString()}`;
        }
      } else {
        await fetchNewRate();
      }
    } catch (e) {
      await fetchNewRate();
    }
  }

  // Fetch new rate
  async function fetchNewRate() {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Updating...';

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const rate = data.rates.INR;
      const now = Date.now();

      await chrome.storage.local.set({
        exchangeRate: rate,
        lastFetchTime: now
      });

      rateEl.textContent = rate.toFixed(2);
      document.querySelector('.rate-currency').textContent = `1 USD = ${rate.toFixed(2)} INR`;
      lastUpdatedEl.textContent = `Last updated: ${new Date(now).toLocaleString()}`;
    } catch (error) {
      lastUpdatedEl.textContent = 'Failed to update. Try again.';
    }

    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh Rate';
  }

  // Event listeners
  refreshBtn.addEventListener('click', fetchNewRate);

  // Initial load
  await loadRate();
});
