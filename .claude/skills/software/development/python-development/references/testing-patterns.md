# Python Testing Patterns

Comprehensive testing patterns for Python applications.

## Pytest Fixtures

### Basic Fixtures
```python
import pytest

@pytest.fixture
def client():
    """Test client fixture."""
    from fastapi.testclient import TestClient
    from main import app
    return TestClient(app)

@pytest.fixture
def db_session():
    """Database session fixture."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture
def sample_user():
    """Sample user data."""
    return {
        "name": "John Doe",
        "email": "john@example.com"
    }
```

### Fixtures with Teardown
```python
@pytest.fixture
def temp_file(tmp_path):
    """Create temp file and cleanup."""
    file = tmp_path / "test.txt"
    file.write_text("test content")
    yield file
    # Cleanup happens automatically with tmp_path

@pytest.fixture(scope="session")
def database():
    """Session-scoped database."""
    # Setup once for all tests
    db = setup_test_db()
    yield db
    db.teardown()
```

## Mocking

### Basic Mock
```python
from unittest.mock import Mock, patch

def test_external_api():
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": "test"}
    
    with patch('requests.get', return_value=mock_response):
        result = call_external_api()
        assert result == {"data": "test"}
```

### Async Mocking
```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_async_fetch():
    mock_fetch = AsyncMock(return_value={"data": "test"})
    
    with patch('aiohttp.ClientSession') as mock_session:
        mock_session.return_value.__aenter__.return_value.get = mock_fetch
        result = await fetch_data()
        assert result == {"data": "test"}
```

### Mock Environment Variables
```python
from unittest.mock import patch
import os

def test_env_variables():
    with patch.dict(os.environ, {"API_KEY": "test-key"}):
        from main import get_api_key
        assert get_api_key() == "test-key"
```

## Parametrized Tests

```python
import pytest

@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    assert input * 2 == expected

@pytest.mark.parametrize("email,valid", [
    ("test@example.com", True),
    ("invalid", False),
    ("", False),
])
def test_email_validation(email, valid):
    from validators import is_valid_email
    assert is_valid_email(email) == valid
```

## Async Testing

```python
import pytest
import asyncio

@pytest.mark.asyncio
async def test_async_function():
    result = await async_add(1, 2)
    assert result == 3

@pytest.mark.asyncio
async def test_async_context_manager():
    async with async_resource() as resource:
        assert resource.is_ready
```

## Integration Tests

```python
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    from main import app
    return TestClient(app)

def test_full_workflow(client):
    # 1. Create user
    response = client.post("/users", json={
        "name": "John",
        "email": "john@example.com"
    })
    assert response.status_code == 201
    user_id = response.json()["id"]
    
    # 2. Get user
    response = client.get(f"/users/{user_id}")
    assert response.status_code == 200
    
    # 3. Update user
    response = client.put(f"/users/{user_id}", json={
        "name": "John Updated"
    })
    assert response.status_code == 200
```

## Coverage

### Configure Coverage
```ini
# pytest.ini
[tool:pytest]
addopts = --cov=src --cov-report=html --cov-report=term-missing

[coverage:run]
source = src
omit = 
    */tests/*
    */migrations/*
```

### Run with Coverage
```bash
pytest --cov=src --cov-report=html
pytest --cov=src --cov-report=term-missing --cov-fail-under=80
```

## Test Organization

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── unit/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/
│   ├── __init__.py
│   ├── test_api.py
│   └── test_database.py
└── fixtures/
    ├── __init__.py
    └── sample_data.py
```

## Test Best Practices

1. **AAA Pattern** - Arrange, Act, Assert
2. **Test one thing** - Each test should verify one behavior
3. **Use descriptive names** - `test_user_creation_fails_without_email`
4. **Isolate tests** - Tests shouldn't depend on each other
5. **Test edge cases** - Empty, None, max values
6. **Use factories** - For creating test data consistently