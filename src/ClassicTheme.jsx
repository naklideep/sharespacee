import { createGlobalStyle } from "styled-components";

/*
  ShareSpace — "Old Library" theme
  Palette: Oxford navy #14213d · Brass #b08d3c · Ivory #fbfaf6 · Claret #7a1f2b · Ink #1d2433
  Type: Cormorant Garamond (display) + Libre Franklin (UI)
  Drop-in: all existing classNames in App.jsx are styled here, no JSX changes needed.
*/

const ClassicTheme = createGlobalStyle`
  @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Libre+Franklin:wght@400;500;600&display=swap");

  :root {
    --navy: #14213d;
    --navy-2: #1d2f55;
    --brass: #b08d3c;
    --brass-soft: #e9dcb8;
    --ivory: #fbfaf6;
    --paper: #ffffff;
    --claret: #7a1f2b;
    --ink: #1d2433;
    --muted: #5d6578;
    --rule: #d9d4c4;
    --serif: "Cormorant Garamond", Georgia, serif;
    --sans: "Libre Franklin", system-ui, sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--ivory); color: var(--ink);
    font-family: var(--sans); font-size: 16px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; color: inherit; }
  button { cursor: pointer; }
  img { max-width: 100%; display: block; }
  :focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }
  h1, h2, h3 { font-family: var(--serif); color: var(--navy); font-weight: 600; margin: 0; line-height: 1.05; }
  p { margin: 0; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }

  .app-shell { min-height: 100vh; }
  .serif-text { font-style: italic; color: var(--claret); }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--serif); font-style: italic; font-size: 1.05rem;
    color: var(--brass); margin-bottom: 14px; letter-spacing: .01em;
  }
  .status-dot { width: 7px; height: 7px; background: var(--brass); transform: rotate(45deg); }

  /* Announcement */
  .announcement {
    background: var(--navy); color: var(--brass-soft);
    display: flex; justify-content: center; align-items: center; gap: 10px;
    padding: 9px 16px; font-size: .82rem; letter-spacing: .02em;
  }
  .announcement a { color: #fff; border-bottom: 1px solid var(--brass); }

  /* Navbar */
  .navbar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    padding: 16px clamp(18px, 5vw, 64px);
    background: rgba(251,250,246,.94); backdrop-filter: blur(8px);
    border-bottom: 3px double var(--rule);
  }
  .brand { display: flex; align-items: center; gap: 12px; font-family: var(--serif); font-size: 1.75rem; font-weight: 700; color: var(--navy); }
  .brand-light { font-style: italic; font-weight: 500; color: var(--brass); }
  .brand-mark { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; width: 26px; height: 26px; padding: 3px; border: 1.5px solid var(--navy); }
  .brand-mark span { background: var(--navy); }
  .brand-mark span:nth-child(2), .brand-mark span:nth-child(3) { background: var(--brass); }

  .nav-links { display: flex; gap: 34px; font-size: .92rem; font-weight: 500; }
  .nav-links a { position: relative; padding: 4px 0; color: var(--muted); transition: color .2s; }
  .nav-links a:hover, .nav-links a.nav-active { color: var(--navy); }
  .nav-links a::after { content: ""; position: absolute; left: 0; bottom: -2px; height: 1.5px; width: 0; background: var(--brass); transition: width .25s; }
  .nav-links a:hover::after, .nav-links a.nav-active::after { width: 100%; }
  .nav-actions { display: flex; align-items: center; gap: 12px; }

  .icon-button {
    position: relative; display: grid; place-items: center; width: 42px; height: 42px;
    background: transparent; border: 1px solid var(--rule); border-radius: 2px; color: var(--navy); transition: .2s;
  }
  .icon-button:hover { border-color: var(--navy); }
  .favorite-active { background: var(--claret); border-color: var(--claret); color: #fff; }
  .favorite-count {
    position: absolute; top: -7px; right: -7px; min-width: 18px; height: 18px; padding: 0 4px;
    display: grid; place-items: center; background: var(--brass); color: var(--navy);
    font-size: .68rem; font-weight: 600; border-radius: 9px;
  }
  .mobile-menu-button { display: none; }

  .auth-nav-user { display: flex; align-items: center; gap: 10px; }
  .auth-user-avatar, .owner-avatar {
    display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
    background: var(--navy); color: var(--brass-soft); border: 1.5px solid var(--brass);
    font-family: var(--serif); font-weight: 700; font-size: .95rem;
  }
  .auth-user-name { font-family: var(--serif); font-size: 1.1rem; font-weight: 600; color: var(--navy); }

  /* Buttons */
  .button {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 22px; border-radius: 2px; border: 1px solid transparent;
    font-size: .9rem; font-weight: 500; letter-spacing: .02em; transition: .2s;
  }
  .button:disabled { opacity: .5; cursor: not-allowed; }
  .button-dark { background: var(--navy); color: #fff; }
  .button-dark:hover { background: var(--navy-2); }
  .button-green { background: var(--navy); color: #fff; box-shadow: 4px 4px 0 var(--brass); }
  .button-green:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 6px 6px 0 var(--brass); }
  .button-outline { background: transparent; border-color: var(--navy); color: var(--navy); }
  .button-outline:hover { background: var(--navy); color: #fff; }
  .button-light { background: var(--ivory); color: var(--navy); box-shadow: 4px 4px 0 var(--brass); }
  .button-light:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0 var(--brass); }
  .auth-logout, .auth-login-button { padding: 9px 16px; }

  /* Hero */
  .hero {
    display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(32px, 6vw, 88px); align-items: center;
    max-width: 1280px; margin: 0 auto; padding: clamp(40px, 7vw, 96px) clamp(18px, 5vw, 64px);
  }
  .hero h1 { font-size: clamp(3.2rem, 7.5vw, 6.2rem); font-weight: 600; letter-spacing: -.015em; margin-bottom: 26px; }
  .hero-description { font-size: 1.12rem; color: var(--muted); max-width: 46ch; margin-bottom: 34px; }
  .hero-actions { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; margin-bottom: 44px; }
  .text-link { font-weight: 500; color: var(--navy); border-bottom: 1px solid var(--brass); padding-bottom: 2px; }
  .hero-proof { display: flex; align-items: center; gap: 16px; padding-top: 24px; border-top: 1px solid var(--rule); max-width: 440px; }
  .avatar-stack { display: flex; }
  .proof-avatar {
    display: grid; place-items: center; width: 38px; height: 38px; margin-left: -10px; border-radius: 50%;
    border: 2px solid var(--ivory); font-family: var(--serif); font-weight: 700; color: #fff;
  }
  .proof-avatar:first-child { margin-left: 0; }
  .avatar-one { background: var(--navy); } .avatar-two { background: var(--claret); }
  .avatar-three { background: var(--brass); } .avatar-four { background: var(--navy-2); }
  .proof-copy { display: flex; flex-direction: column; font-size: .88rem; color: var(--muted); }
  .proof-copy strong { font-family: var(--serif); font-size: 1.15rem; color: var(--navy); }

  .hero-visual { position: relative; padding: 14px; }
  .hero-visual::before { content: ""; position: absolute; inset: 0; border: 1px solid var(--brass); translate: 14px 14px; }
  .hero-image-main { position: relative; aspect-ratio: 4/5; overflow: hidden; background: var(--navy); border: 8px solid var(--paper); box-shadow: 0 0 0 1px var(--rule); }
  .hero-image-main img { width: 100%; height: 100%; object-fit: cover; filter: sepia(.18) saturate(.9); }
  .image-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(20,33,61,.88), transparent 55%); }
  .hero-image-caption { position: absolute; left: 24px; right: 24px; bottom: 24px; color: #fff; }
  .caption-label { display: block; font-family: var(--serif); font-style: italic; color: var(--brass-soft); font-size: 1rem; margin-bottom: 6px; }
  .hero-image-caption strong { font-family: var(--serif); font-size: 1.7rem; font-weight: 600; line-height: 1.15; }
  .floating-note {
    position: absolute; top: 20px; left: -14px; display: flex; gap: 12px; align-items: center;
    padding: 12px 16px; background: var(--ivory); border-left: 3px solid var(--brass); box-shadow: 0 8px 24px rgba(20,33,61,.18);
  }
  .floating-note-icon { color: var(--brass); display: grid; }
  .floating-note strong { display: block; font-family: var(--serif); font-size: 1.05rem; color: var(--navy); line-height: 1.1; }
  .floating-note small { color: var(--muted); font-size: .76rem; }
  .hero-sticker {
    position: absolute; right: -6px; bottom: 40px; display: grid; place-items: center; gap: 0;
    width: 104px; height: 104px; border-radius: 50%; background: var(--claret); color: var(--brass-soft);
    border: 2px dashed var(--brass-soft); outline: 4px solid var(--claret); rotate: 8deg;
    font-family: var(--serif); font-weight: 700; font-size: .9rem; letter-spacing: .12em; text-align: center; line-height: 1.1; padding: 18px 0;
  }

  /* Stats strip */
  .stats-strip {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px 40px;
    max-width: 1280px; margin: 0 auto; padding: 22px clamp(18px, 5vw, 64px);
    border-top: 1px solid var(--navy); border-bottom: 1px solid var(--navy);
  }
  .stat-item { display: flex; align-items: baseline; gap: 12px; }
  .stat-number { font-family: var(--serif); font-size: 2rem; font-weight: 600; color: var(--brass); }
  .stat-number span { color: var(--navy); }
  .stat-label { font-family: var(--serif); font-size: 1.25rem; color: var(--navy); }
  .stats-note { display: flex; align-items: center; gap: 10px; font-style: italic; color: var(--muted); font-size: .9rem; }
  .stats-note-dot { width: 7px; height: 7px; background: var(--claret); transform: rotate(45deg); }

  /* Explore */
  .explore-section { max-width: 1280px; margin: 0 auto; padding: clamp(56px, 8vw, 104px) clamp(18px, 5vw, 64px); }
  .section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 40px; }
  .section-heading h2, .how-heading h2, .share-banner h2 { font-size: clamp(2.3rem, 5vw, 3.8rem); margin-bottom: 10px; }
  .section-heading p, .how-heading p { color: var(--muted); }

  .search-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .search-box {
    flex: 1; min-width: 240px; display: flex; align-items: center; gap: 12px; padding: 0 16px;
    background: var(--paper); border: 1px solid var(--navy); color: var(--muted);
  }
  .search-box:focus-within { box-shadow: 4px 4px 0 var(--brass); }
  .search-box input { flex: 1; border: 0; outline: 0; background: transparent; padding: 14px 0; color: var(--ink); }
  .clear-search { display: grid; place-items: center; border: 0; background: transparent; color: var(--muted); }
  .filter-button {
    display: inline-flex; align-items: center; gap: 8px; padding: 0 20px; background: transparent;
    border: 1px solid var(--navy); color: var(--navy); font-weight: 500; transition: .2s;
  }
  .filter-active, .filter-button:hover { background: var(--navy); color: #fff; }

  .category-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px; }
  .category-pill {
    display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: transparent;
    border: 1px solid var(--rule); border-radius: 999px; font-size: .86rem; color: var(--muted); transition: .2s;
  }
  .category-pill:hover { border-color: var(--navy); color: var(--navy); }
  .category-selected { background: var(--navy); border-color: var(--navy); color: var(--brass-soft); }
  .category-selected:hover { color: var(--brass-soft); }

  .results-label {
    display: flex; justify-content: space-between; padding-bottom: 12px; margin-bottom: 28px;
    border-bottom: 3px double var(--rule); font-family: var(--serif); font-style: italic; font-size: 1.1rem; color: var(--muted);
  }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;
    padding: 72px 24px; border: 1px dashed var(--brass); background: var(--paper); color: var(--brass);
  }
  .empty-state h3 { font-size: 2rem; }
  .empty-state p { color: var(--muted); max-width: 44ch; margin-bottom: 8px; }

  .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 28px; }
  .resource-card {
    position: relative; display: flex; flex-direction: column; background: var(--paper);
    border: 1px solid var(--rule); padding: 10px; transition: transform .25s, box-shadow .25s, border-color .25s;
  }
  .resource-card:hover { transform: translateY(-4px); border-color: var(--brass); box-shadow: 0 14px 30px rgba(20,33,61,.12); }
  .card-favorite {
    position: absolute; top: 20px; right: 20px; z-index: 2; display: grid; place-items: center;
    width: 36px; height: 36px; border-radius: 50%; border: 0; background: rgba(251,250,246,.95); color: var(--navy);
  }
  .is-favorite { background: var(--claret); color: #fff; }
  .resource-image { position: relative; display: block; width: 100%; padding: 0; border: 0; aspect-ratio: 4/3; overflow: hidden; }
  .resource-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
  .resource-card:hover .resource-image img { transform: scale(1.05); }
  .available-badge {
    position: absolute; left: 10px; bottom: 10px; display: inline-flex; align-items: center; gap: 7px;
    padding: 4px 10px; background: var(--ivory); color: var(--navy); font-size: .74rem; font-weight: 500;
  }
  .available-badge span { width: 7px; height: 7px; border-radius: 50%; background: #2f7a4b; }
  .image-arrow {
    position: absolute; right: 10px; bottom: 10px; display: grid; place-items: center; width: 36px; height: 36px;
    background: var(--navy); color: var(--brass-soft); opacity: 0; transform: translateY(6px); transition: .25s;
  }
  .resource-card:hover .image-arrow { opacity: 1; transform: none; }
  .resource-info { display: flex; flex-direction: column; gap: 6px; padding: 16px 8px 8px; flex: 1; }
  .resource-meta { font-family: var(--serif); font-style: italic; color: var(--brass); font-size: 1rem; }
  .resource-title { padding: 0; border: 0; background: none; text-align: left; font-family: var(--serif); font-size: 1.6rem; font-weight: 600; line-height: 1.1; color: var(--navy); }
  .resource-title:hover { color: var(--claret); }
  .resource-location { display: flex; align-items: center; gap: 6px; font-size: .84rem; color: var(--muted); }
  .resource-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--rule); }
  .owner-info { display: flex; align-items: center; gap: 8px; font-size: .84rem; color: var(--muted); }
  .owner-info .owner-avatar { width: 28px; height: 28px; font-size: .8rem; }
  .resource-price strong { font-family: var(--serif); font-size: 1.5rem; color: var(--navy); }
  .resource-price span { font-size: .78rem; color: var(--muted); margin-left: 4px; }

  /* How it works */
  .how-section { background: var(--navy); color: #fff; padding: clamp(56px, 8vw, 104px) clamp(18px, 5vw, 64px); }
  .how-heading { max-width: 1280px; margin: 0 auto 48px; }
  .how-heading h2 { color: #fff; }
  .how-heading .serif-text { color: var(--brass); }
  .how-heading p { color: #b9c0d3; }
  .steps-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
  .step-card { position: relative; padding: 32px 28px; border: 1px solid rgba(233,220,184,.3); outline: 1px solid rgba(233,220,184,.15); outline-offset: 5px; }
  .step-number { display: block; font-family: var(--serif); font-style: italic; color: var(--brass); font-size: 1.05rem; margin-bottom: 20px; }
  .step-icon { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 20px; border: 1px solid var(--brass); color: var(--brass-soft); border-radius: 50%; }
  .step-card h3 { color: #fff; font-size: 1.9rem; margin-bottom: 10px; }
  .step-card p { color: #b9c0d3; font-size: .95rem; }

  /* Banner */
  .share-banner {
    position: relative; overflow: hidden; max-width: 1280px; margin: clamp(48px, 7vw, 88px) auto;
    width: calc(100% - 2 * clamp(18px, 5vw, 64px)); padding: clamp(32px, 5vw, 64px);
    display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
    background: var(--claret); color: #fff; outline: 1px solid var(--brass); outline-offset: -12px;
  }
  .share-banner h2 { color: #fff; }
  .share-banner .serif-text { color: var(--brass-soft); }
  .share-banner .eyebrow { color: var(--brass-soft); }
  .share-banner p { color: #ecd6d9; max-width: 48ch; }
  .banner-decoration { position: absolute; right: 24px; top: -30px; font-size: 9rem; color: rgba(233,220,184,.12); pointer-events: none; }
  .share-banner > * { position: relative; }

  /* Footer */
  .footer { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; border-top: 3px double var(--rule); text-align: center; }
  .footer p { font-family: var(--serif); font-style: italic; font-size: 1.3rem; color: var(--navy); }
  .footer-copy { font-size: .8rem; color: var(--muted); }

  /* Modals */
  .modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 20px; background: rgba(20,33,61,.72); backdrop-filter: blur(3px); overflow-y: auto; animation: ssFade .2s ease; }
  .item-modal {
    position: relative; width: min(560px, 100%); max-height: 92vh; overflow-y: auto; background: var(--ivory);
    border: 1px solid var(--brass); outline: 1px solid var(--brass-soft); outline-offset: 5px; animation: ssRise .25s ease;
  }
  @keyframes ssFade { from { opacity: 0; } }
  @keyframes ssRise { from { opacity: 0; transform: translateY(14px); } }
  .modal-close { position: absolute; top: 14px; right: 14px; z-index: 3; display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 50%; background: var(--ivory); color: var(--navy); }
  .modal-close:hover { background: var(--navy); color: #fff; }
  .modal-image { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
  .modal-body, .auth-modal-content { display: flex; flex-direction: column; gap: 14px; padding: 28px 32px 32px; }
  .modal-body h2, .auth-modal-content h2 { font-size: 2.6rem; }
  .modal-body > p, .auth-modal-content > p { color: var(--muted); }
  .modal-location { display: flex; align-items: center; gap: 6px; font-size: .9rem; }
  .modal-owner { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-block: 1px solid var(--rule); }
  .modal-owner strong { display: block; font-family: var(--serif); font-size: 1.2rem; color: var(--navy); line-height: 1.1; }
  .modal-owner span:not(.owner-avatar) { font-size: .8rem; color: var(--muted); }
  .modal-price strong { font-family: var(--serif); font-size: 2.4rem; color: var(--navy); }
  .modal-price span { margin-left: 8px; color: var(--muted); }
  .booking-message { padding: 12px 14px; background: var(--brass-soft); border-left: 3px solid var(--brass); font-size: .88rem; color: var(--navy) !important; }
  .modal-book { width: 100%; }

  .auth-heading-icon { display: grid; place-items: center; width: 52px; height: 52px; border: 1px solid var(--brass); border-radius: 50%; color: var(--brass); }
  .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--navy); }
  .auth-tab { padding: 10px; border: 0; background: transparent; font-weight: 500; color: var(--navy); }
  .auth-tab.active { background: var(--navy); color: var(--brass-soft); }
  .auth-form { display: flex; flex-direction: column; gap: 16px; }
  .auth-form label { display: flex; flex-direction: column; gap: 6px; font-size: .82rem; font-weight: 500; color: var(--navy); }
  .auth-form input, .auth-form select, .auth-form textarea {
    padding: 11px 12px; background: var(--paper); border: 1px solid var(--rule); border-radius: 0; font-weight: 400; transition: .2s;
  }
  .auth-form input:focus, .auth-form select:focus, .auth-form textarea:focus { outline: 0; border-color: var(--navy); box-shadow: 3px 3px 0 var(--brass); }
  .auth-error { padding: 10px 12px; background: #f6e3e5; border-left: 3px solid var(--claret); color: var(--claret) !important; font-size: .86rem; }
  .auth-success { padding: 10px 12px; background: #e3f0e8; border-left: 3px solid #2f7a4b; color: #1f5a37 !important; font-size: .86rem; }
  .auth-submit { width: 100%; margin-top: 4px; }
  .auth-switch-copy { text-align: center; font-size: .88rem; }
  .auth-switch-copy button { border: 0; background: none; color: var(--claret); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }

  /* Responsive */
  @media (max-width: 960px) {
    .hero { grid-template-columns: 1fr; }
    .hero-visual { max-width: 520px; margin-inline: 0 auto; }
    .mobile-menu-button { display: grid; }
    .nav-links {
      display: none; position: absolute; top: 100%; left: 0; right: 0; flex-direction: column; gap: 0;
      background: var(--ivory); border-bottom: 3px double var(--rule); padding: 8px clamp(18px, 5vw, 64px) 16px;
    }
    .nav-links.nav-open { display: flex; }
    .nav-links a { padding: 12px 0; border-bottom: 1px solid var(--rule); }
    .auth-user-name, .nav-cta { display: none; }
  }
  @media (max-width: 560px) {
    .desktop-break { display: none; }
    .modal-body, .auth-modal-content { padding: 24px 20px 24px; }
    .hero-sticker { width: 88px; height: 88px; right: 0; }
  }
    
/* =========================================
   SHARESPACE MESSENGER — OLD LIBRARY
========================================= */

.messenger-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(20, 33, 61, .76);
  backdrop-filter: blur(5px);
}

.messenger-window {
  width: min(1120px, 100%);
  height: min(760px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ivory);
  border: 1px solid var(--brass);
  outline: 1px solid var(--brass-soft);
  outline-offset: 4px;
  box-shadow: 0 25px 80px rgba(0,0,0,.25);
}

.messenger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 17px 22px;
  background: var(--navy);
  color: white;
  border-bottom: 2px solid var(--brass);
}

.messenger-brand,
.messenger-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.messenger-brand-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: var(--brass-soft);
  border: 1px solid var(--brass);
}

.messenger-brand h2 {
  color: white;
  font-size: 27px;
}

.messenger-brand p {
  color: #c5ccda;
  font-size: 11px;
}

.messenger-close,
.messenger-back {
  display: grid;
  place-items: center;
  border: 1px solid rgba(233,220,184,.35);
  background: transparent;
  color: var(--brass-soft);
  width: 38px;
  height: 38px;
}

.messenger-close:hover {
  background: var(--claret);
  color: white;
}

.messenger-connection {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: #d7d9df;
}

.messenger-connection > span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d39b55;
}

.messenger-connection.connected > span {
  background: #79c18b;
}

.messenger-connection.disconnected > span {
  background: #c66d65;
}

.messenger-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
}

.messenger-sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f4f0e6;
  border-right: 1px solid var(--rule);
}

.messenger-sidebar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 23px 20px 17px;
  border-bottom: 1px solid var(--rule);
}

.messenger-eyebrow {
  display: block;
  font-family: var(--serif);
  font-style: italic;
  color: var(--brass);
  font-size: 13px;
  letter-spacing: .04em;
}

.messenger-sidebar-heading h3 {
  margin-top: 3px;
  font-size: 27px;
}

.messenger-total-unread,
.messenger-unread {
  display: grid;
  place-items: center;
  min-width: 21px;
  height: 21px;
  padding: 0 6px;
  border-radius: 50px;
  background: var(--claret);
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.messenger-conversation-list {
  flex: 1;
  overflow-y: auto;
}

.messenger-conversation {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px;
  border: 0;
  border-bottom: 1px solid #e5dece;
  background: transparent;
  text-align: left;
  transition: background .2s;
}

.messenger-conversation:hover {
  background: #ebe5d7;
}

.messenger-conversation.selected {
  background: white;
  box-shadow: inset 3px 0 var(--brass);
}

.messenger-avatar {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid var(--brass);
  border-radius: 50%;
  background: var(--navy);
  color: var(--brass-soft);
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 700;
}

.messenger-avatar.large {
  width: 43px;
  height: 43px;
}

.messenger-conversation-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.messenger-conversation-copy strong {
  color: var(--navy);
  font-size: 13px;
}

.messenger-resource-name {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8b713f;
  font-size: 11px;
}

.messenger-preview {
  overflow: hidden;
  color: var(--muted);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 190px;
}

.messenger-conversation-meta {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 7px;
}

.messenger-conversation-meta small {
  color: #898477;
  font-size: 10px;
}

.messenger-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px;
  border: 0;
  border-top: 1px solid var(--rule);
  background: #eee8d9;
  color: var(--navy);
  font-size: 12px;
}

.messenger-refresh:hover {
  background: var(--brass-soft);
}

.messenger-refresh:disabled {
  opacity: .6;
  cursor: wait;
}

.messenger-chat {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(rgba(251,250,246,.94), rgba(251,250,246,.94)),
    repeating-linear-gradient(0deg, transparent, transparent 35px, #ded8ca 36px);
}

.messenger-chat-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--rule);
  background: #fffdf8;
}

.messenger-chat-person {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.messenger-chat-person strong {
  color: var(--navy);
  font-size: 14px;
}

.messenger-chat-person span {
  color: var(--muted);
  font-size: 11px;
}

.messenger-back {
  display: none;
  color: var(--navy);
  border-color: var(--rule);
}

.messenger-booking-context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f1ecdf;
  border-bottom: 1px solid var(--rule);
  color: var(--muted);
  font-size: 11px;
}

.messenger-approved {
  margin-left: auto;
  padding: 3px 8px;
  background: #e4eee3;
  color: #285a39;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.messenger-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 22px clamp(14px, 4vw, 40px);
}

.messenger-message {
  display: flex;
  width: 100%;
}

.messenger-message.own {
  justify-content: flex-end;
}

.messenger-message.received {
  justify-content: flex-start;
}

.messenger-message-bubble {
  max-width: min(75%, 470px);
  padding: 11px 14px 8px;
  border: 1px solid var(--rule);
  background: white;
  box-shadow: 2px 3px 0 rgba(20,33,61,.04);
}

.messenger-message.own .messenger-message-bubble {
  background: var(--navy);
  border-color: var(--navy);
  color: white;
}

.messenger-message-bubble p {
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.messenger-message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
  color: #8a867b;
  font-size: 10px;
}

.messenger-message.own .messenger-message-meta {
  color: #c6ccda;
}

.messenger-message-meta .message-read {
  color: #8ed2a0;
}

.messenger-composer {
  display: flex;
  gap: 10px;
  padding: 13px 18px;
  background: white;
  border-top: 1px solid var(--rule);
}

.messenger-composer input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--rule);
  background: var(--ivory);
  outline: none;
  font-size: 13px;
}

.messenger-composer input:focus {
  border-color: var(--navy);
  box-shadow: 3px 3px 0 var(--brass-soft);
}

.messenger-composer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 19px;
  border: 1px solid var(--navy);
  background: var(--navy);
  color: white;
  font-size: 12px;
}

.messenger-composer button:hover:not(:disabled) {
  background: var(--claret);
  border-color: var(--claret);
}

.messenger-composer button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.messenger-footnote {
  padding: 0 18px 10px;
  background: white;
  color: #898477;
  text-align: center;
  font-size: 10px;
}

.messenger-empty,
.messenger-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 25px;
  color: var(--brass);
  text-align: center;
}

.messenger-empty p {
  color: var(--navy);
  font-family: var(--serif);
  font-size: 19px;
}

.messenger-empty small {
  color: var(--muted);
  font-size: 11px;
}

.messenger-welcome-icon {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  margin-bottom: 10px;
  border: 1px solid var(--brass);
  border-radius: 50%;
  color: var(--brass);
}

.messenger-welcome h3 {
  margin: 8px 0;
  font-size: clamp(30px, 4vw, 43px);
  line-height: 1.05;
}

.messenger-welcome > p {
  max-width: 370px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

.messenger-error {
  padding: 9px 14px;
  background: #f6e3e5;
  border-left: 3px solid var(--claret);
  color: var(--claret);
  font-size: 12px;
}

.messenger-spin {
  animation: messengerSpin .9s linear infinite;
}

@keyframes messengerSpin {
  to { transform: rotate(360deg); }
}

@media (max-width: 720px) {
  .messenger-backdrop {
    padding: 0;
  }

  .messenger-window {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border: 0;
    outline: 0;
  }

  .messenger-layout {
    display: block;
    position: relative;
    overflow: hidden;
  }

  .messenger-sidebar,
  .messenger-chat {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .messenger-chat {
    display: none;
  }

  .messenger-chat.chat-active {
    display: flex;
  }

  .messenger-sidebar.has-active-chat {
    display: none;
  }

  .messenger-back {
    display: grid;
  }

  .messenger-message-bubble {
    max-width: 86%;
  }

  .messenger-header {
    padding: 13px 15px;
  }

  .messenger-brand h2 {
    font-size: 23px;
  }
}

@media (max-width: 420px) {
  .messenger-connection {
    font-size: 0;
  }

  .messenger-composer {
    padding: 10px;
  }

  .messenger-composer button {
    padding: 0 12px;
  }

  .messenger-composer button span {
    display: none;
  }
}

`;

export default ClassicTheme;