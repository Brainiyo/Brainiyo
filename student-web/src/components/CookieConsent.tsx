'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cookie, Settings, X } from 'lucide-react';
import styles from './CookieConsent.module.css';

type ConsentSettings = {
  analytics: boolean;
  personalisation: boolean;
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    analytics: true,
    personalisation: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = localStorage.getItem('brainiyo_cookie_consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setSettings({
          analytics: parsed.analytics ?? true,
          personalisation: parsed.personalisation ?? true,
        });
      } catch (e) {
        // Fallback if parsing fails
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      accepted: true,
      analytics: true,
      personalisation: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('brainiyo_cookie_consent', JSON.stringify(consent));
    setSettings({ analytics: true, personalisation: true });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      accepted: true,
      analytics: settings.analytics,
      personalisation: settings.personalisation,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('brainiyo_cookie_consent', JSON.stringify(consent));
    setShowBanner(false);
    setShowModal(false);
  };

  const toggleSetting = (key: keyof ConsentSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            className={`${styles.bannerContainer} glass-panel`}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className={styles.bannerHeader}>
              <Cookie className={styles.cookieIcon} size={24} />
              <div className={styles.bannerText}>
                <p>
                  Hey there! We use cookies to make your JEE & NEET practice runs smoother. 
                  They help us understand how you use our platform and personalize your study sessions. 
                  Check out our{' '}
                  <Link href="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>{' '}
                  to learn more! 🍪
                </p>
              </div>
            </div>
            <div className={styles.bannerActions}>
              <button
                className={`${styles.btn} styles.btnSecondary`}
                onClick={() => setShowModal(true)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Settings size={14} />
                  Manage Preferences
                </span>
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Preferences */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalOverlay}>
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Customize Your Cookie Settings 🍪</h2>
                <p className={styles.modalDesc}>
                  Hi! Under India's DPDP Act 2023, you have full control over your digital footprint. 
                  We use cookies to run our active learning tools, and you get to choose which optional 
                  data you share with us. Read our full{' '}
                  <Link href="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy#cookies" className={styles.link}>
                    Cookie Policy
                  </Link>{' '}
                  for details.
                </p>
              </div>

              <div className={styles.optionsList}>
                {/* 1. Necessary */}
                <div className={`${styles.optionCard} ${styles.optionCardActive}`}>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTitle}>
                      1. Strictly Necessary Cookies
                      <span className={styles.badge}>Always Active</span>
                    </div>
                    <p className={styles.optionDesc}>
                      These cookies are vital. They keep you logged into your profile, keep your billing sessions secure, 
                      and protect our 100k+ question bank. The platform cannot run without them.
                    </p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked disabled />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* 2. Analytics */}
                <div
                  className={`${styles.optionCard} ${
                    settings.analytics ? styles.optionCardActive : ''
                  }`}
                >
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTitle}>
                      2. Analytics Cookies
                    </div>
                    <p className={styles.optionDesc}>
                      We use Google Analytics to see which study modules students visit most and check if pages load 
                      slowly. This helps us make the site faster and better. No personal details are ever shared.
                    </p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.analytics}
                      onChange={() => toggleSetting('analytics')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                {/* 3. Personalisation */}
                <div
                  className={`${styles.optionCard} ${
                    settings.personalisation ? styles.optionCardActive : ''
                  }`}
                >
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTitle}>
                      3. Personalisation Cookies
                    </div>
                    <p className={styles.optionDesc}>
                      These help our adaptive engine remember your study preferences—like saving your choice of JEE or 
                      NEET, keeping your dark mode setting active, and maintaining spaced repetition queues.
                    </p>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={settings.personalisation}
                      onChange={() => toggleSetting('personalisation')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={`${styles.btn} styles.btnSecondary`}
                  onClick={handleSavePreferences}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Save My Preferences
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleAcceptAll}
                >
                  Accept All Cookies
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
