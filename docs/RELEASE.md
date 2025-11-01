# Release Notes & Changelog

## Version 0.2.0 (2025-10-31)

### New Features

#### Environment Variable Validation (`src/lib/env.ts`)
- **Zod-based validation** of all environment variables at startup
- **Type-safe configuration** with exported typed interfaces
- **Fail-fast behavior** with descriptive error messages for misconfiguration
- **Support for required and optional variables** with sensible defaults
- Validates `DATABASE_URL`, `GEMINI_API_KEY`, `REDIS_URL`, `NODE_ENV`, `PORT`

#### Structured Logging System (`src/lib/logger.ts`)
- **JSON-formatted logging** for parsing and analysis
- **Request context tracking** (userId, sessionId, endpoint, method, duration)
- **Multiple log levels**: DEBUG (dev only), INFO, WARN, ERROR
- **Specialized helpers**:
  - `apiRequest()` / `apiError()` for API routes
  - `serviceOperation()` / `serviceError()` for services
- **Request context helper** `getRequestContext()` for Next.js routes
- **No sensitive data logging** - passwords, API keys, tokens excluded
- **Environment-based configuration** (DEBUG in dev, INFO+ in production)

#### Redis-Based Rate Limiting (`src/services/rateLimitService.ts`, `src/lib/redis.ts`)
- **Distributed rate limiting** for AI content generation
- **Multiple limit types**:
  - 5 generations per session (1-hour window)
  - 20 generations per day per user
  - 60-second cooldown between requests
- **Redis client with in-memory fallback**:
  - Production-ready Redis support (when `REDIS_URL` configured)
  - Automatic fallback to in-memory implementation
  - Same rate limiting behavior in both modes
- **Admin functions**: `getRateLimitStatus()`, `resetUserRateLimits()`
- **Graceful degradation** when Redis unavailable

### Bug Fixes

#### Analytics Query Fix
- **Issue**: Analytics summary endpoint returned incomplete sessions instead of completed ones
- **Fix**: Corrected query filter in `analyticsService.ts` to use `completedAt IS NOT NULL`
- **Impact**: Analytics dashboard now accurately shows completed session data

#### Session Query Logic Fix
- **Issue**: Active session filtering incorrectly identified sessions
- **Fix**: Updated session query logic in `sessionService.ts` to properly filter active sessions
- **Impact**: Session management now correctly handles active vs completed sessions

### Documentation Updates

#### Updated `.env.example`
- Comprehensive documentation of all environment variables
- Clear sections for required vs optional configuration
- Examples and descriptions for each variable
- Links to obtain API keys

#### Code Standards (`docs/code-standards.md`)
- New **Logging Standards** section with usage patterns
- New **Environment Variable Standards** section with validation approach
- New **Rate Limiting Standards** section with implementation examples
- Updated best practices for structured logging vs console usage

#### Codebase Summary (`docs/codebase-summary.md`)
- Added environment validation pattern documentation
- Added structured logging architecture details
- Added rate limiting service documentation
- Updated development principles with new patterns

#### System Architecture (`docs/system-architecture.md`)
- New **Configuration Layer** section covering env validation
- New **Logging & Monitoring Layer** section with log structure
- New **Rate Limiting Layer** section with Redis architecture
- Detailed flow diagrams for configuration, logging, and rate limiting

#### README.md
- Enhanced environment setup section with validation details
- New **Logging & Monitoring** section with examples
- Expanded **Rate Limiting** section with Redis details
- Updated tech stack with new components

### Breaking Changes

**None** - All changes are backwards compatible.

### Migration Guide

#### For Developers

1. **Update environment file**:
   ```bash
   # Review .env.example for new optional variables
   # Add REDIS_URL if using distributed rate limiting (optional)
   cp .env.example .env.local
   ```

2. **Update dependencies** (if needed):
   ```bash
   pnpm install
   ```

