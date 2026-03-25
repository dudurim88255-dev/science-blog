import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '연락처',
};

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#e8edf5' }}>연락처</h1>
      <p className="mb-8" style={{ color: '#8b96b0', lineHeight: 1.9 }}>
        논문 제안, 오류 신고, 협업 문의 등은 아래 이메일로 연락주세요.
      </p>
      <a
        href="mailto:contact@example.com"
        style={{ background: 'linear-gradient(135deg, #4fd1c5, #7c3aed)', borderRadius: 12, padding: '12px 32px', color: '#fff', fontWeight: 700, display: 'inline-block' }}
      >
        ✉️ contact@example.com
      </a>
      <p className="mt-6 text-sm" style={{ color: '#4a5568' }}>
        * 이메일 주소는 settings에서 실제 주소로 교체하세요.
      </p>
    </div>
  );
}
