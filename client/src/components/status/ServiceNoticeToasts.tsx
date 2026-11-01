import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useServiceHealth } from '../../contexts/ServiceHealthContext';
import type { ServiceHealth } from '../../services/health';
import styles from './ServiceNoticeToasts.module.css';

// jace-s 공지 표시 규칙: 위에서 내려오는 토스트. 서버에 연결되면 공지는 8초 뒤 닫힌다.
// 서버에 연결할 수 없으면 공지가 있을 때는 공지를, 없을 때는 고정 문구를 닫을 때까지 보여준다
const NOTICE_MS = 8000;
// 응답을 읽지 못한 경우(unknown)도 서버에 연결할 수 없는 것과 같으므로 같은 고정 문구를 쓴다
const OUTAGE_MESSAGE = 'Unable to connect to the server.';

interface Toast {
  id: string;
  kind: 'status' | 'notice';
  title: string;
  // 직접 닫을 때까지 남는다
  sticky: boolean;
}

const toastsFor = (health: ServiceHealth): Toast[] => {
  const down = health.serviceStatus !== 'operational';
  const notices = health.announcements.map(a => ({ id: a.id, kind: 'notice' as const, title: a.title, sticky: down }));
  // 공지가 있으면 장애 문구 대신 공지를 보여준다. 예정된 점검은 공지로 미리 알린다
  if (notices.length > 0) return notices;
  return down ? [{ id: `status-${health.serviceStatus}`, kind: 'status', title: health.message || OUTAGE_MESSAGE, sticky: true }] : [];
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  // 다시 그려져도 자동 닫힘 시간이 처음부터 다시 세어지지 않게 한다
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (toast.sticky) return undefined;
    const timer = window.setTimeout(() => close.current(), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [toast.sticky]);
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
