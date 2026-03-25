import { Metadata } from 'next';
import { PostMeta } from './posts';

export const SITE_NAME = '오가노이드 & 역노화 과학';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://167w7k7.atoms.world';
export const SITE_DESCRIPTION = '최신 생명과학 논문을 쉽게 풀어 설명합니다. 오가노이드, 역노화, CRISPR, 줄기세포 등 핵심 연구를 누구나 이해할 수 있도록 소개합니다.';

export function buildPostMetadata(post: PostMeta): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.coverImage ? `${SITE_URL}${post.coverImage}` : `${SITE_URL}/og-default.png`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [image],
    },
  };
}

export function buildArticleJsonLd(post: PostMeta) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = post.coverImage ? `${SITE_URL}${post.coverImage}` : `${SITE_URL}/og-default.png`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image,
    author: {
      '@type': 'Person',
      name: '오가노이드 & 역노화 과학',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.tags.join(', '),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
