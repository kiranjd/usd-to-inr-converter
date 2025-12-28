// USD to INR Currency Converter - Content Script

(function() {
  'use strict';

  let exchangeRate = null;
  let lastFetchTime = 0;
  const CACHE_DURATION = 3600000; // 1 hour in milliseconds

  // Regex to match dollar amounts: $1, $1.00, $1,234.56, $ 100, USD 100, etc.
  const dollarRegex = /(\$\s?[\d,]+(?:\.\d{2})?|\bUSD\s?[\d,]+(?:\.\d{2})?)/gi;

  // Fetch exchange rate from free API
  async function fetchExchangeRate() {
    const now = Date.now();

    // Check cache first
    if (exchangeRate && (now - lastFetchTime) < CACHE_DURATION) {
      return exchangeRate;
    }

    // Try to get cached rate from storage
    try {
      const cached = await chrome.storage.local.get(['exchangeRate', 'lastFetchTime']);
      if (cached.exchangeRate && cached.lastFetchTime && (now - cached.lastFetchTime) < CACHE_DURATION) {
        exchangeRate = cached.exchangeRate;
        lastFetchTime = cached.lastFetchTime;
        return exchangeRate;
      }
    } catch (e) {
      // Storage not available, continue with fetch
    }

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      exchangeRate = data.rates.INR;
      lastFetchTime = now;

      // Cache the rate
      try {
        await chrome.storage.local.set({ exchangeRate, lastFetchTime });
      } catch (e) {
        // Storage not available
      }

      return exchangeRate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Fallback rate if API fails
      return exchangeRate || 83.5;
    }
  }

  // Parse dollar amount from text
  function parseDollarAmount(text) {
    const cleaned = text.replace(/[$,\s]|USD/gi, '');
    return parseFloat(cleaned);
  }

  // Format INR amount
  function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Create tooltip element
  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'usd-inr-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  // Show tooltip with conversion
  async function showTooltip(event, element) {
    const tooltip = document.querySelector('.usd-inr-tooltip') || createTooltip();
    const dollarText = element.getAttribute('data-usd');
    const dollarAmount = parseDollarAmount(dollarText);

    const rate = await fetchExchangeRate();
    const inrAmount = dollarAmount * rate;

    tooltip.innerHTML = `
      <div class="usd-inr-tooltip-content">
        <div class="usd-inr-converted">${formatINR(inrAmount)}</div>
        <div class="usd-inr-rate">1 USD = ${rate.toFixed(2)} INR</div>
      </div>
    `;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
    tooltip.style.display = 'block';
  }

  // Hide tooltip
  function hideTooltip() {
    const tooltip = document.querySelector('.usd-inr-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Process a text node and wrap dollar amounts
  function processTextNode(textNode) {
    const text = textNode.textContent;
    if (!dollarRegex.test(text)) return;

    // Reset regex lastIndex
    dollarRegex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = dollarRegex.exec(text)) !== null) {
      // Check if there's whitespace before the match (can get lost in flex containers)
      const hasLeadingSpace = match.index > 0 && /\s/.test(text[match.index - 1]);
      const textBeforeEnd = hasLeadingSpace ? match.index - 1 : match.index;

      // Add text before match (excluding leading space we'll include in span)
      if (textBeforeEnd > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, textBeforeEnd)));
      }

      // Create wrapper span for the dollar amount (include leading space inside span)
      const span = document.createElement('span');
      span.className = 'usd-inr-amount';
      span.setAttribute('data-usd', match[0]);
      span.textContent = (hasLeadingSpace ? '\u00A0' : '') + match[0];
      span.addEventListener('mouseenter', (e) => showTooltip(e, span));
      span.addEventListener('mouseleave', hideTooltip);
      fragment.appendChild(span);

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // Replace the text node with our fragment
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // Walk through DOM and find text nodes
  function walkDOM(node) {
    // Skip script, style, and already processed elements
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style' || tagName === 'noscript' ||
          tagName === 'textarea' || tagName === 'input' || tagName === 'select' ||
          node.classList.contains('usd-inr-amount') || node.classList.contains('usd-inr-tooltip')) {
        return;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
      return;
    }

    // Process child nodes (make a copy of childNodes since we're modifying the DOM)
    const children = Array.from(node.childNodes);
    children.forEach(walkDOM);
  }

  // Initialize
  async function init() {
    // Pre-fetch exchange rate
    await fetchExchangeRate();

    // Process the page
    walkDOM(document.body);

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('usd-inr-tooltip')) {
            walkDOM(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
