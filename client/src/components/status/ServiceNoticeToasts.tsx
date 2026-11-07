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

// 공지가 여러 개여도 토스트 하나에 한 줄씩 담는다
interface Toast {
  id: string;
  kind: 'status' | 'notice';
  lines: string[];
  // 직접 닫을 때까지 남는다
  sticky: boolean;
}

const toastFor = (health: ServiceHealth): Toast | null => {
  const down = health.serviceStatus !== 'operational';
  const notices = health.announcements;
  // 공지가 있으면 장애 문구 대신 공지를 보여준다. 예정된 점검은 공지로 미리 알린다
  if (notices.length > 0) return { id: `notices-${notices.map(a => a.id).join(',')}`, kind: 'notice', lines: notices.map(a => a.title), sticky: down };
  return down ? { id: `status-${health.serviceStatus}`, kind: 'status', lines: [health.message || OUTAGE_MESSAGE], sticky: true } : null;
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
      {toast.lines.length === 1
        ? <strong className={styles.title}>{toast.lines[0]}</strong>
        : <ul className={styles.lines}>{toast.lines.map((line, index) => <li key={index}>{line}</li>)}</ul>}
      <button type="button" className={styles.close} aria-label="공지 닫기" onClick={onClose}>×</button>
    </div>
  );
};

// 앱 진입 때 받은 /health 결과를 화면 위 가운데에 토스트 하나로 보여준다. 토스트 밖은 클릭이 통과한다
const ServiceNoticeToasts: React.FC = () => {
  const { health } = useServiceHealth();
  const [closed, setClosed] = useState<string[]>([]);
  if (!health) return null;
  const toast = toastFor(health);
  if (!toast || closed.includes(toast.id)) return null;
  // 3D 화면의 transform 안에 들어가도 위치가 틀어지지 않도록 body에 붙인다
  return createPortal(
    <section className={styles.container} aria-label="서비스 공지">
      <ToastItem key={toast.id} toast={toast} onClose={() => setClosed(ids => [...ids, toast.id])} />
    </section>,
    document.body,
  );
};

export default ServiceNoticeToasts;
