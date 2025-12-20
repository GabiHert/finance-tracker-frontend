# Feature: M16 Interactive Charts

## Overview
Transform dashboard charts from static period-based displays into fully interactive, scrollable visualizations with navigation controls, minimap, and zoom levels.

## Components to Implement

### 1. InteractiveTrendsChart
Wrapper around TrendsChart with scroll/navigation functionality.

**TestIDs Required:**
- `interactive-trends-chart` - main container
- `trends-chart-viewport` - scrollable area
- `chart-data-point` - individual data points
- `chart-x-axis-label` - axis labels
- `chart-empty-period` - empty period indicator
- `chart-empty-state` - no data state

**Features:**
- Drag/swipe to scroll through time
- Click on data points to open TransactionModal
- Double-click to reset to current period
- Keyboard navigation with Arrow keys

### 2. ChartMiniMap
Timeline showing viewport position in data range.

**TestIDs Required:**
- `chart-minimap` - main container
- `chart-minimap-track` - background track
- `chart-minimap-thumb` - draggable position indicator
- `minimap-start-date` - start date label
- `minimap-end-date` - end date label

**Features:**
- Draggable thumb to position viewport
- Shows current position within full data range
- Updates as chart is scrolled

### 3. ChartNavigation
Navigation controls for the chart viewport.

**TestIDs Required:**
- `chart-nav-prev` - previous button
- `chart-nav-next` - next button
- `chart-zoom-toggle` - zoom level selector

**Features:**
- Prev/Next buttons for step navigation
- Zoom toggle with options: "Dia", "Semana", "Mês", "Tri"
- Buttons have `data-selected="true/false"` attribute
- Prev disabled at oldest data, Next disabled at newest data

### 4. ChartLoadingOverlay
Loading indicator for data fetch.

**TestID Required:**
- `chart-loading` - loading overlay

**Features:**
- Semi-transparent overlay with spinner
- Shows during data loading

## Implementation Steps

1. Create ChartLoadingOverlay component
2. Create ChartNavigation component with zoom toggle
3. Create ChartMiniMap component
4. Create InteractiveTrendsChart wrapper
5. Create chart store for state management
6. Integrate in DashboardScreen
7. Run E2E tests

## API Endpoints (Already Available)
- GET /api/v1/dashboard/data-range - Returns oldest/newest dates
- GET /api/v1/dashboard/trends - Returns trend data with granularity

## Dependencies
- Existing TrendsChart component
- Existing dashboard API functions
- date-fns for date manipulation
