import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, CheckCircle, ShieldAlert, Key, HelpCircle, Ban, CreditCard, Scale, LifeBuoy } from "lucide-react";
import styles from "./Terms.module.css";

export default function TermsPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Premium Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo-icon.png" alt="Brainiyo" width={32} height={32} />
            <span>Brainiyo</span>
          </Link>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>
          The rules for using Brainiyo to prepare for JEE and NEET
        </p>
        <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Terms Sections</h3>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}><a href="#acceptance">1. Acceptance of Terms</a></li>
            <li className={styles.navItem}><a href="#eligibility">2. Eligibility & Parental Consent</a></li>
            <li className={styles.navItem}><a href="#accounts">3. Account Security</a></li>
            <li className={styles.navItem}><a href="#acceptable-use">4. Acceptable Use Policy</a></li>
            <li className={styles.navItem}><a href="#ip">5. Intellectual Property</a></li>
            <li className={styles.navItem}><a href="#subscriptions">6. Subscriptions & Billing</a></li>
            <li className={styles.navItem}><a href="#disclaimer">7. Exam Results Disclaimer</a></li>
            <li className={styles.navItem}><a href="#liability">8. Limitation of Liability</a></li>
            <li className={styles.navItem}><a href="#termination">9. Suspension & Termination</a></li>
            <li className={styles.navItem}><a href="#changes">10. Pricing & Service Changes</a></li>
            <li className={styles.navItem}><a href="#governing-law">11. Governing Law</a></li>
            <li className={styles.navItem}><a href="#contact">12. Legal Contact</a></li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div className={styles.introText}>
            <p>
              Welcome to Brainiyo (<strong>brainiyo.in</strong>)! These Terms of Service ("Terms") act as a legal contract 
              between you and <strong>Brainiyo EdTech Technologies</strong>. They set the rules for using our website, 
              our 100k+ question database, our spaced repetition tools, and our personalized analytics dashboard.
            </p>
            <p style={{ marginTop: "1rem" }}>
              Since most of our users are Class 11, Class 12, or dropper students preparing for JEE and NEET, we have 
              written these rules in plain, simple English. Please read them carefully. If you are under 18, you must 
              read and agree to these rules alongside your parent or guardian.
            </p>
          </div>

          {/* Section 1 */}
          <section id="acceptance" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>1.</span> Acceptance of Terms
            </h2>
            <p className={styles.paragraph}>
              By creating an account, browsing our website, or purchasing one of our paid plans, you agree to follow all 
              the rules in these Terms, our Privacy Policy, and any other guidelines we post. 
            </p>
            <p className={styles.paragraph}>
              <strong>If you do not agree to these rules, you must not use or access Brainiyo.</strong>
            </p>
          </section>

          {/* Section 2 */}
          <section id="eligibility" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>2.</span> Eligibility & Parental Consent
            </h2>
            <p className={styles.paragraph}>
              Brainiyo is designed for students preparing for engineering (JEE) and medical (NEET) entrance exams. 
              To use our platform, you must meet the following criteria:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Minimum Age:</strong> You must be at least <strong>13 years old</strong> to register an account on Brainiyo.
              </li>
              <li className={styles.listItem}>
                <strong>Under 18 Users (Minors):</strong> Under the <strong>Indian Contract Act, 1872</strong>, individuals under 18 
                are minors and cannot enter into binding contracts on their own. Therefore, if you are under 18 years old, 
                you must have your parent or legal guardian read and agree to these Terms on your behalf.
              </li>
            </ul>

            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <ShieldAlert size={20} />
                <span>Notice for Parents and Guardians</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p>
                  If you permit your child (under 18) to use Brainiyo, you are agreeing to guide their usage and take responsibility 
                  for their actions on the platform. All billing and paid subscriptions for minors <strong>must</strong> be processed 
                  with the explicit permission and involvement of a parent or guardian.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="accounts" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>3.</span> Account Registration & Security
            </h2>
            <p className={styles.paragraph}>
              To practice on Brainiyo, you must sign up and create a student profile. By doing so, you agree to:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Provide true, accurate, and complete registration details (such as your correct name, email, phone number, and age).
              </li>
              <li className={styles.listItem}>
                Keep your login details (OTP, email access, password) strictly confidential and secure.
              </li>
              <li className={styles.listItem}>
                Accept full responsibility for all activities, attempts, and purchases that happen under your account.
              </li>
            </ul>
            <p className={styles.paragraph}>
              If you suspect that someone else has access to your account, please email us immediately at 
              {" "}<a href="mailto:support@brainiyo.in" className={styles.emailLink}>support@brainiyo.in</a> so we can lock it and help you reset it.
            </p>
          </section>

          {/* Section 4 */}
          <section id="acceptable-use" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>4.</span> Acceptable Use Policy
            </h2>
            <p className={styles.paragraph}>
              Brainiyo is built for individual study and practice. To keep the community safe and fair, you agree 
              <strong> NOT</strong> to engage in any of the following activities:
            </p>

            <div className={`${styles.calloutCard} ${styles.warningCard}`}>
              <div className={`${styles.calloutCardHeader} ${styles.warningCardHeader}`}>
                <Ban size={20} />
                <span>Strictly Prohibited Activities</span>
              </div>
              <div className={styles.calloutCardContent}>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>No Account Sharing:</strong> Your account is for your personal use only. Sharing your login 
                    credentials with friends, coaching classmates, or hosting group study sessions using a single account is strictly forbidden.
                  </li>
                  <li className={styles.listItem}>
                    <strong>No Scraping or Copying:</strong> You may not use automated scripts, bots, scrapers, or web crawlers 
                    to extract practice questions, answers, solutions, explanations, or user interface designs from our database.
                  </li>
                  <li className={styles.listItem}>
                    <strong>No Impersonation:</strong> You must not represent yourself as another student, parent, or admin.
                  </li>
                  <li className={styles.listItem}>
                    <strong>No Reverse-Engineering:</strong> You must not try to copy, modify, hack, or reverse-engineer our 
                    personalized recommendation algorithms or spaced repetition engines.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="ip" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>5.</span> Intellectual Property Rights
            </h2>
            <p className={styles.paragraph}>
              All materials available on Brainiyo—including our database of 100k+ practice questions, chemical equations, 
              solutions, hints, graphics, code, software algorithms, spaced repetition logic, logos, and UI designs—are 
              the exclusive property of <strong>Brainiyo EdTech Technologies</strong>.
            </p>
            <p className={styles.paragraph}>
              We grant you a limited, non-exclusive, non-transferable, and revocable license to log in and use our platform 
              solely for your personal, non-commercial exam preparation. You may not publish, reprint, or redistribute 
              our questions or solutions anywhere else (including on social media, YouTube, or other websites) without 
              our written consent.
            </p>
          </section>

          {/* Section 6 */}
          <section id="subscriptions" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>6.</span> Subscriptions, Payments & Billing
            </h2>
            <p className={styles.paragraph}>
              We offer both free practice tiers and paid premium subscription plans. If you purchase a premium plan:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Pricing:</strong> The fees for premium plans are clearly displayed on our platform before checkout. 
                All fees are inclusive of applicable Indian taxes (GST) unless stated otherwise.
              </li>
              <li className={styles.listItem}>
                <strong>Payment Processing:</strong> All transactions are securely processed by <strong>Razorpay</strong>. 
                We do not store your credit/debit card numbers or bank credentials.
              </li>
              <li className={styles.listItem}>
                <strong>Refund Policy:</strong> In compliance with the <strong>Consumer Protection Act, 2019</strong> and industry 
                standards, all payments for digital subscriptions are pre-paid and <strong>non-refundable</strong>. Since we offer 
                free tier trials, we encourage you to try the platform before buying a premium plan.
              </li>
              <li className={styles.listItem}>
                <strong>Non-Payment:</strong> If Razorpay is unable to process your renewal payment, we reserve the right to 
                downgrade your account to the free tier until payment is resolved.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="disclaimer" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>7.</span> Results & Rank Disclaimer
            </h2>
            
            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <HelpCircle size={20} />
                <span>Important Disclaimer regarding JEE & NEET outcomes</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p style={{ marginBottom: "0.75rem" }}>
                  Brainiyo is an interactive practice and analytics tool built to assist your preparation. 
                  <strong> We do NOT guarantee admission to any college, selection in any exam, or any specific national rank 
                  or score in JEE or NEET.</strong>
                </p>
                <p>
                  Exam performance depends on many variables, including your dedication, actual test-day performance, 
                  and the relative scoring of other candidates. Our mock test scores are estimates of your preparation level 
                  and do not guarantee identical results in the actual NTA examinations.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="liability" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>8.</span> Limitation of Liability
            </h2>
            <p className={styles.paragraph}>
              To the maximum extent permitted by applicable Indian laws, <strong>Brainiyo EdTech Technologies</strong>, 
              its directors, and employees will not be held liable for any indirect, special, incidental, or consequential 
              damages (such as loss of data, loss of exam registration fees, or mental stress) arising out of your use or 
              inability to use the platform.
            </p>
            <p className={styles.paragraph}>
              In any event, our total liability to you for any claim regarding the service is strictly capped at the 
              <strong> total subscription fee paid by you to Brainiyo in the twelve (12) months</strong> preceding the claim.
            </p>
          </section>

          {/* Section 9 */}
          <section id="termination" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>9.</span> Account Suspension & Termination
            </h2>
            <p className={styles.paragraph}>
              We reserve the right, without prior notice, to temporarily suspend or permanently terminate your account and 
              block your access to Brainiyo if:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>You violate any part of these Terms of Service.</li>
              <li className={styles.listItem}>We detect account sharing, scraping bots, or unauthorized commercial exploitation.</li>
              <li className={styles.listItem}>We are required to do so by law or government directive.</li>
            </ul>
            <p className={styles.paragraph}>
              If your account is terminated due to violations of our Acceptable Use policy, you will forfeit any remaining 
              days on your premium subscription, and no refund will be issued.
            </p>
          </section>

          {/* Section 10 */}
          <section id="changes" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>10.</span> Changes to the Platform & Pricing
            </h2>
            <p className={styles.paragraph}>
              We are constantly updating Brainiyo to improve your practice experience. We reserve the right to add, modify, or 
              retire questions, mock tests, algorithms, and features at any time.
            </p>
            <p className={styles.paragraph}>
              We also reserve the right to adjust our subscription pricing. If you are on an active paid plan, we will notify 
              you of any price adjustments at least 30 days before your plan renews, giving you ample time to cancel your subscription 
              if you do not agree to the new pricing.
            </p>
          </section>

          {/* Section 11 */}
          <section id="governing-law" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>11.</span> Governing Law & Jurisdiction
            </h2>
            <p className={styles.paragraph}>
              These Terms of Service are governed by and interpreted in accordance with the laws of the **Republic of India**.
            </p>
            <p className={styles.paragraph}>
              Any dispute, claim, or legal action arising out of these Terms or your use of Brainiyo shall be resolved 
              exclusively in the competent courts located in **Delhi, India**.
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>12.</span> Legal Contact Details
            </h2>
            <p className={styles.paragraph}>
              If you have any questions, clarifications, or need to send legal notices regarding these Terms, please contact 
              our legal department:
            </p>

            <div className={styles.contactBox}>
              <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
                Brainiyo Legal Department
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Brainiyo EdTech Technologies
              </p>
              
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email Address</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:legal@brainiyo.in" className={styles.emailLink}>legal@brainiyo.in</a>
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Corporate Office</span>
                  <span className={styles.contactValue}>
                    Brainiyo EdTech Technologies,<br />
                    Connaught Place, New Delhi,<br />
                    Delhi - 110001, India
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
