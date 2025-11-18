# Admin Paste Feature Implementation Plan

**Date**: 2025-11-18
**Status**: Planning
**Priority**: High
**Assignee**: Development Team

## Overview

Add admin portal at `/admin` route with paste functionality to accept URLs, documents, images, files (PDFs). Mock knowledge extraction from pasted content and save to database.

## Requirements

### Functional Requirements
- Admin portal accessible at `/admin` route
- Paste interface supporting:
  - URLs/links (with metadata extraction)
  - Text documents (plain text)
  - Images (with mock OCR)
  - Files (PDFs with mock text extraction)
- Mock knowledge extraction from pasted content
- Database persistence of extracted knowledge
- List view of all extracted knowledge items
- Delete functionality for knowledge items
- Search/filter capability

### Non-Functional Requirements
- Follow existing codebase patterns (service layer, API routes, Zod validation)
- Use shadcn/ui components
- WCAG 2.1 AA accessibility compliance
- Structured logging with context
- Error handling and validation
- Responsive design (mobile-first)

## Architecture

### Data Flow
```
Admin UI → API Route → Service Layer → Database
         ← JSON Response ←           ←
```

### Component Hierarchy
```
/admin page
├── PasteInterface (tabs: URL, Text, Image, File)
├── KnowledgeList (table with search/filter)
└── KnowledgeItem (card with delete action)
```

## Database Schema Changes

### New Tables

#### knowledge_items
Stores extracted knowledge from pasted content.

```typescript
// src/models/schema.ts
export const contentTypeEnum = pgEnum("content_type", [
  "url",
  "text",
  "image",
  "pdf",
  "document"
]);

export const knowledgeItems = pgTable("knowledge_items", {
  id: text("id").primaryKey(),
  contentType: contentTypeEnum("content_type").notNull(),
  sourceUrl: text("source_url"),           // Original URL if applicable
  sourceTitle: text("source_title"),       // Title/filename
  rawContent: text("raw_content"),         // Original pasted content
  extractedText: text("extracted_text"),   // Extracted text content
  metadata: json("metadata")               // Additional metadata
    .$type<{
      fileSize?: number;
      mimeType?: string;
      imageWidth?: number;
      imageHeight?: number;
      pageCount?: number;
      language?: string;
      wordCount?: number;
      [key: string]: unknown;
    }>(),
  keywords: json("keywords")               // Extracted keywords
    .$type<string[]>(),
  summary: text("summary"),                // AI-generated summary
  createdByUserId: text("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const knowledgeItemsRelations = relations(
  knowledgeItems,
  ({ one }) => ({
    createdBy: one(users, {
      fields: [knowledgeItems.createdByUserId],
      references: [users.id],
    }),
  })
);
```

### Migration Steps
```bash
# 1. Add new schema definitions to src/models/schema.ts
# 2. Generate migration
pnpm drizzle:generate

# 3. Review generated migration in drizzle/ folder
# 4. Apply migration
pnpm drizzle:migrate
```

## API Endpoints

### POST /api/admin/knowledge
Create new knowledge item from pasted content.

**Request Schema**:
```typescript
// src/models/knowledgeItem.ts
export const createKnowledgeItemSchema = z.object({
  contentType: z.enum(["url", "text", "image", "pdf", "document"]),
  content: z.string().min(1, "Content required"),
  sourceTitle: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
```

**Response**: `KnowledgeItem` object

**Error Codes**:
- 400: Invalid request data
- 401: Unauthorized (non-admin)
- 500: Server error

### GET /api/admin/knowledge
List all knowledge items with pagination and filtering.

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `contentType`: string (filter by type)
- `search`: string (search in title/content)

**Response**:
```typescript
{
  items: KnowledgeItem[];
  total: number;
  page: number;
  limit: number;
}
```

### DELETE /api/admin/knowledge/[id]
Delete knowledge item by ID.

**Response**: `{ success: true }`

## Service Functions

### src/services/knowledgeService.ts

