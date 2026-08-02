import React from 'react';
import { COLORS } from '../theme';

const pulse = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <>
      <style>{pulse}</style>
      <div style={{
        width, height, borderRadius: radius,
        background: COLORS.surfaceAlt,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }} />
    </>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: COLORS.surface, borderRadius: 14, padding: '18px 22px' }}>
      <SkeletonBox height={12} width="40%" style={{ marginBottom: 12 }} />
      <SkeletonBox height={28} width="60%" style={{ marginBottom: 8 }} />
      <SkeletonBox height={12} width="80%" />
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ background: COLORS.surface, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <SkeletonBox width={36} height={36} radius={10} />
          <div style={{ flex: 1 }}>
            <SkeletonBox height={13} width="60%" style={{ marginBottom: 8 }} />
            <SkeletonBox height={11} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ cols = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonBox;