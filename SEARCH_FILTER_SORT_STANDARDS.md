# Search, Filter & Sort Standards
## Grades & Assessment Management System

**Document Version**: 1.0  
**Last Updated**: December 17, 2025  
**Status**: Implementation Ready

---

## Table of Contents
1. [Search Standards](#search-standards)
2. [Filter Standards](#filter-standards)
3. [Sort Standards](#sort-standards)
4. [Module-Specific Implementation](#module-specific-implementation)
5. [Performance Optimization](#performance-optimization)
6. [UI/UX Patterns](#uiux-patterns)

---

## Search Standards

### Global Search Implementation

#### Search Scope
- **Primary**: Course codes, student names, student IDs, grade IDs
- **Secondary**: Faculty names, department names, course names
- **Excluded**: Email addresses, phone numbers, addresses

#### Search Algorithm

```typescript
// src/services/search.ts
export interface SearchQuery {
  term: string
  type: 'global' | 'module-specific'
  limit: number
  offset: number
  filters?: Record<string, any>
}

export interface SearchResult {
  id: string
  type: 'student' | 'course' | 'grade' | 'faculty'
  title: string
  subtitle: string
  metadata: Record<string, any>
  score: number
}

export const performSearch = async (
  query: SearchQuery,
  userId: string,
  userRole: string
): Promise<SearchResult[]> => {
  // Normalize search term
  const normalizedTerm = query.term
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

  // Check minimum length
  if (normalizedTerm.length < 2) {
    return []
  }

  // Get user's accessible data
  const accessibleData = await getUserAccessibleData(userId, userRole)

  // Search across indexed fields
  const results = []

  // Search students
  const studentResults = searchStudents(normalizedTerm, accessibleData)
  results.push(...studentResults)

  // Search courses
  const courseResults = searchCourses(normalizedTerm, accessibleData)
  results.push(...courseResults)

  // Search grades
  const gradeResults = searchGrades(normalizedTerm, accessibleData)
  results.push(...gradeResults)

  // Rank results by relevance score
  const ranked = rankResults(results, normalizedTerm)

  // Return paginated results
  return ranked.slice(
    query.offset,
    query.offset + query.limit
  )
}
```

#### Search Field Indexing

| Entity | Searchable Fields | Weight | Indexed |
|--------|------------------|--------|---------|
| Student | studentId, firstName, lastName, email | 1.0 | Yes |
| Course | courseCode, courseName, department | 1.0 | Yes |
| Grade | gradeId, studentId, courseCode | 0.8 | Yes |
| Faculty | facultyId, firstName, lastName, department | 0.9 | Yes |

#### Search Relevance Scoring

```typescript
const scoreResult = (
  result: SearchResult,
  query: string
): number => {
  let score = 0

  // Exact match bonus
  if (result.title.toLowerCase() === query) {
    score += 100
  }

  // Prefix match bonus
  if (result.title.toLowerCase().startsWith(query)) {
    score += 50
  }

  // Contains match
  if (result.title.toLowerCase().includes(query)) {
    score += 25
  }

  // Recency bonus (for recently accessed items)
  if (result.metadata.lastAccessed) {
    const daysOld = daysSince(result.metadata.lastAccessed)
    score += Math.max(0, 10 - daysOld)
  }

  return score
}
```

#### Search Autocomplete

```typescript
// Debounced search suggestions
export const getSearchSuggestions = async (
  term: string,
  limit = 5
): Promise<string[]> => {
  if (term.length < 2) return []

  // Query Firestore for prefix matches
  const snapshot = await firestore
    .collection('searchIndex')
    .where('term', '>=', term.toLowerCase())
    .where('term', '<', term.toLowerCase() + '\uf8ff')
    .orderBy('term')
    .limit(limit)
    .get()

  return snapshot.docs.map(doc => doc.data().display)
}

// React hook for autocomplete
export const useSearchSuggestions = (term: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const debounce = setTimeout(async () => {
      setLoading(true)
      const results = await getSearchSuggestions(term)
      setSuggestions(results)
      setLoading(false)
    }, 300)

    return () => clearTimeout(debounce)
  }, [term])

  return { suggestions, loading }
}
```

---

## Filter Standards

### Filter Architecture

#### Filter Definition

```typescript
export interface FilterDefinition {
  id: string
  label: string
  type: 'single' | 'multi' | 'range' | 'date'
  options?: FilterOption[]
  defaultValue?: any
  operators?: FilterOperator[]
}

export interface FilterOption {
  value: string
  label: string
  count?: number // Number of results
}

export interface FilterOperator {
  id: string
  label: string
  value: string
}

export interface AppliedFilter {
  filterId: string
  operator?: string
  value: any
  valueLabel?: string
}
```

#### Common Filter Types

```typescript
// Single select filter
const statusFilter: FilterDefinition = {
  id: 'status',
  label: 'Status',
  type: 'single',
  options: [
    { value: 'pending', label: 'Pending Verification', count: 45 },
    { value: 'approved', label: 'Approved', count: 1250 },
    { value: 'rejected', label: 'Rejected', count: 12 },
  ],
  defaultValue: null
}

// Multi-select filter
const gradeFilter: FilterDefinition = {
  id: 'grade',
  label: 'Grade Range',
  type: 'multi',
  options: [
    { value: 'A', label: 'A (90-100)', count: 380 },
    { value: 'B', label: 'B (80-89)', count: 520 },
    { value: 'C', label: 'C (70-79)', count: 310 },
    { value: 'D', label: 'D (60-69)', count: 85 },
    { value: 'F', label: 'F (0-59)', count: 32 },
  ]
}

// Date range filter
const dateFilter: FilterDefinition = {
  id: 'submissionDate',
  label: 'Submission Date',
  type: 'date',
  operators: [
    { id: 'between', label: 'Between', value: 'between' },
    { id: 'after', label: 'After', value: 'after' },
    { id: 'before', label: 'Before', value: 'before' },
    { id: 'today', label: 'Today', value: 'today' },
    { id: 'thisWeek', label: 'This Week', value: 'this_week' },
  ]
}

// Range slider filter
const percentageFilter: FilterDefinition = {
  id: 'classAverage',
  label: 'Class Average Range',
  type: 'range',
  // Min: 0, Max: 100
}
```

#### Filter Persistence

```typescript
// Save filter preferences to localStorage
export const saveFilterPreset = (
  presetName: string,
  filters: AppliedFilter[]
) => {
  const presets = JSON.parse(
    localStorage.getItem('filterPresets') || '{}'
  )
  presets[presetName] = {
    filters,
    createdAt: new Date().toISOString()
  }
  localStorage.setItem('filterPresets', JSON.stringify(presets))
}

// Load saved filter preset
export const loadFilterPreset = (presetName: string) => {
  const presets = JSON.parse(
    localStorage.getItem('filterPresets') || '{}'
  )
  return presets[presetName]?.filters || []
}
```

#### Firestore Query Builder

```typescript
export const buildFilteredQuery = (
  baseRef: FirebaseFirestore.CollectionReference,
  filters: AppliedFilter[]
) => {
  let query = baseRef as any

  for (const filter of filters) {
    switch (filter.filterId) {
      case 'status':
        query = query.where('status', '==', filter.value)
        break

      case 'grade':
        if (Array.isArray(filter.value)) {
          query = query.where('grade', 'in', filter.value)
        }
        break

      case 'submissionDate':
        if (filter.operator === 'between') {
          query = query
            .where('submissionDate', '>=', filter.value.start)
            .where('submissionDate', '<=', filter.value.end)
        } else if (filter.operator === 'after') {
          query = query.where('submissionDate', '>=', filter.value)
        } else if (filter.operator === 'before') {
          query = query.where('submissionDate', '<', filter.value)
        }
        break

      case 'department':
        query = query.where('department', '==', filter.value)
        break
    }
  }

  return query
}
```

---

## Sort Standards

### Sort Implementation

#### Sort Definition

```typescript
export interface SortOption {
  id: string
  label: string
  field: string
  direction: 'asc' | 'desc'
  default?: boolean
  availableDirections: ('asc' | 'desc')[]
}

export interface AppliedSort {
  id: string
  direction: 'asc' | 'desc'
  position: number // For multi-sort
}
```

#### Default Sort Options by Module

```typescript
// Grade Encoding Module
export const gradeEncodingSortOptions: SortOption[] = [
  {
    id: 'submissionDate',
    label: 'Submission Date',
    field: 'submissionDate',
    direction: 'desc',
    default: true,
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'studentId',
    label: 'Student ID',
    field: 'studentId',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'grade',
    label: 'Grade',
    field: 'score',
    direction: 'desc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'status',
    label: 'Status',
    field: 'status',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  }
]

// Verification Module
export const verificationSortOptions: SortOption[] = [
  {
    id: 'submissionDate',
    label: 'Most Recent',
    field: 'submissionDate',
    direction: 'desc',
    default: true,
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'course',
    label: 'Course Code',
    field: 'courseCode',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'gradeCount',
    label: 'Number of Grades',
    field: 'gradeCount',
    direction: 'desc',
    availableDirections: ['asc', 'desc']
  }
]

// Student Module
export const studentSortOptions: SortOption[] = [
  {
    id: 'courseCode',
    label: 'Course Code',
    field: 'courseCode',
    direction: 'asc',
    default: true,
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'grade',
    label: 'Grade',
    field: 'grade',
    direction: 'desc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'postDate',
    label: 'Posted Date',
    field: 'postDate',
    direction: 'desc',
    availableDirections: ['asc', 'desc']
  }
]

// Correction Module
export const correctionSortOptions: SortOption[] = [
  {
    id: 'requestDate',
    label: 'Most Recent',
    field: 'requestDate',
    direction: 'desc',
    default: true,
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'status',
    label: 'Status',
    field: 'status',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'approvalLevel',
    label: 'Approval Level',
    field: 'currentApprovalLevel',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    field: 'deadline',
    direction: 'asc',
    availableDirections: ['asc', 'desc']
  }
]
```

#### Multi-Sort Implementation

```typescript
export const applySorting = (
  data: any[],
  sortOptions: AppliedSort[],
  availableFields: SortOption[]
) => {
  // Sort by multiple criteria in order
  return data.sort((a, b) => {
    for (const sort of sortOptions.sort((x, y) => x.position - y.position)) {
      const fieldDef = availableFields.find(f => f.id === sort.id)
      if (!fieldDef) continue

      const fieldName = fieldDef.field
      const aValue = getNestedValue(a, fieldName)
      const bValue = getNestedValue(b, fieldName)

      let comparison = 0

      if (typeof aValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      }

      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison
      }
    }
    return 0
  })
}

// Helper to access nested object properties
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}
```

---

## Module-Specific Implementation

### Grade Encoding Module

#### Available Filters

```typescript
const gradeEncodingFilters: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'single',
    options: [
      { value: 'draft', label: 'Draft', count: 120 },
      { value: 'submitted', label: 'Submitted', count: 450 },
      { value: 'verified', label: 'Verified', count: 1200 },
      { value: 'rejected', label: 'Rejected', count: 23 }
    ]
  },
  {
    id: 'semester',
    label: 'Semester',
    type: 'single',
    options: [
      { value: '2025-spring', label: 'Spring 2025', count: 850 },
      { value: '2024-fall', label: 'Fall 2024', count: 945 },
      { value: '2024-summer', label: 'Summer 2024', count: 0 }
    ]
  },
  {
    id: 'submissionDate',
    label: 'Submission Date',
    type: 'date',
    operators: [
      { id: 'between', label: 'Between', value: 'between' },
      { id: 'after', label: 'After', value: 'after' },
      { id: 'before', label: 'Before', value: 'before' }
    ]
  }
]
```

#### Search Query Example

```
GET /api/grades/search?
  term=COMP101&
  filters=status:submitted&
  sort=submissionDate:desc&
  limit=20&
  offset=0
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "grade_12345",
      "studentId": "S001234",
      "studentName": "John Doe",
      "courseCode": "COMP101",
      "score": 92,
      "status": "verified",
      "submissionDate": "2025-01-15T10:30:00Z",
      "grade": "A"
    }
  ],
  "pagination": {
    "total": 145,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "status": ["submitted"],
    "submissionDate": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    }
  }
}
```

### Verification Module

#### Available Filters

```typescript
const verificationFilters: FilterDefinition[] = [
  {
    id: 'verificationStatus',
    label: 'Verification Status',
    type: 'multi',
    options: [
      { value: 'pending', label: 'Pending Review', count: 180 },
      { value: 'flagged', label: 'Flagged Issues', count: 45 },
      { value: 'approved', label: 'Approved', count: 3200 },
      { value: 'rejected', label: 'Rejected', count: 67 }
    ]
  },
  {
    id: 'anomalyLevel',
    label: 'Anomaly Detected',
    type: 'single',
    options: [
      { value: 'none', label: 'No Anomalies', count: 3100 },
      { value: 'low', label: 'Low Risk', count: 150 },
      { value: 'medium', label: 'Medium Risk', count: 78 },
      { value: 'high', label: 'High Risk', count: 12 }
    ]
  },
  {
    id: 'gradeRange',
    label: 'Grade Distribution',
    type: 'multi',
    options: [
      { value: 'skewed_high', label: 'Skewed High (> 85%)', count: 92 },
      { value: 'normal', label: 'Normal Distribution', count: 2800 },
      { value: 'skewed_low', label: 'Skewed Low (< 60%)', count: 45 }
    ]
  }
]
```

### Student Module

#### Available Filters

```typescript
const studentFilters: FilterDefinition[] = [
  {
    id: 'semester',
    label: 'Semester',
    type: 'multi',
    options: [
      { value: '2025-spring', label: 'Spring 2025', count: 8 },
      { value: '2024-fall', label: 'Fall 2024', count: 9 },
      { value: '2024-summer', label: 'Summer 2024', count: 2 }
    ]
  },
  {
    id: 'grade',
    label: 'Grade',
    type: 'multi',
    options: [
      { value: 'A', label: 'A (90-100)', count: 12 },
      { value: 'B', label: 'B (80-89)', count: 15 },
      { value: 'C', label: 'C (70-79)', count: 5 },
      { value: 'D', label: 'D (60-69)', count: 1 }
    ]
  },
  {
    id: 'department',
    label: 'Department',
    type: 'single',
    options: [
      { value: 'CS', label: 'Computer Science', count: 8 },
      { value: 'MATH', label: 'Mathematics', count: 6 },
      { value: 'ENG', label: 'English', count: 2 }
    ]
  }
]
```

### Correction Module

#### Available Filters

```typescript
const correctionFilters: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Request Status',
    type: 'single',
    options: [
      { value: 'pending', label: 'Pending Approval', count: 12 },
      { value: 'approved', label: 'Approved', count: 34 },
      { value: 'rejected', label: 'Rejected', count: 8 },
      { value: 'completed', label: 'Completed', count: 156 }
    ]
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'single',
    options: [
      { value: 'urgent', label: 'Urgent', count: 3 },
      { value: 'high', label: 'High', count: 8 },
      { value: 'normal', label: 'Normal', count: 24 },
      { value: 'low', label: 'Low', count: 45 }
    ]
  },
  {
    id: 'approvalLevel',
    label: 'Approval Level',
    type: 'single',
    options: [
      { value: 'level1', label: 'Awaiting Department Head', count: 9 },
      { value: 'level2', label: 'Awaiting Dean', count: 3 },
      { value: 'completed', label: 'All Levels Completed', count: 190 }
    ]
  }
]
```

---

## Performance Optimization

### Indexing Strategy

```typescript
// Firestore composite indexes needed
const requiredIndexes = [
  {
    collection: 'grades',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'submissionDate', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'grades',
    fields: [
      { fieldPath: 'courseCode', order: 'ASCENDING' },
      { fieldPath: 'status', order: 'ASCENDING' }
    ]
  },
  {
    collection: 'corrections',
    fields: [
      { fieldPath: 'status', order: 'ASCENDING' },
      { fieldPath: 'requestDate', order: 'DESCENDING' }
    ]
  }
]
```

### Query Optimization

```typescript
// Limit returned fields
export const optimizedQuery = (
  baseRef: FirebaseFirestore.CollectionReference,
  requiredFields: string[]
) => {
  return baseRef.select(...requiredFields)
}

// Example usage
const query = firestore
  .collection('grades')
  .select('studentId', 'grade', 'score', 'status', 'submissionDate')
  .where('status', '==', 'verified')
  .limit(20)
```

### Pagination Implementation

```typescript
export interface PaginationParams {
  limit: number // 1-100, default 20
  offset: number // 0-based
  lastDocumentId?: string // For cursor-based pagination
}

export const getPaginatedResults = async (
  query: FirebaseFirestore.Query,
  params: PaginationParams
) => {
  let q = query

  // Cursor-based pagination (more efficient)
  if (params.lastDocumentId) {
    const lastDoc = await firestore
      .collection('grades')
      .doc(params.lastDocumentId)
      .get()

    if (lastDoc.exists) {
      q = q.startAfter(lastDoc)
    }
  }

  const snapshot = await q.limit(params.limit + 1).get()

  const docs = snapshot.docs.slice(0, params.limit)
  const hasMore = snapshot.docs.length > params.limit

  return {
    data: docs.map(doc => ({ id: doc.id, ...doc.data() })),
    hasMore,
    nextCursor: docs[docs.length - 1]?.id
  }
}
```

---

## UI/UX Patterns

### Filter Panel Component

```typescript
// src/components/FilterPanel.tsx
interface FilterPanelProps {
  filters: FilterDefinition[]
  appliedFilters: AppliedFilter[]
  onChange: (filters: AppliedFilter[]) => void
  onClear: () => void
  loading?: boolean
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  appliedFilters,
  onChange,
  onClear,
  loading
}) => {
  const handleFilterChange = (filterId: string, value: any) => {
    const updated = appliedFilters.filter(f => f.filterId !== filterId)
    if (value !== null && value !== undefined) {
      updated.push({ filterId, value })
    }
    onChange(updated)
  }

  const activeFilterCount = appliedFilters.length

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={onClear} className="clear-filters">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {filters.map(filter => (
        <FilterGroup
          key={filter.id}
          filter={filter}
          value={appliedFilters.find(f => f.filterId === filter.id)?.value}
          onChange={(value) => handleFilterChange(filter.id, value)}
          loading={loading}
        />
      ))}
    </div>
  )
}
```

### Sort Dropdown Component

```typescript
// src/components/SortDropdown.tsx
interface SortDropdownProps {
  options: SortOption[]
  currentSort: AppliedSort
  onChange: (sort: AppliedSort) => void
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  currentSort,
  onChange
}) => {
  return (
    <div className="sort-control">
      <label>Sort by:</label>
      <select
        value={currentSort.id}
        onChange={(e) => onChange({
          ...currentSort,
          id: e.target.value,
          direction: 'asc'
        })}
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        className="sort-direction"
        onClick={() => onChange({
          ...currentSort,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
        })}
        aria-label={`Sort ${currentSort.direction === 'asc' ? 'descending' : 'ascending'}`}
      >
        {currentSort.direction === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )
}
```

### Search Box Component

```typescript
// src/components/SearchBox.tsx
export const SearchBox: React.FC<{
  onSearch: (term: string) => void
  placeholder?: string
}> = ({ onSearch, placeholder = 'Search...' }) => {
  const [term, setTerm] = useState('')
  const { suggestions, loading } = useSearchSuggestions(term)

  return (
    <div className="search-box">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onBlur={() => {
          if (term.length >= 2) {
            onSearch(term)
          }
        }}
        placeholder={placeholder}
        role="searchbox"
      />

      {term.length >= 2 && (
        <div className="suggestions">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : (
            suggestions.map(suggestion => (
              <div
                key={suggestion}
                onClick={() => {
                  setTerm(suggestion)
                  onSearch(suggestion)
                }}
                className="suggestion-item"
              >
                {suggestion}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

---

**Document Version**: 1.0  
**Status**: Implementation Ready  
**Last Updated**: December 17, 2025
