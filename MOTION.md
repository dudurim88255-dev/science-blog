# MOTION.md — 블로그 공통 모션 시스템

## 철학
움직임은 장식이 아니라 **정보 위계의 연장**이다.
사용자의 시선을 이끌고, 콘텐츠가 등장하는 이유를 설명할 때만 움직인다.

## 기술 스택 (고정)
- Framer Motion (motion/react)
- Lenis (부드러운 스크롤)
- CSS `@starting-style` + `view-transition` (페이지 전환)

## Easing 토큰 (이것만 사용)
```ts
export const ease = {
  out: [0.16, 1, 0.3, 1],       // 기본 진입 (basement 톤)
  inOut: [0.65, 0, 0.35, 1],    // 페이지 전환
  spring: [0.34, 1.56, 0.64, 1], // 과감한 등장 (제한적 사용)
  linear: [0, 0, 1, 1],          // 진행바, 로더
}
```

## Duration 토큰
- micro: 150ms (hover, focus)
- base: 320ms (요소 등장, 카드 hover)
- page: 600ms (섹션 전환, 페이지 로드)
- slow: 900ms (히어로 진입, 대형 텍스트 reveal)
- **금지**: 400~500ms 구간(어정쩡함), 1000ms 초과(지루함)

## 1. 페이지 진입 (히어로)
```tsx
// 히어로 텍스트 stagger
<motion.h1
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: ease.out }}
/>

// 서브 요소는 0.08s씩 지연
transition={{ duration: 0.9, ease: ease.out, delay: 0.08 * index }}
```
- stagger 간격: 80ms 고정
- y축 이동: 12~16px (그 이상 금지)
- blur 금지 (성능 + 촌스러움)

## 2. 스크롤 Reveal
```tsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ duration: 0.32, ease: ease.out }}
/>
```
- **once: true 필수** (반복 금지, 주의 분산됨)
- margin -10%: 뷰포트 진입 직전에 발동
- 연속된 카드는 stagger 60ms

## 3. Lenis 부드러운 스크롤
```tsx
// app/providers.tsx
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})
```
- 모바일에선 자동 비활성 (터치 방해됨)

## 4. Hover 인터랙션

### 카드
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.32, ease: ease.out }}
>
  {/* 내부 이미지는 동시에 scale */}
  <motion.img
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.32, ease: ease.out }}
  />
</motion.div>
```
- y: -4px (그 이상은 과함)
- shadow는 CSS transition으로 같이 (box-shadow 변화)
- **scale 단독 금지**, 반드시 다른 속성과 조합

### 링크 (텍스트)
```css
.link {
  background-image: linear-gradient(currentColor, currentColor);
  background-size: 0% 1px;
  background-repeat: no-repeat;
  background-position: 0 100%;
  transition: background-size 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
.link:hover { background-size: 100% 1px; }
```
밑줄이 왼쪽→오른쪽으로 그려지는 방식. 이것 하나로 품격 확 오름.

### 버튼
```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.15, ease: ease.spring }}
/>
```

## 5. 텍스트 Reveal (히어로 전용)
```tsx
// 단어별 등장
{words.map((word, i) => (
  <motion.span
    key={i}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, ease: ease.out, delay: 0.08 * i }}
    style={{ display: "inline-block" }}
  >
    {word}&nbsp;
  </motion.span>
))}
```
- **페이지당 1회만** (히어로에서만)
- 본문에 쓰면 읽기 방해됨

## 6. 페이지 전환 (Next.js View Transitions)
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
}
```
- fade + 살짝 위로 12px만. 화려한 전환 금지.

## 7. 마이크로 디테일 (반드시 포함)
1. **숫자 카운트업** — 조회수/통계는 0부터 카운트 (useMotionValue + animate)
2. **Focus ring 애니메이션** — outline 대신 box-shadow spring
3. **로딩 스켈레톤** — shimmer gradient, 1.5s linear infinite
4. **Toast 진입** — y: 100% → 0, spring
5. **이미지 로드** — blur-up 또는 opacity fade (skeleton에서 자연스럽게)
6. **Copy 버튼** — 클릭 시 체크 아이콘 morph (150ms)
7. **Scroll progress bar** — 상단 1px, Lenis 스크롤 값 연동

## 8. 절대 금지
- bounce easing 과사용 (spring은 버튼 탭에만)
- 500ms 초과 hover
- 무의미한 rotate/skew
- 스크롤 하이재킹 (Lenis는 부드럽게만, 방향 조작 금지)
- 모바일에서 데스크탑 모션 그대로 (모션 50% 감소 필수)
- `prefers-reduced-motion` 무시 (반드시 대응)

## 9. Reduced Motion 대응
```tsx
const shouldReduce = useReducedMotion()
transition={{ duration: shouldReduce ? 0 : 0.9 }}
```

## 10. 강도 조절 (블로그별)
| 블로그 | duration 배율 | stagger | hover y | 특이사항 |
|---|---|---|---|---|
| science-blog | ×1.3 | 80ms | -2px | 차분, 학술적 |
| ainews-kr | ×1.0 (기본) | 80ms | -4px | 베이스 그대로 |
| aiscout | ×0.85 | 80ms | -4px + scale | hover 강도 120% |
| aiscamcheck | ×1.2 | 80ms | -3px | spring easing 금지 (진중함) |

## 의존성 설치
```bash
npm i motion lenis
```
- `motion/react`로 import (Framer Motion이 motion 패키지로 통합됨)
- Next.js 15 App Router: `"use client"` 명시 필수

## CLAUDE.md 추가 한 줄
```
UI/모션 작업 시 @MOTION.md 필수 참조. 섹션 10 강도 규칙 적용.
```
