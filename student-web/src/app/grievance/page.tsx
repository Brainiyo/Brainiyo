import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Mail, Scale, Shield, AlertCircle, FileText, CheckCircle2, Landmark } from "lucide-react";
import styles from "./Grievance.module.css";

export default function GrievancePage() {
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
        <h1 className={styles.title}>Grievance Redressal</h1>
        <p className={styles.subtitle}>
          Help and grievance mechanisms as required under the Indian IT Rules 2021
        </p>
        <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Navigation</h3>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}><a href="#framework">1. Legal Framework</a></li>
            <li className={styles.navItem}><a href="#officer">2. Grievance Officer</a></li>
            <li className={styles.navItem}><a href="#types">3. Covered Complaints</a></li>
            <li className={styles.navItem}><a href="#submission">4. How to Submit</a></li>
            <li className={styles.navItem}><a href="#timelines">5. Response Timelines</a></li>
            <li className={styles.navItem}><a href="#escalation">6. Escalation & Consumer Rights</a></li>
            <li className={styles.navItem}><a href="#office">7. Registered Office</a></li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div className={styles.introText}>
            <p>
              At Brainiyo (<strong>brainiyo.in</strong>), we aim to provide a seamless learning experience for our 
              students. However, if you face any issues, encounter content errors, or have concerns about data privacy, 
              we have a formal grievance redressal system to help you resolve them quickly.
            </p>
            <p style={{ marginTop: "1rem" }}>
              This policy describes our grievance resolution mechanism in compliance with the laws of India. It outlines 
              how to contact our Grievance Officer, the timelines we commit to, and your rights if you need to escalate 
              an issue.
            </p>
          </div>

          {/* Section 1 */}
          <section id="framework" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>1.</span> Legal Framework
            </h2>
            <p className={styles.paragraph}>
              This Grievance Redressal Policy is published in accordance with the provisions of:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Rule 3(2) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
              </li>
              <li className={styles.listItem}>
                The <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> regarding user data concerns.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="officer" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>2.</span> Designated Grievance Officer
            </h2>
            <p className={styles.paragraph}>
              If you have any complaints or concerns, you can contact our designated Grievance Officer directly. 
              We have appointed a senior representative to oversee customer and data grievances:
            </p>

            <div className={styles.contactBox}>
              <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
                Mr. Sameer Verma
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Grievance Officer, Brainiyo EdTech Technologies
              </p>
              
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email Address</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:grievance@brainiyo.in" className={styles.emailLink}>grievance@brainiyo.in</a>
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Designation</span>
                  <span className={styles.contactValue}>
                    Grievance Officer & Data Safety Head
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="types" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>3.</span> Types of Complaints Covered
            </h2>
            <p className={styles.paragraph}>
              Our Grievance Officer handles official complaints concerning the following areas:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Privacy Violations:</strong> Concerns regarding unauthorized collection, handling, or processing 
                of your personal data.
              </li>
              <li className={styles.listItem}>
                <strong>Content Issues:</strong> Reporting copyright violations, offensive/incorrect solutions, or major 
                typographical errors in our 100k+ question bank.
              </li>
              <li className={styles.listItem}>
                <strong>Account Disputes:</strong> Accounts that were suspended or terminated incorrectly under our terms.
              </li>
              <li className={styles.listItem}>
                <strong>Payment & Refund Issues:</strong> Unresolved billing errors, duplicate charges on Razorpay, or delays 
                in receiving approved refunds.
              </li>
              <li className={styles.listItem}>
                <strong>Data Rights Requests:</strong> Requests to access, correct, delete, or port your data under the DPDP Act 2023.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="submission" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>4.</span> Complaint Submission Process
            </h2>
            <p className={styles.paragraph}>
              To file a formal complaint, please send an email to 
              {" "}<a href="mailto:grievance@brainiyo.in" className={styles.emailLink}>grievance@brainiyo.in</a> using your registered 
              email address. To help us process it quickly, please format your email as follows:
            </p>

            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <FileText size={20} />
                <span>Subject Line Format:</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p style={{ fontFamily: "monospace", padding: "0.5rem 1rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontWeight: 700 }}>
                  GRIEVANCE – [Type of Issue] – [User ID / Order ID]
                </p>
                <p style={{ marginTop: "1rem" }}>
                  Please include the following details in your email description:
                </p>
                <ul className={styles.list} style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                  <li className={styles.listItem}>Your full name and contact number.</li>
                  <li className={styles.listItem}>The email address linked to your Brainiyo account.</li>
                  <li className={styles.listItem}>A clear, detailed description of the issue or dispute.</li>
                  <li className={styles.listItem}>Supporting documents or screenshots (such as payment receipts or content screenshots).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="timelines" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>5.</span> Response and Resolution Timelines
            </h2>
            <p className={styles.paragraph}>
              We are committed to resolving your concerns in a prompt and structured manner:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Acknowledgement (Within 24 Hours):</strong> We will send a confirmation reply within 24 hours of receiving your 
                email, containing a unique ticket reference number for tracking.
              </li>
              <li className={styles.listItem}>
                <strong>Initial Investigation:</strong> Our support and legal team will investigate the complaint and may contact 
                you if further details or clarifications are needed.
              </li>
              <li className={styles.listItem}>
                <strong>Resolution (Within 30 Days):</strong> As mandated by the **Information Technology Rules, 2021**, we will resolve 
                your grievance and communicate our final decision or action plan to you within **30 days** of receiving your complaint. 
                *(Note: Most common disputes are resolved much faster, typically within 7–15 business days).*
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="escalation" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>6.</span> Escalation and Consumer Rights
            </h2>
            <p className={styles.paragraph}>
              We make every effort to resolve grievances internally to your complete satisfaction.
            </p>
            <p className={styles.paragraph}>
              However, if you feel your complaint has not been adequately addressed, or if we fail to resolve it within the statutory 
              30-day timeline, you have the right to escalate the matter. Under the **Consumer Protection Act, 2019**, you can file 
              a complaint with the relevant Consumer Disputes Redressal Commission (Consumer Court) or approach the appropriate government 
              consumer forums (such as the National Consumer Helpline).
            </p>
          </section>

          {/* Section 7 */}
          <section id="office" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>7.</span> Registered Office Address
            </h2>
            <p className={styles.paragraph}>
              For sending physical letters, legal notices, or formal documents, please write to our corporate office address:
            </p>

            <div className={styles.calloutCard} style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className={styles.calloutCardHeader} style={{ color: "var(--text)" }}>
                <Landmark size={20} />
                <span>Corporate Office Address</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                  Brainiyo EdTech Technologies
                </p>
                <p style={{ marginTop: "0.25rem", color: "var(--text-secondary)" }}>
                  Connaught Place, New Delhi,<br />
                  Delhi - 110001, India
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
