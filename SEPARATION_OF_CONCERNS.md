# Smartseason Backend — Separation of Concerns Reference

> **Version:** Post-fix (April 2026)
> **Stack:** Django 5 · Django REST Framework · SimpleJWT · PostgreSQL
> **Apps:** `users` · `fields`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture at a Glance](#2-architecture-at-a-glance)
3. [Layer Responsibilities](#3-layer-responsibilities)
4. [Models](#4-models)
5. [Serializers](#5-serializers)
6. [Views](#6-views)
7. [Permissions](#7-permissions)
8. [URL Configuration](#8-url-configuration)
9. [Full API Reference](#9-full-api-reference)
10. [SoC Violations Found & Fixed](#10-soc-violations-found--fixed)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Project Overview

**Smartseason** is a field-management API that lets agricultural administrators
track farming fields and their seasonal progress. Field agents submit staged
updates (planted → growing → ready → harvested); administrators manage users and
field assignments.

```
smartseason/          ← Django project root (settings, root URLs, shared code)
├── permissions.py    ← Centralised DRF permission classes  [NEW]
users/                ← Custom User model + auth endpoints
fields/               ← Field & FieldUpdate models + CRUD endpoints
```

---

## 2. Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                          HTTP Request                        │
└───────────────────────────────┬─────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      urls.py          │  Route → View mapping only
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  permissions.py        │  Who may call this view?
                    │  (smartseason/)        │  IsAdmin / IsAdminOrReadOnly
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │      views.py         │  HTTP orchestration:
                    │                       │  - Select serializer
                    │                       │  - Scope queryset
                    │                       │  - Inject request-scoped values
                    └───────┬───────┬───────┘
                            │       │
             ┌──────────────▼─┐   ┌─▼────────────────┐
             │ serializers.py │   │    models.py       │
             │                │   │                    │
             │ Data shape:    │   │ Schema + ORM +     │
             │ input/output,  │   │ Business rules +   │
             │ validation,    │   │ QuerySet managers  │
             │ read vs write  │   │                    │
             └────────────────┘   └────────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │      PostgreSQL        │
                              └───────────────────────┘
```

---

## 3. Layer Responsibilities

| Layer | File(s) | Owns | Must NOT |
|---|---|---|---|
| **Models** | `*/models.py` | Schema, computed properties, FK relationships, QuerySet managers, business rules enforced on save | Know about HTTP, serializers, or the request cycle |
| **Serializers** | `*/serializers.py` | Input validation, output shaping, read/write variants, nested representation | Read `request.user`; fire DB queries for business logic |
| **Views** | `*/views.py` | HTTP method dispatch, queryset scoping, injecting request-context values (`created_by`, `agent`) into `perform_create` | Contain business logic or duplicate access rules |
| **Permissions** | `smartseason/permissions.py` | Role-based access decisions | Know about specific model data |
| **URLs** | `*/urls.py` | Map URL patterns to view classes | Contain any logic |

---

## 4. Models

### 4.1 `users.User`

Extends Django's `AbstractUser` with a `role` field.

| Field | Type | Notes |
|---|---|---|
| `username` | CharField | Inherited from AbstractUser |
| `email` | EmailField | Inherited |
| `first_name` / `last_name` | CharField | Inherited |
| `role` | CharField | `'admin'` \| `'agent'` (default: `'agent'`) |

### 4.2 `fields.Field`

Represents a single agricultural field.

| Field | Type | Notes |
|---|---|---|
| `name` | CharField | Human-readable field name |
| `crop_type` | CharField | e.g. maize, wheat, rice, beans |
| `planting_date` | DateField | Used to calculate `status` |
| `stage` | CharField | `STAGE_CHOICES` — kept in sync by `FieldUpdate.save()` |
| `assigned_agent` | FK → User | Agent responsible for this field |
| `created_by` | FK → User | Admin who created the record |
| `created_at` / `updated_at` | DateTimeField | Auto-managed |

**Derived property `status`** (read-only, not stored):

```
harvested  →  "completed"
days > crop limit  →  "at_risk"
otherwise  →  "active"
```

Crop day limits: maize 90 · wheat 120 · rice 150 · beans 60 · default 90.

**Custom QuerySet — `FieldQuerySet.visible_to(user)`**

```python
Field.objects.visible_to(user)
# admin → all fields
# agent → only fields where assigned_agent == user
```

### 4.3 `fields.FieldUpdate`

An immutable log entry recording a stage change by an agent.

| Field | Type | Notes |
|---|---|---|
| `field` | FK → Field | Parent field (set from URL) |
| `agent` | FK → User | Auto-set to requesting user |
| `stage` | CharField | `STAGE_CHOICES` |
| `notes` | TextField | Optional free text |
| `created_at` | DateTimeField | Auto-managed |

**`FieldUpdate.save()` — Business Rule:**
Every time a `FieldUpdate` is saved, the parent `Field.stage` is automatically
advanced to match. This guarantee holds for all code paths (API, admin, scripts).

---

## 5. Serializers

### `users` app

| Serializer | Purpose |
|---|---|
| `UserSerializer` | Read-only; safe to nest inside Field serializers |
| `RegisterSerializer` | Write-only; hashes password; used by `RegisterView` |

### `fields` app

| Serializer | Used when | Includes updates? |
|---|---|---|
| `FieldListSerializer` | `GET /api/fields/` (list) | No — keeps payload lean |
| `FieldSerializer` | Create, retrieve, update | Yes — full `updates` array |
| `FieldUpdateSerializer` | All `/updates/` endpoints | n/a |

**Key design decisions:**
- `field` and `agent` on `FieldUpdateSerializer` are **read-only** — always set by the view.
- `created_by` and `status` on `FieldSerializer` are **read-only** — set by view/model respectively.
- Serializers do **not** read `request` — that coupling was removed (see §10, Fix 3).

---

## 6. Views

### `users` app

| View | Method | Endpoint | Permission |
|---|---|---|---|
| `RegisterView` | POST | `/api/auth/register/` | `IsAdmin` |
| `MeView` | GET | `/api/auth/me/` | `IsAuthenticated` |
| `UserListView` | GET | `/api/auth/users/` | `IsAdmin` |
| `UserDetailView` | GET / PATCH / PUT / DELETE | `/api/auth/users/{id}/` | `IsAdmin` |

### `fields` app

| View | Method | Endpoint | Permission |
|---|---|---|---|
| `FieldListCreateView` | GET | `/api/fields/` | `IsAuthenticated` |
| `FieldListCreateView` | POST | `/api/fields/` | `IsAdmin` |
| `FieldDetailView` | GET | `/api/fields/{id}/` | `IsAuthenticated` |
| `FieldDetailView` | PATCH / PUT / DELETE | `/api/fields/{id}/` | `IsAdmin` |
| `FieldUpdateListCreateView` | GET | `/api/fields/{id}/updates/` | `IsAuthenticated` |
| `FieldUpdateListCreateView` | POST | `/api/fields/{id}/updates/` | `IsAuthenticated` |

---

## 7. Permissions

All custom permission classes live in **`smartseason/permissions.py`** — a single
file auditable independently of any app view.

### `IsAdmin`
```python
# Grants access only when role == 'admin'
# Used for: register, user management, field create/update/delete
```

### `IsAdminOrReadOnly`
```python
# Grants read (SAFE_METHODS) to any authenticated user
# Grants write to admins only
# Used for: Field list/create, Field detail
```

**Permission Matrix**

| Action | Admin | Agent | Unauthenticated |
|---|---|---|---|
| Login / Refresh token | ✅ | ✅ | ✅ |
| View own profile (`/me/`) | ✅ | ✅ | ❌ |
| Register new user | ✅ | ❌ | ❌ |
| List / view users | ✅ | ❌ | ❌ |
| Create a field | ✅ | ❌ | ❌ |
| List fields | ✅ (all) | ✅ (assigned) | ❌ |
| View field detail | ✅ (any) | ✅ (assigned) | ❌ |
| Update / delete field | ✅ | ❌ | ❌ |
| Post a field update | ✅ | ✅ (assigned) | ❌ |
| List field updates | ✅ (any) | ✅ (assigned) | ❌ |

---

## 8. URL Configuration

```
/api/auth/login/              POST  → TokenObtainPairView   (JWT)
/api/auth/token/refresh/      POST  → TokenRefreshView      (JWT)
/api/auth/register/           POST  → RegisterView
/api/auth/me/                 GET   → MeView
/api/auth/users/              GET   → UserListView
/api/auth/users/{id}/         GET/PATCH/PUT/DELETE → UserDetailView

/api/fields/                  GET/POST             → FieldListCreateView
/api/fields/{id}/             GET/PATCH/PUT/DELETE → FieldDetailView
/api/fields/{id}/updates/     GET/POST             → FieldUpdateListCreateView
```

---

## 9. Full API Reference

### Authentication

#### `POST /api/auth/login/`
Returns a JWT access + refresh token pair.

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response `200`:**
```json
{ "access": "eyJ...", "refresh": "eyJ..." }
```

---

#### `POST /api/auth/token/refresh/`
**Request body:**
```json
{ "refresh": "eyJ..." }
```
**Response `200`:** `{ "access": "eyJ..." }`

---

#### `GET /api/auth/me/`
Returns the authenticated user's profile.

**Response `200`:**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@farm.com",
  "first_name": "Alice",
  "last_name": "Smith",
  "role": "admin"
}
```

---

#### `POST /api/auth/register/` *(Admin only)*
**Request body:**
```json
{
  "username": "bob",
  "email": "bob@farm.com",
  "first_name": "Bob",
  "last_name": "Jones",
  "password": "secure1234",
  "role": "agent"
}
```

---

### Fields

#### `GET /api/fields/`
Returns a list (lean payload, no nested updates).

**Response `200`:**
```json
[
  {
    "id": 1,
    "name": "North Field",
    "crop_type": "maize",
    "planting_date": "2026-01-15",
    "stage": "growing",
    "status": "active",
    "assigned_agent": 3,
    "assigned_agent_detail": { "id": 3, "username": "bob", "role": "agent" },
    "created_by": 1,
    "created_by_detail": { "id": 1, "username": "alice", "role": "admin" },
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-03-01T10:30:00Z"
  }
]
```

---

#### `POST /api/fields/` *(Admin only)*
**Request body:**
```json
{
  "name": "South Field",
  "crop_type": "wheat",
  "planting_date": "2026-02-01",
  "stage": "planted",
  "assigned_agent": 3
}
```

---

#### `GET /api/fields/{id}/`
Full detail including update history.

**Response `200`:** Same as list item plus:
```json
{
  "updates": [
    {
      "id": 5,
      "field": 1,
      "agent": 3,
      "agent_detail": { "id": 3, "username": "bob" },
      "stage": "growing",
      "notes": "Irrigation applied, looking healthy.",
      "created_at": "2026-03-01T10:30:00Z"
    }
  ]
}
```

---

#### `POST /api/fields/{id}/updates/`
Post a new update. Stage is auto-synced to the parent field.

**Request body:**
```json
{
  "stage": "ready",
  "notes": "Crop ready for harvest."
}
```

**Response `201`:**
```json
{
  "id": 6,
  "field": 1,
  "agent": 3,
  "agent_detail": { "id": 3, "username": "bob" },
  "stage": "ready",
  "notes": "Crop ready for harvest.",
  "created_at": "2026-04-10T07:00:00Z"
}
```

---

## 10. SoC Violations Found & Fixed

> All 5 violations were resolved in a single refactor pass (April 2026).

---

### Fix 1 — Business Logic in View (Stage Sync)

**Principle violated:** Business rules must live in the model layer.

**Before** (`fields/views.py`):
```python
def perform_create(self, serializer):
    field = self._get_field()
    update = serializer.save(agent=self.request.user, field=field)
    # ❌ Business rule in the view — breaks if field is updated outside the API
    if update.stage and field.stage != update.stage:
        field.stage = update.stage
        field.save(update_fields=['stage', 'updated_at'])
```

**After** (`fields/models.py`):
```python
class FieldUpdate(models.Model):
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # ✅ Business rule on the model — enforced for all code paths
        if self.stage and self.field.stage != self.stage:
            self.field.stage = self.stage
            self.field.save(update_fields=['stage', 'updated_at'])
```

**After** (`fields/views.py`):
```python
def perform_create(self, serializer):
    field = self._get_accessible_field()
    serializer.save(agent=self.request.user, field=field)  # ✅ no sync needed here
```

---

### Fix 2 — Permission Classes Scattered Across Apps

**Principle violated:** A cross-cutting concern (access control) must not be
owned by an application-level module.

**Before:** `IsAdmin` defined in `users/views.py`; `IsAdminOrReadOnly` defined
inline in `fields/views.py` — two separate definitions of the same concept.

**After:** `smartseason/permissions.py` (new file):
```python
class IsAdmin(permissions.BasePermission):
    ...

class IsAdminOrReadOnly(permissions.BasePermission):
    ...
```

Both apps now import from one source:
```python
# users/views.py  &  fields/views.py
from smartseason.permissions import IsAdmin, IsAdminOrReadOnly
```

---

### Fix 3 — Serializer Reading `request.user`

**Principle violated:** Serializers must not know about the HTTP layer.

**Before** (`fields/serializers.py`):
```python
def create(self, validated_data):
    request = self.context['request']        # ❌ serializer accessing HTTP context
    validated_data['created_by'] = request.user
    return super().create(validated_data)
```

**After** (`fields/views.py`):
```python
def perform_create(self, serializer):
    # ✅ request context used in the view where it belongs
    serializer.save(created_by=self.request.user)
```

The serializer's `create()` override was removed entirely.

---

### Fix 4 — Access-Control Logic Duplicated Across Three Views

**Principle violated:** Role-based data filtering must have a single source of truth.

**Before:** Three view methods each contained an `if user.role == 'admin'` branch:
- `FieldListCreateView.get_queryset()`
- `FieldDetailView.get_queryset()`
- `FieldUpdateListCreateView._get_field()`

**After** (`fields/models.py`):
```python
class FieldQuerySet(models.QuerySet):
    def visible_to(self, user):
        if user.role == 'admin':
            return self
        return self.filter(assigned_agent=user)

class Field(models.Model):
    objects = FieldQuerySet.as_manager()
```

All three call sites are now:
```python
Field.objects.visible_to(self.request.user)
```

---

### Fix 5 — Duplicate `STAGE_CHOICES`

**Principle violated:** Don't Repeat Yourself (DRY).

**Before** (`fields/models.py`):
```python
class Field(models.Model):
    STAGE_CHOICES = (('planted','Planted'), ...)  # ❌ defined twice

class FieldUpdate(models.Model):
    STAGE_CHOICES = (('planted','Planted'), ...)  # ❌ exact copy
```

**After**:
```python
# Module level — single definition
STAGE_CHOICES = (
    ('planted',   'Planted'),
    ('growing',   'Growing'),
    ('ready',     'Ready'),
    ('harvested', 'Harvested'),
)

class Field(models.Model):
    stage = models.CharField(choices=STAGE_CHOICES, ...)  # ✅ reference

class FieldUpdate(models.Model):
    stage = models.CharField(choices=STAGE_CHOICES, ...)  # ✅ reference
```

---

## 11. Verification Checklist

Use this checklist after any significant backend change to confirm SoC is maintained.

### Models
- [ ] No `from rest_framework` or `from django.http` imports anywhere in `models.py`
- [ ] All business invariants enforced in `save()` or model methods, not in views
- [ ] `STAGE_CHOICES` referenced, not redefined, in each model

### Serializers
- [ ] No `self.context['request']` access in any serializer `create()` / `update()`
- [ ] `created_by`, `agent` fields are `read_only=True` — set by view
- [ ] Separate read vs write serializers exist where payload shapes differ

### Views
- [ ] No inline `if user.role == 'admin'` branching — delegate to `visible_to(user)`
- [ ] `perform_create` only injects request-scoped values (no business logic)
- [ ] No permission class defined inside a view file — import from `smartseason.permissions`

### Permissions
- [ ] All custom permission classes in `smartseason/permissions.py`
- [ ] Each class has a `message` attribute for consistent error responses

### URLs
- [ ] URL files contain only `path(...)` declarations — no logic, no imports of models

---

*Document generated: April 2026 — Smartseason Backend v1.0*
