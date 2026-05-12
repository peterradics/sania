# Sania App — Design Document

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 5 (Svelte runes, `$state`, `$derived`, `$effect`) |
| Styling | Tailwind CSS 4 (`@import 'tailwindcss'`) |
| Component library | shadcn-svelte (built on bits-ui) |
| Icons | `@lucide/svelte` |
| Notifications | `svelte-sonner` (Toaster with `richColors`) |
| Backend | PocketBase (`pb.partnerportal.me`) |
| Validation | Zod |
| Adapter | `@sveltejs/adapter-node` |

---

## Color System

Colors are defined with **OKLCH** values in `src/routes/layout.css` and support both light and dark modes via a `.dark` class. The base color palette is **gray** (configured in `components.json`).

### CSS Custom Properties (light mode)

| Token | Role |
|---|---|
| `--background` | Page background (white) |
| `--foreground` | Default text (near-black) |
| `--primary` | Primary action color (dark navy-gray) |
| `--primary-foreground` | Text on primary (off-white) |
| `--secondary` | Subtle backgrounds |
| `--muted` | Muted backgrounds (light gray) |
| `--muted-foreground` | Secondary/helper text |
| `--accent` | Hover/focus accent (same as muted) |
| `--destructive` | Errors and danger actions (red) |
| `--border` | Borders (light gray) |
| `--input` | Input borders |
| `--ring` | Focus ring |
| `--sidebar` | Sidebar background (near white) |
| `--radius` | Base border radius — `0.625rem` |

Radius scale derived from `--radius`:
- `--radius-sm`: `radius - 4px`
- `--radius-md`: `radius - 2px`
- `--radius-lg`: `radius` (base)
- `--radius-xl`: `radius + 4px`

### Semantic color conventions (Tailwind classes)

| Color | Meaning |
|---|---|
| `text-green-700` / `bg-green-100` | Deposits, positive balance |
| `text-red-700` / `bg-red-100` | Withdrawals, negative balance, destructive |
| `text-blue-800` / `bg-blue-100` | Interest entries |
| `text-destructive` | Form validation errors |
| `text-muted-foreground` | Helper text, secondary data |

---

## Layout

### Shell — `src/routes/dashboard/+layout.svelte`

```
┌─────────────────────────────────────┐
│  Sidebar  │  Sidebar.Inset (p-8)    │
│           │                         │
│  Logo     │  {children}             │
│  NavMain  │                         │
│  NavUser  │                         │
└─────────────────────────────────────┘
```

- Uses `Sidebar.Provider` wrapping `AppSidebar` + `Sidebar.Inset`.
- Content area is padded with `p-8`.
- Sidebar is collapsible to icon-only mode (`collapsible="icon"`).

### Sidebar — `src/lib/components/app-sidebar.svelte`

- **Header**: Sania logo (`/sania-logo.png`), `rounded-sm`.
- **Content**: `NavMain` — collapsible menu groups with Lucide icons and sub-items.
  - Currently active section: **Clients** (Users icon)
    - New Client → `/dashboard/clients/new`
    - Client List → `/dashboard/clients/list`
- **Footer**: `NavUser` — avatar, name, email, logout dropdown with confirmation dialog.
- **Rail**: thin resizer strip on the sidebar edge.

### Root layout — `src/routes/+layout.svelte`

- Imports `layout.css` (all styles entry point).
- Sets favicon from `$lib/assets/favicon.svg`.
- Renders the global `<Toaster richColors />` for toast notifications.

---

## Pages

### Login — `/login`

- Centered card (`flex h-screen items-center justify-center`).
- `Card.Root` max-w-sm with email + password inputs and a full-width Login button.
- Inline error message (`text-destructive text-sm`) on failed auth.
- Uses SvelteKit form `enhance` for progressive enhancement.

### Dashboard home — `/dashboard`

- Placeholder page (work in progress).

### Client List — `/dashboard/clients/list`

- Page container: `mx-auto max-w-4xl py-6`.
- Page header: `text-2xl font-bold` title + `text-sm text-muted-foreground` subtitle.
- Table inside a `rounded-md border` wrapper, `w-full text-sm`.
- Header row: `border-b bg-muted/50`.
- Body rows: `cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40` — clicking navigates to the client detail page.
- Columns: System ID · Name · Balance · 1st Deposit · 1st Deposit Date.
- Balance coloured `text-green-700` (≥ 0) or `text-red-700` (< 0).
- Numeric cells use `tabular-nums` for aligned figures.
- Empty state: plain `text-muted-foreground` paragraph.

### New Client — `/dashboard/clients/new`

- Page container: `mx-auto py-6`.
- Two `Card.Root` sections stacked with `mt-4` gap:
  1. **Personal Information** — 2-column responsive grid (`grid-cols-1 sm:grid-cols-2`).
  2. **Address** — same grid; Street and Country span full width (`col-span-full`).
