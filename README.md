# Royal Intelligence — SupeRR Selector Season 2

A static React dashboard for the Round 1 challenge, **Identify the Most Reliable Players Under Pressure**.

## What's included

- Overall Top 10 batter and bowler rankings.
- Position-wise batting leaderboards: openers, top order, middle order, finishers and tail.
- Searchable full candidate rankings.
- Player comparison tool.
- Methodology and data-coverage pages.
- Squad exclusions, unmatched roster names, retired-player audit, Pakistan-mapping proxy audit and name aliases.
- Downloadable Top 10 CSVs and methodology PDF.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

The static production site is generated in `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy. No backend or environment variables are required.

`vercel.json` includes a single-page-app rewrite for client-side navigation.

## Submission files

See `submission/`:
- `Top10_Batters.csv`
- `Top10_Bowlers.csv`
- `Position_Wise_Top10.csv`
- `Royal_Intelligence_Methodology_Report.pdf`
- Full eligible batter and bowler ranking CSVs.

The same main submission files are downloadable from the deployed website under the Downloads links.

## Data and eligibility notes

The public site includes derived player-level statistics only. It does not bundle the raw ball-by-ball dataset.

The candidate pool excludes the 10 franchise squad lists supplied during the project. It is **not an official auction registration list**. A player not found in those squad lists is only a potential candidate until official registration, NOC, availability and opt-out status are confirmed.

The Pakistan-associated exclusion is inferred from T20I team mappings because the supplied files do not contain a complete nationality field. This is a proxy and requires manual review.

## Methodology notes

- Batting pressure threshold: 50/100; minimum 20 pressure balls across 2 matches.
- Bowling pressure threshold: 60/100; minimum 48 pressure legal balls across 5 matches and 60 non-pressure legal balls.
- IPL seasons 2022–2026 and men's T20I from 2022 onward.
- Only innings 1 and 2; extra innings / Super Overs excluded.
- Other T20 competitions are excluded.

See the downloadable methodology report for formulas, weights, evidence and limitations.