```typescript
/**
 * Mock knowledge extraction from URL
 */
async function extractFromUrl(url: string): Promise<ExtractedKnowledge> {
  // Mock implementation:
  // - Parse URL
  // - Extract domain and path
  // - Generate mock metadata
  // - Return structured data
}

/**
 * Mock knowledge extraction from text
 */
async function extractFromText(text: string): Promise<ExtractedKnowledge> {
  // Mock implementation:
  // - Count words
  // - Extract first sentence as summary
  // - Generate mock keywords (first 5 words)
  // - Return structured data
}

/**
 * Mock knowledge extraction from image
 */
async function extractFromImage(
  imageData: string,
  fileName: string
): Promise<ExtractedKnowledge> {
  // Mock implementation:
  // - Extract file size from base64
  // - Mock OCR result (placeholder text)
  // - Generate mock keywords
  // - Return structured data
}

/**
 * Mock knowledge extraction from PDF
 */
async function extractFromPdf(
  pdfData: string,
  fileName: string
): Promise<ExtractedKnowledge> {
  // Mock implementation:
  // - Extract file size
  // - Mock PDF text extraction
  // - Mock page count (random 1-10)
  // - Generate mock keywords
  // - Return structured data
}

/**
 * Create knowledge item with extraction
 */
export async function createKnowledgeItem(
  request: CreateKnowledgeItemRequest,
  userId: string
): Promise<KnowledgeItem> {
  // 1. Validate input
  // 2. Extract knowledge based on contentType
  // 3. Create database record
  // 4. Return created item
}

/**
 * List knowledge items with pagination
 */
export async function listKnowledgeItems(
  options: ListKnowledgeOptions
): Promise<PaginatedKnowledgeItems> {
  // 1. Build query with filters
  // 2. Apply pagination
  // 3. Execute query
  // 4. Return paginated results
}

/**
 * Delete knowledge item
 */
export async function deleteKnowledgeItem(
  id: string
): Promise<void> {
  // 1. Check item exists
  // 2. Delete from database
}
```

### Mock Extraction Logic

**URL Extraction**:
```typescript
const extractedText = `Content from ${new URL(url).hostname}`;
const keywords = [hostname, ...pathParts].slice(0, 5);
const summary = `Web content from ${url}`;
```

**Text Extraction**:
```typescript
const wordCount = text.split(/\s+/).length;
const keywords = text.split(/\s+/).slice(0, 5);
const summary = text.split(/[.!?]/)[0] + "...";
```

**Image Extraction** (Mock OCR):
```typescript
const extractedText = `Mock OCR result from image: ${fileName}`;
const keywords = ["image", "visual", "content"];
const summary = `Image file: ${fileName}`;
```

**PDF Extraction**:
```typescript
const pageCount = Math.floor(Math.random() * 10) + 1;
const extractedText = `Mock PDF content from ${fileName} (${pageCount} pages)`;
const keywords = ["document", "pdf", fileName.replace(".pdf", "")];
const summary = `PDF document with ${pageCount} pages`;
```

## Components

### app/admin/page.tsx
Main admin portal page.

```typescript
"use client";

// Component structure:
// - AppShell wrapper
// - Page header with title
// - PasteInterface component
// - KnowledgeList component
// - Loading states
// - Error handling
```

### src/components/PasteInterface.tsx
Tabbed interface for different paste types.

**Structure**:
```typescript
<Tabs defaultValue="url">
  <TabsList>
    <TabsTrigger value="url">
      <Link className="h-4 w-4" />
      URL
    </TabsTrigger>
    <TabsTrigger value="text">
      <FileText className="h-4 w-4" />
      Text
    </TabsTrigger>
    <TabsTrigger value="image">
      <Image className="h-4 w-4" />
      Image
    </TabsTrigger>
    <TabsTrigger value="file">
      <File className="h-4 w-4" />
      File
    </TabsTrigger>
  </TabsList>

  <TabsContent value="url">
    <UrlPasteForm />
  </TabsContent>
  {/* ... other tabs */}
</Tabs>
```

**Features**:
- Input validation (Zod schemas)
- File upload handling (drag-drop support)
- Loading states during extraction
- Success/error messages
- Clear form after successful submission

### src/components/KnowledgeList.tsx
Displays list of knowledge items.

**Structure**:
```typescript
<div className="space-y-4">
  {/* Search and Filter Controls */}
  <div className="flex gap-4">
    <Input
      placeholder="Search knowledge..."
      value={search}
      onChange={handleSearch}
    />
    <Select value={filter} onValueChange={setFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="url">URLs</SelectItem>
        <SelectItem value="text">Text</SelectItem>
        <SelectItem value="image">Images</SelectItem>
        <SelectItem value="pdf">PDFs</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Knowledge Items Grid/Table */}
  <div className="grid gap-4">
    {items.map(item => (
      <KnowledgeItemCard key={item.id} item={item} />
    ))}
  </div>

  {/* Pagination */}
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
</div>
```

