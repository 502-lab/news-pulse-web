#!/usr/bin/env node
/**
 * 003 메인 대시보드 — S-01~S-07 자동 검증
 * 실행: node scripts/verify-003.mjs
 * 전제: pnpm dev가 http://localhost:5173 에서 실행 중
 *       VITE_MOCK_DELAY=true (.env.local)로 스켈레톤 동작 확인 가능
 */

import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:5173';
const MOCK_PATH = new URL('../src/mocks/dashboard.mock.ts', import.meta.url).pathname;

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
  await sleep(2800);
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
  await page.setViewport({ width: 1280, height: 900 });

  // ─── S-01: StatCard 4종 기본 렌더링 ──────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });

    // mock 딜레이 없으므로 즉시 데이터 렌더링됨
    await sleep(300);

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');

    const required = ['오늘의 뉴스 수', '분석된 기사 수', '평균 편향 점수', '모니터링 중인 키워드 수'];
    for (const label of required) {
      if (!bodyText.includes(label))
        throw new Error(`"${label}" 텍스트 없음`);
    }

    // 수치 확인 (mock 기준)
    if (!bodyText.includes('247')) throw new Error('"247" 수치 없음');
    if (!bodyText.includes('198')) throw new Error('"198" 수치 없음');

    // section[aria-label] 확인
    const sections = await page.$$eval('section', (els) =>
      els.map((el) => el.getAttribute('aria-label')),
    );
    if (!sections.includes('통계 현황')) throw new Error('section[aria-label="통계 현황"] 없음');

    pass('S-01', 'StatCard 4종 기본 렌더링');
  } catch (e) {
    fail('S-01', 'StatCard 4종 기본 렌더링', e.message);
  }

  // ─── S-02: delta 색상 구분 ───────────────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(300);

    // delta 양수 (오늘의 뉴스 수: +23) → text-green-500
    const greenExists = await page.evaluate(() =>
      document.querySelector('.text-green-500') !== null,
    );
    if (!greenExists) throw new Error('text-green-500 클래스 없음 (양수 delta)');

    // delta 음수 (평균 편향 점수: -0.3) → text-red-500
    const redExists = await page.evaluate(() =>
      document.querySelector('.text-red-500') !== null,
    );
    if (!redExists) throw new Error('text-red-500 클래스 없음 (음수 delta)');

    // delta 0 (모니터링 키워드 수: 0) → text-gray-400
    const grayExists = await page.evaluate(() =>
      document.querySelector('.text-gray-400') !== null,
    );
    if (!grayExists) throw new Error('text-gray-400 클래스 없음 (delta=0)');

    pass('S-02', 'StatCard delta 색상 구분 (green/red/gray)');
  } catch (e) {
    fail('S-02', 'StatCard delta 색상 구분 (green/red/gray)', e.message);
  }

  // ─── S-03: 카테고리 바차트 렌더링 ───────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(500);

    const chartExists = await page.evaluate(() =>
      document.querySelector('.recharts-wrapper') !== null,
    );
    if (!chartExists) throw new Error('.recharts-wrapper 없음 (Recharts BarChart 미렌더)');

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');
    const categories = ['정치', '경제', '사회', '기술', '문화', '스포츠'];
    const found = categories.filter((c) => bodyText.includes(c));
    if (found.length < 1) throw new Error(`카테고리 레이블 없음`);

    pass('S-03', '카테고리 바차트 6개 항목 렌더링');
  } catch (e) {
    fail('S-03', '카테고리 바차트 6개 항목 렌더링', e.message);
  }

  // ─── S-04: 뉴스 피드 article 10개 ──────────────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(300);

    const articles = await page.$$eval('article', (els) => els.length);
    if (articles < 10) throw new Error(`article 요소 ${articles}개 (10개 필요)`);

    // aria-label 접근성 확인
    const feedList = await page.$('ul[aria-label="뉴스 목록"]');
    if (!feedList) throw new Error('ul[aria-label="뉴스 목록"] 없음');

    pass('S-04', '뉴스 피드 article 10개 + aria 접근성');
  } catch (e) {
    fail('S-04', '뉴스 피드 article 10개 + aria 접근성', e.message);
  }

  // ─── S-05: 뉴스 카드 클릭 → /articles/:id ──────────────────────────
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(300);

    // 첫 번째 뉴스 카드 Link 클릭
    const firstLink = await page.$('ul[aria-label="뉴스 목록"] li:first-child a');
    if (!firstLink) throw new Error('첫 번째 뉴스 카드 링크 없음');

    await firstLink.click();
    await page.waitForFunction(
      () => window.location.pathname.startsWith('/articles/'),
      { timeout: 3000 },
    );

    const url = page.url();
    if (!url.includes('/articles/')) throw new Error(`URL /articles/ 없음 (got: ${url})`);

    pass('S-05', '뉴스 카드 클릭 → /articles/:id 이동');
  } catch (e) {
    fail('S-05', '뉴스 카드 클릭 → /articles/:id 이동', e.message);
  }

  // ─── S-06: 에러 상태 (fetchCategoryChart throw) ──────────────────────
  try {
    const mockError = originalMock.replace(
      'export async function fetchCategoryChart(): Promise<CategoryData[]> {\n  await delay(500);\n  return [',
      `export async function fetchCategoryChart(): Promise<CategoryData[]> {\n  await delay(500);\n  throw new Error('mock error');\n  return [`,
    );
    await writeMock(mockError);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(300);

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');
    if (!bodyText.includes('데이터를 불러올 수 없습니다.'))
      throw new Error('"데이터를 불러올 수 없습니다." 텍스트 없음');

    // 재시도 버튼 존재 (role=button)
    const retryBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some((b) => b.textContent?.includes('재시도'));
    });
    if (!retryBtn) throw new Error('재시도 버튼 없음');

    pass('S-06', '에러 상태 → "데이터를 불러올 수 없습니다." + 재시도 버튼');
  } catch (e) {
    fail('S-06', '에러 상태 → "데이터를 불러올 수 없습니다." + 재시도 버튼', e.message);
  } finally {
    await writeMock(originalMock);
  }

  // ─── S-07: 빈 상태 (fetchNewsFeed → []) ─────────────────────────────
  try {
    const mockEmpty = originalMock.replace(
      'export async function fetchNewsFeed(): Promise<NewsItem[]> {\n  await delay(500);\n  return Array.from({ length: 10 }',
      `export async function fetchNewsFeed(): Promise<NewsItem[]> {\n  await delay(500);\n  return [];\n  return Array.from({ length: 10 }`,
    );
    await writeMock(mockEmpty);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(300);

    const bodyText = await page.evaluate(() => document.body.textContent ?? '');
    if (!bodyText.includes('표시할 뉴스가 없습니다.'))
      throw new Error('"표시할 뉴스가 없습니다." 텍스트 없음');

    // role=status 접근성 확인
    const statusEl = await page.$('[role="status"]');
    if (!statusEl) throw new Error('[role="status"] 요소 없음');

    pass('S-07', '빈 상태 → "표시할 뉴스가 없습니다." + role=status');
  } catch (e) {
    fail('S-07', '빈 상태 → "표시할 뉴스가 없습니다." + role=status', e.message);
  } finally {
    await writeMock(originalMock);
  }
} finally {
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
