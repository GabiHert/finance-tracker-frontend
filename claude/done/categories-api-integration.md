# Feature: Categories API Integration

## Description
Replace mock data in CategoriesScreen with real backend API calls. The backend Categories API already exists at `/api/v1/categories` with full CRUD operations.

## Current State
- `CategoriesScreen.tsx` uses `mockCategories` from `mock-data.ts`
- Categories are stored in local `useState`, not fetched from API
- CRUD operations only update local state, not persisted

## Backend API Available
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

## Requirements

### 1. Create API Service Layer
**File:** `src/main/features/categories/api/categories.ts`

```typescript
const API_BASE = '/api/v1'

// GET /api/v1/categories
export async function fetchCategories(token: string): Promise<CategoryListResponse>

// POST /api/v1/categories
export async function createCategory(token: string, data: CreateCategoryRequest): Promise<CategoryResponse>

// PATCH /api/v1/categories/:id
export async function updateCategory(token: string, id: string, data: UpdateCategoryRequest): Promise<CategoryResponse>

// DELETE /api/v1/categories/:id
export async function deleteCategory(token: string, id: string): Promise<void>
```

### 2. Update CategoriesScreen.tsx
- Remove import of `mockCategories`
- Fetch categories from API on mount using `useEffect`
- Get auth token from localStorage
- Handle loading and error states
- Connect Create/Update/Delete operations to API

### 3. Response Format (from backend)
```typescript
interface CategoryResponse {
  id: string
  name: string
  color: string
  icon: string
  owner_type: string
  owner_id: string
  type: 'expense' | 'income'
  transaction_count: number
  period_total: number
  created_at: string
  updated_at: string
}

interface CategoryListResponse {
  categories: CategoryResponse[]
}
```

### 4. Request Format
```typescript
interface CreateCategoryRequest {
  name: string           // required, 1-50 chars
  color?: string
  icon?: string
  type: 'expense' | 'income'  // required
}

interface UpdateCategoryRequest {
  name?: string          // 1-50 chars
  color?: string
  icon?: string
}
```

## Files to Modify
1. Create: `src/main/features/categories/api/categories.ts`
2. Modify: `src/main/features/categories/CategoriesScreen.tsx`
3. Update: `src/main/features/categories/types.ts` (if needed for API response types)

## E2E Test Impact
After this change, E2E tests in `e2e/tests/m3-categories/` will need updates:
- Tests can no longer expect hardcoded category names like "Food & Dining"
- Tests should create categories via API in setup
- Tests should use dynamic assertions

## Acceptance Criteria
- [ ] Categories are fetched from `/api/v1/categories` on page load
- [ ] Loading state shown while fetching
- [ ] Error state shown if API fails
- [ ] Create category calls POST API and refreshes list
- [ ] Edit category calls PATCH API and refreshes list
- [ ] Delete category calls DELETE API and refreshes list
- [ ] E2E tests pass with real API data
