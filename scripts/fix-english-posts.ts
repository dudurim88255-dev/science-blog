#!/usr/bin/env npx tsx
/**
 * 영문 포스트를 한국어로 일괄 변환하는 스크립트
 * 실행: ANTHROPIC_API_KEY=... npx tsx scripts/fix-english-posts.ts
 */
import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

async function callClaude(prompt: string, maxTokens = 200): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 없음');

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.warn(`  API 오류 ${res.status}, 재시도...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      const data: any = await res.json();
      return data.content?.[0]?.text?.trim() ?? null;
    } catch (e: any) {
      console.warn(`  요청 실패: ${e.message}, 재시도...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

function extractFrontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

function extractAbstractFromBody(text: string): string {
  // frontmatter 이후 본문에서 cite-box 이전 텍스트 추출
  const afterFm = text.replace(/^---[\s\S]*?---\n/, '');
  const beforeCite = afterFm.split('<div className="cite-box">')[0];
  // ## 헤딩 이후 텍스트
  const cleaned = beforeCite.replace(/^##.*$/gm, '').replace(/<[^>]+>/g, '').trim();
  return cleaned.slice(0, 800);
}

async function convertPost(filePath: string): Promise<boolean> {
  const text = fs.readFileSync(filePath, 'utf-8');
  const fm = extractFrontmatter(text);
  const englishTitle = fm.title || '';
  const doi = fm.paperDOI || '';
  const journal = fm.journal || '';
  const category = fm.category || '';
  const date = fm.date || '';
  const slug = fm.slug || path.basename(filePath, '.mdx');

  // 본문에서 abstract 추출
  const abstract = extractAbstractFromBody(text);

  console.log(`  제목: ${englishTitle.slice(0, 50)}...`);
  console.log(`  DOI: ${doi}`);

  // 한국어 생성 (순차 실행 - rate limit 방지)
  const koreanTitle = await callClaude(
    `생명과학 논문 제목을 한국어로 번역. 블로그 독자가 흥미를 느낄 자연스러운 표현으로. 20~40자. 제목만 출력.\n\n영문: ${englishTitle}\n초록: ${abstract.slice(0, 200)}`,
    100,
  );
  if (!koreanTitle || !/[가-힣]/.test(koreanTitle)) {
    console.warn('  ❌ 한국어 제목 생성 실패, 건너뜀');
    return false;
  }

  const koreanSummary = await callClaude(
    `다음 논문 초록을 한국어로 1~2문장 요약. 쉽게. 요약문만 출력.\n\n${abstract.slice(0, 600)}`,
    200,
  );

  const body = await callClaude(
    `다음 생명과학 논문을 한국어 블로그 포스트로 작성. MDX 본문만 (프론트매터 제외).

논문: ${englishTitle}
저널: ${journal}
초록: ${abstract}

형식:
## 왜 중요한가?
(2~3문단, 고등학생도 이해 가능, 전문용어 괄호 설명)

## 연구 방법
(간략히 1~2문단)

## 핵심 발견
- bullet 3~5개

## 우리 삶에 미치는 영향
(2~3문장)

<div className="highlight-box">핵심 한 줄 요약</div>`,
    2000,
  );

  if (!body || !/[가-힣]/.test(body)) {
    console.warn('  ❌ 한국어 본문 생성 실패, 건너뜀');
    return false;
  }

  // cite-box 원문 보존
  const citeMatch = text.match(/<div className="cite-box">[\s\S]*?<\/div>/);
  const citeBox = citeMatch ? citeMatch[0] : `<div className="cite-box">
  📄 원문: "${englishTitle}", *${journal}*. DOI: ${doi}
</div>`;

  const summaryClean = (koreanSummary ?? '').replace(/"/g, "'");

  const newMdx = `---
title: "${koreanTitle}"
slug: "${slug}"
date: "${date}"
category: "${category}"
tags: []
summary: "${summaryClean}"
paperDOI: "${doi}"
journal: "${journal}"
difficulty: "입문"
coverImage: ""
---

${body}

${citeBox}
`;

  fs.writeFileSync(filePath, newMdx, 'utf-8');
  return true;
}

async function main() {
  console.log('🔄 영문 포스트 한국어 변환 시작...\n');

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'));
  const englishFiles: string[] = [];

  for (const f of files) {
    const text = fs.readFileSync(path.join(POSTS_DIR, f), 'utf-8');
    const fm = extractFrontmatter(text);
    const title = fm.title || '';
    if (!/[가-힣]/.test(title)) {
      englishFiles.push(f);
    }
  }

  console.log(`📄 영문 포스트 ${englishFiles.length}개 발견\n`);

  let success = 0;
  let fail = 0;

  for (let i = 0; i < englishFiles.length; i++) {
    const f = englishFiles[i];
    console.log(`[${i + 1}/${englishFiles.length}] ${f}`);
    try {
      const ok = await convertPost(path.join(POSTS_DIR, f));
      if (ok) {
        console.log('  ✅ 변환 완료\n');
        success++;
      } else {
        fail++;
      }
    } catch (e: any) {
      console.error(`  ❌ 오류: ${e.message}\n`);
      fail++;
    }
    // rate limit 방지: 각 파일 처리 후 1초 대기
    if (i < englishFiles.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 완료: 성공 ${success}개, 실패 ${fail}개`);
}

main().catch(e => { console.error('오류:', e.message); process.exit(1); });
