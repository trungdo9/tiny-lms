# Sepay Payment Gateway Integration Report

## 1. API Endpoints

| API | Endpoint |
|----|----------|
| Transaction Details | `GET https://my.sepay.vn/userapi/transactions/details/{id}` |
| Transaction List | `GET https://my.sepay.vn/userapi/transactions/list` |
| QR Code Generation | `GET https://qr.sepay.vn/img` |

**Base URL:** `https://my.sepay.vn/userapi/`

## 2. Payment Methods Supported

- **VietQR** (Open Banking) - QR code payments via 30+ connected banks
- **NAPAS VietQRPay** - Domestic QR payments
- **International Cards** - visa, Mastercard, JCB
- **Bank Transfer** - Automatic detection via balance monitoring

## 3. Webhook Events

**Event Types:** "Có tiền vào" (money in), "Có tiền ra" (money out)

**Payload:** Contains `transactionDate`, `accountNumber`, `code`, `content`, `transferAmount`, `referenceCode`

**Response Required:** `{"success": true}` with HTTP 200/201

## 4. API Authentication

```
Authorization: Bearer API_TOKEN
```

## 5. Payment Flow

1. **Create Payment:** Generate QR Code using `qr.sepay.vn/img`
2. **Customer Payment:** Customer scans QR or uses bank transfer
3. **Status Check:** Query via Transaction API
4. **Confirmation:** Webhook notifies merchant

**Note:** SePay monitors bank accounts and notifies when payments arrive - not a traditional gateway.

## 6. QR Code Required Fields

| Parameter | Required | Description |
|-----------|----------|-------------|
| `acc` | Yes | Bank account number |
| `bank` | Yes | Bank code |
| `amount` | No | Transfer amount |
| `des` | No | Transfer description |

## 7. Important Notes

- No refund API - manual handling required
- Rate limit: 2 calls/second
- Webhook retry: Fibonacci sequence, max 7 retries within 5 hours
