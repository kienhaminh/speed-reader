# Analytics Dashboard Design Patterns Research

**Date**: 2025-11-01
**Researcher**: Planner Agent
**Focus**: Analytics dashboard UX for reading apps

## Executive Summary

Card-based grid layouts dominant (Strava, Duolingo). KPI cards top, detailed charts below. Recharts recommended for React. Time-based filters essential. Mobile: stack cards vertically.

## Key Findings

### 1. Data Visualization Best Practices

**Chart Selection by Data Type**:

**Reading Speed Trends**:
- Line chart (time series)
- Show WPM over sessions
- Trend line optional
- Color: Blue gradient

**Comprehension Scores**:
- Bar chart (comparison across sessions)
- Stacked bar (score breakdown)
- Color: Green (good), Yellow (medium), Red (poor)

**Reading Mode Distribution**:
- Pie/donut chart (proportion)
- Alt: Horizontal bar chart
- Colors: Word (blue), Chunk (purple), Paragraph (green)

**Session Duration**:
- Area chart (cumulative time)
- Timeline view
- Color: Purple gradient

**Daily/Weekly Activity**:
- Heatmap calendar (GitHub-style)
- Color intensity: Light to dark accent

### 2. Dashboard Layout Patterns

**Grid Structure** (Desktop):
```
┌─────────────────────────────────────────┐
│  KPI Cards Row                          │
│  [Total] [Avg WPM] [Streak] [Sessions] │
├─────────────────┬───────────────────────┤
│  Large Chart    │  Secondary Chart      │
│  (Line: WPM)    │  (Bar: Scores)        │
├─────────────────┴───────────────────────┤
│  Tertiary Charts (2-3 columns)          │
│  [Mode Dist]  [Activity]  [Top Stats]   │
└─────────────────────────────────────────┘
```

**Mobile Stack**:
```
┌──────────────┐
│  KPI Card 1  │
│  KPI Card 2  │
│  KPI Card 3  │
│  KPI Card 4  │
├──────────────┤
│  Chart 1     │
│  (Full width)│
├──────────────┤
│  Chart 2     │
│  (Full width)│
└──────────────┘
```

**Responsive Breakpoints**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

### 3. KPI Display Patterns

**Card Structure**:
```tsx
<Card>
  <CardHeader>
    <Icon />
    <Label>Average WPM</Label>
  </CardHeader>
  <CardContent>
    <Value>285</Value>
    <Change trend="up">+12% vs last week</Change>
  </CardContent>
</Card>
```

**Visual Elements**:
- **Value**: Large number (2xl-3xl font)
- **Label**: Small gray text above
- **Trend**: Arrow + percentage + color
- **Icon**: Optional, top-right corner
- **Sparkline**: Mini chart (optional)

