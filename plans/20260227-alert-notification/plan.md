# Plan: Alert Notification System

**Date:** 2026-02-27
**Task:** Implement in-app notification system

---

## Requirements (Confirmed)

- **Who receives:** Both students & instructors
- **Delivery:** In-app only (bell icon in header)
- **Timing:** On-demand (fetch when opening panel)

---

## Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `quiz_result` | Quiz submitted, graded | Student |
| `enrollment` | Student enrolled in course | Instructor |
| `grading_complete` | Instructor graded essay | Student |
| `course_published` | Course status changed to published | Enrolled students |

---

## Implementation Steps

### Step 1: Database Schema
- Create `notifications` table
- Fields: id, userId, type, title, message, isRead, data (JSON), createdAt

### Step 2: Backend API
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- Service to create notifications (called from other services)

### Step 3: Trigger Points
- Quiz submitted → create notification for student
- Grading complete → create notification for student
- Enrollment → create notification for instructor
- Course published → notify enrolled students

### Step 4: Frontend Component
- Bell icon in header with unread count badge
- Dropdown panel showing notification list
- Mark as read on click
- "Mark all as read" button

---

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

---

## API Endpoints

```
GET    /notifications          - List notifications (paginated)
GET    /notifications/unread  - Get unread count
PUT    /notifications/:id/read    - Mark single as read
PUT    /notifications/read-all    - Mark all as read
```

---

## Frontend Changes

- Add `NotificationBell` component to header
- Fetch on dropdown open (on-demand)
- Show unread count badge
- Click notification → navigate to related item

---

## Files to Create/Modify

**Backend:**
- `backend/src/modules/notifications/` (new module)
- Trigger notification creation in existing services

**Frontend:**
- `frontend/components/notification-bell.tsx` (new)
- `frontend/components/header.tsx` (add bell)

---

## Success Criteria

- [x] Notifications table created
- [x] Backend API working
- [x] Notifications created on quiz result, enrollment, grading
- [x] Bell icon in header
- [x] Dropdown shows notifications
- [x] Mark as read works

---

## Status: ✅ COMPLETED

**Implemented features:**
- Notification model in database
- Backend API for notifications (`/notifications`)
- Notification bell component at `frontend/components/notification-bell.tsx`
- Notifications created on quiz result, enrollment, grading
- Bell icon in header with dropdown
- Mark as read functionality
