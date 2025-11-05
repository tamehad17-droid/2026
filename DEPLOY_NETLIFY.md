# Deploying promohive to Netlify (CI)

This file explains how to enable automatic CI deploys to Netlify using GitHub Actions.

1) Add repository secrets on GitHub (Repository Settings > Secrets):
   - NETLIFY_AUTH_TOKEN: your Netlify personal access token (keep secret)
   - NETLIFY_SITE_ID: (optional) the Netlify site id for your existing site; if omitted the action will deploy to the linked site for the repo or create a new one.

2) The workflow `/.github/workflows/deploy-netlify.yml` runs on push to `main`. It will:
   - install dependencies with `pnpm`
   - run `pnpm run build` (produces the `build/` folder)
   - deploy the `build/` folder to Netlify using `netlify-cli` and the token in `NETLIFY_AUTH_TOKEN`.

3) Local convenience scripts were added to `package.json`:
   - `pnpm run ci:build` — install deps and build
   - `pnpm run deploy:netlify` — deploy built `build/` folder to Netlify (requires `NETLIFY_AUTH_TOKEN` or a linked site)
   - `pnpm run deploy:preview` — deploy a non-prod preview using the same CLI

Notes
-----
- Make sure the `NETLIFY_AUTH_TOKEN` secret is set in the repository secrets. On Netlify, you can create a personal access token at https://app.netlify.com/user/applications#personal-access-tokens
- If you prefer Netlify to build on its side (instead of using GitHub Actions), make sure `netlify.toml` publish directory is `build` (already updated) and configure Netlify to connect to this GitHub repository.
