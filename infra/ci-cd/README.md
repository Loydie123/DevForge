# DevForge CI/CD

GitHub Actions workflows are located at `/.github/workflows/`:

| Workflow | File | Trigger |
|---|---|---|
| CI (lint, typecheck, build) | `ci.yml` | Push/PR to `main`, `develop` |
| Deploy (staging + production) | `deploy.yml` | Push to `main` or manual dispatch |

## Required GitHub Secrets

| Secret | Description |
|---|---|
| `STAGING_HOST` | Staging server IP or hostname |
| `STAGING_USER` | SSH username for staging |
| `STAGING_SSH_KEY` | Private SSH key for staging |
| `PROD_HOST` | Production server IP or hostname |
| `PROD_USER` | SSH username for production |
| `PROD_SSH_KEY` | Private SSH key for production |

## CI Pipeline

```
Push → Lint → Type Check → Build → Upload Artifacts
```

## Deploy Pipeline

```
Push to main → Build Docker Images → Push to GHCR → Deploy Staging → (manual) Deploy Production
```
