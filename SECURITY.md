# Security Policy

## Supported Versions

FOG Platform is currently in active development. Security fixes are applied to
the latest release only.

| Version | Supported |
| ------- | --------- |
| Latest (`main`) | ✅ |
| Older commits | ❌ |

---

## Scope

The following are **in scope** for security reports:

- Authentication and session handling (JWT tokens, Firebase Auth)
- Prayer request and member data privacy (unauthorised access or data leakage)
- Admin privilege escalation (accessing admin routes as a regular user)
- SQL injection or ORM misuse in the FastAPI backend
- Exposed secrets or credentials in the repository or API responses
- CORS or CSRF weaknesses in the API
- Insecure file upload handling (path traversal, unrestricted file types)

The following are **out of scope**:

- Vulnerabilities in third-party services (Firebase, Railway, Cloudflare R2)
  — report those to the respective vendor
- Denial-of-service attacks (rate limiting is handled at the infrastructure level)
- Issues already documented in `docs/KNOWN_ISSUES.md`

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**
Doing so exposes the flaw to everyone before it can be fixed.

Instead, report privately via one of the following:

1. **GitHub private security advisory** *(preferred)*  
   Go to **Security → Report a vulnerability** on this repository.  
   This creates an encrypted, private thread between you and the maintainers.

2. **Email**  
   Send details to **security@familyofgreatness.com** with the subject line  
   `[FOG Security] <brief description>`.

### What to include

A useful report includes:

- A clear description of the vulnerability and what it allows an attacker to do
- Step-by-step reproduction steps (curl commands, screenshots, or a short script)
- The affected endpoint, file, or component
- Your assessment of severity (Critical / High / Medium / Low) and why

### What to expect

| Timeline | What happens |
| -------- | ------------ |
| Within **48 hours** | You receive an acknowledgement confirming the report was received |
| Within **7 days** | Initial triage: confirmed, duplicate, or out of scope |
| Within **30 days** | A fix is deployed for confirmed Critical/High issues |
| After fix is deployed | You are credited in the release notes (unless you prefer to remain anonymous) |

If a report is **accepted**, we will coordinate a disclosure date with you —
typically 90 days after the fix ships, or sooner if both parties agree.

If a report is **declined**, we will explain why clearly. You are welcome to
disagree and discuss further.

---

## Responsible Disclosure

We ask that you:

- Give us a reasonable amount of time to fix the issue before public disclosure
- Do not access, modify, or delete real user data while testing
- Do not disrupt the service for other users

We commit to:

- Responding promptly and keeping you informed throughout
- Not taking legal action against researchers acting in good faith
- Crediting you publicly for your contribution (with your consent)

---

## Known Hardening Steps in Progress

These are documented weaknesses we are actively working on — you do not need
to report them:

- Pydantic v2 deprecation warnings in `schemas.py` (`class Config` → `model_config`)
- `datetime.utcnow()` deprecation in `utils/auth.py`
- Prayer request `prayer_data.dict()` call → `.model_dump()`

See `docs/ARCHITECTURE.md` and open issues for the current roadmap.
