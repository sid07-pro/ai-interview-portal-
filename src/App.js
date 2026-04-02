import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// STYLES — defined FIRST so StyleInjector can use them
// ============================================================
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080c14; --bg2: #0d1220; --bg3: #111827;
    --surface: #141d2e; --surface2: #1a2438;
    --border: #1f2d44; --border2: #243450;
    --primary: #00d4ff; --primary-dim: rgba(0,212,255,0.12); --primary-glow: rgba(0,212,255,0.35);
    --accent: #7c3aed; --accent2: #06d6a0; --accent3: #ff6b35;
    --text: #e2e8f0; --text2: #94a3b8; --text3: #4a5568;
    --success: #06d6a0; --danger: #ff4757; --warning: #ffa726;
    --radius: 12px; --radius-lg: 20px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4); --shadow-lg: 0 8px 48px rgba(0,0,0,0.6);
  }
  [data-theme="light"] {
    --bg: #f0f4f8; --bg2: #e2e8f0; --bg3: #ffffff;
    --surface: #ffffff; --surface2: #f8fafc;
    --border: #e2e8f0; --border2: #cbd5e1;
    --primary: #0ea5e9; --primary-dim: rgba(14,165,233,0.1); --primary-glow: rgba(14,165,233,0.3);
    --accent: #7c3aed; --text: #0f172a; --text2: #475569; --text3: #94a3b8;
    --shadow: 0 4px 24px rgba(0,0,0,0.1); --shadow-lg: 0 8px 48px rgba(0,0,0,0.15);
  }
  html { scroll-behavior: smooth; }
  body { font-family: 'Syne', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; line-height: 1.6; transition: background 0.3s, color 0.3s; }

  /* ── AUTH ── */
  .auth-root {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); padding: 24px; position: relative; overflow: hidden;
  }
  .auth-root::before {
    content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
    width: 800px; height: 600px;
    background: radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-root::after {
    content: ''; position: absolute; bottom: -150px; right: -100px;
    width: 500px; height: 500px;
    background: radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-card {
    width: 100%; max-width: 440px; position: relative; z-index: 1;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 40px 36px;
    box-shadow: var(--shadow-lg); animation: fadeUp 0.45s ease;
  }
  .auth-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .auth-brand-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
  }
  .auth-brand-name { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; }
  .auth-brand-sub { font-size: 0.75rem; color: var(--text2); font-family: 'JetBrains Mono', monospace; }
  .auth-title { font-size: 1.45rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 5px; }
  .auth-subtitle { font-size: 0.88rem; color: var(--text2); margin-bottom: 24px; }
  .auth-tabs {
    display: flex; margin-bottom: 24px;
    background: var(--bg); border-radius: 10px; padding: 4px; border: 1px solid var(--border);
  }
  .auth-tab {
    flex: 1; padding: 9px; border-radius: 8px; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
    color: var(--text2); background: none; transition: all 0.2s;
  }
  .auth-tab.active { background: var(--surface); color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .auth-form { display: flex; flex-direction: column; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 0.82rem; font-weight: 700; color: var(--text2); }
  .form-input-wrap { position: relative; display: flex; align-items: center; }
  .form-icon { position: absolute; left: 13px; font-size: 0.95rem; color: var(--text3); pointer-events: none; z-index: 1; }
  .form-input {
    width: 100%; padding: 11px 14px 11px 40px;
    border-radius: 10px; border: 1.5px solid var(--border2);
    background: var(--bg); color: var(--text);
    font-family: 'Syne', sans-serif; font-size: 0.92rem;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-dim); }
  .form-input.inp-error { border-color: var(--danger) !important; }
  .form-input::placeholder { color: var(--text3); }
  .eye-btn {
    position: absolute; right: 11px; background: none; border: none; cursor: pointer;
    color: var(--text3); font-size: 1rem; padding: 4px; transition: color 0.2s; line-height: 1;
  }
  .eye-btn:hover { color: var(--primary); }
  .auth-msg {
    border-radius: 8px; padding: 10px 14px; font-size: 0.85rem;
    display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;
  }
  .auth-msg.err { background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.25); color: var(--danger); }
  .auth-msg.ok  { background: rgba(6,214,160,0.1);  border: 1px solid rgba(6,214,160,0.25);  color: var(--success); }
  .btn-auth {
    width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--primary), #0099bb);
    color: #000; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800;
    letter-spacing: 0.02em; transition: all 0.25s; margin-top: 4px;
  }
  .btn-auth:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px var(--primary-glow); }
  .btn-auth:disabled { opacity: 0.5; cursor: not-allowed; }
  .strength-bar { display: flex; gap: 4px; margin-top: 5px; }
  .strength-seg { flex: 1; height: 3px; border-radius: 3px; background: var(--border); transition: background 0.3s; }
  .strength-label { font-size: 0.72rem; margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
  .auth-footer { text-align: center; margin-top: 18px; font-size: 0.83rem; color: var(--text2); }
  .auth-link { color: var(--primary); font-weight: 700; cursor: pointer; background: none; border: none; font-family: 'Syne', sans-serif; font-size: 0.83rem; text-decoration: none; }
  .auth-link:hover { text-decoration: underline; }

  /* ── NAVBAR ── */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(8,12,20,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border); padding: 0 24px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    transition: background 0.3s;
  }
  [data-theme="light"] .navbar { background: rgba(240,244,248,0.88); }
  .nav-brand { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); cursor: pointer; text-decoration: none; }
  .nav-brand-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
  .nav-links { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .nav-btn { background: none; border: none; cursor: pointer; padding: 8px 14px; border-radius: 8px; color: var(--text2); font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
  .nav-btn:hover, .nav-btn.active { color: var(--primary); background: var(--primary-dim); }
  .nav-theme-toggle { width: 38px; height: 38px; border-radius: 8px; border: 1px solid var(--border2); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text2); font-size: 1rem; transition: all 0.2s; }
  .nav-theme-toggle:hover { border-color: var(--primary); color: var(--primary); }
  .nav-user { display: flex; align-items: center; gap: 7px; padding: 5px 12px; background: var(--primary-dim); border: 1px solid rgba(0,212,255,0.2); border-radius: 50px; }
  .nav-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; color: #000; flex-shrink: 0; }
  .nav-username { font-size: 0.82rem; font-weight: 700; color: var(--primary); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nav-logout { background: none; border: 1px solid rgba(255,71,87,0.3); cursor: pointer; padding: 6px 12px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; color: var(--danger); transition: all 0.2s; }
  .nav-logout:hover { background: rgba(255,71,87,0.1); }

  /* ── PAGE ── */
  .page { padding-top: 80px; min-height: 100vh; }

  /* ── HOME ── */
  .home-hero { text-align: center; padding: 60px 24px 40px; position: relative; overflow: hidden; }
  .home-hero::before { content: ''; position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%); pointer-events: none; }
  .hero-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--primary); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .hero-eyebrow::before, .hero-eyebrow::after { content: ''; display: block; width: 30px; height: 1px; background: var(--primary); opacity: 0.5; }
  .hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 16px; }
  .hero-title span { color: var(--primary); }
  .hero-subtitle { color: var(--text2); font-size: 1rem; max-width: 480px; margin: 0 auto 48px; }
  .setup-card { max-width: 720px; margin: 0 auto; padding: 0 24px 60px; }
  .glass-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow); position: relative; }
  .glass-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--primary-glow), transparent); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--primary); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px; }
  .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
  .chip { padding: 9px 20px; border-radius: 50px; border: 1px solid var(--border2); background: var(--bg3); color: var(--text2); cursor: pointer; font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .chip:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }
  .chip.selected { background: var(--primary-dim); border-color: var(--primary); color: var(--primary); }
  .difficulty-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
  .diff-card { padding: 20px 16px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg3); cursor: pointer; text-align: center; transition: all 0.2s; }
  .diff-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .diff-card.selected-easy   { border-color: var(--success); background: rgba(6,214,160,0.08); }
  .diff-card.selected-medium { border-color: var(--warning); background: rgba(255,167,38,0.08); }
  .diff-card.selected-hard   { border-color: var(--danger);  background: rgba(255,71,87,0.08); }
  .diff-icon { font-size: 1.5rem; margin-bottom: 8px; }
  .diff-name { font-weight: 700; font-size: 0.95rem; }
  .diff-sub  { font-size: 0.75rem; color: var(--text2); margin-top: 4px; }
  .diff-badge { display: inline-block; margin-top: 8px; padding: 2px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .badge-easy   { background: rgba(6,214,160,0.15); color: var(--success); }
  .badge-medium { background: rgba(255,167,38,0.15); color: var(--warning); }
  .badge-hard   { background: rgba(255,71,87,0.15);  color: var(--danger); }
  .info-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; padding: 16px; background: var(--bg); border-radius: var(--radius); border: 1px solid var(--border); }
  .info-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text2); }
  .info-item strong { color: var(--text); }
  .btn-primary { width: 100%; padding: 16px; border-radius: var(--radius); border: none; cursor: pointer; background: linear-gradient(135deg, var(--primary), #0099bb); color: #000; font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; letter-spacing: 0.02em; transition: all 0.2s; }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-secondary { padding: 12px 24px; border-radius: var(--radius); border: 1px solid var(--border2); background: var(--surface); color: var(--text); cursor: pointer; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; }
  .btn-secondary:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── QUIZ ── */
  .quiz-layout { max-width: 820px; margin: 0 auto; padding: 20px 24px 40px; }
  .quiz-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
  .quiz-meta { display: flex; align-items: center; gap: 16px; }
  .quiz-badge { padding: 4px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: var(--primary-dim); color: var(--primary); border: 1px solid rgba(0,212,255,0.2); }
  .quiz-category { font-size: 0.85rem; color: var(--text2); font-weight: 600; }
  .timer-wrap { display: flex; align-items: center; gap: 10px; padding: 10px 18px; background: var(--surface); border: 1px solid var(--border2); border-radius: 50px; }
  .timer-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); animation: pulse 1s infinite; }
  .timer-dot.warning { background: var(--warning); } .timer-dot.danger { background: var(--danger); }
  .timer-text { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; }
  .timer-text.warning { color: var(--warning); } .timer-text.danger { color: var(--danger); }
  .progress-section { margin-bottom: 24px; }
  .progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .progress-label { font-size: 0.8rem; color: var(--text2); font-family: 'JetBrains Mono', monospace; }
  .progress-track { height: 4px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius: 4px; transition: width 0.4s ease; }
  .question-dots { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .q-dot { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text3); transition: all 0.2s; }
  .q-dot.answered { background: var(--primary-dim); border-color: var(--primary); color: var(--primary); }
  .q-dot.current  { background: var(--primary); border-color: var(--primary); color: #000; }
  .question-card { margin-bottom: 24px; }
  .q-type-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; margin-bottom: 16px; background: rgba(124,58,237,0.12); color: var(--accent); border: 1px solid rgba(124,58,237,0.2); }
  .q-type-tag.mcq { background: rgba(0,212,255,0.1); color: var(--primary); border-color: rgba(0,212,255,0.2); }
  .q-number { font-size: 0.8rem; color: var(--text3); font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; }
  .q-text   { font-size: 1.05rem; font-weight: 600; line-height: 1.6; margin-bottom: 24px; }
  .q-points { font-size: 0.75rem; color: var(--text3); margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; }
  .options-grid { display: flex; flex-direction: column; gap: 10px; }
  .option { padding: 14px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg3); cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s; color: var(--text); }
  .option:hover { border-color: var(--primary); background: var(--primary-dim); }
  .option.selected { border-color: var(--primary); background: var(--primary-dim); }
  .option-letter { width: 28px; height: 28px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--text2); flex-shrink: 0; transition: all 0.2s; }
  .option.selected .option-letter { background: var(--primary); border-color: var(--primary); color: #000; }
  .option-text { font-size: 0.9rem; font-weight: 500; }
  .desc-textarea { width: 100%; min-height: 160px; padding: 16px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--bg); color: var(--text); font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; line-height: 1.7; resize: vertical; transition: border-color 0.2s; outline: none; }
  .desc-textarea:focus { border-color: var(--primary); }
  .desc-textarea::placeholder { color: var(--text3); }
  .word-count { font-size: 0.75rem; color: var(--text3); margin-top: 8px; text-align: right; font-family: 'JetBrains Mono', monospace; }
  .quiz-nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .submit-btn { padding: 14px 32px; border-radius: var(--radius); border: none; cursor: pointer; background: linear-gradient(135deg, var(--accent2), #04a87d); color: #000; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 800; transition: all 0.2s; }
  .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(6,214,160,0.3); }

  /* ── RESULT ── */
  .result-layout { max-width: 860px; margin: 0 auto; padding: 20px 24px 60px; }
  .result-hero { text-align: center; margin-bottom: 40px; padding: 48px 32px; background: var(--surface); border-radius: var(--radius-lg); border: 1px solid var(--border); position: relative; overflow: hidden; }
  .result-hero::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%); }
  .score-ring { width: 140px; height: 140px; border-radius: 50%; margin: 0 auto 24px; background: conic-gradient(var(--primary) calc(var(--pct) * 3.6deg), var(--border) 0deg); display: flex; align-items: center; justify-content: center; position: relative; }
  .score-ring::before { content: ''; position: absolute; width: 110px; height: 110px; border-radius: 50%; background: var(--surface); }
  .score-ring-inner { position: relative; text-align: center; }
  .score-number { font-size: 1.8rem; font-weight: 800; color: var(--primary); line-height: 1; }
  .score-total  { font-size: 0.75rem; color: var(--text2); font-family: 'JetBrains Mono', monospace; }
  .result-grade { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
  .result-msg   { color: var(--text2); font-size: 0.95rem; }
  .result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
  .stat-pill { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; text-align: center; }
  .stat-val   { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
  .stat-label { font-size: 0.75rem; color: var(--text2); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
  .review-section { margin-top: 32px; }
  .review-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .review-card { padding: 20px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); margin-bottom: 12px; }
  .review-card.correct   { border-left: 3px solid var(--success); }
  .review-card.incorrect { border-left: 3px solid var(--danger); }
  .review-card.partial   { border-left: 3px solid var(--warning); }
  .review-q  { font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; }
  .review-meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .review-your { font-size: 0.8rem; padding: 4px 12px; border-radius: 50px; font-family: 'JetBrains Mono', monospace; }
  .review-your.correct   { background: rgba(6,214,160,0.1);  color: var(--success); }
  .review-your.incorrect { background: rgba(255,71,87,0.1);   color: var(--danger); }
  .review-your.partial   { background: rgba(255,167,38,0.1);  color: var(--warning); }
  .review-correct { font-size: 0.8rem; color: var(--text2); }
  .ai-feedback-box { margin-top: 12px; padding: 12px 16px; background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 8px; font-size: 0.82rem; color: var(--text2); line-height: 1.5; }
  .ai-feedback-label { font-size: 0.7rem; color: var(--accent); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; margin-bottom: 4px; }
  .result-actions { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
  .result-actions .btn-primary   { flex: 1; min-width: 160px; }
  .result-actions .btn-secondary { flex: 1; min-width: 160px; }

  /* ── DASHBOARD ── */
  .dashboard-layout { max-width: 1000px; margin: 0 auto; padding: 20px 24px 60px; }
  .dashboard-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
  .dashboard-sub   { color: var(--text2); font-size: 0.9rem; margin-bottom: 36px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 36px; }
  .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
  .kpi-icon  { font-size: 1.5rem; margin-bottom: 12px; }
  .kpi-val   { font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1; }
  .kpi-label { font-size: 0.75rem; color: var(--text2); margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
  .kpi-trend { font-size: 0.7rem; margin-top: 8px; }
  .kpi-trend.up { color: var(--success); } .kpi-trend.down { color: var(--danger); }
  .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 28px; }
  .chart-bars { display: flex; align-items: flex-end; gap: 12px; height: 160px; }
  .chart-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .chart-bar-track { width: 100%; flex: 1; display: flex; align-items: flex-end; position: relative; }
  .chart-bar { width: 100%; border-radius: 6px 6px 0 0; min-height: 4px; background: linear-gradient(180deg, var(--primary), rgba(0,212,255,0.4)); transition: height 0.6s ease; position: relative; }
  .chart-bar-val { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; font-weight: 700; color: var(--primary); font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
  .chart-bar-label { font-size: 0.7rem; color: var(--text3); font-family: 'JetBrains Mono', monospace; text-align: center; }
  .accuracy-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .accuracy-row { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  .acc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .acc-cat { font-size: 0.82rem; font-weight: 700; }
  .acc-pct { font-size: 0.8rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--primary); }
  .acc-bar-track { height: 6px; background: var(--border); border-radius: 6px; overflow: hidden; }
  .acc-bar-fill  { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
  .history-table { width: 100%; border-collapse: collapse; }
  .history-table th { text-align: left; padding: 12px 16px; font-size: 0.75rem; font-weight: 700; color: var(--text3); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
  .history-table td { padding: 14px 16px; font-size: 0.85rem; border-bottom: 1px solid var(--border); color: var(--text); }
  .history-table tr:last-child td { border-bottom: none; }
  .history-table tr:hover td { background: var(--bg3); }
  .history-score-badge { padding: 3px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .score-high { background: rgba(6,214,160,0.12);  color: var(--success); }
  .score-mid  { background: rgba(255,167,38,0.12); color: var(--warning); }
  .score-low  { background: rgba(255,71,87,0.12);  color: var(--danger); }
  .empty-state { text-align: center; padding: 60px 24px; color: var(--text3); }
  .empty-state-icon { font-size: 3rem; margin-bottom: 16px; }
  .empty-state h3 { font-size: 1.1rem; color: var(--text2); margin-bottom: 8px; }

  /* ── MODAL ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 24px; }
  .modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-lg); padding: 36px; max-width: 440px; width: 100%; text-align: center; box-shadow: var(--shadow-lg); }
  .modal-icon  { font-size: 3rem; margin-bottom: 16px; }
  .modal-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 8px; }
  .modal-msg   { color: var(--text2); font-size: 0.9rem; margin-bottom: 28px; line-height: 1.6; }
  .modal-actions { display: flex; gap: 12px; }

  /* ── LOADING ── */
  .loading-overlay { position: fixed; inset: 0; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; }
  .loader-icon { font-size: 2.5rem; animation: spin 1s linear infinite; margin-bottom: 16px; }
  .loader-text { font-size: 0.9rem; color: var(--text2); font-family: 'JetBrains Mono', monospace; }

  /* ── ANIMATIONS ── */
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }

  /* ── RESPONSIVE ── */
  @media(max-width:600px){
    .difficulty-grid{grid-template-columns:1fr}
    .result-stats{grid-template-columns:repeat(2,1fr)}
    .quiz-header{flex-direction:column;align-items:flex-start}
    .stats-grid{grid-template-columns:repeat(2,1fr)}
    .nav-links{gap:4px}
    .nav-btn{padding:6px 10px;font-size:0.78rem}
    .auth-card{padding:28px 20px}
  }
`;

// ============================================================
// DATA LAYER — Questions Bank
// ============================================================
const QUESTION_BANK = {
  DSA: {
    Easy: [
      { id:"dsa-e-1", type:"mcq", question:"What is the time complexity of binary search?", options:["O(n)","O(log n)","O(n²)","O(1)"], answer:1, topic:"Searching" },
      { id:"dsa-e-2", type:"mcq", question:"Which data structure uses LIFO?", options:["Queue","Array","Stack","Linked List"], answer:2, topic:"Data Structures" },
      { id:"dsa-e-3", type:"mcq", question:"What is the space complexity of merge sort?", options:["O(1)","O(log n)","O(n)","O(n log n)"], answer:2, topic:"Sorting" },
      { id:"dsa-e-4", type:"descriptive", question:"Explain what a hash table is and how it handles collisions.", keywords:["hash function","key","value","collision","chaining","probing","bucket","index"], topic:"Hashing" },
      { id:"dsa-e-5", type:"mcq", question:"Which sorting algorithm has best-case O(n)?", options:["Selection Sort","Bubble Sort","Merge Sort","Quick Sort"], answer:1, topic:"Sorting" },
    ],
    Medium: [
      { id:"dsa-m-1", type:"mcq", question:"In a balanced BST with n nodes, height is approximately?", options:["O(n)","O(log n)","O(n log n)","O(√n)"], answer:1, topic:"Trees" },
      { id:"dsa-m-2", type:"descriptive", question:"Explain Dijkstra's algorithm and its time complexity.", keywords:["shortest path","priority queue","greedy","weighted graph","relaxation","O(E log V)","visited","distance"], topic:"Graphs" },
      { id:"dsa-m-3", type:"mcq", question:"Which traversal visits root between left and right subtree?", options:["Preorder","Inorder","Postorder","Level-order"], answer:1, topic:"Trees" },
      { id:"dsa-m-4", type:"mcq", question:"What data structure is best for implementing a priority queue?", options:["Array","Linked List","Heap","Stack"], answer:2, topic:"Data Structures" },
      { id:"dsa-m-5", type:"descriptive", question:"What is dynamic programming? Give an example.", keywords:["overlapping subproblems","optimal substructure","memoization","tabulation","fibonacci","knapsack","bottom-up","top-down"], topic:"DP" },
    ],
    Hard: [
      { id:"dsa-h-1", type:"descriptive", question:"Explain the concept of amortized analysis with an example.", keywords:["amortized","aggregate","accounting","potential method","dynamic array","doubling","average cost","operations"], topic:"Analysis" },
      { id:"dsa-h-2", type:"mcq", question:"What is the time complexity of Floyd-Warshall algorithm?", options:["O(V²)","O(V³)","O(E log V)","O(V² log V)"], answer:1, topic:"Graphs" },
      { id:"dsa-h-3", type:"descriptive", question:"Explain Red-Black trees and their balancing properties.", keywords:["red","black","root","leaf","rotation","balanced","height","insertion","O(log n)","color"], topic:"Trees" },
      { id:"dsa-h-4", type:"mcq", question:"Which NP-complete problem involves finding a Hamiltonian cycle?", options:["Travelling Salesman Problem","Knapsack Problem","Graph Coloring","Subset Sum"], answer:0, topic:"Complexity" },
      { id:"dsa-h-5", type:"descriptive", question:"Describe segment trees and their use cases.", keywords:["range query","point update","build","lazy propagation","sum","min","max","O(log n)","tree"], topic:"Trees" },
    ],
  },
  HR: {
    Easy: [
      { id:"hr-e-1", type:"descriptive", question:"Tell me about yourself and your background.", keywords:["experience","skills","education","goal","passion","background","work","project"], topic:"Introduction" },
      { id:"hr-e-2", type:"mcq", question:"Which is the most important quality in teamwork?", options:["Individual performance","Communication","Competition","Seniority"], answer:1, topic:"Teamwork" },
      { id:"hr-e-3", type:"descriptive", question:"What are your biggest strengths?", keywords:["problem solving","communication","leadership","teamwork","adaptable","learning","analytical","creative"], topic:"Self-Assessment" },
      { id:"hr-e-4", type:"mcq", question:"What does 'work ethic' primarily refer to?", options:["Salary expectations","Commitment and diligence","Office politics","Working hours only"], answer:1, topic:"Work Culture" },
      { id:"hr-e-5", type:"descriptive", question:"Why do you want to join this company?", keywords:["growth","culture","vision","mission","technology","learning","opportunity","contribute"], topic:"Motivation" },
    ],
    Medium: [
      { id:"hr-m-1", type:"descriptive", question:"Describe a conflict you had with a teammate and how you resolved it.", keywords:["conflict","communication","listen","compromise","resolve","outcome","team","approach"], topic:"Conflict Resolution" },
      { id:"hr-m-2", type:"mcq", question:"The STAR method stands for?", options:["Skill, Task, Action, Result","Situation, Task, Action, Result","Strategy, Time, Approach, Result","Situation, Task, Approach, Review"], answer:1, topic:"Interview Technique" },
      { id:"hr-m-3", type:"descriptive", question:"Where do you see yourself in 5 years?", keywords:["leadership","growth","skills","contribute","management","expertise","goal","career"], topic:"Career Goals" },
      { id:"hr-m-4", type:"descriptive", question:"Describe a time you failed. What did you learn?", keywords:["failure","lesson","improve","overcome","reflect","growth","mistake","action"], topic:"Growth Mindset" },
      { id:"hr-m-5", type:"mcq", question:"Which leadership style involves team participation in decision-making?", options:["Autocratic","Laissez-faire","Democratic","Transactional"], answer:2, topic:"Leadership" },
    ],
    Hard: [
      { id:"hr-h-1", type:"descriptive", question:"How would you handle strongly disagreeing with your manager's decision?", keywords:["professional","discuss","evidence","respect","communicate","escalate","outcome","team"], topic:"Professional Judgment" },
      { id:"hr-h-2", type:"descriptive", question:"You have multiple high-priority tasks and limited time. Walk me through your approach.", keywords:["prioritize","deadline","communicate","delegate","organize","impact","stakeholder","plan"], topic:"Time Management" },
      { id:"hr-h-3", type:"mcq", question:"Emotional intelligence primarily involves?", options:["High IQ","Self-awareness and empathy","Technical expertise","Fast decision-making"], answer:1, topic:"EQ" },
      { id:"hr-h-4", type:"descriptive", question:"How do you handle ambiguous requirements in a project?", keywords:["clarify","stakeholder","assumption","document","iterate","communicate","prototype","feedback"], topic:"Ambiguity" },
      { id:"hr-h-5", type:"descriptive", question:"Describe how you would build and motivate a team from scratch.", keywords:["vision","goal","trust","culture","recognition","feedback","communication","diversity"], topic:"Leadership" },
    ],
  },
  Core: {
    Easy: [
      { id:"core-e-1", type:"mcq", question:"What does OOP stand for?", options:["Object-Oriented Programming","Open Object Protocol","Ordered Operation Processing","Objective Output Program"], answer:0, topic:"OOP" },
      { id:"core-e-2", type:"mcq", question:"Which OSI layer handles routing?", options:["Data Link","Transport","Network","Session"], answer:2, topic:"Networking" },
      { id:"core-e-3", type:"descriptive", question:"Explain the four pillars of Object-Oriented Programming.", keywords:["encapsulation","inheritance","polymorphism","abstraction","class","object","method","data"], topic:"OOP" },
      { id:"core-e-4", type:"mcq", question:"Which protocol is used for secure web communication?", options:["HTTP","FTP","HTTPS","SMTP"], answer:2, topic:"Networking" },
      { id:"core-e-5", type:"descriptive", question:"What is a process vs a thread?", keywords:["process","thread","memory","CPU","lightweight","context switch","concurrent","independent"], topic:"OS" },
    ],
    Medium: [
      { id:"core-m-1", type:"descriptive", question:"Explain the concept of virtual memory and paging.", keywords:["virtual memory","page","frame","page table","swap","TLB","physical memory","address space"], topic:"OS" },
      { id:"core-m-2", type:"mcq", question:"Which DBMS concept ensures atomicity?", options:["Indexing","Transactions","Normalization","Sharding"], answer:1, topic:"Databases" },
      { id:"core-m-3", type:"descriptive", question:"What is the TCP three-way handshake?", keywords:["SYN","SYN-ACK","ACK","connection","TCP","reliable","handshake","establish"], topic:"Networking" },
      { id:"core-m-4", type:"mcq", question:"ACID in databases stands for?", options:["Atomicity, Consistency, Isolation, Durability","Access, Control, Input, Data","Atomicity, Concurrency, Integrity, Data","None of the above"], answer:0, topic:"Databases" },
      { id:"core-m-5", type:"descriptive", question:"Explain deadlock and the conditions necessary for it.", keywords:["mutual exclusion","hold and wait","no preemption","circular wait","deadlock","resource","process","prevention"], topic:"OS" },
    ],
    Hard: [
      { id:"core-h-1", type:"descriptive", question:"Explain CAP theorem and its implications for distributed systems.", keywords:["consistency","availability","partition tolerance","distributed","trade-off","BASE","eventually consistent","CAP"], topic:"Distributed Systems" },
      { id:"core-h-2", type:"mcq", question:"Which consensus algorithm is used in blockchain?", options:["Paxos","Raft","Proof of Work","Two-Phase Commit"], answer:2, topic:"Distributed Systems" },
      { id:"core-h-3", type:"descriptive", question:"Describe database normalization up to 3NF.", keywords:["1NF","2NF","3NF","anomaly","functional dependency","primary key","transitive","redundancy"], topic:"Databases" },
      { id:"core-h-4", type:"descriptive", question:"Explain the microservices architecture and its trade-offs.", keywords:["microservices","monolith","API gateway","service","scalability","fault isolation","communication","deployment"], topic:"System Design" },
      { id:"core-h-5", type:"mcq", question:"Which attack exploits unsanitized SQL input?", options:["XSS","CSRF","SQL Injection","Buffer Overflow"], answer:2, topic:"Security" },
    ],
  },
  System_Design: {
    Easy: [
      { id:"sd-e-1", type:"mcq", question:"What does API stand for?", options:["Application Program Interface","Advanced Protocol Integration","Automated Program Instruction","Application Process Input"], answer:0, topic:"APIs" },
      { id:"sd-e-2", type:"descriptive", question:"What is REST and what are its key principles?", keywords:["stateless","client-server","resource","HTTP","uniform interface","cacheable","endpoint","representation"], topic:"APIs" },
      { id:"sd-e-3", type:"mcq", question:"Which HTTP method is idempotent and safe?", options:["POST","PUT","DELETE","GET"], answer:3, topic:"APIs" },
      { id:"sd-e-4", type:"descriptive", question:"What is a CDN and why is it used?", keywords:["content delivery","latency","geographic","cache","static","edge","server","performance"], topic:"Infrastructure" },
      { id:"sd-e-5", type:"mcq", question:"Load balancing distributes traffic to improve?", options:["Security","Availability and Performance","Data consistency","Code quality"], answer:1, topic:"Scalability" },
    ],
    Medium: [
      { id:"sd-m-1", type:"descriptive", question:"Design a URL shortener like bit.ly. What components would you use?", keywords:["hash","database","redirect","unique","collision","cache","scalability","analytics"], topic:"System Design" },
      { id:"sd-m-2", type:"mcq", question:"Which caching strategy writes to cache and DB simultaneously?", options:["Cache-aside","Write-through","Write-back","Read-through"], answer:1, topic:"Caching" },
      { id:"sd-m-3", type:"descriptive", question:"What is horizontal vs vertical scaling?", keywords:["horizontal","vertical","scale out","scale up","CPU","memory","servers","load balancer"], topic:"Scalability" },
      { id:"sd-m-4", type:"descriptive", question:"Explain message queues and when to use them.", keywords:["asynchronous","decouple","producer","consumer","RabbitMQ","Kafka","retry","buffering"], topic:"Architecture" },
      { id:"sd-m-5", type:"mcq", question:"Redis is primarily used as?", options:["SQL Database","In-memory cache/store","Message broker only","File storage"], answer:1, topic:"Caching" },
    ],
    Hard: [
      { id:"sd-h-1", type:"descriptive", question:"Design Twitter's timeline feature at scale (millions of users).", keywords:["fan-out","pull","push","cache","sharding","celebrity","feed","database","latency","consistency"], topic:"System Design" },
      { id:"sd-h-2", type:"descriptive", question:"Explain consistent hashing and its advantages.", keywords:["consistent hashing","virtual nodes","ring","key distribution","node addition","removal","replication","load"], topic:"Distributed Systems" },
      { id:"sd-h-3", type:"mcq", question:"Which pattern avoids cascading failures in microservices?", options:["Singleton","Circuit Breaker","Observer","Factory"], answer:1, topic:"Resilience" },
      { id:"sd-h-4", type:"descriptive", question:"How would you design a distributed rate limiter?", keywords:["token bucket","sliding window","Redis","distributed","counter","atomic","expiry","limit"], topic:"System Design" },
      { id:"sd-h-5", type:"descriptive", question:"Design a notification system for 100M+ users.", keywords:["push","websocket","queue","priority","batch","retry","delivery","scale","partition"], topic:"System Design" },
    ],
  },
};

const DIFFICULTY_MULTIPLIER = { Easy:1, Medium:1.5, Hard:2 };
const DIFFICULTY_TIME        = { Easy:600, Medium:900, Hard:1200 };
const POINTS_PER_MCQ  = 10;
const POINTS_PER_DESC = 15;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getQuestions(category, difficulty) {
  const pool = QUESTION_BANK[category]?.[difficulty] || [];
  return shuffle(pool).slice(0, 5);
}

function evaluateDescriptive(answer, keywords) {
  if (!answer || answer.trim().length === 0) return { score:0, feedback:"no_answer", matchedKeywords:[], percentage:0 };
  const lower = answer.toLowerCase();
  const matched = keywords.filter(k => lower.includes(k.toLowerCase()));
  const percentage = matched.length / keywords.length;
  let feedback = "poor";
  if (answer.trim().length < 20) feedback = "too_short";
  else if (percentage >= 0.7) feedback = "excellent";
  else if (percentage >= 0.5) feedback = "good";
  else if (percentage >= 0.3) feedback = "average";
  return { score: Math.round(percentage * POINTS_PER_DESC), feedback, matchedKeywords: matched, percentage };
}

function generateAIFeedback(question, answer, result) {
  const feedbackMap = {
    no_answer: ["No response detected. Ensure you attempt every question.","AI Analysis: Empty submission — 0 marks awarded."],
    too_short:  ["Response is critically short. Expand with technical detail.","AI Analysis: Answer lacks sufficient depth. Add concrete examples."],
    poor:       ["Limited keyword coverage. Review core concepts for this topic.","AI Analysis: Fundamentals need reinforcement. Consider revisiting study material."],
    average:    ["Moderate understanding shown. Good start — add more specifics.","AI Analysis: Partial grasp detected. Strengthen with precise terminology."],
    good:       ["Good technical coverage. Minor gaps — refine with edge cases.","AI Analysis: Strong foundational answer. Examples would push this to excellent."],
    excellent:  ["Outstanding answer! Comprehensive and technically accurate.","AI Analysis: Excellent keyword density and structural clarity — full marks territory."],
  };
  const msgs = feedbackMap[result.feedback] || feedbackMap["poor"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getFromStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setToStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// ============================================================
// AUTH HELPERS
// ============================================================
function getUsers()       { return getFromStorage("aip_users", []); }
function getCurrentUser() { return getFromStorage("aip_current_user", null); }

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok:false, error:"An account with this email already exists." };
  }
  const user = { id:Date.now(), name, email, password, createdAt:new Date().toLocaleDateString() };
  setToStorage("aip_users", [...users, user]);
  const safe = { id:user.id, name:user.name, email:user.email, createdAt:user.createdAt };
  setToStorage("aip_current_user", safe);
  return { ok:true, user:safe };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { ok:false, error:"Incorrect email or password." };
  const safe = { id:user.id, name:user.name, email:user.email, createdAt:user.createdAt };
  setToStorage("aip_current_user", safe);
  return { ok:true, user:safe };
}

function logoutUser() { localStorage.removeItem("aip_current_user"); }

// ============================================================
// STYLE INJECTOR
// ============================================================
function StyleInjector() {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = STYLES;
    document.head.appendChild(tag);
    return () => { try { document.head.removeChild(tag); } catch(_){} };
  }, []);
  return null;
}

// ============================================================
// COMPONENT: AuthPage  (Login + Register)
// ============================================================
function AuthPage({ onAuth }) {
  const [tab,     setTab]     = useState("login");
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // login fields
  const [lEmail, setLEmail] = useState("");
  const [lPass,  setLPass]  = useState("");

  // register fields
  const [rName,  setRName]  = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass,  setRPass]  = useState("");
  const [rPass2, setRPass2] = useState("");

  const pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6)           s++;
    if (pw.length >= 10)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(rPass);
  const strengthColors = ["#1f2d44","#ff4757","#ffa726","#ffa726","#06d6a0","#06d6a0"];
  const strengthLabels = ["","Weak","Fair","Fair","Strong","Very Strong"];

  const switchTab = (t) => { setTab(t); setError(""); setSuccess(""); setShowPw(false); };

  const handleLogin = (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!lEmail.trim()) { setError("Please enter your email."); return; }
    if (!lPass)         { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = loginUser(lEmail.trim(), lPass);
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      onAuth(res.user);
    }, 500);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!rName.trim())  { setError("Please enter your full name."); return; }
    if (!rEmail.trim()) { setError("Please enter your email."); return; }
    if (!rPass)         { setError("Please enter a password."); return; }
    if (!rPass2)        { setError("Please confirm your password."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail.trim())) { setError("Please enter a valid email address."); return; }
    if (rPass.length < 6)   { setError("Password must be at least 6 characters."); return; }
    if (rPass !== rPass2)   { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = registerUser(rName.trim(), rEmail.trim(), rPass);
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => onAuth(res.user), 1000);
    }, 600);
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">⚡</div>
          <div>
            <div className="auth-brand-name">InterviewAI</div>
            <div className="auth-brand-sub">// practice portal</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==="login"    ? "active":""}`} onClick={() => switchTab("login")}>Sign In</button>
          <button className={`auth-tab ${tab==="register" ? "active":""}`} onClick={() => switchTab("register")}>Create Account</button>
        </div>

        {/* ── LOGIN ── */}
        {tab === "login" && (
          <>
            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Sign in to continue your interview prep</div>
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              {error && <div className="auth-msg err">⚠️ {error}</div>}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-icon">✉️</span>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={lEmail}
                    onChange={e => setLEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <span className="form-icon">🔒</span>
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={lPass}
                    onChange={e => setLPass(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: "42px" }}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account?{" "}
              <button className="auth-link" onClick={() => switchTab("register")}>Create one free</button>
            </div>
          </>
        )}

        {/* ── REGISTER ── */}
        {tab === "register" && (
          <>
            <div className="auth-title">Create account</div>
            <div className="auth-subtitle">Start your interview preparation journey</div>
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              {error   && <div className="auth-msg err">⚠️ {error}</div>}
              {success && <div className="auth-msg ok">✅ {success}</div>}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-wrap">
                  <span className="form-icon">👤</span>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your full name"
                    value={rName}
                    onChange={e => setRName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-icon">✉️</span>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={rEmail}
                    onChange={e => setREmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <span className="form-icon">🔒</span>
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={rPass}
                    onChange={e => setRPass(e.target.value)}
                    autoComplete="new-password"
                    style={{ paddingRight: "42px" }}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)}>
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
                {rPass.length > 0 && (
                  <>
                    <div className="strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="strength-seg"
                          style={{ background: i <= strength ? strengthColors[strength] : undefined }}
                        />
                      ))}
                    </div>
                    <div className="strength-label" style={{ color: strengthColors[strength] }}>
                      {strengthLabels[strength]}
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-wrap">
                  <span className="form-icon">🔐</span>
                  <input
                    className={`form-input ${rPass2.length > 0 && rPass2 !== rPass ? "inp-error" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={rPass2}
                    onChange={e => setRPass2(e.target.value)}
                    autoComplete="new-password"
                    style={{ paddingRight: "42px" }}
                  />
                </div>
                {rPass2.length > 0 && rPass2 !== rPass && (
                  <div style={{ fontSize:"0.78rem", color:"var(--danger)", marginTop:"3px" }}>Passwords do not match</div>
                )}
              </div>

              <button type="submit" className="btn-auth" disabled={loading || !!success}>
                {loading ? "Creating account..." : success ? "Redirecting..." : "Create Account →"}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account?{" "}
              <button className="auth-link" onClick={() => switchTab("login")}>Sign in</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: Navbar
// ============================================================
function Navbar({ page, setPage, theme, toggleTheme, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setPage("home")}>
        <div className="nav-brand-icon">⚡</div>
        <span>InterviewAI</span>
      </div>
      <div className="nav-links">
        {["home","dashboard"].map(p => (
          <button key={p} className={`nav-btn ${page===p?"active":""}`} onClick={() => setPage(p)}>
            {p==="home" ? "🏠 Home" : "📊 Dashboard"}
          </button>
        ))}
        <button className="nav-theme-toggle" onClick={toggleTheme}>
          {theme==="dark" ? "☀️" : "🌙"}
        </button>
        {user && (
          <>
            <div className="nav-user">
              <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span className="nav-username">{user.name.split(" ")[0]}</span>
            </div>
            <button className="nav-logout" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ============================================================
// COMPONENT: Timer
// ============================================================
function Timer({ totalTime, onExpire, isRunning }) {
  const [remaining, setRemaining] = useState(totalTime);
  const ref = useRef(null);

  useEffect(() => {
    if (!isRunning) return;
    ref.current = setInterval(() => {
      setRemaining(t => {
        if (t <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [isRunning, onExpire]);

  const pct = (remaining / totalTime) * 100;
  const cls = pct < 20 ? "danger" : pct < 40 ? "warning" : "";

  return (
    <div className="timer-wrap">
      <div className={`timer-dot ${cls}`} />
      <span className={`timer-text ${cls}`}>{formatTime(remaining)}</span>
    </div>
  );
}

// ============================================================
// COMPONENT: QuestionCard
// ============================================================
function QuestionCard({ question, index, total, answer, onAnswer }) {
  const wordCount = typeof answer === "string"
    ? answer.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="question-card glass-card fade-up">
      <div className={`q-type-tag ${question.type==="mcq" ? "mcq" : ""}`}>
        {question.type==="mcq" ? "🔘 Multiple Choice" : "✍️ Descriptive"}
      </div>
      <div className="q-number">Q{index+1} of {total} · {question.topic}</div>
      <p className="q-text">{question.question}</p>
      <div className="q-points">
        {question.type==="mcq"
          ? `+${POINTS_PER_MCQ} pts`
          : `+${POINTS_PER_DESC} pts (AI scored)`}
      </div>

      {question.type === "mcq" ? (
        <div className="options-grid">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`option ${answer===i ? "selected" : ""}`}
              onClick={() => onAnswer(i)}
            >
              <div className="option-letter">{String.fromCharCode(65+i)}</div>
              <span className="option-text">{opt}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <textarea
            className="desc-textarea"
            placeholder="Type your detailed answer here... Use technical terminology for a higher AI score."
            value={answer || ""}
            onChange={e => onAnswer(e.target.value)}
          />
          <div className="word-count">
            {wordCount} words ·{" "}
            {wordCount < 20 ? "⚠️ Too short" : wordCount < 60 ? "📝 Developing" : "✅ Good length"}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// COMPONENT: ConfirmModal
// ============================================================
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">⚠️</div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <button className="btn-secondary" style={{flex:1}} onClick={onCancel}>Cancel</button>
          <button className="btn-primary"   style={{flex:1}} onClick={onConfirm}>Submit Test</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Home
// ============================================================
const CATEGORIES = [
  { key:"DSA",           label:"DSA",           icon:"🧮", sub:"Data Structures & Algorithms" },
  { key:"HR",            label:"HR",             icon:"🤝", sub:"Behavioral & Soft Skills" },
  { key:"Core",          label:"Core CS",        icon:"💻", sub:"OS, DBMS, Networking" },
  { key:"System_Design", label:"System Design",  icon:"🏗️", sub:"Architecture & Scale" },
];
const DIFFICULTIES = [
  { key:"Easy",   icon:"🟢", sub:"10 min · 1× points",   badge:"badge-easy" },
  { key:"Medium", icon:"🟡", sub:"15 min · 1.5× points", badge:"badge-medium" },
  { key:"Hard",   icon:"🔴", sub:"20 min · 2× points",   badge:"badge-hard" },
];

function HomePage({ onStart, user }) {
  const [category,   setCategory]   = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const canStart  = category && difficulty;
  const time      = difficulty ? DIFFICULTY_TIME[difficulty] : 0;
  const mult      = difficulty ? DIFFICULTY_MULTIPLIER[difficulty] : 1;
  const maxScore  = difficulty ? Math.round((POINTS_PER_MCQ*3 + POINTS_PER_DESC*2) * mult) : 0;

  return (
    <div className="page">
      <div className="home-hero">
        <div className="hero-eyebrow">Welcome back, {user?.name?.split(" ")[0] || "Candidate"} 👋</div>
        <h1 className="hero-title">Ace Your Next<br /><span>Tech Interview</span></h1>
        <p className="hero-subtitle">Real questions. Adaptive difficulty. Instant AI feedback. Simulate the actual interview experience.</p>
      </div>

      <div className="setup-card">
        <div className="glass-card">
          <div className="section-label">// step 01 — choose category</div>
          <div className="chip-grid">
            {CATEGORIES.map(c => (
              <div key={c.key} className={`chip ${category===c.key ? "selected" : ""}`} onClick={() => setCategory(c.key)}>
                <span>{c.icon}</span>
                <div>
                  <div style={{fontWeight:700}}>{c.label}</div>
                  <div style={{fontSize:"0.72rem", opacity:0.7}}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-label">// step 02 — select difficulty</div>
          <div className="difficulty-grid">
            {DIFFICULTIES.map(d => (
              <div
                key={d.key}
                className={`diff-card ${difficulty===d.key ? `selected-${d.key.toLowerCase()}` : ""}`}
                onClick={() => setDifficulty(d.key)}
              >
                <div className="diff-icon">{d.icon}</div>
                <div className="diff-name">{d.key}</div>
                <div className="diff-sub">{d.sub}</div>
                <div className={`diff-badge ${d.badge}`}>{d.key.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {canStart && (
            <div className="info-bar fade-up">
              <div className="info-item">⏱️ <strong>{formatTime(time)}</strong> time limit</div>
              <div className="info-item">📋 <strong>5</strong> questions</div>
              <div className="info-item">🏆 Max <strong>{maxScore} pts</strong></div>
              <div className="info-item">🤖 <strong>AI</strong> feedback included</div>
            </div>
          )}

          <button className="btn-primary" disabled={!canStart} onClick={() => onStart(category, difficulty)}>
            {canStart ? `🚀 Start ${category.replace("_"," ")} — ${difficulty} Test` : "Select Category & Difficulty to Begin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Quiz
// ============================================================
function QuizPage({ category, difficulty, onComplete }) {
  const [questions]      = useState(() => getQuestions(category, difficulty));
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});
  const [timerRunning, setTimerRunning] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const startTime = useRef(Date.now());

  const handleSubmit = useCallback(() => {
    setTimerRunning(false);
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    const results = questions.map(q => {
      if (q.type === "mcq") {
        const isCorrect = answers[q.id] === q.answer;
        return {
          question: q,
          userAnswer: answers[q.id] ?? null,
          isCorrect,
          score: isCorrect ? Math.round(POINTS_PER_MCQ * DIFFICULTY_MULTIPLIER[difficulty]) : 0,
          feedback: isCorrect ? "Correct!" : "Incorrect",
          aiFeedback: isCorrect
            ? "AI Analysis: Correct selection. Good recall."
            : `AI Analysis: Incorrect. Correct answer is "${q.options[q.answer]}".`,
        };
      } else {
        const ans   = answers[q.id] || "";
        const eval_ = evaluateDescriptive(ans, q.keywords);
        const score = Math.round(eval_.score * DIFFICULTY_MULTIPLIER[difficulty]);
        return {
          question: q, userAnswer: ans,
          isCorrect: eval_.percentage >= 0.5,
          score, feedback: eval_.feedback,
          aiFeedback: generateAIFeedback(q, ans, eval_),
          matchedKeywords: eval_.matchedKeywords,
        };
      }
    });
    const totalScore = results.reduce((s, r) => s + r.score, 0);
    const maxScore   = questions.reduce((s, q) => s + Math.round(
      (q.type==="mcq" ? POINTS_PER_MCQ : POINTS_PER_DESC) * DIFFICULTY_MULTIPLIER[difficulty]
    ), 0);
    const attempt = {
      id: Date.now(), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(),
      category, difficulty, score: totalScore, maxScore, timeTaken,
      accuracy: Math.round((results.filter(r => r.isCorrect).length / questions.length) * 100),
    };
    const history = getFromStorage("interview_history", []);
    setToStorage("interview_history", [attempt, ...history].slice(0, 20));
    onComplete({ results, totalScore, maxScore, timeTaken, category, difficulty });
  }, [answers, questions, difficulty, category, onComplete]);

  useEffect(() => { if (autoSubmit) handleSubmit(); }, [autoSubmit, handleSubmit]);

  const progress  = ((current+1) / questions.length) * 100;
  const answered  = Object.keys(answers).length;

  return (
    <div className="page">
      <ConfirmModal
        isOpen={showModal}
        title="Submit Test?"
        message={`You've answered ${answered} of ${questions.length} questions. Unanswered questions receive 0 marks. Submit now?`}
        onConfirm={() => { setShowModal(false); handleSubmit(); }}
        onCancel={()  => setShowModal(false)}
      />
      <div className="quiz-layout">
        <div className="quiz-header">
          <div className="quiz-meta">
            <div className="quiz-badge">{category.replace("_"," ")}</div>
            <div className="quiz-category">{difficulty} · {questions.length} Questions</div>
          </div>
          <Timer totalTime={DIFFICULTY_TIME[difficulty]} onExpire={() => setAutoSubmit(true)} isRunning={timerRunning} />
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Q{current+1} / {questions.length} · {answered} answered</span>
            <span className="progress-label">{Math.round(progress)}% complete</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
          <div className="question-dots">
            {questions.map((q,i) => (
              <div
                key={q.id}
                className={`q-dot ${i===current ? "current" : answers[q.id]!==undefined ? "answered" : ""}`}
                onClick={() => setCurrent(i)}
              >{i+1}</div>
            ))}
          </div>
        </div>

        <QuestionCard
          question={questions[current]}
          index={current}
          total={questions.length}
          answer={answers[questions[current].id]}
          onAnswer={val => setAnswers(prev => ({ ...prev, [questions[current].id]: val }))}
        />

        <div className="quiz-nav">
          <button className="btn-secondary" disabled={current===0} onClick={() => setCurrent(c => c-1)}>← Previous</button>
          <button className="btn-secondary" onClick={() => setShowModal(true)} style={{color:"var(--danger)",borderColor:"var(--danger)"}}>
            Submit Test
          </button>
          {current < questions.length-1
            ? <button className="btn-primary" style={{width:"auto",padding:"12px 28px"}} onClick={() => setCurrent(c => c+1)}>Next →</button>
            : <button className="submit-btn" onClick={() => setShowModal(true)}>✓ Finish & Submit</button>
          }
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Results
// ============================================================
function ResultPage({ data, onHome, onDashboard, onRetry }) {
  const { results, totalScore, maxScore, timeTaken, difficulty } = data;
  const pct     = Math.round((totalScore / maxScore) * 100);
  const correct = results.filter(r => r.isCorrect).length;

  const grade = pct>=90?"🏆 Outstanding":pct>=75?"🎯 Excellent":pct>=60?"✅ Good":pct>=40?"⚡ Average":"📚 Needs Work";
  const msg   = pct>=90?"Interview-ready! You're performing at the top level."
    : pct>=75?"Strong performance. Fine-tune the weak areas."
    : pct>=60?"Decent score. Regular practice will elevate this further."
    : pct>=40?"Keep going — consistency is key to improvement."
    : "Don't be discouraged. Review the feedback and retry.";

  return (
    <div className="page">
      <div className="result-layout">
        <div className="result-hero glass-card fade-up">
          <div className="score-ring" style={{"--pct":pct}}>
            <div className="score-ring-inner">
              <div className="score-number">{pct}%</div>
              <div className="score-total">{totalScore}/{maxScore}</div>
            </div>
          </div>
          <div className="result-grade">{grade}</div>
          <div className="result-msg">{msg}</div>
          <div className="result-stats">
            <div className="stat-pill"><div className="stat-val">{correct}/{results.length}</div><div className="stat-label">CORRECT</div></div>
            <div className="stat-pill"><div className="stat-val">{formatTime(timeTaken)}</div><div className="stat-label">TIME TAKEN</div></div>
            <div className="stat-pill"><div className="stat-val">{difficulty}</div><div className="stat-label">DIFFICULTY</div></div>
          </div>
        </div>

        <div className="review-section">
          <div className="review-title">🔍 Answer Review & AI Feedback</div>
          {results.map((r, i) => {
            const cls = r.isCorrect ? "correct" : r.question.type==="descriptive" ? "partial" : "incorrect";
            return (
              <div key={i} className={`review-card ${cls} fade-up`} style={{animationDelay:`${i*0.07}s`}}>
                <div className="review-q">Q{i+1}: {r.question.question}</div>
                <div className="review-meta">
                  {r.question.type === "mcq" ? (
                    <>
                      <span className={`review-your ${r.isCorrect?"correct":"incorrect"}`}>
                        Your: {r.userAnswer!==null ? r.question.options[r.userAnswer] : "Not answered"}
                      </span>
                      {!r.isCorrect && <span className="review-correct">✅ Correct: {r.question.options[r.question.answer]}</span>}
                      <span className={`review-your ${r.isCorrect?"correct":"incorrect"}`}>+{r.score} pts</span>
                    </>
                  ) : (
                    <span className={`review-your ${cls}`}>
                      Score: {r.score} pts · {r.matchedKeywords?.length||0} keywords matched
                    </span>
                  )}
                </div>
                <div className="ai-feedback-box">
                  <div className="ai-feedback-label">◆ AI EVALUATOR</div>
                  {r.aiFeedback}
                  {r.matchedKeywords?.length > 0 && (
                    <div style={{marginTop:8, display:"flex", flexWrap:"wrap", gap:6}}>
                      {r.matchedKeywords.map(k => (
                        <span key={k} style={{background:"rgba(0,212,255,0.1)", color:"var(--primary)", padding:"2px 8px", borderRadius:"4px", fontSize:"0.72rem", fontFamily:"JetBrains Mono, monospace"}}>{k}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button className="btn-secondary" onClick={onHome}>🏠 Home</button>
          <button className="btn-secondary" onClick={onRetry}>🔄 Retry</button>
          <button className="btn-primary"   onClick={onDashboard}>📊 View Dashboard</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENT: BarChart
// ============================================================
function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="chart-card">
      <div className="section-title">{title}</div>
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={i} className="chart-bar-wrap">
            <div className="chart-bar-track">
              <div className="chart-bar" style={{height:`${Math.max((d.value/max)*140,4)}px`}}>
                <div className="chart-bar-val">{d.value}</div>
              </div>
            </div>
            <div className="chart-bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: Dashboard
// ============================================================
function DashboardPage({ onHome }) {
  const [history,  setHistory]  = useState(() => getFromStorage("interview_history", []));

  const totalAttempts = history.length;
  const avgScore    = totalAttempts ? Math.round(history.reduce((s,a) => s + Math.round((a.score/a.maxScore)*100), 0) / totalAttempts) : 0;
  const avgAccuracy = totalAttempts ? Math.round(history.reduce((s,a) => s + a.accuracy, 0) / totalAttempts) : 0;
  const bestScore   = totalAttempts ? Math.max(...history.map(a => Math.round((a.score/a.maxScore)*100))) : 0;

  const catData = ["DSA","HR","Core","System_Design"].map(cat => {
    const attempts = history.filter(a => a.category===cat);
    const avg = attempts.length ? Math.round(attempts.reduce((s,a) => s + Math.round((a.score/a.maxScore)*100),0) / attempts.length) : 0;
    return { cat, attempts:attempts.length, avg };
  });

  const chartData = history.slice(0,8).reverse().map((a,i) => ({
    label:`#${i+1}`, value: Math.round((a.score/a.maxScore)*100)
  }));

  const diffData = ["Easy","Medium","Hard"].map(d => ({
    label:d, value: history.filter(a => a.difficulty===d).length
  }));

  const handleClear = () => {
    setToStorage("interview_history", []);
    setHistory([]);
  };

  return (
    <div className="page">
      <div className="dashboard-layout">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16, marginBottom:36}}>
          <div>
            <div className="dashboard-title">Performance Dashboard</div>
            <div className="dashboard-sub">Your complete interview preparation analytics</div>
          </div>
          <div style={{display:"flex", gap:10}}>
            {totalAttempts > 0 && (
              <button className="btn-secondary" style={{fontSize:"0.8rem", color:"var(--danger)", borderColor:"var(--danger)"}} onClick={handleClear}>
                🗑 Clear History
              </button>
            )}
            <button className="btn-primary" style={{width:"auto", padding:"12px 24px", fontSize:"0.9rem"}} onClick={onHome}>+ New Test</button>
          </div>
        </div>

        <div className="stats-grid">
          {[
            {icon:"🧪", val:totalAttempts,  label:"TOTAL ATTEMPTS",  trend:null},
            {icon:"📈", val:`${avgScore}%`,  label:"AVG SCORE",       trend:avgScore>60?"up":"down"},
            {icon:"🎯", val:`${avgAccuracy}%`,label:"AVG ACCURACY",   trend:null},
            {icon:"🏆", val:`${bestScore}%`, label:"BEST SCORE",      trend:"up"},
          ].map((k,i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-icon">{k.icon}</div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-label">{k.label}</div>
              {k.trend && <div className={`kpi-trend ${k.trend}`}>{k.trend==="up" ? "▲ Good standing" : "▼ Needs improvement"}</div>}
            </div>
          ))}
        </div>

        {history.length === 0 ? (
          <div className="glass-card empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No Attempts Yet</h3>
            <p>Take your first test to see analytics and performance trends here.</p>
            <button className="btn-primary" style={{marginTop:24, maxWidth:240, margin:"24px auto 0", display:"block"}} onClick={onHome}>
              Start First Test
            </button>
          </div>
        ) : (
          <>
            {chartData.length > 0 && <BarChart data={chartData} title="📈 Score Trend — Recent Attempts" />}

            <div className="section-title">📡 Category Performance</div>
            <div className="accuracy-grid" style={{marginBottom:28}}>
              {catData.map(c => (
                <div key={c.cat} className="accuracy-row">
                  <div className="acc-header">
                    <span className="acc-cat">{c.cat.replace("_"," ")}</span>
                    <span className="acc-pct">{c.avg}%</span>
                  </div>
                  <div className="acc-bar-track">
                    <div className="acc-bar-fill" style={{width:`${c.avg}%`, background: c.avg>=75?"var(--success)":c.avg>=50?"var(--warning)":"var(--danger)"}} />
                  </div>
                  <div style={{fontSize:"0.72rem", color:"var(--text3)", marginTop:6, fontFamily:"JetBrains Mono, monospace"}}>{c.attempts} attempts</div>
                </div>
              ))}
            </div>

            <BarChart data={diffData} title="🎯 Attempts by Difficulty" />

            <div className="section-title">📋 Attempt History</div>
            <div className="glass-card" style={{padding:"0 0 4px", overflow:"hidden"}}>
              <table className="history-table">
                <thead>
                  <tr><th>#</th><th>Category</th><th>Difficulty</th><th>Score</th><th>Accuracy</th><th>Time</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {history.slice(0,15).map((a,i) => {
                    const pct = Math.round((a.score/a.maxScore)*100);
                    const cls = pct>=75?"score-high":pct>=50?"score-mid":"score-low";
                    return (
                      <tr key={a.id}>
                        <td style={{color:"var(--text3)", fontFamily:"JetBrains Mono, monospace"}}>{i+1}</td>
                        <td>{a.category?.replace("_"," ")}</td>
                        <td>{a.difficulty}</td>
                        <td><span className={`history-score-badge ${cls}`}>{pct}%</span></td>
                        <td style={{fontFamily:"JetBrains Mono, monospace"}}>{a.accuracy}%</td>
                        <td style={{fontFamily:"JetBrains Mono, monospace"}}>{formatTime(a.timeTaken)}</td>
                        <td style={{color:"var(--text2)", fontSize:"0.8rem"}}>{a.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [theme, setTheme] = useState(() => getFromStorage("theme", "dark"));
  const [user,  setUser]  = useState(() => getCurrentUser());
  const [page,  setPage]  = useState("home");
  const [quizConfig,  setQuizConfig]  = useState(null);
  const [resultData,  setResultData]  = useState(null);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setToStorage("theme", theme);
  }, [theme]);

  const toggleTheme  = () => setTheme(t => t==="dark" ? "light" : "dark");

  const handleAuth   = (u) => { setUser(u); setPage("home"); };
  const handleLogout = () => { logoutUser(); setUser(null); setPage("home"); setQuizConfig(null); setResultData(null); };

  const handleStart  = (category, difficulty) => {
    setLoading(true);
    setTimeout(() => { setQuizConfig({category, difficulty}); setPage("quiz"); setLoading(false); }, 700);
  };

  const handleComplete = (data) => { setResultData(data); setPage("result"); };
  const handleRetry    = () => {
    if (quizConfig) { setLoading(true); setTimeout(() => { setPage("quiz"); setLoading(false); }, 600); }
  };
  const handleHome = () => { setPage("home"); setResultData(null); setQuizConfig(null); };

  const navSetPage = (p) => { if (p==="home") handleHome(); else setPage(p); };

  // ── Not logged in ──
  if (!user) {
    return (
      <>
        <StyleInjector />
        <AuthPage onAuth={handleAuth} />
      </>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <>
        <StyleInjector />
        <div className="loading-overlay">
          <div className="loader-icon">⚡</div>
          <div className="loader-text">Generating questions...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <StyleInjector />
      <Navbar page={page} setPage={navSetPage} theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} />
      {page==="home"      && <HomePage  onStart={handleStart} user={user} />}
      {page==="quiz"      && quizConfig && (
        <QuizPage
          key={`${quizConfig.category}-${quizConfig.difficulty}-${Date.now()}`}
          category={quizConfig.category}
          difficulty={quizConfig.difficulty}
          onComplete={handleComplete}
        />
      )}
      {page==="result"    && resultData && (
        <ResultPage data={resultData} onHome={handleHome} onDashboard={() => setPage("dashboard")} onRetry={handleRetry} />
      )}
      {page==="dashboard" && <DashboardPage onHome={handleHome} />}
    </>
  );
}