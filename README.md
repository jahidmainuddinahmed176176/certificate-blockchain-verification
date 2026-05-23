# Certificate Blockchain Verification

Scan QR code → Instantly know if certificate is real or fake.

## Contract

- **Address (Sepolia)**: `0x8795f60e40020edeC438f0b72108bF5Fb12805A8`

## How to Use

1. Install MetaMask
2. Switch to Sepolia network
3. Run `npx serve .`
4. Open `http://localhost:3000`
5. Connect wallet
6. Paste QR data and verify

## Test Certificates

**Valid:**
- `CERT-001|Alice Chen|secret789`
- `CERT-002|Bob Wilson|secret456`
- `CERT-003|Charlie Davis|secret123`

**Fake:**
- `FAKE-999|Hacker|fake123`

## Run Locally

```bash
npm install
npx serve .

