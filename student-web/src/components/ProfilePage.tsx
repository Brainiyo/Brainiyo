'use client';
import { useState, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProfilePage.module.css';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Save,
  Edit3,
  CheckCircle,
  AlertCircle,
  Flame,
  Star,
  Award,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react';

type Toast = { type: 'success' | 'error'; message: string };

const CLASS_OPTIONS = [
  { value: 11, label: 'Class 11' },
  { value: 12, label: 'Class 12' },
  { value: 13, label: 'Dropper (Class 13)' },
];

const EXAM_OPTIONS = [
  { value: 'JEE', label: '🚀 JEE (Engineering)', desc: 'IIT / NIT / BITS' },
  { value: 'NEET', label: '🩺 NEET (Medical)', desc: 'MBBS / BDS / AYUSH' },
];

export function ProfilePage() {
  const { user, streak, updateUser, refreshUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showClassDrop, setShowClassDrop] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    class: user?.class || 11,
    target_exam: user?.target_exam || 'JEE',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleEdit = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      class: user?.class || 11,
      target_exam: user?.target_exam || 'JEE',
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setShowClassDrop(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      showToast('error', 'Name must be at least 2 characters.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        class: form.class,
        target_exam: form.target_exam,
      };
      const res = await api.updateMe(payload);
      updateUser({ ...user, ...res.data });
      setEditing(false);
      showToast('success', 'Profile updated successfully! 🎉');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const selectedClass = CLASS_OPTIONS.find((c) => c.value === form.class);
  const selectedExam = EXAM_OPTIONS.find((e) => e.value === form.target_exam);

  const displayClass = user?.class === 13 ? 'Dropper' : `Class ${user?.class}`;
  const displayExam = user?.target_exam === 'NEET' ? '🩺 NEET' : '🚀 JEE';

  return (
    <div className={styles.page}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Card */}
      <motion.div
        className={styles.profileHero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.heroGlow} />
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarLg}>
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className={styles.examBadge}>
            {user?.target_exam === 'NEET' ? '🩺' : '🚀'}
          </div>
        </div>

        <div className={styles.heroInfo}>
          <h2 className={styles.heroName}>{user?.name || 'Student'}</h2>
          <p className={styles.heroMeta}>
            {displayClass} &nbsp;·&nbsp; {displayExam} Aspirant
          </p>
          <p className={styles.heroEmail}>{user?.email || '—'}</p>
        </div>

        <button className={styles.editBtn} onClick={editing ? handleCancel : handleEdit}>
          {editing ? <X size={16} /> : <Edit3 size={16} />}
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className={styles.statsRow}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className={styles.statChip}>
          <Flame size={20} className={styles.statIconFlame} />
          <div>
            <div className={styles.statVal}>{streak?.current_streak ?? 0}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>
        <div className={styles.statChip}>
          <Star size={20} className={styles.statIconStar} />
          <div>
            <div className={styles.statVal}>{user?.xp_points ?? 0}</div>
            <div className={styles.statLabel}>XP Points</div>
          </div>
        </div>
        <div className={styles.statChip}>
          <Award size={20} className={styles.statIconAward} />
          <div>
            <div className={styles.statVal}>{streak?.longest_streak ?? 0}</div>
            <div className={styles.statLabel}>Best Streak</div>
          </div>
        </div>
        <div className={styles.statChip}>
          <Calendar size={20} className={styles.statIconCal} />
          <div>
            <div className={styles.statVal}>{memberSince}</div>
            <div className={styles.statLabel}>Member Since</div>
          </div>
        </div>
      </motion.div>

      <div className={styles.columns}>
        {/* Left: Edit Form / View Info */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className={styles.cardHeader}>
            <User size={18} />
            <h3>Personal Information</h3>
          </div>

          <div className={styles.fieldList}>
            {/* Name */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Full Name</label>
              {editing ? (
                <input
                  className={styles.input}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  maxLength={100}
                />
              ) : (
                <div className={styles.fieldValue}>
                  <User size={15} className={styles.fieldIcon} />
                  {user?.name || '—'}
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Email Address
                <span className={styles.readonlyTag}>Google Account</span>
              </label>
              <div className={styles.fieldValue}>
                <Mail size={15} className={styles.fieldIcon} />
                {user?.email || '—'}
              </div>
            </div>

            {/* Phone (read-only, set by Firebase) */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Phone Number
                <span className={styles.readonlyTag}>Auto-filled</span>
              </label>
              <div className={styles.fieldValue}>
                <Phone size={15} className={styles.fieldIcon} />
                {user?.phone || 'Not linked'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Academic Settings */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className={styles.cardHeader}>
            <GraduationCap size={18} />
            <h3>Academic Settings</h3>
          </div>

          <div className={styles.fieldList}>
            {/* Class / Batch */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Class / Batch</label>
              {editing ? (
                <div className={styles.customSelect}>
                  <button
                    className={styles.selectBtn}
                    onClick={() => setShowClassDrop((p) => !p)}
                    type="button"
                  >
                    <GraduationCap size={15} />
                    {selectedClass?.label}
                    <ChevronDown size={14} className={showClassDrop ? styles.chevronOpen : ''} />
                  </button>
                  <AnimatePresence>
                    {showClassDrop && (
                      <motion.ul
                        className={styles.dropList}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        {CLASS_OPTIONS.map((opt) => (
                          <li
                            key={opt.value}
                            className={`${styles.dropItem} ${form.class === opt.value ? styles.dropActive : ''}`}
                            onClick={() => {
                              setForm({ ...form, class: opt.value });
                              setShowClassDrop(false);
                            }}
                          >
                            {opt.label}
                            {form.class === opt.value && <CheckCircle size={14} />}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className={styles.fieldValue}>
                  <GraduationCap size={15} className={styles.fieldIcon} />
                  {displayClass}
                </div>
              )}
            </div>

            {/* Target Exam */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Target Exam</label>
              {editing ? (
                <div className={styles.examCards}>
                  {EXAM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.examCard} ${form.target_exam === opt.value ? styles.examCardActive : ''}`}
                      onClick={() => setForm({ ...form, target_exam: opt.value })}
                    >
                      <span className={styles.examLabel}>{opt.label}</span>
                      <span className={styles.examDesc}>{opt.desc}</span>
                      {form.target_exam === opt.value && (
                        <CheckCircle size={16} className={styles.examCheck} />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.fieldValue}>
                  <Target size={15} className={styles.fieldIcon} />
                  {displayExam} Aspirant
                </div>
              )}
            </div>
          </div>

          {editing && (
            <motion.button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? (
                <span className={styles.spinner} />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        className={`${styles.card} ${styles.dangerCard}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className={styles.cardHeader}>
          <AlertCircle size={18} className={styles.dangerIcon} />
          <h3>Account</h3>
        </div>
        <p className={styles.dangerDesc}>
          Your account is linked to Google. To change your email or permanently
          delete your account, please contact our support team.
        </p>
        <div className={styles.dangerActions}>
          <a
            href="mailto:support@brainiyo.com"
            className={styles.contactBtn}
          >
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}
