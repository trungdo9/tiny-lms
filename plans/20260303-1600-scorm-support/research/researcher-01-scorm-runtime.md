# SCORM Runtime Implementation Research
**Date**: 2026-03-03
**Context**: NestJS backend + Next.js frontend LMS with SCORM support

---

## 1. SCORM 1.2 vs 2004 API Differences

### Key API Method Names
- **SCORM 1.2**: `LMSInitialize()` / `LMSFinish()`
- **SCORM 2004**: `Initialize()` / `Finish()` (no LMS prefix)
- Both return string: "true" (success) or "false" (failure)

### CMI Data Model Changes
| Data Element | SCORM 1.2 | SCORM 2004 |
|---|---|---|
| Status | `cmi.core.lesson_status` | `cmi.completion_status` + `cmi.success_status` |
| Values | "passed", "completed", "failed", "incomplete" | completion: "completed"/"incomplete"; success: "passed"/"failed"/"unknown" |
| Score | `cmi.core.score.raw/min/max` | `cmi.score.raw/min/max/scaled` |
| Time | `cmi.core.time_limit_action` | `cmi.time_limit_action` |
| Suspend Data | `cmi.suspend_data` (4096 max) | `cmi.suspend_data` (64000 max) |

### Version Detection from imsmanifest.xml
```xml
<!-- SCORM 1.2 -->
<manifest xmlns="http://www.imsproject.org/xsd/imscp_v1p1"
          schemaversion="1.2">

<!-- SCORM 2004 (1.3) -->
<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          schemaversion="1.3">
```

Parse `schemaversion` attribute; value "1.2" vs "1.3" determines runtime behavior.

---

## 2. iframe SCORM API Injection

### Window Lookup Chain (SCORM 1.2 Spec)
SCO (content) searches ancestor windows in this order:
```javascript
// Content inside iframe executes:
const API = window.API || window.parent.API || window.parent.parent.API || ...
```

SCORM content calls methods on discovered API object: `API.LMSInitialize("")`

### Same-Origin vs Cross-Origin
- **Same-origin**: Direct `window.parent.API` access works (no CORS issues)
- **Cross-origin**: Blocked by browser; requires postMessage bridge pattern:
  ```javascript
  // Parent window: expose API
  window.API = { LMSInitialize: (param) => {...} };

  // Content iframe (cross-origin): use postMessage
  window.parent.postMessage({cmd: 'LMSInitialize', param: ''}, '*');
  ```

### Best Practice: Pre-inject Before Content Load
1. Create iframe element: `<iframe />`
2. Set `sandbox="allow-same-origin allow-scripts"` attributes
3. Inject API into iframe's window BEFORE setting `src`:
   ```javascript
   const iframe = document.createElement('iframe');
   iframe.sandbox.add('allow-same-origin', 'allow-scripts');
   const iframeDoc = iframe.contentDocument;
   iframeDoc.open();
   iframeDoc.write(`<script>window.API = ${JSON.stringify(apiObject)};</script>`);
   iframeDoc.close();
   iframe.src = scormContentUrl;
   ```
4. Or: serve imsmanifest-resolved entry point with pre-loaded API script tag.

---

## 3. adm-zip npm Package Usage

### Extract SCORM Package
```javascript
import AdmZip from 'adm-zip';

const buffer = fs.readFileSync('course.zip');
const zip = new AdmZip(buffer);
zip.extractAllTo('/path/to/extract', true); // 2nd param = overwrite
```

### Key Considerations
- **extractAllTo(target, overwrite)**: Extracts all entries; nested structure preserved
- **Gotcha 1**: Ensure target directory exists or `extractAllTo()` may fail
- **Gotcha 2**: Large SCORM packages (100MB+) load entire ZIP into memory; consider streaming alternative for production
- **Gotcha 3**: Windows path separators in ZIP entries; `extractAllTo()` handles auto-conversion
- **Gotcha 4**: Permissions not preserved; file mode bytes ignored on Windows

Recommendation: Use adm-zip for small packages (<50MB), consider unzipper or tar-based approach for large packages.

---

## 4. imsmanifest.xml Parsing with xml2js

### Critical XML Extraction Paths
```javascript
import { parseStringPromise } from 'xml2js';

const manifest = await parseStringPromise(xmlString);
const root = manifest.manifest;

// Version detection
const schemaVersion = root.$.schemaversion; // "1.2" or "1.3"

// Find SCO entry point
const resources = root.resources[0].resource;
const scoResource = resources.find(r =>
  r.$.adlcp?.scormtype === 'sco' && r.$.href
);
const entryPoint = scoResource.$.href; // e.g., "lesson01/index.html"

// Package title
const title = root.metadata?.[0]?.lom?.[0]?.general?.[0]?.title?.[0]?.string?.[0];

// SCORM 2004: check adlcp:masteryrequire
const masteryThreshold = scoResource.$['adlcp:masteryrequire']; // "0.8" for 80%
```

### Namespace Handling
- xml2js preserves namespaces in key names (e.g., `adlcp:scormtype`)
- Set `preserveChildrenOrder: true` for resource sequence preservation
- Default merge behavior combines attributes into `$` object

---

## 5. SCORM suspend_data Size Limits

### Specification Limits
- **SCORM 1.2**: 4,096 characters max (per ADL spec)
- **SCORM 2004 (1.3)**: 64,000 characters max (per IEEE 1484.11.2)

### Database Implications
- **PostgreSQL TEXT type**: Stores up to 1GB; no truncation risk
- **MySQL TEXT type**: 65,535 bytes; sufficient for both versions
- **Storage strategy**: Store raw suspend_data string as-is; no compression needed for typical use
- **Validation**: Client-side enforce 4096 (1.2) or 64000 (2004) char limit before transmission

### Best Practice
Validate version-specific limit in backend before storing:
```javascript
if (schemaVersion === '1.2' && suspendData.length > 4096) {
  throw new Error('suspend_data exceeds SCORM 1.2 limit');
}
```

---

## Implementation Checklist
- [ ] Parse imsmanifest.xml to detect SCORM version
- [ ] Implement dual API (1.2 & 2004) in backend service
- [ ] Create iframe injection utility (same-origin or postMessage bridge)
- [ ] Set up adm-zip extraction pipeline with error handling
- [ ] Validate suspend_data length per version before DB commit
- [ ] Test cross-origin iframe scenarios if frontend ≠ backend domain
- [ ] Document API method mappings for dev team

---
**Token Count**: ~800 words | **Lines**: 147 | **Status**: Research Complete
