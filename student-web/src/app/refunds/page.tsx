import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, CreditCard, Mail, HelpCircle, XCircle, Ban, AlertCircle, ShieldCheck } from "lucide-react";
import styles from "./Refunds.module.css";

export default function RefundsPage() {
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
        <h1 className={styles.title}>Refund & Cancellation</h1>
        <p className={styles.subtitle}>
          Simple rules about plans, cancellation, and refund requests
        </p>
        <span className={styles.lastUpdated}>Last Updated: May 26, 2026</span>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Policy Outline</h3>
          <ul className={styles.navMenu}>
            <li className={styles.navItem}><a href="#overview">1. Policy Overview</a></li>
            <li className={styles.navItem}><a href="#free-trial">2. Free Tier & Trials</a></li>
            <li className={styles.navItem}><a href="#refund-rules">3. Refund Eligibility Rules</a></li>
            <li className={styles.navItem}><a href="#annual-plan">4. Annual Plan Pro-Rata</a></li>
            <li className={styles.navItem}><a href="#renewals">5. Renewal Grace Period</a></li>
            <li className={styles.navItem}><a href="#fees">6. Razorpay Fees Note</a></li>
            <li className={styles.navItem}><a href="#request-refund">7. How to Ask for a Refund</a></li>
            <li className={styles.navItem}><a href="#cancellation">8. How to Cancel Subscription</a></li>
            <li className={styles.navItem}><a href="#access">9. Post-Cancellation Access</a></li>
            <li className={styles.navItem}><a href="#unused-days">10. Unused Days Rule</a></li>
            <li className={styles.navItem}><a href="#laws">11. Governing Laws</a></li>
            <li className={styles.navItem}><a href="#support">12. Billing Support</a></li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div className={styles.introText}>
            <p>
              Thank you for preparing for JEE and NEET with Brainiyo (<strong>brainiyo.in</strong>). We want to make sure 
              you have a clear understanding of how our subscription plans work, how you can cancel them, and under 
              what terms refunds are processed.
            </p>
            <p style={{ marginTop: "1rem" }}>
              We have written this policy in plain, simple English with clear headings. As an Indian EdTech platform operated 
              by <strong>Brainiyo EdTech Technologies</strong>, we ensure our policies are fair, transparent, and comply with 
              applicable Indian consumer protection standards.
            </p>
          </div>

          {/* Section 1 */}
          <section id="overview" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>1.</span> Policy Overview
            </h2>
            <p className={styles.paragraph}>
              Brainiyo offers both <strong>monthly</strong> and <strong>annual</strong> subscription plans. These plans unlock 
              unlimited practice questions, spaced repetition (SRS) scheduling, custom study paths, and detailed analytics. 
              All payments on our platform are processed securely in Indian Rupees (INR) using our payment partner, 
              <strong> Razorpay</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="free-trial" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>2.</span> Free Tier & Trials
            </h2>
            <p className={styles.paragraph}>
              To make sure Brainiyo is the right fit for your exam preparation, we offer a **Free Essential Tier**. 
              This allows you to solve up to 30 questions per day and preview our dashboard analytics without entering any credit 
              card or payment details. 
            </p>
            <p className={styles.paragraph}>
              We highly recommend using our free features to check out the question quality and our interface before making a purchase.
            </p>
          </section>

          {/* Section 3 */}
          <section id="refund-rules" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>3.</span> Refund Eligibility Rules
            </h2>
            <p className={styles.paragraph}>
              If you decide to upgrade to a premium plan and find it doesn't meet your needs, you can request a refund under the 
              following conditions:
            </p>
            
            <div className={styles.calloutCard}>
              <div className={styles.calloutCardHeader}>
                <ShieldCheck size={20} />
                <span>7-Day Standard Refund Policy</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p style={{ marginBottom: "0.5rem" }}>
                  You are eligible for a <strong>full refund</strong> of your purchase price if:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    You submit your refund request within exactly <strong>7 calendar days</strong> from the date of purchase, **AND**
                  </li>
                  <li className={styles.listItem}>
                    You have solved <strong>fewer than 50 questions</strong> on the practice portal in total since buying the subscription.
                  </li>
                </ul>
              </div>
            </div>

            <div className={`${styles.calloutCard} ${styles.infoCard}`}>
              <div className={`${styles.calloutCardHeader} ${styles.infoCardHeader}`}>
                <AlertCircle size={20} />
                <span>When are refunds NOT eligible?</span>
              </div>
              <div className={styles.calloutCardContent}>
                <p>
                  No refunds will be granted if the request is submitted more than 7 days after the purchase date, or if 
                  you have solved 50 or more questions. This prevents misuse of our test database and conceptual materials.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="annual-plan" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>4.</span> Annual Plan Pro-Rata Policy
            </h2>
            <p className={styles.paragraph}>
              For students on our **Annual Subscription Plan**, we provide extra flexibility:
            </p>
            <p className={styles.paragraph}>
              If you request a refund within **15 days of purchase** (even if you have solved more than 50 questions), we will 
              consider a **pro-rata refund**. This means we will deduct the cost of one standard single month of premium access 
              along with payment gateway charges, and return the remaining amount to you. No pro-rata refunds will be entertained 
              after the 15-day mark.
            </p>
          </section>

          {/* Section 5 */}
          <section id="renewals" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>5.</span> Renewal Charges & Grace Period
            </h2>
            <p className={styles.paragraph}>
              To prevent any interruption in your JEE/NEET studies, monthly and annual subscriptions may renew automatically. 
              We do not issue refunds for automatic renewal charges if you simply forgot to cancel before the billing cycle.
            </p>
            <p className={styles.paragraph}>
              However, we offer a **48-hour grace period** from the renewal date. If your subscription auto-renews and you contact 
              us within 48 hours without having solved any new questions during those 48 hours, we will cancel the renewal and 
              refund the charge.
            </p>
          </section>

          {/* Section 6 */}
          <section id="fees" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>6.</span> Razorpay Transaction Fees
            </h2>
            <p className={styles.paragraph}>
              Please note that third-party payment gateway transaction fees (charged by Razorpay, typically around 2% to 3% of 
              the total transaction value) are charged directly by the gateway provider and are **non-refundable**. In cases where 
              a refund is approved, we will return the subscription value minus these transaction fees.
            </p>
          </section>

          {/* Section 7 */}
          <section id="request-refund" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>7.</span> How to Request a Refund
            </h2>
            <p className={styles.paragraph}>
              To request a refund, please follow these steps:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                Send an email from your registered Brainiyo email address to: 
                {" "}<a href="mailto:refunds@brainiyo.in" className={styles.emailLink}>refunds@brainiyo.in</a>.
              </li>
              <li className={styles.listItem}>
                Use the subject line: <strong>Refund Request – [Your Order ID / Payment ID]</strong>. You can find this ID in your 
                Razorpay email receipt.
              </li>
              <li className={styles.listItem}>
                State the reason you are requesting a refund (your feedback helps us make the platform better!).
              </li>
            </ul>
            <p className={styles.paragraph}>
              <strong>Processing Time:</strong> Once your refund request is verified and approved, it will take 
              <strong> 5 to 7 business days</strong> for the funds to reflect in your original payment method (bank account, 
              UPI, credit card, or wallet used during purchase).
            </p>
          </section>

          {/* Section 8 */}
          <section id="cancellation" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>8.</span> How to Cancel Your Subscription
            </h2>
            <p className={styles.paragraph}>
              You can cancel your subscription at any time. You do not need to call us. You can cancel using either 
              of the following options:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <strong>Account Settings:</strong> Log in to your student portal, go to <strong>My Profile &gt; Subscriptions</strong>, 
                and click on the **Cancel Subscription** button.
              </li>
              <li className={styles.listItem}>
                <strong>Email Support:</strong> Send an email requesting cancellation to 
                {" "}<a href="mailto:support@brainiyo.in" className={styles.emailLink}>support@brainiyo.in</a> at least 24 hours 
                before your next billing date.
              </li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="access" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>9.</span> Access After Cancellation
            </h2>
            <p className={styles.paragraph}>
              When you cancel your subscription, you will not lose access immediately. Your premium membership will remain 
              active, and you can continue to practice with premium features, until the **end of your current billing period**.
            </p>
            <p className={styles.paragraph}>
              For example, if your monthly billing date is June 15th and you cancel on June 1st, you will keep premium access 
              until June 15th. After June 15th, your account will downgrade to the Free tier.
            </p>
          </section>

          {/* Section 10 */}
          <section id="unused-days" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>10.</span> No Partial Refunds for Unused Days
            </h2>
            <p className={styles.paragraph}>
              We do not provide partial refunds or credits for unused days in the middle of a billing cycle. If you cancel your 
              subscription halfway through your billing month, you will not receive a refund for the remaining days of that month.
            </p>
          </section>

          {/* Section 11 */}
          <section id="laws" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>11.</span> Governing Laws
            </h2>
            <p className={styles.paragraph}>
              This policy is governed by the laws of the **Republic of India** and is in compliance with the **Consumer Protection 
              (E-Commerce) Rules, 2020** issued under the **Consumer Protection Act, 2019**.
            </p>
          </section>

          {/* Section 12 */}
          <section id="support" className={styles.section}>
            <h2 className={styles.sectionHeading}>
              <span className={styles.sectionNumber}>12.</span> Billing Support Contact
            </h2>
            <p className={styles.paragraph}>
              For any questions regarding billing errors, double payments, or subscription issues, you can contact our support team:
            </p>

            <div className={styles.contactBox}>
              <h3 style={{ margin: 0, fontFamily: "Outfit", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
                Brainiyo Support Team
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>
                Brainiyo EdTech Technologies
              </p>
              
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Billing Email</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:support@brainiyo.in" className={styles.emailLink}>support@brainiyo.in</a>
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Refunds Email</span>
                  <span className={styles.contactValue}>
                    <a href="mailto:refunds@brainiyo.in" className={styles.emailLink}>refunds@brainiyo.in</a>
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
