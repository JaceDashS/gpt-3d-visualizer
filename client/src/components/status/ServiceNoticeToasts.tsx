import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useServiceHealth } from '../../contexts/ServiceHealthContext';
import type { ServiceHealth, ServiceStatus } from '../../services/health';
import styles from './ServiceNoticeToasts.module.css';

// jace-s 공지 표시 규칙: 위에서 내려오는 토스트. 공지는 8초 뒤 닫히고, 장애 안내는 닫을 때까지 남는다
const NOTICE_MS = 8000;

const STATUS_FALLBACK: Record<Exclude<ServiceStatus, 'operational'>, string> = {
  maintenance: 'Maintenance',
  unavailable: 'Service unavailable',
  unknown: '서비스 상태를 확인할 수 없습니다.',
};

interface Toast {
  id: string;
  kind: 'status' | 'notice';
  title: string;
}

const toastsFor = (health: ServiceHealth): Toast[] => {
  const status: Toast[] = health.serviceStatus === 'operational' ? []
    : [{ id: `status-${health.serviceStatus}`, kind: 'status', title: health.message || STATUS_FALLBACK[health.serviceStatus] }];
  return [...status, ...health.announcements.map(a => ({ id: a.id, kind: 'notice' as const, title: a.title }))];
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  // 다시 그려져도 자동 닫힘 시간이 처음부터 다시 세어지지 않게 한다
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (toast.kind !== 'notice') return undefined;
    const timer = window.setTimeout(() => close.current(), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [toast.kind]);
  const status = toast.kind === 'status';
  return (
    <div className={`${styles.toast} ${status ? styles.status : styles.notice}`} role={status ? 'alert' : 'status'}>
      {/* 제목과 문구는 텍스트로만 렌더링한다 (HTML 해석 금지) */}
      <strong className={styles.title}>{toast.title}</strong>
      <button type="button" className={styles.close} aria-label="공지 닫기" onClick={onClose}>×</button>
    </div>
  );
};

// 앱 진입 때 받은 /health 결과를 화면 위 가운데에 쌓아 보여준다. 토스트 밖은 클릭이 통과한다
const ServiceNoticeToasts: React.FC = () => {
  const { health } = useServiceHealth();
  const [closed, setClosed] = useState<string[]>([]);
  if (!health) return null;
  const toasts = toastsFor(health).filter(t => !closed.includes(t.id));
  if (toasts.length === 0) return null;
  // 3D 화면의 transform 안에 들어가도 위치가 틀어지지 않도록 body에 붙인다
  return createPortal(
    <section className={styles.container} aria-label="서비스 공지">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => setClosed(ids => [...ids, toast.id])} />
      ))}
    </section>,
    document.body,
  );
};

export default ServiceNoticeToasts;
