# EquipTrack — Team Project Guide

Shared technical guide for all six team members.  
Use the same database names, routes, status values, session structure and Git workflow.

---

# 1. Project Overview

| Item | Detail |
|------|--------|
| Project name | EquipTrack |
| Application type | Equipment Loan and Reservation System |
| Main purpose | Let campus users browse equipment, reserve it for date ranges, and help staff track loans, returns and damage |
| Intended users | Borrowers (students/staff who borrow), staff (issue/approve), admins (manage catalogue and users) |
| Server entry file | `app.js` |
| Database name | `equiptrack` |

## Technologies used

| Technology | Role in project |
|------------|-----------------|
| Node.js | Runtime |
| Express | Web server and routes |
| EJS | Server-rendered HTML views |
| MySQL | Database |
| mysql2 | Node.js MySQL driver (listed in `package.json`; DB connection not wired in `app.js` yet) |
| express-session | Sessions (listed in `package.json`; not configured in `app.js` yet) |
| bcrypt | Password hashing (listed in `package.json`; not used in `app.js` yet) |
| dotenv | Load `.env` (listed in `package.json`; not used in `app.js` yet) |
| Bootstrap 5 | UI framework (loaded in EJS partials) |
| Vanilla JavaScript | Client-side UI helpers in `public/js/main.js` |

---

# 2. User Roles

Roles come from `users.role` in `database/equiptrack.sql`:

`ENUM('borrower', 'staff', 'admin')` — default `'borrower'`

## Borrower

- Browse equipment
- Search and filter equipment
- Create reservations
- View personal reservations
- Cancel valid reservations
- Join waiting lists

## Staff

- View pending reservations
- Approve or reject reservations
- Record equipment collection
- Record equipment return
- Create damage reports

## Admin

- Manage users
- Manage equipment
- Manage categories
- View system records and reports

**Important:** Exact permissions must be enforced on the **server side** (Express middleware / route checks).  
Do not rely only on hiding buttons in EJS or client JavaScript.

---

# 3. Team Feature Responsibilities

| # | Feature | Owner | Main responsibility | Main tables | Existing Express routes | Status |
|---|---------|-------|---------------------|-------------|-------------------------|--------|
| 1 | User Account, Role and Admin Management | TBD | Register, login, logout, roles, admin user management | `users` | `GET/POST /login`, `GET/POST /register` | UI only (no auth / no DB) |
| 2 | Equipment and Category Management | TBD | CRUD for equipment and categories | `equipment`, `categories` | None for create/update/delete | Not started (catalogue view is sample data) |
| 3 | Equipment Catalogue, Search and Filtering | TBD | List, search, filter catalogue | `equipment`, `categories` | `GET /equipment`, `GET /equipment/:id` | UI only (client-side filters on sample data) |
| 4 | Equipment Reservation and Availability Management | Cheng Xun | Create reservations, availability, waitlist, cancel | `reservations`, `equipment`, `users` | `GET /reservations`, `GET /reservations/new`, `POST /reservations/add` | UI only (sample data; POST redirects only) |
| 5 | Reservation Approval and Equipment Collection | TBD | Approve/reject; record collection → loans | `reservations`, `loans`, `equipment` | None | Not started |
| 6 | Equipment Return, Overdue, Damage and Maintenance Management | TBD | Returns, overdue, damage, maintenance status | `returns`, `loans`, `damage_reports`, `equipment`, `reservations` | None | Not started |

Other five features have **no owner names recorded in the project** — marked TBD.

---

# 4. Cheng Xun’s Feature

## Feature name

**Equipment Reservation and Availability Management**

## In scope

| Task | Description |
|------|-------------|
| Create reservations | Insert into `reservations` |
| Validate required fields | `equipment_id`, `start_date`, `end_date`, `purpose` (plus `user_id` from session) |
| Reject past start dates | `start_date` must not be before today |
| Reject invalid end dates | `end_date` must not be earlier than `start_date` |
| Check overlapping reservations | See Section 11 |
| Prevent double booking | Block conflicting active dates for same equipment |
| Insert with Pending | Default status `Pending` when dates are free |
| Show own reservations | List reservations for `req.session.user.user_id` |
| Valid cancellation | Allow cancel when rules allow (e.g. Pending / Waitlisted — exact rules TBD with team) |
| Date-based availability | Check conflicts by date range, not only `equipment.status` |
| Waiting list | If conflict, insert as `Waitlisted` with `queue_position` |
| Promote after cancel | When a slot frees, promote earliest valid waitlisted user |

