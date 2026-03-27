import Link from 'next/link';
import { getAllPosts, CATEGORY_MAP, getAllTags } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { AdBanner } from '@/components/AdBanner';
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_URL } from '@/lib/seo';

const CATEGORY_EMOJI: Record<string, string> = {
  organoid: '🫁',
  'anti-aging': '⏳',
  genomics: '🧬',
  'stem-cell': '🔬',
  'drug-discovery': '💊',
  neuroscience: '🧠',
};

export default function HomePage() {
  const posts = getAllPosts();
  const recent = posts.slice(0, 6);
  const featured = posts[0];

  // 통계
  const journals = [...new Set(posts.map((p) => p.journal).filter(Boolean))];
  const categories = Object.keys(CATEGORY_MAP);

  // 태그 빈도
  const tagCounts: Record<string, number> = {};
  posts.forEach((p) => p.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  const maxCount = topTags[0]?.[1] ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* ── 히어로 ── */}
      <section className="relative text-center py-16 mb-4 overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #0d1424 0%, #111827 50%, #0d1424 100%)', border: '1px solid #1e2a42' }}>
        {/* 배경 글로우 */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(79,209,197,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative">
          {/* 배지 */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(79,209,197,0.1)', border: '1px solid rgba(79,209,197,0.3)', color: '#4fd1c5' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4fd1c5] animate-pulse" />
            최신 생명과학 논문 해설 블로그
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight" style={{ color: '#e8edf5' }}>
            인간 수명{' '}
            <span style={{ background: 'linear-gradient(90deg, #4fd1c5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              150세
            </span>
            {' '}가능한가?
          </h1>
          <p className="text-base md:text-lg font-semibold mb-4" style={{ color: '#4fd1c5' }}>
            {SITE_TAGLINE}
          </p>
          <p className="text-sm md:text-base max-w-xl mx-auto mb-10" style={{ color: '#8b96b0', lineHeight: 1.9 }}>
            {SITE_DESCRIPTION}
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link href="/blog"
              style={{ background: 'linear-gradient(135deg, #4fd1c5, #38b2ac)', borderRadius: 12, padding: '10px 28px', color: '#0d1424', fontWeight: 700, fontSize: 14 }}
              className="hover:opacity-90 transition-opacity">
              전체 논문 보기
            </Link>
            <Link href="/category/anti-aging"
              style={{ background: 'transparent', border: '1px solid rgba(79,209,197,0.4)', borderRadius: 12, padding: '10px 28px', color: '#4fd1c5', fontWeight: 600, fontSize: 14 }}
              className="hover:border-[#4fd1c5] hover:bg-[rgba(79,209,197,0.05)] transition-all">
              역노화 연구 →
            </Link>
          </div>

          {/* 통계 */}
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { value: posts.length, label: '논문 해설', suffix: '편' },
              { value: categories.length, label: '연구 분야', suffix: '개' },
              { value: journals.length, label: '저명 저널', suffix: '개' },
            ].map(({ value, label, suffix }) => (
              <div key={label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold" style={{ color: '#4fd1c5' }}>
                  {value}<span className="text-base ml-0.5" style={{ color: '#4fd1c5' }}>{suffix}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: '#4a5568' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdBanner slot="1234567890" format="horizontal" className="my-10" />

      {/* ── 카테고리 카드 ── */}
      <section className="mb-14">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#4fd1c5' }}>
          <span>📂</span> 연구 분야
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(CATEGORY_MAP).map(([slug, { name, description }]) => {
            const count = posts.filter((p) => p.category === slug).length;
            const emoji = CATEGORY_EMOJI[slug] ?? '📄';
            return (
              <Link key={slug} href={`/category/${slug}`}
                style={{ background: '#131a2e', border: '1px solid #1e2a42', borderRadius: 16, padding: '20px', transition: 'all 0.2s', display: 'block' }}
                className="hover:border-[#4fd1c5] hover:-translate-y-0.5 group">
                <div className="text-2xl mb-2">{emoji}</div>
                <div className="font-bold text-sm mb-1 group-hover:text-[#4fd1c5] transition-colors" style={{ color: '#e8edf5' }}>{name}</div>
                <div className="text-xs mb-3 line-clamp-2" style={{ color: '#4a5568' }}>{description}</div>
                <div className="text-xs font-semibold" style={{ color: '#4fd1c5' }}>{count}편 →</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 주요 포스트 ── */}
      {featured && (
        <section className="mb-14">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#4fd1c5' }}>
            <span>⭐</span> 주요 논문
          </h2>
          <Link href={`/blog/${featured.slug}`} className="block group">
            <article style={{ background: 'linear-gradient(135deg, #131a2e, #1a1f35)', border: '1px solid rgba(79,209,197,0.3)', borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.2s' }}
              className="md:flex hover:border-[#4fd1c5]">
              {featured.coverImage && (
                <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span style={{ background: 'rgba(79,209,197,0.1)', color: '#4fd1c5', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>
                    {CATEGORY_MAP[featured.category]?.name ?? featured.category}
                  </span>
                  {featured.journal && (
                    <span style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>
                      {featured.journal}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#e8edf5' }}>{featured.title}</h3>
                <p className="text-sm mb-4" style={{ color: '#8b96b0', lineHeight: 1.8 }}>{featured.summary}</p>
                <span style={{ color: '#4fd1c5', fontSize: 14, fontWeight: 600 }}>자세히 보기 →</span>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* ── 최신 논문 ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#4fd1c5' }}>
            <span>🔬</span> 최신 논문 해설
          </h2>
          {posts.length > 6 && (
            <Link href="/blog" style={{ color: '#8b96b0', fontSize: 14 }} className="hover:text-[#4fd1c5]">
              전체 보기 →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* ── 인기 태그 ── */}
      {topTags.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#4fd1c5' }}>
            <span>🏷️</span> 인기 태그
          </h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => {
              const ratio = count / maxCount;
              const fontSize = Math.round(11 + ratio * 5);
              const opacity = 0.5 + ratio * 0.5;
              return (
                <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}
                  style={{
                    background: `rgba(79,209,197,${0.05 + ratio * 0.1})`,
                    border: `1px solid rgba(79,209,197,${0.15 + ratio * 0.25})`,
                    borderRadius: 20,
                    padding: `4px ${Math.round(10 + ratio * 4)}px`,
                    color: `rgba(79,209,197,${opacity})`,
                    fontSize,
                  }}
                  className="hover:border-[#4fd1c5] hover:text-[#4fd1c5] transition-colors">
                  #{tag}
                  {count > 1 && <span className="ml-1 text-[10px] opacity-60">{count}</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
