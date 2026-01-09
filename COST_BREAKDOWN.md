# TLDR Content - Complete Cost Breakdown

## ✅ CI/CD Costs: **$0/month**

### GitHub Actions (Build & Deploy)
- **Your repo is public** → Unlimited free CI/CD minutes
- **What it does**: Builds Docker image, pushes to GCR, deploys to Cloud Run
- **Build time**: ~5 minutes per deployment
- **Deployments per day**: Unlimited
- **Monthly cost**: **$0** ✅

---

## Cloud Run Runtime Costs

### Free Tier (Monthly)
- 2 million requests
- 360,000 GB-seconds (memory)
- 180,000 vCPU-seconds (CPU)
- 1 GB network egress

### Estimated Costs by Traffic

#### Scenario 1: Startup/Testing (1M page views/month)
**Traffic:**
- 1 million page views
- ~3 million requests (including API calls, images)
- ~100GB data transfer

**Costs:**
- Requests: $0 (within free tier)
- CPU: $0 (within free tier)
- Memory: $0 (within free tier)
- Network: $0 (within free tier)

**Total: $0-2/month** ✅

---

#### Scenario 2: Growing Traffic (10M page views/month)
**Traffic:**
- 10 million page views
- ~30 million requests
- ~500GB data transfer

**Costs:**
- Requests: ~$12 (30M × $0.40/1M)
- CPU: ~$12 (500K vCPU-seconds)
- Memory: ~$3 (1M GB-seconds)
- Network: ~$60 (500GB × $0.12/GB)

**Total: ~$25-35/month**

---

#### Scenario 3: High Traffic (100M page views/month)
**Traffic:**
- 100 million page views
- ~300 million requests
- ~5TB data transfer

**Costs:**
- Requests: ~$120 (300M × $0.40/1M)
- CPU: ~$120 (5M vCPU-seconds)
- Memory: ~$25 (10M GB-seconds)
- Network: ~$600 (5TB × $0.12/GB)

**Total: ~$250-350/month**

---

## Additional GCP Costs

### Container Registry (Image Storage)
- **Storage**: $0.026/GB per month
- **Network egress**: $0.12/GB
- **Typical usage**: ~1-2GB (Docker images)
- **Monthly cost**: ~$0.05-0.10

### Secret Manager (Environment Variables)
- **Active secrets**: $0.06 per 10,000 accesses
- **Storage**: $0.06 per secret version per month
- **Typical usage**: 5-10 secrets
- **Monthly cost**: ~$0.30-0.60

---

## Total Monthly Cost Estimate

| Traffic Level | CI/CD | Cloud Run | GCR | Secrets | **Total** |
|---------------|-------|-----------|-----|---------|-----------|
| **Startup** (1M views) | $0 | $0-2 | $0.10 | $0.50 | **~$0-3** |
| **Growing** (10M views) | $0 | $25-35 | $0.10 | $0.50 | **~$26-36** |
| **High** (100M views) | $0 | $250-350 | $0.20 | $0.80 | **~$251-351** |

---

## Cost Optimization Tips

### 1. Scale to Zero (Default)
```yaml
min-instances: 0  # No cost when idle
```
✅ Already configured - you only pay for active traffic.

### 2. Use ISR Caching
✅ Already implemented - pages cache for 1 hour, reducing compute.

### 3. Monitor Usage
```bash
# Check current month's costs
gcloud billing projects describe YOUR_PROJECT_ID
```

### 4. Set Budget Alerts
```bash
# Get notified when costs exceed threshold
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="TLDR Content Budget" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## Comparison with Other Platforms

| Platform | Low Traffic | Medium Traffic | High Traffic | Control |
|----------|-------------|----------------|--------------|---------|
| **Vercel** | Free | $20/month | $200-400/month | Limited |
| **Netlify** | Free | $19/month | $99-499/month | Limited |
| **AWS App Runner** | $5 | $40/month | $300-500/month | Medium |
| **GCP Cloud Run** | $0-3 | $26-36/month | $251-351/month | **Full** ✅ |

**Why GCP Cloud Run:**
- ✅ Full infrastructure control
- ✅ Competitive pricing at scale
- ✅ Scales to zero (no idle costs)
- ✅ Integrated with Google services
- ✅ Standard Docker (no vendor lock-in)

---

## Real-World Cost Examples

### Example 1: Personal Project (Low Traffic)
```
Daily visits: 1,000
Pages per visit: 3
Monthly page views: ~90K

Cost: $0 (free tier covers everything)
```

### Example 2: Startup MVP (Growing)
```
Daily visits: 10,000
Pages per visit: 5
Monthly page views: ~1.5M

Cost: ~$5-10/month
```

### Example 3: Production App (Medium Traffic)
```
Daily visits: 100,000
Pages per visit: 10
Monthly page views: ~30M

Cost: ~$80-120/month
```

---

## Billing Timeline

### When You Get Charged
- **Billing cycle**: Monthly (calendar month)
- **Payment**: Auto-charged to credit card
- **Invoice**: Available in GCP Console
- **Credits**: New accounts get $300 free credits (90 days)

### Free Tier Reset
- Free tier resets on the 1st of each month
- Unused free tier doesn't roll over

---

## Summary

### Your Costs:
1. **GitHub Actions CI/CD**: $0 (free forever) ✅
2. **Cloud Run**: Pay only for actual usage
3. **Starting out**: Likely $0-3/month
4. **Growing**: Scales predictably with traffic
5. **No surprises**: Set budget alerts

### What You Control:
- ✅ Min/max instances
- ✅ CPU and memory allocation
- ✅ Concurrency limits
- ✅ Region selection
- ✅ Auto-scaling thresholds

---

**Last Updated**: January 9, 2026
**Framework**: Next.js 16.1.1 on GCP Cloud Run
