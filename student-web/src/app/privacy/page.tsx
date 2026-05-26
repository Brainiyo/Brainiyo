import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Cookie, UserCheck, Clock, Mail, FileCheck, Lock, AlertTriangle } from "lucide-react";
import styles from "./Privacy.module.css";

export default function PrivacyPage() {
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
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>
          How we look after your data while you master JEE and NEET
        </p>
        <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Navigation</h3>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}><a href="#introduction">Introduction</a></li>
            <li className={styles.navItem}><a href="#who-we-are">1. Who We Are</a></li>
            <li className={styles.navItem}><a href="#laws-we-follow">2. Indian Laws We Follow</a></li>
            <li className={styles.navItem}><a href="#data-we-collect">3. Data We Collect</a></li>
            <li className={styles.navItem}><a href="#how-we-use-data">4. How We Use Your Data</a></li>
            <li className={styles.navItem}><a href="#under-18">5. Students Under 18</a></li>
            <li className={styles.navItem}><a href="#third-parties">6. Third-Party Services</a></li>
            <li className={styles.navItem}><a href="#cookies">7. Cookie Policy</a></li>
            <li className={styles.navItem}><a href="#user-rights">8. Your Data Rights</a></li>
            <li className={styles.navItem}><a href="#data-retention">9. Data Retention</a></li>
            <li className={styles.navItem}><a href="#security">10. Data Security</a></li>
            <li className={styles.navItem}><a href="#changes">11. Policy Changes</a></li>
            <li className={styles.navItem}><a href="#grievance">12. Grievance Officer</a></li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div id="introduction" className={styles.introText}>
            <p>
              Hi there! Welcome to Brainiyo (<strong>brainiyo.in</strong>). We are an adaptive practice platform 
              designed to help you crack JEE and NEET exams. To help you study better, our systems need to collect 
              and understand some details about you and how you study. 
            </p>
            <p style={{ marginTop: "1rem" }}>
              We know legal documents can be boring and hard to read, so we have written this policy in plain, simple 
              English that a Class 11 student can easily understand. This policy explains what information we collect, 
              why we collect it, how we protect it, and what rights you have over your own data.
            </p>
          </div>

          {/* Section 1 */}
          <section id="who-we-are" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>1.</span> Who We Are
            </h2>
            <p className={styles.paragraph}>
              This platform is operated by <strong>Brainiyo EdTech Technologies</strong>. We are a registered 
              company located in <strong>Delhi, India</strong>. 
            </p>
            <p className={styles.paragraph}>
              Our main mission is to make JEE and NEET practice highly personal and efficient. We use smart algorithms, 
              spaced repetition (asking you questions right when you are about to forget them), mock tests, and 
              personalized analytics to help you study smarter.
            </p>
          </section>

          {/* Section 2 */}
          <section id="laws-we-follow" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>2.</span> Indian Laws We Follow
            </h2>
            <p className={styles.paragraph}>
              We take data protection very seriously. Your data is handled in strict compliance with Indian laws, including:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>India's IT Act, 2000</strong> and the <strong>IT (Amendment) Act, 2008</strong>.
              </li>
              <li className={styles.listItem}>
                The <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> (SPDI Rules).
              </li>
              <li className={styles.listItem}>
                The <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="data-we-collect" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>3.</span> Data We Collect About You
            </h2>
            <p className={styles.paragraph}>
              To run our practice tools and help you improve, we collect the following information:
            </p>
            
            <h3 className={styles.subHeading}><UserCheck size={18} /> A. Personal Details (Provided by you)</h3>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Name:</strong> To address you correctly on the portal and certificates.</li>
              <li className={styles.listItem}><strong>Email Address:</strong> To send you login codes, test schedules, and performance reports.</li>
              <li className={styles.listItem}><strong>Phone Number:</strong> To contact you for support and authenticate your account.</li>
              <li className={styles.listItem}><strong>Date of Birth:</strong> To verify your age (and check if you need parental consent).</li>
            </ul>

            <h3 className={styles.subHeading}><FileCheck size={18} /> B. Practice & Performance Data (Generated as you study)</h3>
            <p className={styles.paragraph}>
              Since we are an adaptive platform, we need to monitor how you interact with practice modules. This includes:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><strong>Practice History:</strong> Which questions you solved, your answers, and which topics you visited.</li>
              <li className={styles.listItem}><strong>Accuracy Scores:</strong> Your percentage correct on different chapters and mock tests.</li>
              <li className={styles.listItem}><strong>Time-Per-Question Data:</strong> Exactly how many seconds or minutes you spent on each question. This helps us see if you are struggling with speed or guessing.</li>
            </ul>

            <h3 className={styles.subHeading}><Lock size={18} /> C. Payment Details (For Premium Subscription purchases)</h3>
            <p className={styles.paragraph}>
              If you buy our premium plan, the payment transaction is handled directly by <strong>Razorpay</strong>, 
              our secure payment partner. Brainiyo <strong>does not</strong> store your credit card numbers, net banking pins, 
              or UPI details on our servers. Razorpay processes everything securely.
            </p>

            <h3 className={styles.subHeading}><Shield size={18} /> D. Technical & Device Info (Collected automatically)</h3>
            <p className={styles.paragraph}>
              We collect details like your device type (phone, tablet, or laptop), operating system (Android, iOS, Windows, macOS), 
              browser name, and IP address. This helps us find bugs and ensure our website runs fast on your screen.
            </p>
          </section>

          {/* Section 4 */}
          <section id="how-we-use-data" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>4.</span> How We Use Your Data
            </h2>
            <p className={styles.paragraph}>
              We only use your information for clear, direct educational purposes:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>To create your student profile and save your progress.</li>
              <li className={styles.listItem}>To run our <strong>Adaptive Engine</strong> (e.g., choosing which question to ask you next based on your past accuracy and speed).</li>
              <li className={styles.listItem}>To calculate your spaced-repetition schedules, reminding you to review weak concepts.</li>
              <li className={styles.listItem}>To provide you with personalized dashboards showing your strong and weak sub-topics.</li>
              <li className={styles.listItem}>To verify payments and enable premium features.</li>
              <li className={styles.listItem}>To analyze traffic on our landing page using <strong>Google Analytics</strong> (this data is combined and anonymous).</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="under-18" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>5.</span> Students Under 18 (Minors)
            </h2>
            
            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <AlertTriangle size={20} />
                <span>Under 18? Please read this carefully!</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p style={{ marginBottom: "0.75rem" }}>
                  Most of our users are between <strong>15 and 18 years old</strong> (Class 11, 12, and repeaters). 
                  Under India's Digital Personal Data Protection (DPDP) Act 2023, you are considered a minor. 
                </p>
                <p style={{ marginBottom: "0.75rem" }}>
                  Because of this, we require that you sign up only with the consent and permission of your 
                  <strong> parent or lawful guardian</strong>. By using Brainiyo, you confirm that your parent or guardian 
                  knows you are using our services and agrees to let us collect your practice details.
                </p>
                <p>
                  <strong>No Tracking or Advertisements:</strong> We promise that we do <strong>not</strong> engage in 
                  behavioral tracking or profiling for marketing purposes. We will never show you targeted advertisements on 
                  our platform, and we will never use your data in a way that harms your mental health or well-being.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="third-parties" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>6.</span> Third-Party Services We Use
            </h2>
            <p className={styles.paragraph}>
              We do not sell, rent, or distribute your private information to third-party marketing agencies. We only share 
              your data with trusted service providers who help us run Brainiyo:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Razorpay:</strong> To process subscription payments securely.
              </li>
              <li className={styles.listItem}>
                <strong>Google Analytics:</strong> To help us study how users navigate the website so we can design a better, 
                faster experience. Google Analytics receives anonymous usage statistics only.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="cookies" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>7.</span> Cookie Policy
            </h2>
            <p className={styles.paragraph}>
              Cookies are small files that websites place on your computer or mobile device. We use them for simple reasons:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>To keep you logged in to your account.</li>
              <li className={styles.listItem}>To remember your preferences, like whether you prefer light mode or dark mode.</li>
              <li className={styles.listItem}>To understand how users browse our website.</li>
            </ul>
            <p className={styles.paragraph}>
              You can turn off cookies in your browser settings at any time. However, if you disable them, some features 
              of Brainiyo (like staying logged in between sessions) might not work.
            </p>
          </section>

          {/* Section 8 */}
          <section id="user-rights" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>8.</span> Your Rights Over Your Data
            </h2>
            <p className={styles.paragraph}>
              Under the DPDP Act 2023, you (or your parents/guardians) have complete rights over your personal data:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Right to Access:</strong> You can ask us what personal data we hold about you and request a copy of it.
              </li>
              <li className={styles.listItem}>
                <strong>Right to Correction:</strong> If your name, email, date of birth, or phone number is wrong, you can ask 
                us to fix or update it.
              </li>
              <li className={styles.listItem}>
                <strong>Right to Erasure (Deletion):</strong> You have the right to ask us to delete your account and all 
                associated personal data from our servers.
              </li>
              <li className={styles.listItem}>
                <strong>Right to Nominate:</strong> You have the right to nominate someone else to manage your data rights 
                in case of emergency or inability to act.
              </li>
            </ul>
            <p className={styles.paragraph}>
              To use any of these rights, simply email our Grievance Officer at 
              {" "}<a href="mailto:grievance@brainiyo.in" className={styles.emailLink}>grievance@brainiyo.in</a>.
            </p>
          </section>

          {/* Section 9 */}
          <section id="data-retention" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>9.</span> How Long We Keep Your Data (Retention)
            </h2>
            <p className={styles.paragraph}>
              We keep your data on file as long as you have an active account with us. This ensures we can build your spaced 
              repetition history and track your long-term JEE/NEET prep metrics.
            </p>
            <p className={styles.paragraph}>
              If you delete your account, we will clean and erase your records. However, for legal, tax, and audit compliance 
              purposes (like tracking purchase histories via Razorpay), we retain transaction metadata for exactly 
              <strong> 2 years after account deletion</strong>. After this 2-year period, your records are permanently purged 
              from our active systems and archives.
            </p>
          </section>

          {/* Section 10 */}
          <section id="security" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>10.</span> Data Security
            </h2>
            <p className={styles.paragraph}>
              We protect your data using industry-standard security measures, including SSL encryption for all data transfers 
              and secure firewalls on our backend servers. 
            </p>
            <p className={styles.paragraph}>
              While we make every effort to keep your data 100% secure, please remember that no transfer of information over the 
              internet is completely bulletproof. We recommend using a strong password for your Brainiyo account and keeping 
              it private.
            </p>
          </section>

          {/* Section 11 */}
          <section id="changes" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>11.</span> Policy Changes
            </h2>
            <p className={styles.paragraph}>
              We may update this Privacy Policy from time to time as we add new learning features or if Indian laws change. 
              If we make major changes, we will notify you by sending an email or by putting a clear notice on our platform.
            </p>
          </section>

          {/* Section 12 */}
          <section id="grievance" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>12.</span> Grievance Officer & Contact
            </h2>
            <p className={styles.paragraph}>
              If you have any doubts about this policy, want to correct your data, want to request deletion of your account, 
              or have any complaint about how your data is being handled, you can reach out to our designated Grievance Officer:
            </p>

            <div className={styles.grievanceBox}>
              <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
                Mr. Sameer Verma
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Grievance Officer, Brainiyo EdTech Technologies
              </p>
              
              <div className={styles.grievanceGrid}>
                <div className={styles.grievanceItem}>
                  <span className={styles.grievanceLabel}>Email</span>
                  <span className={styles.grievanceValue}>
                    <a href="mailto:grievance@brainiyo.in" className={styles.emailLink}>grievance@brainiyo.in</a>
                  </span>
                </div>
                <div className={styles.grievanceItem}>
                  <span className={styles.grievanceLabel}>Address</span>
                  <span className={styles.grievanceValue}>
                    Brainiyo EdTech Technologies,<br />
                    Connaught Place, New Delhi,<br />
                    Delhi - 110001, India
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.infoBox}>
              <p className={styles.infoBoxText}>
                <em>Note: As required under Indian data privacy laws, we will look into your request/grievance and resolve 
                it within 15 days of receiving your email.</em>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
