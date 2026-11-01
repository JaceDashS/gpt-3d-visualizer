import React from 'react';
import { useServiceHealth } from '../../contexts/ServiceHealthContext';
import type { ServiceStatus } from '../../services/health';
import styles from './ServiceStatusBanner.module.css';

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: 'Operational',
  maintenance: 'Maintenance',
  unavailable: 'Service unavailable',
  unknown: 'Status unknown',
};

const formatTime = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

const formatRange = (from: string | null, until: string | null): string | null => {
  const start = formatTime(from);
  const end = formatTime(until);
  if (!start && !end) return null;
  return `${start ?? '?'} ~ ${end ?? '?'}`;
};

// 서비스 상태와 공지. title/content/message는 모두 텍스트로만 렌더링한다 (HTML 해석 금지)
const ServiceStatusBanner: React.FC = () => {
  const { health } = useServiceHealth();
  if (!health) return null;

  const { serviceStatus, message, maintenance, announcements } = health;
  const showStatus = serviceStatus !== 'operational';
  if (!showStatus && announcements.length === 0) return null;

  const maintenanceRange = maintenance
    ? formatRange(maintenance.startsAt, maintenance.expectedEndsAt)
    : null;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      {showStatus && (
        <div className={`${styles.status} ${styles[serviceStatus]}`} data-status={serviceStatus}>
          <strong>{STATUS_LABEL[serviceStatus]}</strong>
          {message && <span className={styles.message}>{message}</span>}
          {maintenanceRange && <span className={styles.time}>{maintenanceRange}</span>}
        </div>
      )}
      {announcements.map(a => {
        const range = formatRange(a.maintenanceFrom, a.maintenanceUntil);
        return (
          <div key={a.id} className={styles.announcement}>
            {a.title && <strong className={styles.title}>{a.title}</strong>}
            {a.content && <p className={styles.content}>{a.content}</p>}
            {range && <span className={styles.time}>Maintenance: {range}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceStatusBanner;
