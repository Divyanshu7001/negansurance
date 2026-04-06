# Negansurance Backend API

FastAPI application that orchestrates public policy, claim, trigger, payout, and KYC endpoints following the domain boundaries defined in `dump/self-reference.md`.

## Module layout

- `negansurance/app.py` – application factory with security headers, request ID logging, Prometheus metrics, and router registration under `/api/v1`.
- `negansurance/core/` – configuration, middleware, metrics, and API-key based protection with rate limiting.
- `negansurance/domain/` – Pydantic models for policies, premium quotes, claims, triggers, payouts, and identity flows.
- `negansurance/services/` – service facades per bounded context: risk pricing, policy lifecycle, claim decisioning, trigger monitoring, payout orchestration, identity checks, and notifications.
- `negansurance/api/routes/` – FastAPI routers exposing each boundary (`/policies`, `/claims`, `/triggers`, `/identity`, `/payouts`) plus `/health` and `/metrics`.

## Running locally

1. Create a `.env` file at the repository root:

   ```bash
   cat <<'EOF' > .env
   NEGANSURANCE_API_KEY=local-dev-key
   SUPABASE_PASSWORD=your-real-supabase-password
   # Optional: override the database URL directly
   # DATABASE_URL=postgresql://postgres:${SUPABASE_PASSWORD}@db.nafuwfitrqrlcleuppjv.supabase.co:5432/postgres
   EOF
   ```

   By default the API composes the Supabase connection string from `SUPABASE_PASSWORD`. You can override it with `DATABASE_URL` or `SUPABASE_DB_TEMPLATE`.

2. Install dependencies and start the API:

   ```bash
   uvicorn main:app --app-dir apps/api/src --reload
   ```

Use the default API key via header `X-API-Key: local-dev-key` when hitting secured endpoints (all except `/`). Customize via `NEGANSURANCE_API_KEY` env variable.

### Trigger monitoring data sources

The `/triggers/active` endpoint now calls the shared collector under `services/trigger_monitoring`. Provide the following env vars (place them in the repo-level `.env`) so both the CLI script and FastAPI surface reuse the same credentials:

- `DATA_GOOGLE_API_KEY` – used for Google Geocoding, Weather History, and Air Quality APIs.
- `DATA_GROK_API_KEY` – optional, enables civic alert enrichment via Groq; if omitted, civic events default to `false`.

Because the API imports that root package directly, ensure the repo is launched from its root (the provided `uvicorn ... --app-dir apps/api/src` command already does so).

## Example flow

1. Request weekly premium quote: `POST /api/v1/policies/quote`.
2. Create a policy from that quote: `POST /api/v1/policies`.
3. Submit a claim tied to the policy: `POST /api/v1/claims`.
4. Queue payout for approved claims: `POST /api/v1/claims/{claim_id}/payouts`.
5. Monitor triggers, payouts, and identity/KYC endpoints as needed.
