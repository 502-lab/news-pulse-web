#!/usr/bin/env node
/**
 * 002 레이아웃 & 네비게이션 셸 — S-01~S-08 자동 검증
 * 실행: node scripts/verify-002.mjs
 * 전제: pnpm dev가 http://localhost:5173 에서 실행 중
 */

import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:5173';
const MOCK_PATH = new URL('../src/store/auth.mock.ts', import.meta.url).pathname;

const originalMock = readFileSync(MOCK_PATH, 'utf-8');
const results = [];

function pass(id, label) {
  results.push({ id, label, ok: true });
  console.log(`${id} · ${label}  ✅ PASS`);
}

function fail(id, label, reason) {
  results.push({ id, label, ok: false, reason });
  console.log(`${id} · ${label}  ❌ FAIL\n   └─ ${reason}`);
}

async function writeMock(content) {
  writeFileSync(MOCK_PATH, content, 'utf-8');
  await sleep(2800); // Vite 재컴파일 대기
}

// client-side navigation helper: click link by label text inside aside
async function clickNavItem(page, label) {
  await page.evaluate((lbl) => {
    const links = Array.from(document.querySelectorAll('aside nav a'));
    const link = links.find((l) => l.textContent?.includes(lbl));
    if (!link) throw new Error(`nav link not found: ${lbl}`);
    link.click();
  }, label);
}

async function waitForPath(page, path, timeout = 4000) {
  await page.waitForFunction(
    (p) => window.location.pathname === p,
    { timeout },
    path,
  );
}

let browser;
let page;