## Feature flow

```
Borrower selects equipment and dates
  → form submits to Express route (POST /reservations/add)
  → server validates input
  → SQL checks date conflicts
  → reservation is inserted as Pending or Waitlisted
  → MySQL returns result
  → Express redirects or renders an EJS page
```

## Out of scope for Cheng Xun

These belong to other features:

| Area | Owner feature |
|------|----------------|
| Reservation approval / reject | Feature 5 |
| Equipment collection | Feature 5 |
| Equipment return | Feature 6 |
| Damage reports | Feature 6 |
| Maintenance status management | Feature 6 |

## Current code baseline

| Item | Current state |
|------|---------------|
| Form | `views/reservation-form.ejs` → `POST /reservations/add` |
| Input names | `equipment_id`, `start_date`, `end_date`, `purpose` (match DB column names) |
| List page | `GET /reservations` uses `data/sampleData.js` |
| Cancel button | Client-only demo in `public/js/main.js` — does **not** call Express or MySQL |
| POST handler | Redirects to `/reservations` with **no** validation or INSERT |

---

# 5. Database Schema

Source: `database/equiptrack.sql`  
Database: `equiptrack`

## 5.1 `users`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| user_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique user id |
| name | VARCHAR(100) | NO | — | Display name |
| email | VARCHAR(255) | NO | UNIQUE | Login email |
| password | VARCHAR(255) | NO | — | Password hash (bcrypt later) |
| role | ENUM('borrower','staff','admin') DEFAULT 'borrower' | YES* | — | Access role |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | YES* | — | Account created time |

\*MySQL may store NULL for columns without explicit `NOT NULL` unless DEFAULT fills them; treat role/created_at as always set by DEFAULT.

## 5.2 `categories`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| category_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique category id |
| category_name | VARCHAR(100) | NO | UNIQUE | Category label |
| description | TEXT | YES | — | Optional notes |

## 5.3 `equipment`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| equipment_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique equipment id |
| category_id | INT | YES | FK → `categories.category_id` | Category link |
| equipment_name | VARCHAR(150) | NO | — | Display name |
| asset_code | VARCHAR(50) | NO | UNIQUE | Inventory code |
| description | TEXT | YES | — | Details |
| equipment_condition | ENUM('Good','Fair','Damaged') DEFAULT 'Good' | YES* | — | Physical condition |
| status | ENUM('Available','Reserved','Borrowed','Maintenance','Damaged') DEFAULT 'Available' | YES* | — | Availability / state |
| image | VARCHAR(255) | YES | — | Image path/URL |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | YES* | — | Created time |

## 5.4 `reservations`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| reservation_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique reservation id |
| user_id | INT | NO | FK → `users.user_id` | Who reserved |
| equipment_id | INT | NO | FK → `equipment.equipment_id` | What was reserved |
| start_date | DATE | NO | — | Loan/reservation start |
| end_date | DATE | NO | — | Loan/reservation end |
| purpose | VARCHAR(255) | NO | — | Reason for use |
| status | ENUM('Pending','Approved','Rejected','Waitlisted','Cancelled','Collected','Returned','Overdue') DEFAULT 'Pending' | YES* | — | Reservation lifecycle |
| queue_position | INT | YES | — | Waitlist order |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | YES* | — | Created time |

## 5.5 `loans`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| loan_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique loan id |
| reservation_id | INT | NO | FK → `reservations.reservation_id` | Source reservation |
| issued_by | INT | NO | FK → `users.user_id` | Staff who issued |
| collection_date | DATETIME | YES | — | When collected |
| due_date | DATE | NO | — | Return due date |
| loan_status | ENUM('Active','Returned','Overdue') DEFAULT 'Active' | YES* | — | Loan lifecycle |

## 5.6 `returns`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| return_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique return id |
| loan_id | INT | NO | FK → `loans.loan_id` | Related loan |
| received_by | INT | NO | FK → `users.user_id` | Staff who received |
| return_date | DATETIME DEFAULT CURRENT_TIMESTAMP | YES* | — | When returned |
| return_condition | ENUM('Good','Fair','Damaged') | NO | — | Condition on return |
| late_days | INT DEFAULT 0 | YES* | — | Days late |
| notes | TEXT | YES | — | Optional notes |

## 5.7 `damage_reports`

