# Application Pages

This document lists all pages implemented in the Platform Maturity Dashboard application.

## Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/` (unauthenticated) | Role selection with Platform 4.0 Maturity framework visualization |

## Dashboard Pages (Authenticated)

| Page | Route | Roles | Description |
|------|-------|-------|-------------|
| Overview | `/` | All | Main dashboard — gauges for Admin, consolidated org view for Super User, platform view for Supervisor/TPL |
| Dimensions | `/dimensions` | All | Maturity and performance dimension breakdown charts |
| Trends | `/trends` | All | Historical quarterly trend visualizations |
| Improvements | `/improvements` | All | Pillar improvement tracking with QoQ deltas |
| Team Data | `/team-data` | All | Filterable team metrics table with export |

## Assessment Pages

| Page | Route | Roles | Description |
|------|-------|-------|-------------|
| Submit Assessment | `/assessments/submit` | User (TPL) | 23-question maturity assessment submission (1–5 scale) |
| View Assessments | `/assessments/view` | User (TPL), Reviewer | View submitted assessments with radar charts |
| Peer Review | `/assessments/review` | User (TPL), Reviewer | Review and score peer assessments |

## Admin Pages

| Page | Route | Roles | Description |
|------|-------|-------|-------------|
| Personas | `/admin/personas` | Admin | Visual grid of system role personas |
| Data Upload | `/admin/upload` | Admin | Excel/CSV data upload for team metrics |
| Settings | `/admin/settings` | Admin | Platform, pillar, and CIO configuration |

## Error Pages

| Page | Route | Description |
|------|-------|-------------|
| Not Found | `*` | 404 page for unmatched routes |

## Role Summary

| Role | Key |
|------|-----|
| Super User | `superuser` — Full org visibility with consolidated heatmaps, radar, drill-down |
| Supervisor (CIO) | `supervisor` — Platform-scoped dashboard with pillar drill-down |
| Admin | `admin` — Data management, upload, settings, personas |
| Reviewer | `reviewer` — Assessment review and peer feedback |
| User (TPL) | `user` — Platform lead metrics and assessment submission |
