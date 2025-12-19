import React, { useEffect, useState, useMemo } from 'react';
import styles from './FeedbackOverlay.module.css';
import { feedbackApi } from '../../services/api';
import { OVERLAY_SLIDE_DOWN_DURATION } from '../../constants/animation';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Language } from '../../pages/howItWorksText';

interface FeedbackOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  password: string;
  content: string;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState<FeedbackFormData>({
    password: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 다국어 텍스트
  const texts = useMemo(() => {
    const dict: Record<Language, {
      title: string;
      subtitle: string;
      viewAllFeedback: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      passwordHelp: string;
      contentLabel: string;
      contentPlaceholder: string;
      submitButton: string;
      submitting: string;
      successMessage: string;
      errorContent: string;
      errorPassword: string;
      errorSubmit: string;
      closeLabel: string;
      showPassword: string;
      hidePassword: string;
    }> = {
      en: {
        title: 'Feedback',
        subtitle: 'Share your thoughts, suggestions, or report any issues. Your name will be generated from your IP address.',
        viewAllFeedback: 'View all feedback',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter password for editing/deleting',
        passwordHelp: "You'll need this password to edit or delete your feedback later.",
        contentLabel: 'Content',
        contentPlaceholder: 'Share your thoughts, suggestions, or report issues...',
        submitButton: 'Submit Feedback',
        submitting: 'Submitting...',
        successMessage: '✓ Thank you for your feedback!',
        errorContent: 'Please enter your feedback.',
        errorPassword: 'Please enter a password.',
        errorSubmit: 'Failed to submit feedback. Please try again.',
        closeLabel: 'Close feedback',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
      },
      ko: {
        title: '피드백',
        subtitle: '의견, 제안 또는 문제를 공유해주세요. 이름은 IP 주소에서 자동으로 생성됩니다.',
        viewAllFeedback: '모든 피드백 보기',
        passwordLabel: '비밀번호',
        passwordPlaceholder: '수정/삭제를 위한 비밀번호를 입력하세요',
        passwordHelp: '나중에 피드백을 수정하거나 삭제하려면 이 비밀번호가 필요합니다.',
        contentLabel: '내용',
        contentPlaceholder: '의견, 제안 또는 문제를 공유해주세요...',
        submitButton: '피드백 제출',
        submitting: '제출 중...',
        successMessage: '✓ 피드백을 주셔서 감사합니다!',
        errorContent: '피드백을 입력해주세요.',
        errorPassword: '비밀번호를 입력해주세요.',
        errorSubmit: '피드백 제출에 실패했습니다. 다시 시도해주세요.',
        closeLabel: '피드백 닫기',
        showPassword: '비밀번호 표시',
        hidePassword: '비밀번호 숨기기',
      },
      ja: {
        title: 'フィードバック',
        subtitle: 'ご意見、ご提案、または問題を共有してください。名前はIPアドレスから自動生成されます。',
        viewAllFeedback: 'すべてのフィードバックを見る',
        passwordLabel: 'パスワード',
        passwordPlaceholder: '編集/削除用のパスワードを入力してください',
        passwordHelp: '後でフィードバックを編集または削除するには、このパスワードが必要です。',
        contentLabel: '内容',
        contentPlaceholder: 'ご意見、ご提案、または問題を共有してください...',
        submitButton: 'フィードバックを送信',
        submitting: '送信中...',
        successMessage: '✓ フィードバックありがとうございます！',
        errorContent: 'フィードバックを入力してください。',
        errorPassword: 'パスワードを入力してください。',
        errorSubmit: 'フィードバックの送信に失敗しました。もう一度お試しください。',
        closeLabel: 'フィードバックを閉じる',
        showPassword: 'パスワードを表示',
        hidePassword: 'パスワードを非表示',
      },
      zh: {
        title: '反馈',
        subtitle: '分享您的想法、建议或报告任何问题。您的姓名将从IP地址自动生成。',
        viewAllFeedback: '查看所有反馈',
        passwordLabel: '密码',
        passwordPlaceholder: '输入用于编辑/删除的密码',
        passwordHelp: '您需要此密码来编辑或删除您的反馈。',
        contentLabel: '内容',
        contentPlaceholder: '分享您的想法、建议或报告问题...',
        submitButton: '提交反馈',
        submitting: '提交中...',
        successMessage: '✓ 感谢您的反馈！',
        errorContent: '请输入您的反馈。',
        errorPassword: '请输入密码。',
        errorSubmit: '提交反馈失败。请重试。',
        closeLabel: '关闭反馈',
        showPassword: '显示密码',
        hidePassword: '隐藏密码',
      },
    };
    return dict[language];
  }, [language]);

  // 열리고 닫힐 때 애니메이션이 자연스럽게 보이도록 내부 마운트 상태 관리
  useEffect(() => {
    let timer: number | undefined;

    if (isOpen) {
      setIsMounted(true);
      setIsClosing(false);
    } else if (!isOpen && isMounted) {
      // 닫힐 때는 슬라이드 다운 애니메이션을 먼저 보여주고 언마운트
      setIsClosing(true);
      timer = window.setTimeout(() => {
        setIsMounted(false);
        setIsClosing(false);
        // 폼 상태 초기화
        setFormData({ password: '', content: '' });
        setSubmitStatus('idle');
        setErrorMessage(null);
        setShowPassword(false);
      }, OVERLAY_SLIDE_DOWN_DURATION);
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [isOpen, isMounted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러 상태 초기화
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 내용 필수 검증
    if (!formData.content.trim()) {
      setSubmitStatus('error');
      setErrorMessage(texts.errorContent);
      return;
    }

    // 비밀번호 필수 검증
    if (!formData.password.trim()) {
      setSubmitStatus('error');
      setErrorMessage(texts.errorPassword);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      await feedbackApi.submitFeedback({
        content: formData.content.trim(),
        userPassword: formData.password,
      });

      setSubmitStatus('success');
      // 성공 후 폼 초기화
      setFormData({ password: '', content: '' });
      setShowPassword(false);
    } catch (err: unknown) {
      console.error('Failed to submit feedback:', err);
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : texts.errorSubmit
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.backdrop} aria-modal="true" role="dialog">
      <div className={`${styles.sheet} ${isClosing ? styles.closing : ''}`}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={texts.closeLabel}
          disabled={isSubmitting}
        >
          ×
        </button>

        <div className={styles.content}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>{texts.title}</h2>
            <div className={styles.langGroup} role="group" aria-label="Language">
              <button
                type="button"
                className={`${styles.langButton} ${language === 'en' ? styles.langButtonActive : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`${styles.langButton} ${language === 'zh' ? styles.langButtonActive : ''}`}
                onClick={() => setLanguage('zh')}
              >
                中
              </button>
              <button
                type="button"
                className={`${styles.langButton} ${language === 'ja' ? styles.langButtonActive : ''}`}
                onClick={() => setLanguage('ja')}
              >
                日
              </button>
              <button
                type="button"
                className={`${styles.langButton} ${language === 'ko' ? styles.langButtonActive : ''}`}
                onClick={() => setLanguage('ko')}
              >
                한
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>
            {texts.subtitle}
          </p>

          <a
            href={`${window.location.origin}/#comment`}
            className={styles.viewAllLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {texts.viewAllFeedback} →
          </a>

          {submitStatus === 'success' ? (
            <div className={styles.successMessage}>
              <p>{texts.successMessage}</p>
              <a
                href={`${window.location.origin}/#comment`}
                className={styles.viewAllLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {texts.viewAllFeedback} →
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="feedback-password" className={styles.label}>
                  {texts.passwordLabel} <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="feedback-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder={texts.passwordPlaceholder}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? texts.hidePassword : texts.showPassword}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className={styles.helpText}>
                  {texts.passwordHelp}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="feedback-content" className={styles.label}>
                  {texts.contentLabel} <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="feedback-content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder={texts.contentPlaceholder}
                  rows={6}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus === 'error' && errorMessage && (
                <div className={styles.errorMessage}>{errorMessage}</div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !formData.content.trim() || !formData.password.trim()}
              >
                {isSubmitting ? texts.submitting : texts.submitButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackOverlay;

