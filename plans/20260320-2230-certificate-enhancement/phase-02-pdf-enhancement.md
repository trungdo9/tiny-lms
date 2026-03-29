# Phase 02 — Backend: PDF Design Enhancement

**Date:** 2026-03-20
**Status:** Pending (depends on Phase 1)
**Priority:** Medium

---

## Context Links

- Parent plan: [plan.md](./plan.md)
- Certificates service: `backend/src/modules/certificates/certificates.service.ts`
- Settings service: `backend/src/modules/settings/settings.service.ts`
- Settings keys: `site_name`, `site_logo_url` (from `analytics_ga_code` pattern)

---

## Key Insights

- `generatePdf(certId)` uses pdfkit — border + text only, no branding
- Settings module has key-value store — `site_name`, `site_logo_url` can be fetched
- `certificateNumber` now populated (Phase 1) — include in PDF for verification
- `qrcode` npm package can generate QR code as PNG buffer → embed in pdfkit
- Public verify URL: `https://{siteUrl}/verify/{certificateNumber}`

---

## Requirements

1. Add org name from Settings (`site_name`) to PDF header
2. Add QR code in PDF corner linking to `/verify/:certificateNumber`
3. Include `certificateNumber` in PDF as visible text
4. Improve visual layout: colored header band, better typography

---

## Implementation Steps

### Step 1 — Install qrcode package

```bash
cd backend && npm install qrcode && npm install --save-dev @types/qrcode
```

### Step 2 — Inject SettingsService into CertificatesModule

In `certificates.module.ts`, import `SettingsModule` to access `SettingsService`.

### Step 3 — Update generatePdf()

```typescript
async generatePdf(certId: string): Promise<Buffer> {
  const cert = await this.prisma.certificate.findUnique({
    where: { id: certId },
    include: { course: true, user: true },
  });

  const [siteName, siteUrl] = await Promise.all([
    this.settingsService.get('site_name').catch(() => 'Tiny LMS'),
    this.settingsService.get('site_url').catch(() => 'https://tinylms.com'),
  ]);

  const verifyUrl = `${siteUrl}/verify/${cert.certificateNumber}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 80 });

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Header band
  doc.rect(0, 0, doc.page.width, 80).fill('#1e40af');
  doc.fillColor('white').fontSize(28).text(siteName, 50, 25, { align: 'center' });

  // Body
  doc.fillColor('#1e293b').fontSize(16).text('Certificate of Completion', { align: 'center' });
  doc.moveDown();
  doc.fontSize(24).text(cert.user.fullName, { align: 'center' });
  doc.fontSize(14).text(`has successfully completed`, { align: 'center' });
  doc.fontSize(20).text(cert.course.title, { align: 'center' });
  doc.fontSize(10).text(`Issued: ${cert.issuedAt.toDateString()}`, { align: 'center' });
  doc.fontSize(10).text(`Certificate No: ${cert.certificateNumber}`, { align: 'center' });

  // QR code bottom-right
  doc.image(qrBuffer, doc.page.width - 120, doc.page.height - 120, { width: 80 });

  doc.end();
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
```

---

## Todo List

- [ ] Install `qrcode` + `@types/qrcode`
- [ ] Import `SettingsModule` in `CertificatesModule`
- [ ] Update `generatePdf()` to fetch site name + build verify URL
- [ ] Add QR code generation via `qrcode.toBuffer()`
- [ ] Update PDF layout: colored header, cert number, improved typography

---

## Success Criteria

- [ ] PDF includes organization name from Settings
- [ ] QR code in PDF links to `/verify/:certificateNumber`
- [ ] `certificateNumber` visible in PDF
- [ ] PDF still generates without errors when Settings keys are missing (fallback values)
