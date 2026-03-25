import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { buildPostMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd, SITE_URL, SITE_NAME } from '@/lib/seo';
import { PaperMetadata } from '@/components/PaperMetadata';
import { TableOfContents } from '@/components/TableOfContents';
import { AdBanner } from '@/components/AdBanner';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return buildPostMetadata(post);
}

const DIFFICULTY_CONFIG = {
  '입문': { color: '#4fd1c5', emoji: '🟢' },
  '중급': { color: '#f6c90e', emoji: '🟡' },
  '심화': { color: '#f87171', emoji: '🔴' },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const diff = DIFFICULTY_CONFIG[post.difficulty] ?? DIFFICULTY_CONFIG['입문'];
  const articleJsonLd = buildArticleJsonLd(post);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: SITE_NAME, url: SITE_URL },
    { name: post.category, url: `${SITE_URL}/category/${post.category}` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* 브레드크럼 */}
        <nav className="text-sm mb-6 flex items-center gap-2" style={{ color: '#8b96b0' }}>
          <Link href="/" className="hover:text-[#4fd1c5]">홈</Link>
          <span>/</span>
          <Link href={`/category/${post.category}`} className="hover:text-[#4fd1c5]">{post.category}</Link>
          <span>/</span>
          <span style={{ color: '#c5d8f0' }} className="truncate max-w-xs">{post.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_240px] gap-12">
          {/* 본문 */}
          <article>
            {/* 헤더 */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span style={{ background: 'rgba(79,209,197,0.1)', color: '#4fd1c5', border: '1px solid rgba(79,209,197,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>
                  {post.category}
                </span>
                <span style={{ color: diff.color, background: `${diff.color}15`, border: `1px solid ${diff.color}40`, borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>
                  {diff.emoji} {post.difficulty}
                </span>
                {post.journal && (
                  <span style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '3px 12px', fontSize: 13 }}>
                    {post.journal}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-snug" style={{ color: '#e8edf5' }}>
                {post.title}
              </h1>
              <p className="text-base mb-5" style={{ color: '#8b96b0', lineHeight: 1.8 }}>{post.summary}</p>
              <div className="flex items-center gap-4 text-sm" style={{ color: '#4a5568' }}>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>

              {/* 논문 메타 */}
              <PaperMetadata doi={post.paperDOI} journal={post.journal} date={post.date} />

              {/* 커버 이미지 */}
              {post.coverImage && (
                <div className="rounded-xl overflow-hidden mt-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImage} alt={post.title} className="w-full" />
                </div>
              )}
            </header>

            <AdBanner slot="2345678901" className="mb-8" />

            {/* MDX 본문 */}
            <div className="prose">
              <MDXRemote source={post.content} />
            </div>

            <AdBanner slot="3456789012" className="mt-10" />

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} style={{ background: '#131a2e', border: '1px solid #1e2a42', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#8b96b0' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* 사이드바 목차 */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </>
  );
}