**Features**:
- Real-time search (debounced)
- Type filtering
- Pagination controls
- Empty state when no items
- Loading skeleton

### src/components/KnowledgeItemCard.tsx
Individual knowledge item display.

**Structure**:
```typescript
<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <Badge>{contentType}</Badge>
        <CardTitle>{sourceTitle}</CardTitle>
        <CardDescription>
          {format(createdAt, "MMM d, yyyy")}
        </CardDescription>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        aria-label="Delete knowledge item"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground mb-2">
      {summary}
    </p>
    <div className="flex flex-wrap gap-2">
      {keywords.map(kw => (
        <Badge key={kw} variant="secondary">{kw}</Badge>
      ))}
    </div>
    {/* Metadata display */}
    <dl className="mt-4 text-sm">
      <dt className="font-medium">Word Count:</dt>
      <dd className="text-muted-foreground">{metadata.wordCount}</dd>
      {/* ... other metadata */}
    </dl>
  </CardContent>
</Card>
```

**Features**:
- Content type badge
- Formatted timestamps
- Keyword tags
- Metadata display
- Delete confirmation dialog
- Hover effects

## Files to Create

### Database & Models
- ✓ Modify: `src/models/schema.ts` (add knowledgeItems table)
- ✓ Create: `src/models/knowledgeItem.ts` (types and schemas)

### Services
- ✓ Create: `src/services/knowledgeService.ts` (extraction logic)

### API Routes
- ✓ Create: `app/api/admin/knowledge/route.ts` (POST, GET)
- ✓ Create: `app/api/admin/knowledge/[id]/route.ts` (DELETE)

### Pages
- ✓ Create: `app/admin/page.tsx` (main admin portal)
- ✓ Create: `app/admin/layout.tsx` (admin layout wrapper)

### Components
- ✓ Create: `src/components/PasteInterface.tsx` (tabbed paste UI)
- ✓ Create: `src/components/KnowledgeList.tsx` (list with filters)
- ✓ Create: `src/components/KnowledgeItemCard.tsx` (item display)
- ✓ Create: `src/components/UrlPasteForm.tsx` (URL input form)
- ✓ Create: `src/components/TextPasteForm.tsx` (text input form)
- ✓ Create: `src/components/ImagePasteForm.tsx` (image upload form)
- ✓ Create: `src/components/FilePasteForm.tsx` (file upload form)

### Schemas
- ✓ Modify: `src/schemas/index.ts` (export knowledge schemas)

## Implementation Steps

### Phase 1: Database Setup
1. Add `contentTypeEnum` and `knowledgeItems` table to schema
2. Create `src/models/knowledgeItem.ts` with types and Zod schemas
3. Generate database migration
4. Review and apply migration
5. Test schema in Drizzle Studio

**Acceptance Criteria**:
- Table created successfully
- Can insert/query knowledge items
- Relations work correctly

### Phase 2: Service Layer
1. Create `src/services/knowledgeService.ts`
2. Implement mock extraction functions:
   - `extractFromUrl()`
   - `extractFromText()`
   - `extractFromImage()`
   - `extractFromPdf()`
3. Implement CRUD functions:
   - `createKnowledgeItem()`
   - `listKnowledgeItems()`
   - `deleteKnowledgeItem()`
4. Add structured logging
5. Write unit tests

**Acceptance Criteria**:
- All extraction functions return mock data
- CRUD operations work correctly
- Logging includes proper context
- Unit tests pass

### Phase 3: API Routes
1. Create `app/api/admin/knowledge/route.ts`
   - POST handler with validation
   - GET handler with pagination
2. Create `app/api/admin/knowledge/[id]/route.ts`
   - DELETE handler
3. Add error handling
4. Add logging with request context
5. Write contract tests

**Acceptance Criteria**:
- API returns correct status codes
- Validation errors return 400
- Success responses match schema
- Contract tests pass

### Phase 4: Form Components
1. Create `UrlPasteForm.tsx`
   - Input with URL validation
   - Submit handler
   - Loading/error states
2. Create `TextPasteForm.tsx`
   - Textarea with character count
   - Submit handler
3. Create `ImagePasteForm.tsx`
   - Drag-drop file input
   - Image preview
   - Base64 encoding