| Column | Data type | Null | Key / relationship | Purpose |
|--------|-----------|------|--------------------|---------|
| damage_id | INT AUTO_INCREMENT | NO | PRIMARY KEY | Unique report id |
| equipment_id | INT | NO | FK → `equipment.equipment_id` | Damaged item |
| loan_id | INT | YES | FK → `loans.loan_id` | Optional related loan |
| reported_by | INT | NO | FK → `users.user_id` | Who reported |
| description | TEXT | NO | — | What happened |
| severity | ENUM('Minor','Moderate','Severe') | NO | — | Severity |
| repair_cost | DECIMAL(10,2) DEFAULT 0 | YES* | — | Cost estimate |
| status | ENUM('Reported','Under Repair','Resolved') DEFAULT 'Reported' | YES* | — | Repair workflow |
| reported_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | YES* | — | Report time |

---

# 6. Database Relationships

From foreign keys in `database/equiptrack.sql`:

```
users.user_id
  → reservations.user_id
  → loans.issued_by
  → returns.received_by
  → damage_reports.reported_by

categories.category_id
  → equipment.category_id

equipment.equipment_id
  → reservations.equipment_id
  → damage_reports.equipment_id

reservations.reservation_id
  → loans.reservation_id

loans.loan_id
  → returns.loan_id
  → damage_reports.loan_id
```

One-to-many summary:

| Parent | Child | Link |
|--------|-------|------|
| `users` | `reservations` | `user_id` |
| `categories` | `equipment` | `category_id` |
| `equipment` | `reservations` | `equipment_id` |
| `reservations` | `loans` | `reservation_id` |
| `loans` | `returns` | `loan_id` |
| `equipment` | `damage_reports` | `equipment_id` |
| `loans` | `damage_reports` | `loan_id` (optional) |
| `users` | `loans` | `issued_by` |
| `users` | `returns` | `received_by` |
| `users` | `damage_reports` | `reported_by` |

---

# 7. Shared Naming Conventions

| Area | Rule | Example |
|------|------|---------|
| Database columns | `snake_case` | `start_date`, `equipment_id` |
| Route paths | lowercase, plural resource names where already used | `/reservations`, `/equipment` |
| Tables | plural | `users`, `reservations` |
| Primary keys | `<table_singular>_id` | `user_id`, `reservation_id` |
| EJS input `name` | Must match `req.body` and prefer DB column names | `name="start_date"` |
| Session user | `req.session.user` object (see Section 8) | `req.session.user.user_id` |
| DB status values | Exact capitalisation from ENUM | `'Pending'`, `'Available'` |

## Matching example (agreed pattern)

HTML:

```html
<input name="start_date">
```

Express:

```js
const { start_date } = req.body;
```

Database:

```sql
start_date DATE NOT NULL
```

---

# 8. Session Structure

`express-session` is in `package.json`, but **`app.js` does not configure sessions yet**.

Until code exists, all teammates must use this agreed shape:

```js
req.session.user = {
  user_id: 1,
  name: 'Example User',
  role: 'borrower'
};
```

## Rules

| Rule | Why |
|------|-----|
| Use `req.session.user.user_id` for protected actions | Identity must come from the server session |
| Do **not** trust `user_id` from an HTML form | Users can edit form fields |
| Protected routes check `req.session.user` exists | Otherwise redirect to `/login` |
| Role-protected routes check `req.session.user.role` | Enforce borrower / staff / admin |

**Current code:** no `req.session` usage in `app.js` — login/register only redirect.

---

# 9. Reservation Status Values

Exact ENUM from `reservations.status` in SQL:

| Status | Meaning | Who / which feature changes it | Typical next statuses |
|--------|---------|--------------------------------|------------------------|
| Pending | New request awaiting decision | Created by Feature 4 (reservation) | Approved, Rejected, Waitlisted, Cancelled |
| Approved | Staff approved the request | Feature 5 (approval) | Collected, Cancelled, Overdue (TBD exact rules) |
| Rejected | Staff rejected the request | Feature 5 (approval) | Usually terminal |
| Waitlisted | Dates conflict; user queued | Feature 4 (availability) | Pending or Approved (after promotion — TBD), Cancelled |
| Cancelled | Reservation cancelled | Feature 4 (own cancel) / possibly staff TBD | Terminal |
| Collected | Equipment handed out | Feature 5 (collection) | Returned, Overdue |
| Returned | Reservation/loan cycle finished at reservation level | Feature 6 (return) — TBD coordination | Terminal |
| Overdue | Past due / not returned on time | Feature 6 (overdue) | Returned, Collected (TBD) |

