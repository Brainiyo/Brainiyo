import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldAlert, Award, AlertTriangle, AlertCircle, HelpCircle, ServerCrash, Landmark, Scale } from "lucide-react";
import styles from "./Disclaimer.module.css";

export default function DisclaimerPage() {
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
        <h1 className={styles.title}>Disclaimer</h1>
        <p className={styles.subtitle}>
          Important legal disclaimers about rank guarantees, NTA affiliation, and content accuracy
        </p>
        <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Outline</h3>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}><a href="#overview">Overview</a></li>
            <li className={styles.navItem}><a href="#no-guarantee">1. No Guarantee of Results</a></li>
            <li className={styles.navItem}><a href="#no-affiliation">2. Not Affiliated with NTA</a></li>
            <li className={styles.navItem}><a href="#accuracy">3. Question & Syllabus Accuracy</a></li>
            <li className={styles.navItem}><a href="#third-party">4. Third-Party Links</a></li>
            <li className={styles.navItem}><a href="#availability">5. Platform Availability</a></li>
            <li className={styles.navItem}><a href="#professional-advice">6. Not Professional Advice</a></li>
            <li className={styles.navItem}><a href="#liability">7. Limitation of Liability</a></li>
            <li className={styles.navItem}><a href="#contact">Contact Support</a></li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div id="overview" className={styles.introText}>
            <p>
              Please read these disclaimers carefully before using the Brainiyo practice platform (<strong>brainiyo.in</strong>), 
              operated by <strong>Brainiyo EdTech Technologies</strong>. 
            </p>
            <p style={{ marginTop: "1rem" }}>
              These disclaimers clarify the limits of our responsibilities and help set the correct expectations for students, 
              parents, and educators using our study tools. By using Brainiyo, you acknowledge and agree to the disclaimers 
              outlined on this page.
            </p>
          </div>

          {/* Section 1 */}
          <section id="no-guarantee" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>1.</span> No Guarantee of Results
            </h2>
            <p className={styles.paragraph}>
              Brainiyo is designed to be a self-study practice and diagnostics tool. We provide high-quality practice questions, 
              simulated mock tests, spaced repetition scheduling, and analytical feedback to highlight your weak sub-topics.
            </p>
            
            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <Award size={20} />
                <span>Rank and Selection Disclaimer</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p>
                  <strong>We do NOT guarantee, warrant, or promise any specific rank, percentile, score, or admission 
                  outcome in the Joint Entrance Examination (JEE) or the National Eligibility cum Entrance Test (NEET).</strong> 
                  Your performance in actual examinations depends on various independent factors, including your self-discipline, 
                  examination conditions, revision quality, and the relative scores of other candidates.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="no-affiliation" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>2.</span> Not Affiliated with NTA or Government Bodies
            </h2>
            <p className={styles.paragraph}>
              Brainiyo is an entirely independent educational technology platform developed and operated by 
              <strong> Brainiyo EdTech Technologies</strong>.
            </p>
            <p className={styles.paragraph}>
              We are <strong>not</strong> affiliated with, endorsed by, sponsored by, or in any way officially connected 
              to the **National Testing Agency (NTA)**, the **Central Board of Secondary Education (CBSE)**, the **Joint 
              Admission Board (JAB)**, or any other government department or examination authority in India. Any reference to 
              "JEE", "NEET", "NTA", or official exam patterns is purely for identification and educational prep purposes.
            </p>
          </section>

          {/* Section 3 */}
          <section id="accuracy" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>3.</span> Question and Syllabus Accuracy
            </h2>
            <p className={styles.paragraph}>
              Our question database contains over 100k+ questions curated by subject-matter experts. While we make every 
              reasonable effort to review explanations, answers, and chemical/mathematical formulas for accuracy, typographical 
              errors or syllabus misalignment may occasionally occur.
            </p>
            <p className={styles.paragraph}>
              NCERT textbooks and official notifications from the NTA remain the final and authoritative sources for syllabus, 
              curriculum, question patterns, and marking schemes. We advise students to cross-verify disputed answers with official 
              curriculum guides.
            </p>
          </section>

          {/* Section 4 */}
          <section id="third-party" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>4.</span> Third-Party Links and Resources
            </h2>
            <p className={styles.paragraph}>
              Our website may contain links to external sites (such as official NTA notice boards, NCERT download sites, or educational 
              blogs). 
            </p>
            <p className={styles.paragraph}>
              Brainiyo has no control over the content, security, privacy policies, or availability of these external websites. 
              Linking to an external site does not imply that we endorse its content, and we are not liable for any issues, spam, 
              or malware encountered on third-party sites.
            </p>
          </section>

          {/* Section 5 */}
          <section id="availability" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>5.</span> Platform Availability and Downtime
            </h2>
            <p className={styles.paragraph}>
              We strive to keep Brainiyo available 24/7 to support your preparation. However, we do **not** guarantee uninterrupted, 
              error-free access to our servers. 
            </p>
            <p className={styles.paragraph}>
              We may occasionally suspend or restrict access to parts of the platform to conduct essential updates, server maintenance, 
              database optimization, or bug fixes. We will make reasonable efforts to schedule planned maintenance during hours of 
              low activity and will notify active users beforehand where possible.
            </p>
          </section>

          {/* Section 6 */}
          <section id="professional-advice" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>6.</span> Not a Substitute for Professional Counselling
            </h2>
            <p className={styles.paragraph}>
              The analytics dashboards, accuracy indexes, heatmaps, and recommendation strings provided by Brainiyo are intended to guide 
              your practice schedules. 
            </p>
            <p className={styles.paragraph}>
              This data does <strong>not</strong> constitute professional academic counselling, career selection guidance, or psychological 
              advice. Brainiyo should be used as a support tool alongside structured classroom instructions and the guidance of 
              qualified educators.
            </p>
          </section>

          {/* Section 7 */}
          <section id="liability" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>7.</span> Limitation of Liability
            </h2>
            
            <div className={`${styles.calloutCard} ${styles.warningCard || ""}`} style={{ borderColor: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.03)" }}>
              <div className={styles.calloutCardHeader} style={{ color: "var(--danger)" }}>
                <Scale size={20} />
                <span>Liability Capping Clause</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p>
                  To the full extent permitted by Indian laws, Brainiyo EdTech Technologies, its directors, and content partners 
                  shall not be held liable for any damages (direct, indirect, or consequential) resulting from errors in our content, 
                  system downtime, or loss of practice history.
                </p>
                <p style={{ marginTop: "0.5rem" }}>
                  In any event, our total liability for any claim under these terms or usage is strictly limited and capped at 
                  the **total subscription fees paid by you to Brainiyo in the three (3) months** immediately preceding the date 
                  the claim arose.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="contact" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              Contact & Support
            </h2>
            <p className={styles.paragraph}>
              If you have any questions about this disclaimer page, or if you spot any errors in our questions that you would 
              like us to verify and fix, please reach out:
            </p>

            <div className={styles.contactBox}>
              <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
                Brainiyo Legal & Content Support
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Brainiyo EdTech Technologies
              </p>
              
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>General Queries</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:support@brainiyo.in" className={styles.emailLink}>support@brainiyo.in</a>
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Legal Queries</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:legal@brainiyo.in" className={styles.emailLink}>legal@brainiyo.in</a>
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
