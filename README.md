# Fundi

Find trusted local service providers in South Africa, such as plumbers, electricians, solar installers and more.
Compare listed prices and ratings, then call or WhatsApp the provider directly.

- **Plan & roadmap:** [PLAN.md](./PLAN.md)
- **Live prototype:** https://alexikleo.github.io/App-Idea/
- **Web app source:** [`web/`](./web)
- **Database (Supabase):** [`supabase/`](./supabase) · setup guide: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)

```bash
cd web && npm install && npm run dev
```

Without a Supabase project connected, the app runs in **demo mode** on sample data, and anything you add is saved in your browser only. Demo sign-in accepts any email with the code `123456`.

| Home | Provider profile |
| --- | --- |
| ![Home](docs/screenshots/home.png) | ![Provider](docs/screenshots/provider.png) |

| Quote checker | Need help now | Search |
| --- | --- | --- |
| ![Quote checker](docs/screenshots/check-result-m.png) | ![Emergency](docs/screenshots/emergency-m.png) | ![Search](docs/screenshots/search-m.png) |

| Compare | Get quotes | QR card for providers |
| --- | --- | --- |
| ![Compare](docs/screenshots/compare.png) | ![Get quotes](docs/screenshots/request-quotes.png) | ![QR card](docs/screenshots/qr-card.png) |

| Dark mode |
| --- |
| ![Dark mode](docs/screenshots/dark-home.png) |
