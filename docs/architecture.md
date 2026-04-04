# ReMaster (Focus OS) Architecture

## Overview
ReMaster is a React web application backed by a Node/Express API with SQLite.

- UI layer: Focus modes, timers, session summaries, analytics, settings.
- API layer: Sessions and analytics endpoints.
- Shared domain models: Session types, focus scoring rules, and storage contracts.

## App Layout

- Renderer (React)
  - Presents the focus system UI, mode flows, and analytics dashboard.
  - Stores sessions via API services.
  - Tracks idle time and tab visibility changes using browser APIs.
- API (Node/Express)
  - Persists sessions in SQLite.
  - Serves analytics and smart insights.

## Core Modules

- Focus Modes (Renderer)
  - Timer Mode: Countdown with presets, custom durations, auto-save sessions.
  - Stopwatch Mode: Open-ended timer with pause/resume.
  - Deep Work Mode: Locked sessions, limited pause, strict monitoring.
- Session Tracking (Renderer + Storage)
  - Session persistence layer (local storage now; DB later).
  - Focus score calculator (distractions, idle, completion).
- Activity Monitoring (Web)
  - Tab visibility tracking.
  - Idle detection and auto-pause.
- Distraction Control (Web)
  - App/site allowlist and blocklist rules (tracking only).

## Data Model

- FocusSession
  - `mode`, `duration`, `timestamps`, `distractions`, `idleSeconds`, `focusScore`.

## System Capabilities

- Browser builds cannot inspect other applications or modify the hosts file.
- App switching is inferred via tab visibility changes.
- `session:save`
- `session:list`

## Storage Strategy

- SQLite via `better-sqlite3` for sessions and analytics.

## Focus Scoring

- Base score: 100
- Penalties:
  - Distractions: -5 each
  - Idle time: -2 per minute
  - Early termination: -10

## UI Structure

- Home Dashboard
- Mode Selection
- Timer Mode
- Stopwatch Mode
- Deep Work Mode
- Session Summary
- Analytics
