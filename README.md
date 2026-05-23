
```markdown
# Certificate Blockchain Verification

Scan QR code → Instantly know if certificate is real or fake.

## Contract

- **Address (Sepolia)**: `0x44e415bc9C4bA95C8eD42Be5D1641E19F1E8Bf50`

## How to Use

1. Install MetaMask
2. Switch to Sepolia network
3. Open `verification-fixed.html` using local server
4. Connect wallet
5. Paste QR data and verify

## Test Data

**Valid certificates:**
- `CERT-001|Alice Chen|secret789`
- `CERT-002|Bob Wilson|secret456`
- `CERT-003|Charlie Davis|secret123`

**Fake certificate:**
- `FAKE-999|Hacker|fake123`

## Run Locally

```bash
npm install
npx serve .
```

Then open `http://localhost:3000/verification-fixed.html`

## Files

- `contracts/CertificateVerificationFixed.sol` - Smart contract
- `verification-fixed.html` - Frontend
- `deploy-standalone.js` - Deployment script
```
