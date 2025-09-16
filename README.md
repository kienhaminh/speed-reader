# Speed Reader

A modern web application for improving reading speed and comprehension through various reading techniques.

## Features

- **Multiple Reading Modes**:

  - Word-by-word display for focused reading
  - Chunk-of-meaning groups for natural flow
  - Paragraph highlighting for structured content

- **AI Content Generation**: Generate reading material using Google's Gemini AI
- **Comprehensive Testing**: Built-in comprehension quizzes after each session
- **Analytics Dashboard**: Track progress, WPM improvements, and comprehension scores
- **Multilingual Support**: English and Vietnamese content support
- **Accessibility**: Full keyboard navigation and screen reader support

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Generative AI (Gemini)
- **Testing**: Vitest (unit), Playwright (e2e)
- **Validation**: Zod schemas

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Gemini API key

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd speed-reader
pnpm install
```

### 2. Database Setup

Start PostgreSQL and create a database:

```bash

# Using Docker (recommended)

docker-compose up -d db

# Or using local PostgreSQL

createdb speedreader
```

### 3. Environment Configuration

Copy the environment template and configure:

```bash
cp .env.example .env.local
```

Update `.env.local` with your values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/speedreader"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Database Migration

Run the initial database migration:

```bash
pnpm drizzle:generate
pnpm drizzle:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Creating Content

1. **Manual Input**: Paste or upload text content
2. **AI Generation**: Specify a topic and let AI generate reading material

### Reading Sessions

1. Choose your reading mode (word, chunk, or paragraph)
2. Set your target reading speed (WPM)
3. Configure mode-specific settings (e.g., chunk size)
4. Start reading and track your progress

### Comprehension Testing

After each reading session:

- Answer 5 AI-generated multiple-choice questions
- Receive immediate feedback and scoring
- View detailed answer explanations

### Analytics

Track your progress over time:

- Reading speed improvements by mode
- Comprehension score trends
- Total reading time and session counts
- Export data for external analysis

## API Reference

### Core Endpoints

- `POST /api/content` - Create reading content
- `POST /api/content/generate` - Generate AI content
- `POST /api/sessions` - Start reading session
- `POST /api/sessions/complete` - Complete session
- `POST /api/questions` - Generate quiz questions
- `POST /api/answers` - Submit quiz answers
- `GET /api/analytics/summary` - Get analytics data
- `GET /api/health` - Health check

See `specs/001-i-want-to/contracts/openapi.yaml` for detailed API documentation.

## Development

### Running Tests

```bash

# Unit tests

pnpm test

# E2E tests

pnpm test:e2e

# All tests

pnpm test:all
```

### Database Operations

```bash

# Generate new migration

pnpm drizzle:generate

# Apply migrations

pnpm drizzle:migrate

# Open Drizzle Studio

pnpm drizzle:studio
```

### Code Quality

```bash

# Linting

pnpm lint

# Type checking

pnpm type-check

# Build

pnpm build
```

## Project Structure

```
speed-reader/
├── app/ # Next.js App Router
│ ├── api/ # API routes
│ └── page.tsx # Main application page
├── src/
│ ├── components/ # React components
│ ├── lib/ # Utility libraries
│ ├── models/ # Database models and schemas
│ ├── services/ # Business logic
│ ├── schemas/ # Validation schemas
│ └── i18n/ # Internationalization
├── tests/
│ ├── unit/ # Unit tests
│ ├── integration/ # Integration tests
│ └── contract/ # API contract tests
├── drizzle/ # Database migrations
└── specs/ # Project specifications
```

## Rate Limiting

AI content generation is rate-limited to prevent abuse:

- 5 generations per session
- 20 generations per day per user
- 1-minute cooldown between requests

## Accessibility

The application follows WCAG guidelines:

- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for dynamic content
- ARIA labels and live regions

## Performance

Key performance considerations:

- 60fps animations and transitions
- <50ms metric calculations
- Optimized bundle size with code splitting
- Database query optimization
- Caching strategies for static content

## Contributing

1. Follow the established code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure accessibility compliance
5. Run the full test suite before submitting

## License

[MIT License](LICENSE)

## Support

For issues and questions:

1. Check the [troubleshooting guide](docs/troubleshooting.md)
2. Review existing [GitHub issues](issues)
3. Create a new issue with detailed information

---

Built with ❤️ using modern web technologies for enhanced reading experiences.