- Fields: First Name\*, Last Name\*, Email, Phone, Birth Place, Birth Date, System ID, Password (with "Generate Password" button).
- Password is auto-generated on mount via `passwordGen()` (8 chars, uppercase + digits, no ambiguous characters).
- Footer: Cancel (outline) + Save Client (primary, with spinner).
- On success redirects to `/dashboard/clients` with a toast.

### Client Detail — `/dashboard/clients/[id]`

Two-tab layout using `Tabs.Root`:

#### Tab 1 — Account

**Add Money Entry form** (Card):
- Type selector: Deposit / Withdraw / Interest.
- Value input (number, step 0.01).
- Start of Term (date input).
- End of Term (date input).
- **Parent deposit selector** — shown when type is `withdraw` or `interest`:
  - Label reads "Linked Deposit" for interest, "Withdraw From (Deposit)" for withdraw.
  - Dropdown lists existing deposits formatted as `startofterm · value (until endofterm)`.

**Money Entries table**:
- Columns: Type badge · Value · End of Term · Parent Deposit · Created (startofterm).
- Type badges are coloured pills (`rounded-full px-2 py-0.5 text-xs font-medium`):
  - Deposit → `bg-green-100 text-green-800`
  - Withdraw → `bg-red-100 text-red-800`
  - Interest → `bg-blue-100 text-blue-800`

**Summary card**:
- Three-column grid showing Total Deposits (green), Total Withdrawals (red), Net Balance (green/red).

#### Tab 2 — Personal Information

- Two `Card.Root` sections (Personal Information, Address), identical structure to the New Client form.
- Back to List button (outline) + Save Client button (primary with spinner).

---

## Component Conventions

### Forms

- All forms use `use:enhance` from `$app/forms`.
- Loading state tracked with `$state(false)`, disabled on submit, spinner rendered inline using an SVG `animate-spin`.
- Validation errors displayed as `<p class="text-xs text-destructive">` directly below the offending field.
- Required fields marked with `<span class="text-destructive">*</span>`.
- Server feedback via `svelte-sonner` toasts: `toast.success()` / `toast.error()`.
- Server validation uses **Zod** schemas; client receives typed error maps.

### Inputs

- `Input` component from shadcn-svelte (height `h-9`, rounded-md, shadow-sm, focus ring).
- Native `<select>` styled to match inputs via a shared `selectClass` string:
  ```
  border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1
  ```
- Date fields use `type="date"`.

### Buttons

- Primary (default): dark background, off-white text.
- Outline: bordered, transparent background.
- Destructive: used for dangerous actions (e.g. logout confirm).
- Disabled state propagated during async operations.

### Cards

- `Card.Root` + `Card.Header` + `Card.Title` + `Card.Content` + optional `Card.Footer`.
- Content padding handled by the card component itself.

### Tables

- Raw `<table>` elements (not a component), always inside `rounded-md border`.
- `thead` row: `border-b bg-muted/50`, `th` cells: `px-4 py-3 text-left/right font-medium`.
- `tbody` rows: `border-b last:border-0`, `td` cells: `px-4 py-3`.
- Hoverable rows add `hover:bg-muted/40 cursor-pointer transition-colors`.

---

## Utilities

| Utility | Location | Purpose |
|---|---|---|
| `cn(...classes)` | `$lib/utils.ts` | Merges Tailwind classes with `clsx` + `tailwind-merge` |
| `passwordGen()` | `$lib/utils.ts` | Generates an 8-char random password (uppercase + digits, no ambiguous chars) |
| `formatMoney(v)` | per-page | `toLocaleString` with 2 decimal places |
| `formatDate(iso)` | per-page | `toLocaleDateString` with `year/month/day` options |

---

## Authentication

- Session stored as an **httpOnly cookie** (`pb_auth`) on every request via `hooks.server.ts`.
- Cookie settings: `path=/`, `httpOnly: true`, `sameSite: 'lax'`, `secure` in production, `maxAge` 30 days.
- `locals.pb` is a per-request PocketBase instance with the session restored from the cookie.
- Unauthenticated requests to `/dashboard/**` are redirected to `/login`.
- Logout at `/logout` clears the auth store and redirects to `/login`.

---

## Data Model (PocketBase collections)

### `clients`

| Field | Type |
|---|---|
| `system_id` | number |
| `name_first` | string |
| `name_last` | string |
| `email` | string |
| `phone_number` | string |
| `adress_street` | string _(note: typo in field name)_ |
| `address_zip` | string |
| `address_city` | string |
| `address_country` | string |
| `birth_place` | string |
| `birth_date` | string (date) |

### `money`

| Field | Type | Notes |
|---|---|---|
| `client` | relation → clients | |
| `type` | enum | `deposit`, `withdraw`, `interest` |
| `value` | number | |
| `startofterm` | date | |
| `endofterm` | date | optional |
| `parentMoneyItem` | relation → money | used for `withdraw` and `interest` to link back to the parent deposit |

### `users`

Standard PocketBase auth collection. Each client has a corresponding user record with a `client` relation field and a `system_id`.
