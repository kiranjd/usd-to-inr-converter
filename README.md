# USD to INR Converter

A Chrome extension that automatically detects USD dollar amounts on any webpage and shows the INR (Indian Rupee) conversion on hover.

https://github.com/user-attachments/assets/8a82b0c8-1fcd-487e-8a6f-5d3ad1525572

## Features

- Automatically detects dollar amounts ($100, $1,234.56, USD 50, etc.)
- Hover over any dollar amount to see instant INR conversion
- Live exchange rates from [exchangerate-api.com](https://exchangerate-api.com) (cached for 1 hour)
- Works on all websites
- Handles dynamically loaded content
- Lightweight and fast

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/kiranjd/usd-to-inr-converter.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Select the cloned folder

6. The extension is now active! Visit any page with dollar amounts and hover over them.

## Usage

1. Browse any website with USD prices
2. Dollar amounts will have a subtle dotted underline
3. Hover over any dollar amount to see the INR conversion
4. Click the extension icon to see the current exchange rate

## Files

```
usd-to-inr-converter/
├── manifest.json     # Extension configuration
├── content.js        # Main script (detects $ and shows tooltips)
├── styles.css        # Tooltip and highlight styles
├── popup.html        # Extension popup UI
├── popup.js          # Popup functionality
├── icon16.png        # Extension icon (16x16)
├── icon48.png        # Extension icon (48x48)
└── icon128.png       # Extension icon (128x128)
```

## Permissions

- `storage` - Cache exchange rates locally
- `host_permissions` for exchangerate-api.com - Fetch live rates

## API

Exchange rates are fetched from the free [Exchange Rate API](https://exchangerate-api.com). Rates are cached for 1 hour to minimize API calls.

## Browser Support

- Google Chrome
- Microsoft Edge
- Brave
- Other Chromium-based browsers

## License

MIT License - feel free to use and modify.

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