**Note:** Temporary UI sample data in `data/sampleData.js` uses reservation status **`Borrowed`**, which is **not** in the SQL `reservations` ENUM. SQL uses **`Collected`** for hand-out. Team must align UI/sample filters to SQL when connecting the DB.

---

# 10. Equipment Status Values

Exact ENUM from `equipment.status` in SQL:

| Status | When to use |
|--------|-------------|
| Available | Item can be considered for new reservations (still check date overlaps) |
| Reserved | Item has approved/active reservation blocking general availability (exact timing TBD with Features 4 & 5) |
| Borrowed | Item is currently with a borrower (after collection) |
| Maintenance | Item is being repaired / unavailable for loans |
| Damaged | Item is damaged and not loanable until resolved |

Also related (not availability status): `equipment_condition` = `'Good' | 'Fair' | 'Damaged'`.

---

# 11. Double-Booking Rule

Two date ranges overlap when:

```
existing.start_date <= requested.end_date
AND
existing.end_date   >= requested.start_date
```

## Sample SQL (matches actual schema)

```sql
SELECT reservation_id, user_id, start_date, end_date, status
FROM reservations
WHERE equipment_id = ?
  AND status IN ('Pending', 'Approved', 'Waitlisted', 'Collected', 'Overdue')
  AND start_date <= ?
  AND end_date   >= ?;
```

- First `?` = requested `equipment_id`
- Second `?` = requested `end_date`
- Third `?` = requested `start_date`

Exact status list for “counts as conflict” is **TBD** with the team (suggested starting set above).

## Date example

| Reservation | Dates |
|-------------|-------|
| Existing | 10 Jul – 15 Jul |
| Requested | 14 Jul – 18 Jul |

Overlap? Yes — 14 Jul is inside the existing range.  
Reject as double-book, or waitlist (Feature 4 rule).

Non-overlap example: existing 10–15 Jul, requested 16–18 Jul → allowed as Pending (if equipment otherwise OK).

---

# 12. Route Reference

Source: `app.js` only. **Do not invent routes.**

| Method | Path | Purpose | EJS page | Auth required | Role required | Current status |
|--------|------|---------|----------|---------------|---------------|----------------|
| GET | `/` | Redirect to dashboard | — | No | — | Temporary UI |
| GET | `/login` | Show login form | `login.ejs` | No | — | Temporary UI |
| POST | `/login` | Accept login form | — (redirect `/dashboard`) | No | — | Temporary UI (no auth) |
| GET | `/register` | Show register form | `register.ejs` | No | — | Temporary UI |
| POST | `/register` | Accept register form | — (redirect `/login`) | No | — | Temporary UI (no insert) |
| GET | `/dashboard` | Summary cards + recent lists | `dashboard.ejs` | No | — | Temporary UI (sample data) |
| GET | `/equipment` | Catalogue list | `equipment.ejs` | No | — | Temporary UI (sample data) |
| GET | `/equipment/:id` | Equipment detail | `equipment-details.ejs` | No | — | Temporary UI (sample data) |
| GET | `/reservations` | Reservation list | `reservations.ejs` | No | — | Temporary UI (sample data) |
| GET | `/reservations/new` | New reservation form | `reservation-form.ejs` | No | — | Temporary UI (sample data) |
| POST | `/reservations/add` | Submit reservation | — (redirect `/reservations`) | No | — | Temporary UI (no DB) |

Future routes for approval, collection, return, damage, admin CRUD: **TBD** (not in `app.js`).

---

# 13. Form Reference

| Page | Form action | Method | Input names | Related Express route | Status |
|------|-------------|--------|-------------|----------------------|--------|
| `login.ejs` | `/login` | POST | `email`, `password` | `POST /login` | UI only; no session |
| `register.ejs` | `/register` | POST | `name`, `email`, `password` | `POST /register` | UI only; no INSERT |
| `reservation-form.ejs` | `/reservations/add` | POST | `equipment_id`, `start_date`, `end_date`, `purpose` | `POST /reservations/add` | UI only; no validation/INSERT |

## Extra UI fields (not wired to `req.body`)

| Page | Control | Issue |
|------|---------|-------|
| `login.ejs` | “Remember me” checkbox `#rememberMe` | No `name` attribute — will not appear in `req.body` |
| `register.ejs` | “Agree to terms” `#agreeTerms` | No `name` attribute — HTML `required` only |
| `login.ejs` | “Forgot password?” link | `href="#"` — not implemented |

## Known naming mismatches (UI sample data vs SQL)

