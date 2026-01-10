# Validation Scripts

This directory contains scripts to ensure project boundaries are maintained.

## validate-project.sh

Validates that your local environment and configurations are correctly set up for TLDR Content deployment.

### Usage

```bash
# Run validation
./scripts/validate-project.sh

# Or make it executable first if needed
chmod +x ./scripts/validate-project.sh
./scripts/validate-project.sh
```

### What It Checks

1. **GCP Project Configuration**
   - Verifies `gcloud` is configured for project `tldr-music`
   - Validates project number matches `401132033262`

2. **Firebase Configuration**
   - Checks `web/.env.local` for correct Firebase project
   - Validates project ID is `content-lumiolabs-internal`

3. **Project Config File**
   - Validates `.project-config.json` has correct project IDs

### Exit Codes

- `0` - All validations passed
- `1` - One or more validations failed

### Integration Ideas

#### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
./scripts/validate-project.sh
exit $?
```

Then make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

#### Make Target

Add to `Makefile`:
```makefile
.PHONY: validate
validate:
	@./scripts/validate-project.sh

.PHONY: deploy
deploy: validate
	@echo "Deploying to production..."
	# Your deployment commands here
```

#### NPM Script

Add to `package.json`:
```json
{
  "scripts": {
    "validate": "./scripts/validate-project.sh",
    "predeploy": "npm run validate"
  }
}
```

## When to Run

- Before committing code
- Before deploying to production
- After switching GCP projects
- When setting up a new development environment
- When onboarding new team members

## Troubleshooting

If validation fails, the script will provide specific instructions on how to fix the issue.

Common fixes:

```bash
# Fix GCP project
gcloud config set project tldr-music

# Fix Firebase project in .env.local
cd web
echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=content-lumiolabs-internal" > .env.local
```

See [PROJECT-BOUNDARIES.md](../PROJECT-BOUNDARIES.md) for detailed documentation.

---

## generate-hotstar-token.js

Generates authentication tokens for Hotstar (JioHotstar) API using Akamai token generation.

### Quick Start

**1. Install Dependencies:**
```bash
npm install akamai-token
```

**2. Generate Token:**
```bash
node scripts/generate-hotstar-token.js
```

**3. Copy Token to `.env.local`:**

The script outputs the token in the correct format to add to your environment file.

### Example Output

```
=== Hotstar API Token Generated ===

Token: st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456

Add this to your .env.local file:
HOTSTAR_TOKEN=st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456

Token valid for: 2000 seconds (33 minutes)

=== Test with cURL ===
curl --location 'https://pp-catalog-api.hotstar.com/movie/search?...' \
  --header 'hdnea: st=1736054800~exp=1736056800~acl=/*~hmac=abc123def456'
```

### Token Expiry

⚠️ Tokens expire after **2000 seconds (33 minutes)**. You'll need to:
- Regenerate tokens before they expire
- Implement auto-refresh for production use
- Use longer windows for development (if Hotstar policy allows)

### Configuration

The script reads `HOTSTAR_AKAMAI_SECRET` from environment variables.

**Custom secret:**
```bash
HOTSTAR_AKAMAI_SECRET=your_secret node scripts/generate-hotstar-token.js
```

### Alternative Methods

If Node.js token generation doesn't work:

**Java:**
```bash
java AkamaiToken -k <secret> -a /* -s now -w 2000
```

**Python:**
```bash
python akamai_token_v2.py -k <secret> -a /* -s now -w 2000
```

### Documentation

See [HOTSTAR_API.md](../HOTSTAR_API.md) for complete Hotstar API documentation.
