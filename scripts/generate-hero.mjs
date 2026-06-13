/**
 * Generates public/hero-background.png — a 3840×2160 premium SaaS hero image.
 * Run: node scripts/generate-hero.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '..', 'public', 'hero-background.png');

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 3840px;
    height: 2160px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
    background: #faf9ff;
    position: relative;
  }

  /* ─── Background canvas ─────────────────────────────────── */
  .bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 2400px 1800px at 20% 110%, rgba(236,72,153,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 2200px 1600px at 10% 95%,  rgba(124,58,237,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 3000px 2000px at 65% 50%,  rgba(245,240,255,0.6) 0%, transparent 80%),
      linear-gradient(160deg, #ffffff 0%, #f8f5ff 35%, #fdf0fd 65%, #fafbff 100%);
  }

  /* ─── Dot grid (top-left) ────────────────────────────────── */
  .dots {
    position: absolute;
    top: 0; left: 0;
    width: 1400px;
    height: 900px;
    background-image: radial-gradient(circle, rgba(124,58,237,0.18) 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 1200px 700px at 0% 0%, black 0%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse 1200px 700px at 0% 0%, black 0%, transparent 75%);
  }

  /* ─── Ambient edge glow (bottom-left) ───────────────────── */
  .glow-bl {
    position: absolute;
    bottom: -200px; left: -200px;
    width: 1800px;
    height: 1800px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(167,139,250,0.22) 0%, rgba(236,72,153,0.1) 40%, transparent 70%);
    filter: blur(80px);
  }

  /* ─── Top-right soft fill ────────────────────────────────── */
  .glow-tr {
    position: absolute;
    top: -300px; right: -100px;
    width: 1400px;
    height: 1200px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(221,214,254,0.3) 0%, transparent 70%);
    filter: blur(100px);
  }

  /* ─── Dashboard wrapper ──────────────────────────────────── */
  .scene {
    position: absolute;
    top: 50%;
    left: 52%;
    transform: translateY(-50%) perspective(4000px) rotateY(-14deg) rotateX(4deg);
    transform-origin: center center;
    filter: drop-shadow(0 80px 160px rgba(124,58,237,0.28))
            drop-shadow(0 40px 80px rgba(0,0,0,0.18))
            drop-shadow(0 0 120px rgba(167,139,250,0.2));
  }

  /* ─── Dashboard shell ────────────────────────────────────── */
  .shell {
    width: 1980px;
    background: rgba(255,255,255,0.96);
    border-radius: 24px;
    border: 1px solid rgba(124,58,237,0.12);
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.9),
      0 0 0 1px rgba(124,58,237,0.06);
    display: flex;
    flex-direction: column;
  }

  /* ─── Window chrome ──────────────────────────────────────── */
  .chrome {
    background: rgba(250,248,255,0.98);
    border-bottom: 1px solid rgba(124,58,237,0.08);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }
  .traffic { display: flex; gap: 8px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #ffbd2e; }
  .dot-g { background: #28c840; }
  .url-bar {
    flex: 1;
    max-width: 500px;
    background: rgba(124,58,237,0.05);
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    color: #6b7280;
  }

  /* ─── App body ───────────────────────────────────────────── */
  .app-body {
    display: flex;
    height: 960px;
  }

  /* ─── Sidebar ────────────────────────────────────────────── */
  .sidebar {
    width: 220px;
    flex-shrink: 0;
    background: rgba(248,246,255,0.95);
    border-right: 1px solid rgba(124,58,237,0.08);
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .brand {
    display: flex; align-items: center; gap: 10px;
    padding: 0 10px 24px;
    border-bottom: 1px solid rgba(124,58,237,0.08);
    margin-bottom: 16px;
  }
  .brand-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #7C3AED, #EC4899);
    border-radius: 8px;
  }
  .brand-name {
    font-size: 16px; font-weight: 700;
    color: #1a1a2e;
  }
  .brand-badge {
    font-size: 9px; font-weight: 600;
    background: linear-gradient(135deg, #7C3AED, #EC4899);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 12px;
    border-radius: 10px;
    font-size: 14px; font-weight: 500;
    color: #6b7280;
    cursor: pointer;
  }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.06));
    color: #7C3AED;
    font-weight: 600;
  }
  .nav-icon {
    width: 18px; height: 18px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .nav-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* Projects section */
  .sidebar-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    color: #9ca3af;
    padding: 8px 12px 4px;
    margin-top: 8px;
  }
  .project-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px; font-weight: 500; color: #6b7280;
  }
  .project-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* ─── Main content ───────────────────────────────────────── */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(252,250,255,0.9);
  }

  .main-header {
    padding: 24px 32px 20px;
    border-bottom: 1px solid rgba(124,58,237,0.07);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .greeting-date {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;
  }
  .greeting-name {
    font-size: 22px; font-weight: 700; color: #1a1a2e;
    background: linear-gradient(135deg, #1a1a2e 0%, #7C3AED 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .streak-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(124,58,237,0.08));
    border: 1px solid rgba(236,72,153,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #EC4899;
    margin-left: 12px;
  }
  .header-actions { display: flex; gap: 12px; align-items: center; }
  .btn-add {
    background: linear-gradient(135deg, #7C3AED, #EC4899);
    color: white; border: none; border-radius: 10px;
    padding: 10px 20px; font-size: 13px; font-weight: 600;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-secondary {
    background: rgba(124,58,237,0.06);
    border: 1px solid rgba(124,58,237,0.15);
    color: #7C3AED; border-radius: 10px;
    padding: 10px 16px; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 6px;
  }

  /* ─── Two-column layout ──────────────────────────────────── */
  .columns {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* LEFT: stats + chart + goals */
  .left-panel {
    width: 280px;
    flex-shrink: 0;
    padding: 24px 20px;
    border-right: 1px solid rgba(124,58,237,0.07);
    background: rgba(250,248,255,0.6);
    display: flex; flex-direction: column; gap: 20px;
    overflow: hidden;
  }

  .stats-strip {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
  }
  .stat-card {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 14px; padding: 14px 12px;
    text-align: center;
  }
  .stat-icon { font-size: 18px; margin-bottom: 4px; }
  .stat-num { font-size: 22px; font-weight: 800; color: #1a1a2e; line-height: 1; }
  .stat-label { font-size: 9px; font-weight: 600; letter-spacing: 0.06em; color: #9ca3af; text-transform: uppercase; margin-top: 4px; }

  .section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    color: #9ca3af; text-transform: uppercase; margin-bottom: 10px;
  }

  /* Mini bar chart */
  .chart-area {
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(124,58,237,0.08);
    border-radius: 14px; padding: 16px;
  }
  .chart-bars {
    display: flex; align-items: flex-end; gap: 8px;
    height: 70px;
  }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bar {
    width: 100%; border-radius: 4px 4px 0 0;
    background: linear-gradient(180deg, rgba(124,58,237,0.2), rgba(124,58,237,0.1));
  }
  .bar.active {
    background: linear-gradient(180deg, #7C3AED, rgba(124,58,237,0.7));
  }
  .bar-label { font-size: 9px; color: #9ca3af; font-weight: 500; }

  /* Goal focus */
  .goal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .goal-mini {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 12px; padding: 12px;
  }
  .goal-mini-label {
    font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 4px;
  }
  .goal-mini-num { font-size: 20px; font-weight: 800; line-height: 1; }
  .goal-mini-sub { font-size: 9px; color: #9ca3af; margin-top: 2px; }

  /* Goal outcomes */
  .goal-outcome {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(124,58,237,0.05);
  }
  .goal-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .goal-text { flex: 1; min-width: 0; }
  .goal-title { font-size: 12px; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .goal-date { font-size: 10px; color: #9ca3af; margin-top: 1px; }
  .goal-pct { font-size: 11px; font-weight: 700; color: #7C3AED; }

  /* RIGHT: task feeds */
  .right-panel {
    flex: 1; padding: 24px 28px;
    overflow: hidden;
    display: flex; flex-direction: column; gap: 20px;
  }

  .widget-title {
    font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: #9ca3af;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .widget-title::before {
    content: '';
    display: block; width: 3px; height: 14px;
    background: linear-gradient(180deg, #EC4899, #7C3AED);
    border-radius: 2px;
  }

  /* Task cards */
  .task-card {
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(124,58,237,0.09);
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 2px 8px rgba(124,58,237,0.06);
    position: relative;
    overflow: hidden;
  }
  .task-card::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  }
  .task-card.urgent::before { background: #ef4444; }
  .task-card.high::before { background: #f97316; }
  .task-card.medium::before { background: #f59e0b; }
  .task-card.done::before { background: #10b981; }

  .task-checkbox {
    width: 20px; height: 20px; flex-shrink: 0;
    border-radius: 50%; border: 2px solid rgba(124,58,237,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .task-checkbox.checked {
    background: #10b981; border-color: #10b981;
  }
  .task-check-mark {
    width: 10px; height: 10px;
    border-bottom: 2px solid white; border-right: 2px solid white;
    transform: rotate(45deg) translate(-1px, -2px);
  }
  .task-body { flex: 1; min-width: 0; }
  .task-title { font-size: 14px; font-weight: 600; color: #1f2937; }
  .task-title.done { text-decoration: line-through; color: #9ca3af; }
  .task-subtitle { font-size: 12px; color: #9ca3af; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .task-meta { display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap; }
  .badge {
    border-radius: 6px; padding: 2px 8px;
    font-size: 10px; font-weight: 600;
    display: inline-block;
  }
  .badge-urgent { background: rgba(239,68,68,0.1); color: #ef4444; }
  .badge-high { background: rgba(249,115,22,0.1); color: #f97316; }
  .badge-medium { background: rgba(245,158,11,0.1); color: #f59e0b; }
  .badge-low { background: rgba(59,130,246,0.1); color: #3b82f6; }
  .badge-project {
    background: rgba(124,58,237,0.07);
    color: #7C3AED; border: 1px solid rgba(124,58,237,0.12);
    display: inline-flex; align-items: center; gap: 4px;
  }
  .badge-date { background: transparent; color: #9ca3af; }
  .badge-overdue { background: rgba(239,68,68,0.08); color: #ef4444; }
  .badge-today { background: rgba(245,158,11,0.08); color: #f59e0b; }

  /* Subtask bar */
  .subtask-progress {
    display: flex; align-items: center; gap: 6px; margin-top: 6px;
  }
  .subtask-bar-bg {
    height: 3px; flex: 1; border-radius: 99px;
    background: rgba(124,58,237,0.1);
  }
  .subtask-bar-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #7C3AED, #EC4899);
  }
  .subtask-text { font-size: 10px; color: #9ca3af; }

  /* ─── Floating analytics panel ────────────────────────────── */
  .analytics-float {
    position: absolute;
    right: -180px;
    top: 160px;
    width: 280px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(124,58,237,0.14);
    border-radius: 20px;
    box-shadow:
      0 24px 60px rgba(124,58,237,0.2),
      0 8px 24px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.9);
    padding: 20px;
    z-index: 10;
  }
  .af-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  }
  .af-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1));
    display: flex; align-items: center; justify-content: center;
  }
  .af-title { font-size: 13px; font-weight: 700; color: #1f2937; }

  /* Progress ring */
  .ring-area { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .ring-svg { flex-shrink: 0; }
  .ring-info { flex: 1; }
  .ring-pct { font-size: 22px; font-weight: 800; color: #1f2937; }
  .ring-label { font-size: 11px; color: #9ca3af; margin-top: 2px; }

  .af-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px; margin-bottom: 6px;
  }
  .af-row-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .af-row-body { flex: 1; min-width: 0; }
  .af-row-label { font-size: 11px; color: #6b7280; }
  .af-row-val { font-size: 14px; font-weight: 700; }
  .af-row-sub { font-size: 10px; color: #9ca3af; }

  /* Up next */
  .up-next {
    background: rgba(124,58,237,0.05);
    border: 1px solid rgba(124,58,237,0.1);
    border-radius: 12px; padding: 12px;
    margin-top: 4px;
    display: flex; align-items: center; gap: 10px;
  }
  .up-next-arrow {
    width: 24px; height: 24px; border-radius: 6px;
    background: linear-gradient(135deg, #7C3AED, #EC4899);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .up-next-title { font-size: 12px; font-weight: 600; color: #374151; }
  .up-next-meta { font-size: 10px; color: #9ca3af; margin-top: 2px; }
</style>
</head>
<body>

<!-- Background layers -->
<div class="bg"></div>
<div class="dots"></div>
<div class="glow-bl"></div>
<div class="glow-tr"></div>

<!-- Dashboard scene -->
<div class="scene">
  <div style="position: relative;">
    <div class="shell">

      <!-- Window chrome -->
      <div class="chrome">
        <div class="traffic">
          <div class="dot dot-r"></div>
          <div class="dot dot-y"></div>
          <div class="dot dot-g"></div>
        </div>
        <div class="url-bar">app.optimaz.co/dashboard</div>
      </div>

      <!-- App body -->
      <div class="app-body">

        <!-- Sidebar -->
        <div class="sidebar">
          <div class="brand">
            <div class="brand-icon"></div>
            <div>
              <span class="brand-name">Optimaz</span>
              <span class="brand-badge">BETA</span>
            </div>
          </div>

          <div class="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="#7C3AED" opacity="0.8"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="#7C3AED" opacity="0.4"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="#7C3AED" opacity="0.4"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="#7C3AED" opacity="0.2"/>
            </svg>
            Today
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <path d="M9 11l3 3L22 4" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Tasks
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <circle cx="12" cy="12" r="9" stroke="#9ca3af" stroke-width="2"/>
              <path d="M12 7v5l3 3" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Goals
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9ca3af" stroke-width="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Calendar
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <rect x="3" y="11" width="4" height="10" rx="1" fill="#9ca3af" opacity="0.5"/>
              <rect x="10" y="7" width="4" height="14" rx="1" fill="#9ca3af" opacity="0.5"/>
              <rect x="17" y="3" width="4" height="18" rx="1" fill="#9ca3af" opacity="0.5"/>
            </svg>
            Projects
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <circle cx="12" cy="8" r="4" stroke="#9ca3af" stroke-width="2"/>
              <path d="M6 20v-2a6 6 0 0112 0v2" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Routines
          </div>
          <div class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#9ca3af" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#9ca3af" stroke-width="2"/>
            </svg>
            Settings
          </div>

          <div class="sidebar-section-label">PROJECTS</div>
          <div class="project-item">
            <div class="project-dot" style="background:#3b82f6"></div>
            Web App Redesign
          </div>
          <div class="project-item">
            <div class="project-dot" style="background:#EC4899"></div>
            Marketing Campaign
          </div>
          <div class="project-item">
            <div class="project-dot" style="background:#10b981"></div>
            Personal Finance
          </div>
          <div class="project-item">
            <div class="project-dot" style="background:#ef4444"></div>
            Health &amp; Wellness
          </div>
        </div>

        <!-- Main content -->
        <div class="main">
          <!-- Header -->
          <div class="main-header">
            <div>
              <div class="greeting-date">Sunday · June 14, 2026</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="greeting-name">Good morning, Aiman</div>
                <div class="streak-pill">🔥 5 Day Streak · Getting started</div>
              </div>
              <div style="font-size:12px; color:#9ca3af; margin-top:6px; font-style:italic;">
                "Small daily improvements over time lead to stunning results." — Robin Sharma
              </div>
            </div>
            <div class="header-actions">
              <div class="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="4" height="10" rx="1" fill="#7C3AED"/><rect x="10" y="7" width="4" height="14" rx="1" fill="#7C3AED" opacity="0.7"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#7C3AED" opacity="0.4"/></svg>
                Filter
              </div>
              <div class="btn-add">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
                Add Task
              </div>
            </div>
          </div>

          <!-- Two columns -->
          <div class="columns">
            <!-- Stats left panel -->
            <div class="left-panel">
              <div>
                <div class="section-label">This Week</div>
                <div class="stats-strip">
                  <div class="stat-card">
                    <div style="font-size:16px; margin-bottom:4px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin:0 auto; display:block"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10b981" stroke-width="2" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#10b981" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <div class="stat-num" style="color:#10b981">6</div>
                    <div class="stat-label">Done</div>
                  </div>
                  <div class="stat-card">
                    <div style="font-size:16px; margin-bottom:4px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin:0 auto; display:block"><circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <div class="stat-num" style="color:#ef4444">5</div>
                    <div class="stat-label">Overdue</div>
                  </div>
                  <div class="stat-card">
                    <div style="font-size:16px; margin-bottom:4px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin:0 auto; display:block"><circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>
                    </div>
                    <div class="stat-num" style="color:#f59e0b">8</div>
                    <div class="stat-label">Soon</div>
                  </div>
                </div>
              </div>

              <!-- Bar chart -->
              <div class="chart-area">
                <div class="section-label" style="margin-bottom:12px">Completions · Last 7 Days</div>
                <div class="chart-bars">
                  <div class="bar-col"><div class="bar" style="height:20px"></div><div class="bar-label">Mo</div></div>
                  <div class="bar-col"><div class="bar" style="height:15px"></div><div class="bar-label">Tu</div></div>
                  <div class="bar-col"><div class="bar" style="height:30px"></div><div class="bar-label">We</div></div>
                  <div class="bar-col"><div class="bar" style="height:12px"></div><div class="bar-label">Th</div></div>
                  <div class="bar-col"><div class="bar" style="height:18px"></div><div class="bar-label">Fr</div></div>
                  <div class="bar-col"><div class="bar" style="height:25px"></div><div class="bar-label">Sa</div></div>
                  <div class="bar-col"><div class="bar active" style="height:55px"></div><div class="bar-label" style="color:#7C3AED; font-weight:700">Su</div></div>
                </div>
              </div>

              <!-- Goal focus -->
              <div>
                <div class="section-label">Goal Focus</div>
                <div class="goal-grid">
                  <div class="goal-mini">
                    <div class="goal-mini-label" style="color:#7C3AED">Active</div>
                    <div class="goal-mini-num" style="color:#1f2937">6</div>
                    <div class="goal-mini-sub">Goals in motion</div>
                  </div>
                  <div class="goal-mini" style="background:rgba(239,68,68,0.04); border-color:rgba(239,68,68,0.12)">
                    <div class="goal-mini-label" style="color:#ef4444">At Risk</div>
                    <div class="goal-mini-num" style="color:#ef4444">0</div>
                    <div class="goal-mini-sub">Past target</div>
                  </div>
                  <div class="goal-mini" style="background:rgba(245,158,11,0.04); border-color:rgba(245,158,11,0.12)">
                    <div class="goal-mini-label" style="color:#f59e0b">Urgent</div>
                    <div class="goal-mini-num" style="color:#f59e0b">4</div>
                    <div class="goal-mini-sub">Urgent tasks</div>
                  </div>
                  <div class="goal-mini" style="background:rgba(16,185,129,0.04); border-color:rgba(16,185,129,0.12)">
                    <div class="goal-mini-label" style="color:#10b981">Done</div>
                    <div class="goal-mini-num" style="color:#10b981">2</div>
                    <div class="goal-mini-sub">Completed</div>
                  </div>
                </div>
              </div>

              <!-- Next outcomes -->
              <div>
                <div class="section-label">Next Outcomes</div>
                <div class="goal-outcome">
                  <div class="goal-dot" style="background:#3b82f6"></div>
                  <div class="goal-text">
                    <div class="goal-title">Build in public — 30 posts</div>
                    <div class="goal-date">Target 2026-09-01</div>
                  </div>
                  <div class="goal-pct">50%</div>
                </div>
                <div class="goal-outcome">
                  <div class="goal-dot" style="background:#EC4899"></div>
                  <div class="goal-text">
                    <div class="goal-title">Launch MVP by Q3 2026</div>
                    <div class="goal-date">Target 2026-09-30</div>
                  </div>
                  <div class="goal-pct">17%</div>
                </div>
                <div class="goal-outcome" style="border:none">
                  <div class="goal-dot" style="background:#10b981"></div>
                  <div class="goal-text">
                    <div class="goal-title">Run 5K under 30 minutes</div>
                    <div class="goal-date">Target 2026-08-01</div>
                  </div>
                  <div class="goal-pct">33%</div>
                </div>
              </div>
            </div>

            <!-- Right task area -->
            <div class="right-panel">
              <!-- Overdue section -->
              <div>
                <div class="widget-title" style="color:#ef4444">Overdue (5)</div>
                <div class="task-card urgent">
                  <div class="task-checkbox">
                    <div style="width:8px;height:8px;border-radius:50%;background:rgba(239,68,68,0.2)"></div>
                  </div>
                  <div class="task-body">
                    <div class="task-title">Set up Google Analytics 4</div>
                    <div class="task-subtitle">Install GA4 tag and configure conversion events</div>
                    <div class="task-meta">
                      <span class="badge badge-high">High</span>
                      <span class="badge badge-project"><span style="width:6px;height:6px;border-radius:50%;background:#EC4899;display:inline-block"></span>Marketing Campaign Q3</span>
                      <span class="badge badge-date">📅 Jun 12</span>
                      <span class="badge badge-overdue">Overdue</span>
                    </div>
                  </div>
                </div>
                <div class="task-card high">
                  <div class="task-checkbox"></div>
                  <div class="task-body">
                    <div class="task-title">Fix auth redirect bug on mobile</div>
                    <div class="task-subtitle">Users get stuck on /auth/callback on iOS Safari</div>
                    <div class="task-meta">
                      <span class="badge badge-urgent">Urgent</span>
                      <span class="badge badge-project"><span style="width:6px;height:6px;border-radius:50%;background:#3b82f6;display:inline-block"></span>Web App Redesign</span>
                      <span class="badge badge-date">📅 Jun 10</span>
                      <span class="badge badge-overdue">Overdue</span>
                    </div>
                  </div>
                </div>
                <div class="task-card medium">
                  <div class="task-checkbox"></div>
                  <div class="task-body">
                    <div class="task-title">Write LinkedIn post about product update</div>
                    <div class="task-meta">
                      <span class="badge badge-medium">Medium</span>
                      <span class="badge badge-project"><span style="width:6px;height:6px;border-radius:50%;background:#EC4899;display:inline-block"></span>Marketing Campaign Q3</span>
                      <span class="badge badge-date">📅 Jun 11</span>
                      <span class="badge badge-overdue">Overdue</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Today section -->
              <div>
                <div class="widget-title">Today</div>
                <div class="task-card done" style="opacity:0.7">
                  <div class="task-checkbox checked">
                    <div class="task-check-mark"></div>
                  </div>
                  <div class="task-body">
                    <div class="task-title done">Design onboarding email sequence</div>
                    <div class="task-meta">
                      <span class="badge badge-high">High</span>
                      <span class="badge badge-project"><span style="width:6px;height:6px;border-radius:50%;background:#EC4899;display:inline-block"></span>Marketing Campaign Q3</span>
                      <span class="badge badge-today">Due today</span>
                    </div>
                    <div class="subtask-progress">
                      <div class="subtask-bar-bg"><div class="subtask-bar-fill" style="width:100%"></div></div>
                      <div class="subtask-text">5/5 subtasks · 100%</div>
                    </div>
                  </div>
                </div>
                <div class="task-card medium">
                  <div class="task-checkbox"></div>
                  <div class="task-body">
                    <div class="task-title">Update app store screenshots</div>
                    <div class="task-subtitle">New onboarding flow — capture all 5 key screens</div>
                    <div class="task-meta">
                      <span class="badge badge-medium">Medium</span>
                      <span class="badge badge-project"><span style="width:6px;height:6px;border-radius:50%;background:#3b82f6;display:inline-block"></span>Web App Redesign</span>
                      <span class="badge badge-today">Due today</span>
                    </div>
                    <div class="subtask-progress">
                      <div class="subtask-bar-bg"><div class="subtask-bar-fill" style="width:40%"></div></div>
                      <div class="subtask-text">2/5 subtasks · 40%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating analytics panel -->
    <div class="analytics-float">
      <div class="af-header">
        <div class="af-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="4" height="10" rx="1" fill="#7C3AED"/><rect x="10" y="7" width="4" height="14" rx="1" fill="#7C3AED" opacity="0.7"/><rect x="17" y="3" width="4" height="18" rx="1" fill="#7C3AED" opacity="0.4"/></svg>
        </div>
        <div class="af-title">Today's Progress</div>
        <div style="margin-left:auto; width:22px; height:22px; border-radius:6px; background:rgba(124,58,237,0.06); display:flex; align-items:center; justify-content:center;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
      </div>

      <!-- Ring -->
      <div class="ring-area">
        <svg class="ring-svg" width="72" height="72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(124,58,237,0.1)" stroke-width="5"/>
          <circle cx="36" cy="36" r="30" fill="none"
            stroke="url(#ring-grad)" stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray="188.5" stroke-dashoffset="69"
            transform="rotate(-90 36 36)"
          />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#7C3AED"/>
              <stop offset="100%" stop-color="#EC4899"/>
            </linearGradient>
          </defs>
          <text x="36" y="37" text-anchor="middle" dominant-baseline="middle" style="font-size:13px; font-weight:800; fill:#1f2937">63%</text>
        </svg>
        <div class="ring-info">
          <div class="ring-pct">63%</div>
          <div class="ring-label">5 tasks overdue</div>
          <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Sunday, June 14</div>
        </div>
      </div>

      <!-- Stat rows -->
      <div class="af-row" style="background:rgba(16,185,129,0.07)">
        <div class="af-row-icon" style="background:rgba(16,185,129,0.12)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10b981" stroke-width="2" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#10b981" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div class="af-row-body">
          <div class="af-row-label">Done today</div>
          <div class="af-row-sub">3 remaining</div>
        </div>
        <div class="af-row-val" style="color:#10b981">5/8</div>
      </div>

      <div class="af-row" style="background:rgba(239,68,68,0.07)">
        <div class="af-row-icon" style="background:rgba(239,68,68,0.12)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div class="af-row-body">
          <div class="af-row-label">Overdue</div>
          <div class="af-row-sub">Need attention</div>
        </div>
        <div class="af-row-val" style="color:#ef4444">5</div>
      </div>

      <div class="af-row" style="background:rgba(249,115,22,0.07)">
        <div class="af-row-icon" style="background:rgba(249,115,22,0.12)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8.5 14.5s1.5 2 4 2 4-2 4-2" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" stroke="#f97316" stroke-width="1.5"/></svg>
        </div>
        <div class="af-row-body">
          <div class="af-row-label">Streak</div>
          <div class="af-row-sub">Keep it going!</div>
        </div>
        <div class="af-row-val" style="color:#f97316">5d</div>
      </div>

      <div class="af-row" style="background:rgba(124,58,237,0.06)">
        <div class="af-row-icon" style="background:rgba(124,58,237,0.12)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#7C3AED" stroke-width="2"/><path d="M12 7v5l3 3" stroke="#7C3AED" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div class="af-row-body">
          <div class="af-row-label">Active goals</div>
          <div class="af-row-sub">In progress</div>
        </div>
        <div class="af-row-val" style="color:#7C3AED">6</div>
      </div>

      <!-- Up next -->
      <div style="margin-top:8px; font-size:9px; font-weight:700; letter-spacing:0.12em; color:#9ca3af; text-transform:uppercase; margin-bottom:6px;">Up Next</div>
      <div class="up-next">
        <div class="up-next-arrow">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <div>
          <div class="up-next-title">Fix auth redirect bug on mobile</div>
          <div class="up-next-meta">Urgent Priority · 2026-06-10</div>
        </div>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;

async function generate() {
  console.log('Launching Chromium…');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 3840, height: 2160 });

  await page.setContent(HTML, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const buffer = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 3840, height: 2160 },
  });

  writeFileSync(OUT_PATH, buffer);
  console.log(`Saved → ${OUT_PATH}`);

  await browser.close();
}

generate().catch(err => { console.error(err); process.exit(1); });