| Area | UI / `sampleData.js` | SQL schema |
|------|----------------------|------------|
| Equipment PK | `id` | `equipment_id` |
| Equipment name | `name` | `equipment_name` |
| Asset code | `assetCode` | `asset_code` |
| Category | string `category` | `category_id` FK + `categories.category_name` |
| Condition | `Excellent`, `Good`, `Fair`, `Poor` | `Good`, `Fair`, `Damaged` only |
| Location | `location` field | **No column** in SQL |
| Reservation PK | `id` | `reservation_id` |
| Dates in sample | `startDate`, `endDate` | `start_date`, `end_date` |
| Reservation status filter options | `Pending`, `Approved`, `Borrowed`, `Overdue` | SQL has `Collected` (not `Borrowed`); also `Rejected`, `Waitlisted`, `Cancelled`, `Returned` |
| Dashboard “active loans” | filters reservation status `"Borrowed"` | `"Borrowed"` is an **equipment** status / sample reservation label — not in `reservations` ENUM |

**Good match:** reservation form field names (`equipment_id`, `start_date`, `end_date`, `purpose`) already match DB columns.

---

# 14. Environment Variables

From `.env.example`:

| Variable | Example | Purpose |
|----------|---------|---------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `equiptrack` | Database name |
| `SESSION_SECRET` | `replace_with_secure_secret` | Session signing secret |
| `PORT` | `3000` | Express port |

## Rules

- Create a local `.env` from `.env.example` — **do not** commit `.env`
- `.env` is listed in `.gitignore`
- **Do** commit `.env.example`
- Each teammate uses their own local password / secret values

---

# 15. Project Setup Commands

## Install and run

```bash
npm install
node app.js
```

Server entry file is **`app.js`** (see `package.json` `"main": "app.js"`).

Local URL:

```text
http://localhost:3000
```

(`PORT` from `.env` / environment, default `3000` in `app.js`.)

## Import MySQL schema (Workbench)

1. Open MySQL Workbench and connect to your local server.
2. File → Open SQL Script → select `database/equiptrack.sql`.
3. Execute the script (lightning bolt).
4. Confirm database `equiptrack` exists.

## Verify tables

In Workbench, run:

```sql
USE equiptrack;
SHOW TABLES;
```

Expected tables:

`users`, `categories`, `equipment`, `reservations`, `loans`, `returns`, `damage_reports`

Optional checks:

```sql
SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM equipment;
```

## Start the app again

```bash
node app.js
```

Open `http://localhost:3000`.

---

# 16. Git Workflow

```text
main
  → feature branches
  → pull request
  → review
  → merge into main
```

## Feature branch names (agreed)

| Branch | Feature |
|--------|---------|
| `feature/user-auth` | User Account, Role and Admin Management |
| `feature/equipment-management` | Equipment and Category Management |
| `feature/equipment-search` | Equipment Catalogue, Search and Filtering |
| `feature/reservation-management` | Reservation and Availability (Cheng Xun) |
| `feature/approval-collection` | Approval and Collection |
| `feature/return-damage-maintenance` | Return, Overdue, Damage, Maintenance |

## Start work

```bash
git switch main
git pull origin main
git switch -c feature/reservation-management
git push -u origin feature/reservation-management
```

## After changes

```bash
git add .
git commit -m "Clear commit message"
git push
```

## Pull request

- **base:** `main`
- **compare:** your feature branch (e..g. `feature/reservation-management`)

## Rules

- Nobody pushes directly to `main`
- Pull requests must be reviewed
- Test before merging
- Do **not** use `git push --force`

### Current repo note

Local/remote branch naming today includes `feature-reservation_management` (hyphen, underscore).  
Agreed guide names use `feature/reservation-management` (slash).  
Team should standardise on one style — **TBD** if renaming existing branches.

Remote default HEAD currently points at `design-branch`; workflow target remains **`main`**.

---

# 17. Integration Rules

- All teammates must use the same table and column names from `database/equiptrack.sql`.
- Do not independently rename shared columns.
- Do not change another member’s feature without discussion.
- Pull the latest `main` before starting new work.
- Existing feature branches should merge the latest `main` regularly.
- Database schema changes must be communicated to the whole team.
- Shared files such as `app.js` must be edited carefully (avoid overwriting each other’s routes).
- Resolve route naming conflicts **before** merging.
- Keep EJS input `name`s aligned with `req.body` and SQL columns.

---

# 18. Testing Checklist

## General

