# Phase 01 -- Chart Library Setup

**Ref:** [plan.md](./plan.md)
**Depends on:** nothing
**Blocks:** Phase 02, Phase 03, Phase 04

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-04 |
| Description | Install recharts, create reusable chart wrapper components matching shadcn/ui style |
| Priority | High |
| Status | Pending |

---

## Key Insights

- No chart library currently installed in frontend.
- All chart consumers will be `'use client'` components -- no SSR concerns.
- recharts is built on D3 + React; ~45KB gzipped. Tree-shakeable -- import only needed chart types.
- shadcn/ui uses CSS variables for theming; chart wrappers should use `hsl(var(--primary))` etc.
- Existing score distribution in quiz report page uses manual CSS bars -- replace with recharts `BarChart`.

---

## Requirements

1. Install `recharts` in frontend.
2. Create `components/charts/` directory with reusable wrappers.
3. Each wrapper: typed props, responsive container, consistent color palette.
4. Components needed: `LineChart`, `BarChart`, `PieChart`, `AreaChart` wrappers.
5. Shared color config and tooltip component.
6. All charts must be responsive (use `ResponsiveContainer`).

---

## Architecture

### File Structure

```
frontend/components/charts/
  index.ts               # barrel export
  chart-colors.ts        # shared color palette constants
  line-chart.tsx         # LineChartCard wrapper
  bar-chart.tsx          # BarChartCard wrapper
  pie-chart.tsx          # PieChartCard wrapper
  area-chart.tsx         # AreaChartCard wrapper
```

### Component API Design

```typescript
// line-chart.tsx
interface LineChartCardProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  xKey: string;
  lines: { key: string; color?: string; label?: string }[];
  height?: number;
}

export function LineChartCard({ title, data, xKey, lines, height = 300 }: LineChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          {lines.map(line => (
            <Line key={line.key} dataKey={line.key} stroke={line.color} name={line.label} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Similar pattern for `BarChartCard`, `PieChartCard`, `AreaChartCard`.

### Color Palette

```typescript
// chart-colors.ts
export const CHART_COLORS = {
  primary: '#1e293b',    // slate-800
  secondary: '#3b82f6',  // blue-500
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  danger: '#ef4444',     // red-500
  info: '#6366f1',       // indigo-500
  palette: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'],
};
```

---

## Related Code Files

| File | Role |
|------|------|
| `frontend/package.json` | Add recharts dependency |
| `frontend/components/charts/` | New directory for chart wrappers |
| `frontend/app/instructor/reports/quizzes/[id]/page.tsx` | Existing manual bar chart to replace later |

---

## Implementation Steps

- [ ] `cd frontend && npm install recharts`
- [ ] Create `components/charts/chart-colors.ts` with shared color constants
- [ ] Create `components/charts/line-chart.tsx` -- `LineChartCard` component
- [ ] Create `components/charts/bar-chart.tsx` -- `BarChartCard` component
- [ ] Create `components/charts/pie-chart.tsx` -- `PieChartCard` component
- [ ] Create `components/charts/area-chart.tsx` -- `AreaChartCard` component
- [ ] Create `components/charts/index.ts` barrel export
- [ ] Verify all chart components render correctly in isolation (manual test)

---

## Todo

```
- [ ] Install recharts
- [ ] Create chart-colors.ts
- [ ] Create LineChartCard
- [ ] Create BarChartCard
- [ ] Create PieChartCard
- [ ] Create AreaChartCard
- [ ] Create barrel export
- [ ] Manual render test
```

---

## Success Criteria

- `recharts` in `package.json` dependencies.
- All 4 chart wrapper components exist and export from barrel.
- Each component accepts typed props and renders responsively.
- Color palette is centralized, not hardcoded per chart.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| recharts bundle size | Low | Low | Tree-shaking; only import used charts |
| SSR hydration mismatch | Low | Medium | All chart pages already `'use client'` |

---

## Security Considerations

None -- purely frontend UI components with no data fetching.

---

## Next Steps

Phase 02 (Admin Dashboard), Phase 03 (Instructor Charts), Phase 04 (Student Progress) can start in parallel once this phase completes.