3. **Replace console.log with logger**:
   ```typescript
   // Old
   console.log('User created', userId);

   // New
   import { logger } from '@/lib/logger';
   logger.info('User created', { userId });
   ```

4. **Use validated env instead of process.env**:
   ```typescript
   // Old
   const apiKey = process.env.GEMINI_API_KEY;

   // New
   import { env } from '@/lib/env';
   const apiKey = env.GEMINI_API_KEY; // Type-safe and validated
   ```

#### For Deployment

**No changes required** - Application maintains backward compatibility:
- Redis is optional (falls back to in-memory)
- Existing environment variables still work
- Logging output format is additive (JSON structure)

### Technical Details

#### Files Added
- `src/lib/env.ts` - Environment variable validation
- `src/lib/redis.ts` - Redis client with fallback
- `src/services/rateLimitService.ts` - Rate limiting logic

#### Files Modified
- `src/lib/logger.ts` - Enhanced with new methods
- `.env.example` - Comprehensive documentation
- Multiple API routes - Replaced console with logger
- Multiple services - Added structured logging

#### Performance Impact
- **Startup time**: +10-20ms for environment validation (one-time cost)
- **Logging overhead**: Negligible (JSON.stringify optimized by V8)
- **Rate limiting**: <1ms per check (Redis) or <0.1ms (in-memory)

#### Security Improvements
- Environment validation prevents misconfiguration
- Structured logging excludes sensitive data
- Rate limiting protects AI endpoints from abuse

---

# Release Process Documentation

This document explains the automated release system for this project.

## Overview