4. Create `FilePasteForm.tsx`
   - File input (PDF only)
   - File size validation
   - Base64 encoding

**Acceptance Criteria**:
- Forms validate input correctly
- Submit handlers call API
- Loading states display correctly
- Error messages are user-friendly
- Success feedback is clear

### Phase 5: List Components
1. Create `KnowledgeItemCard.tsx`
   - Display all item fields
   - Delete button with confirmation
   - Responsive design
2. Create `KnowledgeList.tsx`
   - Search input (debounced)
   - Type filter dropdown
   - Grid/table layout
   - Pagination controls
   - Empty state

**Acceptance Criteria**:
- Items display all data correctly
- Search filters list in real-time
- Pagination works correctly
- Delete removes items
- Empty state shows when no items

### Phase 6: Main Page Assembly
1. Create `app/admin/layout.tsx`
   - Admin-specific layout
   - Navigation breadcrumbs
   - Access control placeholder
2. Create `app/admin/page.tsx`
   - Page header
   - PasteInterface component
   - KnowledgeList component
   - State management
3. Create `PasteInterface.tsx`
   - Tabbed layout
   - Integrate form components
   - Handle submission
4. Wire up all components

**Acceptance Criteria**:
- Admin page loads correctly
- All tabs work
- Forms submit successfully
- List updates after creation
- Delete updates list

### Phase 7: Polish & Testing
1. Add loading skeletons
2. Add error boundaries
3. Improve accessibility:
   - ARIA labels
   - Keyboard navigation
   - Focus management
4. Add animations (150-300ms)
5. Test responsive design
6. E2E testing with Playwright
7. Accessibility audit

**Acceptance Criteria**:
- WCAG 2.1 AA compliant
- Keyboard navigation works
- Screen reader compatible
- Works on mobile/tablet/desktop
- E2E tests pass

## Testing Strategy

### Unit Tests
- `knowledgeService.test.ts`:
  - Test all extraction functions
  - Test CRUD operations
  - Test error handling
  - Mock database calls

### Contract Tests
- `admin/knowledge.post.test.ts`:
  - Test POST endpoint validation
  - Test successful creation
  - Test error responses
- `admin/knowledge.get.test.ts`:
  - Test GET with pagination
  - Test filtering
  - Test search
- `admin/knowledge.delete.test.ts`:
  - Test successful deletion
  - Test not found error

### Integration Tests
- `admin-flow.test.ts`:
  - Create knowledge from each type
  - List and filter items
  - Delete item
  - Verify database state

### E2E Tests
- Navigate to /admin
- Paste URL and verify extraction
- Paste text and verify extraction
- Upload image and verify extraction
- Upload PDF and verify extraction
- Search and filter knowledge items
- Delete knowledge item
- Verify empty state

## Security Considerations

### Access Control
- Admin routes should check user permissions
- Placeholder implementation for now
- Future: Add role-based access control (RBAC)

### Input Validation
- Validate all inputs with Zod schemas
- Sanitize file uploads
- Limit file sizes (10MB max)
- Allowed file types: images (jpg, png, webp), PDFs only

### Data Protection
- Don't log sensitive content in logs
- Sanitize URLs before storing
- Validate base64 data before processing

### Rate Limiting
- Future enhancement: Rate limit file uploads
- Current: No rate limiting (mock implementation)

## Performance Considerations

### File Upload
- Max file size: 10MB
- Base64 encoding overhead: ~33% size increase
- Future: Use direct file upload (S3/R2)

### Pagination
- Default: 20 items per page
- Max: 100 items per page
- Index on `createdAt` for sorting

### Search
- Simple LIKE query for now
- Future: Full-text search with PostgreSQL
- Debounce search input (300ms)

### Caching
- No caching in initial implementation
- Future: Cache list results with Redis

## Risks & Mitigations

### Risk: Large File Uploads
**Impact**: High
**Mitigation**:
- Limit file size to 10MB
- Show upload progress
- Handle timeout errors gracefully

### Risk: Mock Extraction Limitations
**Impact**: Medium
**Mitigation**:
- Clearly label as "mock" in UI
- Document future enhancement path
- Provide realistic mock data

### Risk: No Access Control
**Impact**: High
**Mitigation**:
- Add TODO comments for future RBAC
- Create placeholder middleware
- Document security requirements

### Risk: Base64 Storage Inefficiency
**Impact**: Medium
**Mitigation**:
- Accept for MVP (mock implementation)
- Plan for external storage migration
- Monitor database size

