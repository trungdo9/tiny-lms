# NestJS Static Serving & SCORM Player Implementation Research

## 1. NestJS Static File Serving

**ServeStaticModule** (`@nestjs/serve-static`):
- Serves entire folder at configured root path
- Config-based, static at app startup
- Not suitable for per-package SCORM content (each package needs unique path like `/scorm/content/package-123/`)
- Single rootPath limitation; cannot serve multiple dynamic directories

**Express.static Middleware** (recommended for SCORM):
```typescript
// main.ts
const path = require('path');
app.use('/scorm/content/:packageId', express.static((req, res, next) => {
  const contentPath = path.join('/uploads/scorm', req.params.packageId);
  return contentPath;
}));
```
- Dynamic path support via route parameters
- Per-package isolation: `/scorm/content/pkg-1/`, `/scorm/content/pkg-2/`
- Flexible middleware ordering in Express stack
- **Verdict**: Use `express.static` for dynamic SCORM paths; ServeStaticModule only for static assets like `/public`

## 2. Multer ZIP Upload in NestJS

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (['application/zip', 'application/x-zip-compressed'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only ZIP files allowed'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}))
async uploadScorm(@UploadedFile() file: Express.Multer.File) {
  const zip = new AdmZip(file.buffer); // Direct buffer processing
  // Extract and validate SCORM structure
}
```
- `memoryStorage()` keeps file in buffer; no disk I/O overhead
- Mimetype validation essential (clients can fake extensions)
- File size limits prevent DoS; SCORM packages rarely exceed 50MB
- `adm-zip` processes buffer synchronously; consider async wrapper for large files

## 3. SCORM Player Iframe Security

**Sandbox Attributes**:
- `allow-scripts`: Required; SCORM JS initialization depends on script execution
- `allow-same-origin`: Allows `window.parent` API access from iframe; required for window.parent.API calls
- Removing both: iframe isolated but SCORM cannot communicate with LMS
- `allow-popups`: Optional; some SCORM content opens help windows
- **Critical**: Both flags must be present together for standard SCORM API

**CSP Headers**:
- Must NOT block iframe `src` with `frame-src` directive
- Must allow `script-src 'unsafe-inline'` for legacy SCORM content
- Prefer: `frame-src 'self'; script-src 'self' 'unsafe-inline'`
- Avoid blanket CSP that breaks iframe loading

## 4. SCORM API Communication Strategy

**Direct window.parent** (same-origin, SCORM-spec standard):
```typescript
// In iframe SCORM content
const api = window.parent.API;
api.Initialize('');
api.SetValue('cmi.core.student_name', 'John');
```
- SCORM 1.2 & 2004 specification; all compliant packages expect this
- No serialization overhead
- Direct object references; synchronous
- Works on localhost development (both app and iframe on localhost)

**postMessage** (cross-origin only):
- Only necessary for cross-domain iframes (different hostname/port)
- Extra complexity; serialization required
- **Avoid unless**: SCORM served from CDN or different origin
- Not recommended for typical localhost dev or same-domain production

**Verdict**: Use direct `window.parent.API` for same-origin setup (standard, simpler, SCORM-compliant)

## 5. React Iframe Ref + API Injection Timing

```typescript
const iframeRef = useRef<HTMLIFrameElement>(null);

useEffect(() => {
  if (!iframeRef.current) return;

  const win = iframeRef.current.contentWindow;
  // Inject API BEFORE setting src
  win.API = new ScormAPI();

  // Then set source
  iframeRef.current.src = `/scorm/content/${packageId}/index.html`;
}, [packageId]);

// Use onLoad to detect when content ready
const handleIframeLoad = () => {
  const api = iframeRef.current.contentWindow.parent.API;
  api.Initialize(''); // Safe now; SCORM content loaded
};
```
- Set `window.API` **before** `src` assignment; content executes immediately on load
- `onLoad` callback fires after HTML parsed and scripts executed
- `ref.current.contentWindow.parent.API === window.API` when same-origin (both identical)
- Error handling: wrap API calls in try-catch; content may fail to initialize
- State management: store SCORM session ID in React context/store post-initialization
