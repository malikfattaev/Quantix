# Quantix

AI search that doesn't lie.

Web-based AI search engine: Anthropic Claude Haiku 4.5 with built-in web search, streaming answers, and verified citations.

## Structure

```
.
├── web/        Next.js 16 app (App Router, TypeScript, Tailwind v4)
│   ├── src/    Application code
│   └── public/ Static assets
├── infra/      Deployment artifacts
│   └── Dockerfile
├── railway.json
└── .dockerignore
```

## Local development

```sh
cd web
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy (Railway)

1. New Project → Deploy from GitHub repo
2. Railway reads `railway.json` and builds from `infra/Dockerfile`
3. Set environment variable: `ANTHROPIC_API_KEY`
4. Generate a public domain in Settings → Networking