## Future Enhancements

### P1 (Next Phase)
- Real URL metadata fetching (OpenGraph, meta tags)
- Actual OCR integration (Google Vision API)
- Real PDF text extraction (pdf-parse library)
- Role-based access control
- File storage (Cloudflare R2 / S3)

### P2 (Later)
- AI-powered keyword extraction (Gemini API)
- AI-generated summaries (Gemini API)
- Full-text search
- Knowledge categorization/tagging
- Bulk import functionality
- Export knowledge to CSV/JSON
- Duplicate detection

## TODO Tasks

### Database
- [ ] Add `contentTypeEnum` to schema.ts
- [ ] Add `knowledgeItems` table to schema.ts
- [ ] Create `src/models/knowledgeItem.ts`
- [ ] Generate database migration
- [ ] Apply migration
- [ ] Test in Drizzle Studio

### Service Layer
- [ ] Create `src/services/knowledgeService.ts`
- [ ] Implement `extractFromUrl()`
- [ ] Implement `extractFromText()`
- [ ] Implement `extractFromImage()`
- [ ] Implement `extractFromPdf()`
- [ ] Implement `createKnowledgeItem()`
- [ ] Implement `listKnowledgeItems()`
- [ ] Implement `deleteKnowledgeItem()`
- [ ] Add structured logging
- [ ] Write unit tests

### API Routes
- [ ] Create `app/api/admin/knowledge/route.ts` (POST)
- [ ] Add POST validation and error handling
- [ ] Add GET endpoint with pagination
- [ ] Create `app/api/admin/knowledge/[id]/route.ts` (DELETE)
- [ ] Add logging to all endpoints
- [ ] Write contract tests

### Components - Forms
- [ ] Create `src/components/UrlPasteForm.tsx`
- [ ] Create `src/components/TextPasteForm.tsx`
- [ ] Create `src/components/ImagePasteForm.tsx`
- [ ] Create `src/components/FilePasteForm.tsx`
- [ ] Add validation to all forms
- [ ] Add loading states
- [ ] Add error handling

### Components - List
- [ ] Create `src/components/KnowledgeItemCard.tsx`
- [ ] Create `src/components/KnowledgeList.tsx`
- [ ] Add search functionality (debounced)
- [ ] Add type filter
- [ ] Add pagination
- [ ] Add delete confirmation dialog
- [ ] Add empty state

### Pages
- [ ] Create `app/admin/layout.tsx`
- [ ] Create `app/admin/page.tsx`
- [ ] Create `src/components/PasteInterface.tsx`
- [ ] Wire up all components
- [ ] Add state management
- [ ] Add loading states
- [ ] Add error boundaries

### Testing
- [ ] Write unit tests for knowledgeService
- [ ] Write contract tests for API endpoints
- [ ] Write integration tests for admin flow
- [ ] Write E2E tests for admin portal
- [ ] Perform accessibility audit
- [ ] Test on mobile/tablet/desktop

### Polish
- [ ] Add loading skeletons
- [ ] Add animations (150-300ms)
- [ ] Add success/error toasts
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Add ARIA labels
- [ ] Test with screen reader

## Unresolved Questions

1. **Access Control**: Should we implement basic admin middleware now or defer to later?
   - **Recommendation**: Add middleware stub with TODO for future RBAC implementation

2. **File Storage**: Base64 in database vs external storage for MVP?
   - **Recommendation**: Use base64 for MVP, plan migration path to R2/S3

3. **URL Fetching**: Should we fetch actual URL content for MVP or keep fully mock?
   - **Recommendation**: Keep fully mock for MVP, document enhancement path

4. **Extraction Library**: Use existing libraries (pdf-parse, tesseract.js) or fully mock?
   - **Recommendation**: Fully mock for MVP to avoid complexity

5. **AI Integration**: Should summary/keywords use Gemini API or remain mock?
   - **Recommendation**: Mock for MVP, easy to swap later with existing aiContentService pattern

## Summary

Comprehensive plan for admin portal with paste feature. Mock implementation for knowledge extraction allows rapid MVP development while maintaining clear enhancement path for production features. Follows existing codebase patterns (service layer, API routes, Zod validation, shadcn/ui).

**Estimated Effort**: 3-5 days
**Dependencies**: None (all dependencies already in project)
**Risk Level**: Low (mock implementation, no external integrations)