**Color Coding**:
- Positive trend: Green (#10B981)
- Negative trend: Red (#EF4444)
- Neutral: Gray (#6B7280)

**Example KPIs**:
1. Total Reading Time (hours)
2. Average WPM (number)
3. Current Streak (days)
4. Sessions Completed (count)
5. Comprehension Score (percentage)
6. Words Read (cumulative)

### 4. Interactive Filters

**Time Range Selector**:
```tsx
<Select value={timeRange} onChange={setTimeRange}>
  <option value="7d">Last 7 days</option>
  <option value="30d">Last 30 days</option>
  <option value="90d">Last 90 days</option>
  <option value="1y">Last year</option>
  <option value="all">All time</option>
</Select>
```

**Date Range Picker**:
- Calendar dropdown
- Preset ranges (This week, This month)
- Custom range selection

**Mode Filter**:
```tsx
<ButtonGroup>
  <Button variant={mode === 'all' ? 'primary' : 'outline'}>
    All
  </Button>
  <Button variant={mode === 'word' ? 'primary' : 'outline'}>
    Word
  </Button>
  <Button variant={mode === 'chunk' ? 'primary' : 'outline'}>
    Chunk
  </Button>
  <Button variant={mode === 'paragraph' ? 'primary' : 'outline'}>
    Paragraph
  </Button>
</ButtonGroup>
```

### 5. Real-Time vs Historical Data

**Real-Time Indicators**:
- Live badge ("Live")
- Pulsing dot animation
- Auto-refresh (30s interval)
- WebSocket connection optional

**Historical Data**:
- Date range selector
- Cached data (no auto-refresh)
- Export functionality

**Mixed Approach**:
- Current session: Real-time
- Past sessions: Historical
- Clear visual separation

### 6. Mobile Dashboard UX

**Optimizations**:
- Vertical stack (no horizontal scroll)
- Swipeable chart cards
- Collapsible sections
- Bottom sheet for filters
- Simplified charts (fewer data points)

**Touch Interactions**:
- Tap chart for details
- Swipe between time periods
- Pull to refresh
- Pinch to zoom (charts)

**Performance**:
- Lazy load charts below fold
- Reduce data points on mobile
- Use canvas over SVG for large datasets

### 7. Chart Libraries Comparison

**Recharts** (Recommended):
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={wpmData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="wpm" stroke="#3B82F6" />
  </LineChart>
</ResponsiveContainer>
```

**Pros**:
- React-first, component-based
- Responsive built-in
- Good docs
- TypeScript support

**Cons**:
- Larger bundle (~50KB)
- Less customization than D3

**Alternatives**:
- **Chart.js**: Canvas-based, performant
- **Victory**: Similar to Recharts
- **D3.js**: Full control, steep learning curve

### 8. Empty States & Zero Data

**No Sessions Yet**:
```tsx
<div className="empty-state">
  <Icon name="chart-line" size="xl" />
  <h3>No reading sessions yet</h3>
  <p>Start your first session to see analytics</p>
  <Button onClick={goToReading}>Start Reading</Button>
</div>
```

**No Data for Filter**:
```tsx
<div className="empty-state">
  <p>No sessions in selected time range</p>
  <Button variant="link" onClick={resetFilters}>
    Clear filters
  </Button>
</div>
```

**Loading State**:
```tsx
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-24" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-8 w-16" />
  </CardContent>
</Card>
```

### 9. Export & Sharing Features

**Export Options**:
- CSV download (raw data)
- PDF report (formatted)
- Image export (chart screenshot)

**Implementation**:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline">
      <Download /> Export
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={exportCSV}>
      Download CSV
    </DropdownMenuItem>
    <DropdownMenuItem onClick={exportPDF}>
      Export PDF Report
    </DropdownMenuItem>
    <DropdownMenuItem onClick={exportImage}>
      Save as Image
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Share Stats**:
- Social media cards (auto-generated image)
- Shareable link with stats
- Copy stats to clipboard

### 10. Progressive Data Loading

**Lazy Loading Strategy**:
```typescript
// Load critical KPIs first
const { data: kpis } = useSWR('/api/analytics/summary')

// Load charts on scroll
const { data: chartData } = useSWR(
  isVisible ? '/api/analytics/charts' : null
)
```

**Skeleton Screens**:
- Show layout immediately
- Pulse animation
- Preserve space (no layout shift)

**Pagination** (Large Datasets):
- 50 sessions per page
- Infinite scroll or numbered pages
- "Load more" button

## Dashboard Examples Analysis

### Strava
**Strengths**:
- Clean card-based layout
- Personal records highlighted
- Activity heatmap
- Social comparison

**Applicable**:
- KPI cards with trends
- Calendar heatmap for daily reading
- Personal bests (fastest WPM, longest streak)

### Duolingo
**Strengths**:
- Gamification (streak, XP)
- Progress rings
- Daily goal visualization
- Simple, colorful

**Applicable**:
- Streak counter
- Daily/weekly goals
- Progress rings for completion
- Achievement badges

### Google Analytics
**Strengths**:
- Real-time data
- Date range comparison
- Multiple chart types
- Deep drill-down

**Applicable**:
- Date range picker
- Real-time session tracking
- Export functionality

## Recommendations for Speed Reader

1. **Card-based grid** layout (4 KPI cards top)
2. **Recharts library** for charts
3. **Time range filter** (7d, 30d, 90d, all)
4. **Mobile stack** layout (vertical)
5. **Skeleton screens** for loading
6. **Empty states** with CTAs
7. **Export to CSV** functionality
8. **Trend indicators** (% change, arrows)
9. **Calendar heatmap** for daily activity
10. **Personal records** section

## Key Metrics to Display

**Primary KPIs**:
1. Average WPM (all modes)
2. Total reading time
3. Current streak (days)
4. Sessions completed

**Charts**:
1. WPM trend over time (line)
2. Comprehension scores (bar)
3. Mode distribution (donut)
4. Activity calendar (heatmap)

**Secondary Stats**:
- Fastest WPM (personal record)
- Most productive day/time
- Longest session duration
- Total words read

## Implementation Priority

1. **Phase 1**: KPI cards + basic line chart
2. **Phase 2**: Multiple chart types + filters
3. **Phase 3**: Export + sharing
4. **Phase 4**: Advanced features (comparisons, goals)

## Unresolved Questions

- Goal setting feature needed?
- Social comparison/leaderboards?
- AI-generated insights?
- Weekly email reports?
