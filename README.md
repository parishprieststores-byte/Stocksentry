# StockSentry PWA

A lightweight, mobile-first inventory Progressive Web App.

## Included
- Add/edit/delete inventory items
- Stock increase/decrease controls
- Low-stock alerts
- Expiry alerts
- Stock movement log
- CSV export
- Online/offline indicator
- Local browser storage
- PWA install metadata
- Service worker for offline use

## GitHub Pages
1. Create a GitHub repository.
2. Upload all files while preserving the `icons/` folder.
3. Go to Settings → Pages.
4. Select Deploy from branch → `main` → `/ (root)`.
5. Save and wait for GitHub to publish the site.

## Updating
After changing files, update the service-worker cache version in `sw.js` (for example `stocksentry-v2`) so browsers fetch the new app assets.
