import Link from 'next/link';
import { getAllPosts, CATEGORY_MAP } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { AdBanner } from '@/components/AdBanner';
import { SITE_DESCRIPTION, SITE_TAGLINE } from '@/lib/seo';

export default function HomePage() {
  const posts = getAllPosts();
  const recent = posts.slice(0, 6);
  const featured = posts[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* 히어로 */}
      <section className="text-center py-12 mb-12">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#e8edf5' }}>
          인간 수명 150세 가능한가?
        </h1>
        <p className="text-lg font-semibold mb-4" style={{ color: '#4fd1c5' }}>
          {SITE_TAGLINE}
        </p>
        <p className="text-base max-w-xl mx-auto" style={{ color: '#8b96b0', lineHeight: 1.8 }}>
          {SITE_DESCRIPTION}
        </p>
        {/* 카테고리 빠른 링크 */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {Object.entries(CATEGORY_MAP).map(([slug, { name }]) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              style={{ background: '#131a2e', border: '1px solid #1e2a42', borderRadius: 20, padding: '6px 16px', color: '#8b96b0', fontSize: 13, transition: 'all 0.15s' }}
              className="hover:border-[#4fd1c5] hover:text-[#4fd1c5]"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      <AdBanner slot="1234567890" format="horizontal" className="mb-10" />

      {/* 최신 포스트 */}
      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#8b96b0' }}>
          <div className="text-4xl mb-4">📝</div>
          <p>아직 등록된 포스트가 없습니다.</p>
          <p className="text-sm mt-2">content/posts/ 폴더에 MDX 파일을 추가하세요.</p>
        </div>
      ) : (
        <>
          {/* 주요 포스트 */}
          {featured && (
            <section className="mb-12">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: '#4fd1c5' }}>
                <span>⭐</span> 주요 논문
              </h2>
              <Link href={`/blog/${featured.slug}`} className="block group">
                <article style={{ background: 'linear-gradient(135deg, #131a2e, #1a1f35)', border: '1px solid rgba(79,209,197,0.3)', borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.2s' }} className="md:flex hover:border-[#4fd1c5]">
                  {featured.coverImage && (
                    <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span style={{ background: 'rgba(79,209,197,0.1)', color: '#4fd1c5', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>{featured.category}</span>
                      {featured.journal && <span style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>{featured.journal}</span>}
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#e8edf5' }}>{featured.title}</h3>
                    <p className="text-sm mb-4" style={{ color: '#8b96b0', lineHeight: 1.8 }}>{featured.summary}</p>
                    <span style={{ color: '#4fd1c5', fontSize: 14, fontWeight: 600 }}>자세히 보기 →</span>
                  </div>
                </article>
              </Link>
            </section>
          )}

          {/* 최신 포스트 그리드 */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#4fd1c5' }}>
                <span>🔬</span> 최신 논문 해설
              </h2>
              {posts.length > 6 && (
                <Link href="/blog" style={{ color: '#8b96b0', fontSize: 14 }} className="hover:text-[#4fd1c5]">전체 보기 →</Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
