#!/usr/bin/env npx tsx
/**
 * 기존 MDX 포스트에 쉬운 버전(easyBody) 자동 생성 스크립트
 * 사용법: npx tsx scripts/generate-easy.ts [slug]
 *   slug 없으면 easyBody가 없는 모든 포스트 일괄 처리
 *
 * 필요한 환경변수:
 *   ANTHROPIC_API_KEY — Claude API 키
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const [, , targetSlug] = process.argv;

async function generateEasyBody(title: string, content: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('  ⚠️  ANTHROPIC_API_KEY 없음 — 건너뜀');
    return null;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `아래 생명과학 논문 해설을 '쉬운 버전'으로 다시 써줘.

조건:
- AI 느낌 전혀 없이, 친한 친구가 설명해주는 것처럼 자연스럽게
- "~입니다" 대신 "~거예요", "~이에요", "~죠" 같은 친근한 말투
- 어려운 용어는 일상적인 비유로 설명 (예: "세포 분열" → "세포가 복사기처럼 자기 복사본을 만드는 과정")
- 독자한테 말 거는 듯한 자연스러운 흐름 ("궁금하죠?", "신기하지 않아요?" 같은 표현 OK)
- 섹션 구조는 유지하되 제목도 쉽고 재밌게 변경
- 마크다운 형식 유지 (##, **, - 등)
- 분량: 원본의 70~80% 수준

논문 제목: ${title}

원본 내용:
${content.slice(0, 3000)}`,
      }],
    }),
  });

  if (!res.ok) {
    console.warn(`  ⚠️  Claude API 오류: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}

function addEasyBodyToMdx(filePath: string, easyBody: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);

  // 이미 있으면 덮어쓰기
  parsed.data.easyBody = easyBody;

  // gray-matter stringify: 프론트매터 재구성
  const newRaw = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, newRaw, 'utf-8');
}

async function processFile(file: string) {
  const filePath = path.join(POSTS_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  if (data.easyBody) {
    console.log(`  ⏭️  건너뜀 (이미 있음): ${file}`);
    return;
  }

  console.log(`  🤖 생성 중: ${file}`);
  const easyBody = await generateEasyBody(data.title ?? '', content);
  if (!easyBody) return;

  addEasyBodyToMdx(filePath, easyBody);
  console.log(`  ✅ 완료: ${file}`);
}

async function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('content/posts 디렉토리 없음');
    process.exit(1);
  }

  if (targetSlug) {
    const file = `${targetSlug}.mdx`;
    const filePath = path.join(POSTS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`파일 없음: ${file}`);
      process.exit(1);
    }
    await processFile(file);
  } else {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'));
    console.log(`📚 총 ${files.length}개 포스트 처리 시작...\n`);
    for (const file of files) {
      await processFile(file);
    }
    console.log('\n🎉 완료!');
  }
}

main().catch((e) => { console.error('오류:', e.message); process.exit(1); });