try {
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // ─── S-01: 기본 레이아웃 ─────────────────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 10000 });

    const sidebar = await page.$('aside');
    if (!sidebar) throw new Error('aside 요소 없음');

    const sidebarClass = await sidebar.evaluate((el) => el.className);
    if (!sidebarClass.includes('w-[240px]'))
      throw new Error(`Sidebar w-[240px] 클래스 없음 (got: ${sidebarClass})`);

    const sidebarText = await sidebar.evaluate((el) => el.textContent ?? '');
    if (!sidebarText.includes('NewsPulse'))
      throw new Error('"NewsPulse" 텍스트 없음');

    const navItems = await page.$$eval('aside nav a', (links) =>
      links.map((l) => ({ text: l.textContent?.trim() ?? '', cls: l.className })),
    );
    for (const label of ['대시보드', '트렌드 분석', '편향 분석']) {
      if (!navItems.some((n) => n.text.includes(label)))
        throw new Error(`nav item "${label}" 없음 (got: ${navItems.map((n) => n.text)})`);
    }

    const dashItem = navItems.find((n) => n.text.includes('대시보드'));
    if (!dashItem?.cls.includes('text-brand'))
      throw new Error(`"대시보드" 활성 스타일(text-brand) 없음 (got: ${dashItem?.cls})`);

    const mainText = await page.evaluate(() => document.querySelector('main')?.textContent ?? '');
    if (!mainText.includes('대시보드 — 003에서 구현'))
      throw new Error('"대시보드 — 003에서 구현" 텍스트 없음');

    if (!sidebarText.includes('테스트유저'))
      throw new Error('"테스트유저" 닉네임 없음');
    if (!sidebarText.includes('로그아웃'))
      throw new Error('"로그아웃" 버튼 없음');

    pass('S-01', '기본 레이아웃');
  } catch (e) {
    fail('S-01', '기본 레이아웃', e.message);
  }

  // ─── S-02: 네비게이션 이동 + 활성 스타일 ────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 10000 });

    await clickNavItem(page, '트렌드 분석');
    await waitForPath(page, '/trends');

    const afterTrend = await page.$$eval('aside nav a', (links) =>
      links.map((l) => ({ text: l.textContent?.trim() ?? '', cls: l.className })),
    );
    const trendItem = afterTrend.find((n) => n.text.includes('트렌드 분석'));
    if (!trendItem?.cls.includes('text-brand'))
      throw new Error(`"트렌드 분석" 활성 스타일 없음 (got: ${trendItem?.cls})`);

    const dashItem = afterTrend.find((n) => n.text.includes('대시보드'));
    if (dashItem?.cls.includes('text-brand'))
      throw new Error(`/trends 진입 후 "대시보드"가 여전히 활성 (end prop 미작동)`);

    await clickNavItem(page, '대시보드');
    await waitForPath(page, '/');

    const afterDash = await page.$$eval('aside nav a', (links) =>
      links.map((l) => ({ text: l.textContent?.trim() ?? '', cls: l.className })),
    );
    const dashBack = afterDash.find((n) => n.text.includes('대시보드'));
    if (!dashBack?.cls.includes('text-brand'))
      throw new Error(`"대시보드" 복귀 후 활성 스타일 없음`);

    pass('S-02', '네비게이션 이동 + 활성 스타일');
  } catch (e) {
    fail('S-02', '네비게이션 이동 + 활성 스타일', e.message);
  }

  // ─── S-03: 공개 경로 (Sidebar 없음) ──────────────────────────────────
  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0', timeout: 10000 });

    const sidebar = await page.$('aside');
    if (sidebar) throw new Error('로그인 페이지에 aside(Sidebar) 있음');

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');
    if (!bodyText.includes('로그인 — 007에서 구현'))
      throw new Error('"로그인 — 007에서 구현" 텍스트 없음');

    pass('S-03', '공개 경로 (Sidebar 없음)');
  } catch (e) {
    fail('S-03', '공개 경로 (Sidebar 없음)', e.message);
  }

  // ─── S-04: 404 페이지 ────────────────────────────────────────────────
  try {
    await page.goto(`${BASE}/존재안하는경로`, { waitUntil: 'networkidle0', timeout: 10000 });

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');
    if (!bodyText.includes('404'))
      throw new Error('"404" 텍스트 없음');
    if (!bodyText.includes('페이지를 찾을 수 없습니다'))
      throw new Error('"페이지를 찾을 수 없습니다" 텍스트 없음');

    const homeLink = await page.$('a[href="/"]');
    if (!homeLink) throw new Error('"홈으로 돌아가기" 링크(href="/") 없음');

    const sidebar = await page.$('aside');
    if (sidebar) throw new Error('404 페이지에 aside(Sidebar) 있음');

    pass('S-04', '404 페이지');
  } catch (e) {
    fail('S-04', '404 페이지', e.message);
  }

  // ─── S-05: FullPageSpinner (isLoading=true) ──────────────────────────
  try {
    const mockLoading = originalMock
      .replace(
        `user: {
    id: '1',
    nickname: '테스트유저',
    email: 'test@example.com',
    role: 'USER',
  },
  isLoading: false,`,
        `user: null,
  isLoading: true,`,
      );

    await writeMock(mockLoading);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 10000 });

    const sidebar = await page.$('aside');
    if (sidebar) throw new Error('스피너 상태에서 aside(Sidebar) 있음');

    const spinner = await page.$('.animate-spin');
    if (!spinner) throw new Error('.animate-spin 요소 없음 (FullPageSpinner 미표시)');

    pass('S-05', 'FullPageSpinner (isLoading=true)');
  } catch (e) {
    fail('S-05', 'FullPageSpinner (isLoading=true)', e.message);
  } finally {
    await writeMock(originalMock);
  }

  // ─── S-06: ADMIN 라우팅 (USER → 리다이렉트) ──────────────────────────
  try {
    await page.goto(`${BASE}/admin/monitor`, { waitUntil: 'networkidle0', timeout: 10000 });

    const url = page.url();
    if (url !== `${BASE}/`)
      throw new Error(`/ 리다이렉트 실패 (got: ${url})`);

    const mainText = await page.evaluate(() => document.querySelector('main')?.textContent ?? '');
    if (!mainText.includes('대시보드 — 003에서 구현'))
      throw new Error('DashboardPage placeholder 없음');

    pass('S-06', 'ADMIN 라우팅 (USER → 리다이렉트)');
  } catch (e) {
    fail('S-06', 'ADMIN 라우팅 (USER → 리다이렉트)', e.message);
  }

  // ─── S-07: ADMIN 라우팅 (ADMIN mock → 접근 허용) ─────────────────────
  try {
    const mockAdmin = originalMock.replace("role: 'USER',", "role: 'ADMIN',");
    await writeMock(mockAdmin);

    await page.goto(`${BASE}/admin/monitor`, { waitUntil: 'networkidle0', timeout: 10000 });

    const mainText = await page.evaluate(() => document.querySelector('main')?.textContent ?? '');
    if (!mainText.includes('시스템 모니터링 — 006에서 구현'))
      throw new Error('"시스템 모니터링 — 006에서 구현" 텍스트 없음');

    const navItems = await page.$$eval('aside nav a', (links) =>
      links.map((l) => l.textContent?.trim() ?? ''),
    );
    if (navItems.length !== 5)
      throw new Error(`nav 항목 5개 아님 (got: ${navItems.length} → [${navItems}])`);

    for (const label of ['대시보드', '트렌드 분석', '편향 분석', '시스템 모니터링', '사용자 관리']) {
      if (!navItems.some((t) => t.includes(label)))
        throw new Error(`ADMIN nav item "${label}" 없음`);
    }

    pass('S-07', 'ADMIN 라우팅 (ADMIN mock → 접근 허용)');
  } catch (e) {
    fail('S-07', 'ADMIN 라우팅 (ADMIN mock → 접근 허용)', e.message);
  } finally {
    await writeMock(originalMock);
  }

  // ─── S-08: 새로고침 시 경로 유지 ─────────────────────────────────────
  try {
    await page.goto(`${BASE}/trends`, { waitUntil: 'networkidle0', timeout: 10000 });
    await page.reload({ waitUntil: 'networkidle0', timeout: 10000 });

    const url = page.url();
    if (!url.endsWith('/trends'))
      throw new Error(`새로고침 후 /trends 아님 (got: ${url})`);

    const mainText = await page.evaluate(() => document.querySelector('main')?.textContent ?? '');
    if (!mainText.includes('트렌드 분석 — 004에서 구현'))
      throw new Error('TrendsPage placeholder 없음');

    pass('S-08', '새로고침 시 경로 유지');
  } catch (e) {
    fail('S-08', '새로고침 시 경로 유지', e.message);
  }
} finally {
  // 반드시 원복
  try {
    writeFileSync(MOCK_PATH, originalMock, 'utf-8');
  } catch (_) {}

  if (browser) await browser.close();

  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = total - passed;
  console.log('\n─────────────────────────────────────');
  console.log(`결과: ${passed}/${total} PASS  ${failed > 0 ? `(${failed} FAIL)` : ''}`);
  if (failed > 0) process.exit(1);
}