- [ ] Application starts (`node app.js`)
- [ ] MySQL connects (after DB wiring)
- [ ] EJS pages render
- [ ] Navigation works
- [ ] No terminal errors
- [ ] No browser console errors

## Authentication

- [ ] Registration
- [ ] Login
- [ ] Wrong password
- [ ] Logout
- [ ] Protected route redirects when logged out
- [ ] Role restriction works

## Reservation feature (Cheng Xun)

- [ ] Valid reservation creates `Pending` row
- [ ] Missing fields rejected
- [ ] Start date in the past rejected
- [ ] End date before start date rejected
- [ ] Overlapping reservation blocked or waitlisted
- [ ] Non-overlapping reservation accepted
- [ ] Personal reservation list shows only own rows
- [ ] Cancel own reservation (when allowed)
- [ ] Cannot cancel another user’s reservation
- [ ] Waiting-list insertion sets `Waitlisted` + `queue_position`
- [ ] Waiting-list promotion after cancellation

---

# 19. Current Project Status

## Completed

- Express app boots from `app.js`
- EJS pages and Bootstrap UI for login, register, dashboard, equipment, details, reservations, reservation form
- Client-side catalogue and reservation filters (`public/js/main.js`)
- MySQL schema file `database/equiptrack.sql` with tables + sample users/categories/equipment
- `.env.example` with agreed environment keys
- Dependencies listed: `express`, `ejs`, `mysql2`, `express-session`, `bcrypt`, `dotenv`

## UI only

- All pages use `data/sampleData.js` (not MySQL)
- Login / register POST handlers only redirect
- Reservation POST only redirects
- Equipment search/filter is browser-side only
- Reservation cancel is browser-side demo only
- Dashboard / reservation summary cards use hard-coded sample arrays

## Not started

- dotenv / mysql2 connection pool
- express-session setup and middleware
- bcrypt hashing on register / verify on login
- Server-side auth and role checks
- DB-backed equipment CRUD and category management
- DB-backed reservations, waitlist, cancel
- Approval / collection / loans
- Returns / overdue / damage reports
- Admin user management

## Known issues

1. Sample field names (`id`, `name`, `assetCode`, `startDate`) do not match SQL (`equipment_id`, `equipment_name`, `asset_code`, `start_date`).
2. Sample reservation status **`Borrowed`** is not in SQL `reservations.status` (SQL uses **`Collected`**).
3. Sample reservation filter options omit `Rejected`, `Waitlisted`, `Cancelled`, `Collected`, `Returned`.
4. Sample equipment conditions include `Excellent` / `Poor`; SQL only allows `Good`, `Fair`, `Damaged`.
5. Sample `location` has no SQL column.
6. Sessions, DB, and auth packages are installed but not used in `app.js`.
7. Feature branch name in repo (`feature-reservation_management`) differs from agreed guide name (`feature/reservation-management`).
8. No routes yet for staff approval, collection, return, damage, or admin CRUD.

---

# 20. CA2 Requirements Reminder

- Every student must write JavaScript.
- Every student must own substantial **database-connected** work.
- The application needs authentication and authorization.
- The application needs CRUD.
- The application needs search, filtering, sorting or categorisation.
- Students must understand and explain their code.
- UI changes alone are not a meaningful enhancement.
- Hardcoded features do not receive marks.
- `app.js` should be developed collaboratively.
- Final submission needs: project ZIP, SQL file, journal, deployed application, online MySQL database, and updated GitHub repository.

---

# 21. Presentation Explanation Format

Always explain code in this order:

```text
User action
  → Express route
  → validation
  → SQL query
  → MySQL database
  → query result
  → Express response
  → EJS page
```

## Reservation example (using actual current route + schema)

```text
User submits New Reservation form
  → POST /reservations/add
  → validate equipment_id, start_date, end_date, purpose; load user_id from session
  → SELECT overlapping rows from reservations for that equipment_id and dates
  → if free: INSERT into reservations (status 'Pending')
     if conflict: INSERT (status 'Waitlisted', queue_position set)
  → MySQL returns insert result
  → Express redirects to GET /reservations (or re-renders form with errors)
  → reservations.ejs shows the logged-in user's reservations
```

*(Today the POST handler only redirects; the flow above is the target explanation once DB logic is added.)*

---

## Document footer

| Field | Value |
|-------|-------|
| Last updated | 2026-07-14 |
| Current server entry file | `app.js` |
| Current database name | `equiptrack` |
| Current default branch (workflow) | `main` |
| Project status | UI prototype + MySQL schema; database features not connected yet |
