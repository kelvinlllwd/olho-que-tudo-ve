# Olho Que Tudo Vê - Social Media Monitoring Dashboard

A Next.js 14 dashboard for monitoring Instagram and TikTok accounts, posts, stories, and metrics with IP binding and anti-procrastination features.

## Live URL
https://olho-publico.loca.lt

## Requirements

- Node.js v20+ (installed at `C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64`)

## Running the Dev Server

```cmd
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
npm run dev
```

Or use the `start.bat` script in the project root.

The server runs on `http://localhost:3000`.

## Demo Credentials

- Email: `demo@olho.com`
- Password: `demo123`

## Features

- Multi-account Instagram/TikTok monitoring
- Post and story tracking
- Metrics dashboard (views, spend, revenue, ROI)
- IP binding for security
- Daily activity calendar
- Anti-procrastination mode

## Project Structure

```
src/
  app/
    api/          # API routes (auth, accounts, posts, metrics, analytics, daily-activity, ip, seed)
    dashboard/    # Dashboard page
    accounts/     # Accounts management page
    analytics/    # Analytics page
    calendar/     # Calendar heatmap page
    settings/     # Settings page
    auth/         # Auth pages (login, register)
  components/     # Shared components
  contexts/       # AuthContext, ThemeContext
  lib/            # Auth utilities, Prisma client
prisma/
  schema.prisma   # Database schema (SQLite)
  dev.db          # SQLite database
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/accounts` - List accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/manage` - Update account
- `GET /api/posts` - List posts
- `GET /api/metrics` - Get metrics
- `GET /api/analytics` - Get analytics data
- `GET /api/daily-activity` - Get daily activity
- `GET /api/ip` - Check IP binding
- `GET /api/seed` - Seed demo data