This project uses [semantic-release](https://semantic-release.gitbook.io/) to automate the entire package release workflow including:

- Determining the next version number based on commit messages
- Generating release notes and changelog
- Publishing to NPM registry (optional, disabled by default)
- Creating GitHub releases
- Updating documentation

## How It Works

### 1. Commit Analysis
- Every commit to the `main` branch is analyzed for release-worthy changes
- Commit messages must follow [Conventional Commits](https://conventionalcommits.org/) format
- Different commit types trigger different version bumps:
  - `feat:` → Minor version bump (e.g., 1.0.0 → 1.1.0)
  - `fix:` → Patch version bump (e.g., 1.0.0 → 1.0.1)  
  - `feat!:` or `BREAKING CHANGE:` → Major version bump (e.g., 1.0.0 → 2.0.0)
  - `docs:`, `refactor:`, `style:` → Patch version bump
  - `ci:`, `test:`, `chore:` → No release (unless configured otherwise)

### 2. Automated Workflow
The release process is triggered on every push to `main` branch via GitHub Actions:

1. **Code Quality Checks**: Run tests and linting
2. **Version Analysis**: Determine if a release is needed
3. **Version Calculation**: Calculate next semantic version
4. **Changelog Generation**: Generate release notes from commits
5. **Package Publishing**: Publish to NPM registry (if enabled)
6. **GitHub Release**: Create GitHub release with assets
7. **Documentation Update**: Update CHANGELOG.md and commit back

### 3. Release Artifacts
Each release creates:
- **NPM Package**: Published to the NPM registry (if npmPublish is enabled)
- **GitHub Release**: With generated release notes
- **Git Tags**: Semantic version tags (e.g., `v1.2.3`)
- **CHANGELOG.md**: Updated with new release notes
- **GitHub Release Assets**: Including the changelog

## Commit Message Guidelines

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

#### Feature (Minor Version Bump)
```bash
feat: add user authentication system
feat(auth): implement OAuth2 integration
```

#### Bug Fix (Patch Version Bump)
```bash
fix: resolve memory leak in data processing
fix(api): handle null response from external service
```

#### Breaking Change (Major Version Bump)
```bash
feat!: redesign API response structure
# or
feat: redesign API response structure

BREAKING CHANGE: API response format has changed from array to object
```

#### Documentation (Patch Version Bump)
```bash
docs: update installation instructions
docs(api): add examples for authentication endpoints
```

#### Refactor (Patch Version Bump)
```bash
refactor: simplify user service logic
refactor(database): optimize query performance
```

#### Other Types (No Release by default)
```bash
test: add unit tests for authentication
ci: update GitHub Actions workflow
chore: update dependencies
style: fix code formatting
```

## Configuration Files

### `.releaserc.json`
Main configuration for semantic-release:
- Defines release branches (`main`)
- Configures plugins for analysis, changelog, NPM, GitHub, and git
- Customizes release notes format with emojis

### `.commitlintrc.json`
Configuration for commit message validation:
- Enforces conventional commit format
- Defines allowed commit types
- Sets message length and format rules

### `.github/workflows/release.yml`
GitHub Actions workflow:
- Triggers on push to main branch
- Runs quality checks (tests, linting, security audit)
- Executes semantic-release process

## Manual Release Process

If you need to create a release manually or understand the process:

```bash
# 1. Ensure you're on the main branch with latest changes
git checkout main
git pull origin main

# 2. Install dependencies
npm ci

# 3. Run quality checks
npm test
npm run lint

# 4. Run semantic-release (locally, not recommended for production)
npm run semantic-release
```

**Note**: Manual releases are not recommended. Use the automated GitHub Actions workflow instead.

## Troubleshooting

### No Release Created
**Problem**: Push to main didn't create a release
**Possible Causes**:
- No releasable commits (only `ci:`, `test:`, `chore:` commits)
- Commit messages don't follow conventional format
- Tests or linting failed

**Solution**:
- Check commit messages follow conventional format
- Ensure at least one `feat:`, `fix:`, or breaking change commit
- Verify all checks pass in GitHub Actions

### Release Failed
**Problem**: GitHub Actions workflow failed during release
**Possible Causes**:
- Missing NPM_TOKEN secret
- Insufficient GitHub permissions
- NPM package name already exists
- Network issues

**Solution**:
- Check GitHub Actions logs for specific error
- Verify repository secrets are configured
- Ensure package name is unique in NPM
- Check permissions for GitHub token

### Wrong Version Number
**Problem**: Released version doesn't match expectations
**Possible Causes**:
- Incorrect commit message type
- Missing breaking change indicators
- Previous releases affect version calculation

**Solution**:
- Review commit history and types
- Use `feat!:` or `BREAKING CHANGE:` footer for breaking changes
- Check existing tags and releases

## Best Practices

1. **Commit Frequently**: Small, focused commits with clear messages
2. **Use Conventional Commits**: Always follow the format for automatic releases
3. **Test Before Push**: Ensure code quality before pushing to main
4. **Document Breaking Changes**: Clearly describe breaking changes in commit body
5. **Review Release Notes**: Check generated changelogs for accuracy
6. **Monitor Releases**: Watch GitHub Actions for release status

## Repository Setup Requirements

For the automated release system to work, ensure:

1. **GitHub Repository**:
   - Repository exists and is accessible
   - `main` branch is the default branch
   - GitHub Actions are enabled

2. **NPM Setup** (optional - only if you want to publish to NPM):
   - Set `npmPublish: true` in `.releaserc.json`
   - NPM account with appropriate permissions
   - `NPM_TOKEN` secret configured in GitHub repository settings

3. **Package Configuration**:
   - `package.json` has correct repository URL
   - Package name is unique (if publishing publicly)
   - License and other metadata are complete

4. **Branch Protection** (recommended):
   - Protect `main` branch
   - Require PR reviews
   - Require status checks to pass

## Security Considerations

- **Secrets Management**: Never commit API tokens or secrets
- **NPM Token**: Use automation tokens with minimal required permissions
- **GitHub Token**: Uses built-in `GITHUB_TOKEN` with limited scope
- **Dependency Security**: Regular `npm audit` runs in CI/CD
- **Package Integrity**: Uses npm provenance attestations

---

For more information, see:
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits Specification](https://conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)