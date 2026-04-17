# FastAPI Patterns & Best Practices

Advanced FastAPI patterns for production-ready APIs.

## Dependency Injection

### Basic Dependency
```python
from fastapi import Depends

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users")
async def get_users(db = Depends(get_db)):
    return db.query(User).all()
```

### Class-Based Dependencies
```python
class PaginationParams:
    def __init__(self, page: int = 1, size: int = 10):
        self.page = max(1, page)
        self.size = min(100, size)
        self.offset = (self.page - 1) * self.size

@app.get("/items")
async def get_items(params: PaginationParams = Depends()):
    return items[params.offset:params.offset + params.size]
```

## Middleware

### CORS Middleware
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Custom Middleware
```python
from starlette.middleware.base import BaseHTTPMiddleware

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
```

## Error Handling

### Custom Exception Handler
```python
from fastapi import Request
from fastapi.responses import JSONResponse

class CustomException(Exception):
    def __init__(self, message: str):
        self.message = message

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=400,
        content={"error": exc.message}
    )

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id < 0:
        raise CustomException("Item ID must be positive")
    return {"item_id": item_id}
```

## WebSocket

```python
from fastapi import WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except Exception:
        await websocket.close()
```

## Background Tasks

```python
from fastapi import BackgroundTasks

def send_email(email: str, message: str):
    # Email sending logic
    pass

@app.post("/send-notification")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email, email, "Hello!")
    return {"message": "Notification queued"}
```

## Response Model

```python
from pydantic import BaseModel
from typing import Optional, List

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

class UsersResponse(BaseModel):
    users: List[UserResponse]
    total: int

@app.get("/users", response_model=UsersResponse)
async def get_users():
    return UsersResponse(users=users_db, total=len(users_db))
```

## Pagination

```python
from fastapi import Query

@app.get("/items")
async def get_items(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    start = (page - 1) * size
    end = start + size
    return {
        "items": items[start:end],
        "page": page,
        "size": size,
        "total": len(items)
    }
```

## File Upload

```python
from fastapi import UploadFile, File
import shutil

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    save_path = f"uploads/{file.filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "size": file.size}
```

## State Management

### Application State
```python
app = FastAPI()

app.state.database = Database()
app.state.cache = Cache()

@app.get("/stats")
async def get_stats(request: Request):
    db = request.app.state.database
    return {"connections": db.connection_count}
```

## Performance Tips

1. **Use async properly** - Don't block in async functions
2. **Use `response_model`** - Validate and serialize efficiently
3. **Use dependency injection** - Share reusable logic
4. **Configure workers** - `uvicorn --workers 4`
5. **Use caching** - Add cache headers for static data