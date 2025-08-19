<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0)
})
</script>

<template>
  <div class="terms-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <i class="pi pi-file-text"></i>
          <span>Legal Terms</span>
        </div>
        <h1 class="hero-title">Terms and Conditions</h1>
        <p class="hero-subtitle">
          Please read these terms carefully before using our AI agent platform and services
        </p>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <div class="content-container">
        <!-- Agreement Notice -->
        <div class="agreement-notice">
          <h3>This Agreement contains a binding arbitration clause. Please read the agreement carefully before accepting its terms and conditions.</h3>
          <p class="important-notice">
            <strong>IMPORTANT</strong> – PLEASE READ THESE TERMS CAREFULLY BEFORE APPLYING FOR, ACCEPTING, OR USING A BOTSIFY ONLINE ACCOUNT OR THE BOTSIFY NATURAL LANGUAGE PROCESSING SERVICES. BY USING, APPLYING FOR, OR ACCEPTING THE SERVICES OR BY CLICKING ON "I AGREE TO TERMS AND CONDITIONS" BUTTON, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS AGREEMENT, THAT YOU UNDERSTAND IT, AND THAT YOU AGREE TO BE BOUND BY ITS TERMS. IF YOU DO NOT AGREE TO THE TERMS AND CONDITIONS OF THIS AGREEMENT, DO NOT APPLY FOR, ACCEPT, OR USE A BOTSIFY ONLINE ACCOUNT OR THE BOTSIFY NATURAL LANGUAGE PROCESSING SERVICES.
          </p>
        </div>

        <!-- Terms Content -->
        <div class="terms-content">
          <!-- License Section -->
          <section class="terms-section">
            <h2>1. License</h2>
            
            <h3>1.1 Grant of License</h3>
            <p>
              Botsify.com ("Botsify") grants to you a limited, non-exclusive, non-transferrable and revocable license to BOTSIFY online voice and natural language processing services as well as any documentation, files, or website information accompanying the services ("Services") solely to the extent necessary for you to create a natural language interface that operates solely in connection with your devices ("Devices") and/or software services/applications ("Applications"). Any violation of the terms of this Agreement shall automatically revoke the license granted herein.
            </p>

            <h3>1.2 Limited License Service</h3>
            <p>
              Services include basic services ("Basic Services") provided free of charge and enhanced services ("Enhanced Services"), which, if available, must be purchased. The licenses granted herein are contingent upon Botsify's receipt of the applicable license fees and taxes due for the Enhanced Services. Fees paid for Enhanced Services shall allow you to use Enhanced Services for the duration of the subscription service, as applicable, as selected by you during your registration of the Enhanced Services ("Subscription Period"). The fees owned for the use of the Enhanced Services are set forth on BOTSIFY's website and are subject to change upon 30 days' advance written notice. License fees may vary depending on the usage of the Services. These fees are owed regardless of whether the Services is actually used. No refunds will be given for any unused Services or any early termination of the Subscription Period.
            </p>

            <h3>1.3 Trial, Evaluation, and Beta Services</h3>
            <p>
              If this Agreement pertains to a trial, beta, or evaluation license then the licenses granted under this Agreement will terminate upon the expiration or cancellation of the trial or evaluation period. You agree to use the Services and any services only for the duration of the trial or evaluation period and only for evaluation or testing purposes. All such licenses are limited to one per customer per promotion or beta test.
            </p>

            <h3>1.4 Restrictions</h3>
            <p>The licenses granted herein are only valid if:</p>
            <ul>
              <li>The Services are NOT modified in any manner</li>
              <li>All copyright and proprietary notices or labels in the Services are maintained in their original format</li>
              <li>The Services are only installed and used in accordance with your network security policies</li>
              <li>You possess the necessary authority and power to install the Services</li>
              <li>You promptly pay all license fees when due</li>
              <li>This Agreement is accepted without any modification</li>
              <li>You have not breached the terms of this Agreement in any manner</li>
            </ul>

            <h3>1.5 Registration</h3>
            <p>
              The Services require registration or activation to be used properly. You agree to provide accurate and complete information on all registration forms. Failure to complete the registration or activation may limit your ability to use the Services or may disable the Services from functioning. When registering or activating Services, you may be required to select a username and password. Maintaining the confidentiality of this password and username is your responsibility, and Botsify is not responsible for any loss or damage arising from unauthorized access to your account or your failure to comply with this section. You are fully responsible for any activities that occur under your username even if unauthorized. You must notify Botsify immediately of any unauthorized use of your account.
            </p>

            <h3>1.6 Minimum Registration Age</h3>
            <p>
              By registering for BOTSIFY account, you agree that you are older than 13 years of age.
            </p>
          </section>

          <!-- Services Section -->
          <section class="terms-section">
            <h2>2. Services</h2>
            
            <h3>2.1 Limited License</h3>
            <p>
              The licenses granted herein are only for the purpose of allowing you to connect to and use the Services for your personal or internal business use (including communicating with End Users). You will not use the services to perform natural language processing for any third parties other than End Users.
            </p>

            <h3>2.2 Delivery</h3>
            <p>
              Botsify shall provide you with a web interface and an API protocol based interface necessary to use the Services ("Interface"). You agree to access the Services only through the Interface and will not create any derivative works of the Interface or the Services. You agree not to circumvent any limitations to the Services or Interface as implemented by Botsify.
            </p>

            <h3>2.3 Storage</h3>
            <p>
              When using the Services, Botsify will save a copy of each record you designate as requiring storage. The saved records will be transferred over the Internet to a server operated by Botsify or an affiliate or partner of Botsify. Except as provided in Section 7, Botsify disclaims all liability for the Services, including any resulting from lost or compromised data. Botsify does not make any warranty that your data will be stored safely or securely, except that Botsify warrants that, in performing the Services, it and its affiliates and partners will comply with all applicable data protection legislation and other privacy laws, rules, and regulations when processing and storing personal data. Subject to the foregoing, You give Botsify permission to transmit all records designated by you as requiring storage to a remote data center operated by Botsify or an affiliate or partner of Botsify.com. ("Storage Servers").
            </p>

            <h3>2.4 Data Loss</h3>
            <p>
              Botsify.com. does not maintain a backup copy of the data stored on our servers and does not guarantee the information against loss or destruction. In the event that this Agreement is terminated, Botsify may in its sole discretion and without notice to you delete or deny access to the backed up data and such data or records will not be available to you. Botsify and its affiliates may retain (but shall have no obligation to retain) your data for a period of time after your subscription to the Services expires in order to allow you to renew the Subscription Period if desired.
            </p>

            <h3>2.5 File Deletion</h3>
            <p>
              Botsify does not maintain a copy of the data backed up to our servers and does not guarantee the information against loss or destruction. In the event that the licenses granted herein are revoked, lapse, or terminate, whether by you or by Botsify.com, including lapse of any trial or evaluation period, Botsify may, in its sole and absolute discretion, without notice to you, delete or deny access to the backed up data and such data or records will not be available to you. You agree that Botsify and its affiliates may retain (but shall have no obligation to retain) your data for a period after your trial or license has been terminated, expired, or otherwise lapsed, as part of Botsify's marketing to you the opportunity to purchase, renew, or extend a license.
            </p>

            <h3>2.6 Broadcast And Schedule Messages</h3>
            <p>
              Botsify will allow you to send broadcast and schedule messages to active users of the last 7 days. Because of facebook restrictions and conditions of spamming and non promotional messages we have this restriction.
            </p>

            <h3>2.7 End User Data</h3>
            <p>
              You acknowledge and agree that you are solely responsible for obtaining all required consents from End Users in connection with any use of your Devices or Applications, which consent shall be compliant with all applicable data protection legislation and other privacy laws, rules, and regulations. Before collecting any End User Data or other information from End Users, you must provide adequate notice of what End User Data and other information you collect and how it will be used and/or shared and obtain any necessary consents. You and your Devices and Applications shall comply comply with all privacy laws and regulations in connection with your access and use of the Services. You will provide and adhere to a privacy policy for your Device or Application that:
            </p>
            <ul>
              <li>Complies with all applicable laws, rules, and regulations</li>
              <li>Is conspicuously displayed to all End Users</li>
              <li>Clearly and accurately describes to End Users what data and user information you collect (such as personally identifiable information, login information, etc.) and how you use and share such information with Botsify and third parties.</li>
            </ul>

            <h3>2.8 Service Uptime</h3>
            <p>
              Botsify doesn't guarantee 100% uptime of the service, our uptime is usually 95%. For dedicated uptime upto 99% please contact <a href="mailto:support@botsify.com" class="email-link">support@botsify.com</a> for the quotation.
            </p>
          </section>

          <!-- Ownership Section -->
          <section class="terms-section">
            <h2>3. Ownership</h2>
            
            <h3>3.1 No Ownership Rights</h3>
            <p>
              The Services are being licensed, not sold. This Agreement does not grant any ownership rights to you and gives you only a limited license to use the Services during the term of the Agreement.
            </p>
          </section>

          <!-- Governing Law Section -->
          <section class="terms-section">
            <h2>12. Governing Law</h2>
            <p>
              This Agreement shall be construed, interpreted and governed by the laws of the State of California without regard to conflicts of law provisions thereof. You agree that the exclusive forum for any disputes arising out of or relating to this Agreement shall be an appropriate federal or state court sitting in Santa Clara County, State of California, USA.
            </p>
          </section>

          <!-- Arbitration Section -->
          <section class="terms-section">
            <h2>21. Arbitration</h2>
            <p>
              To the extent permitted by law, before you may begin arbitration with respect to a dispute involving any aspect of this Agreement, you shall notify Botsify, and any other party to the dispute for the purpose of seeking dispute resolution. If the dispute is not resolved within sixty (60) days after the initial notice, then a party may proceed in accordance with the following:
            </p>
            <p>
              <strong>21.1</strong> Any unresolved dispute arising under the terms of this Agreement shall be decided by arbitration conducted through the services of the American Arbitration Association (hereinafter referred to as the "AAA").
            </p>
            <p>
              <strong>21.2</strong> Notice of demand for an arbitration hearing shall be in writing and properly served upon the parties to this Agreement. Arbitration hearings shall be held in the state of California at a location mutually agreeable to the parties.
            </p>
            <p>
              <strong>21.3</strong> There shall be one Arbitrator to hear the matter. The parties shall initially agree to a panel of three possible Arbitrators to hear the matter and each party shall have the opportunity to name one Arbitrator to be dropped from the panel until one remains. The party giving notice of the Arbitration demand shall be first to indicate its selection.
            </p>
            <p>
              <strong>21.4</strong> All costs of the Arbitration and the AAA shall be borne equally by both parties to this agreement, regardless of the final decision. The defaulting party as determined by the Arbitrator, shall pay all other costs and expenses, including reasonable attorney's fees, incurred by the party in enforcing its rights under this Agreement.
            </p>
            <p>
              <strong>21.5</strong> You affirm that you are older than 18 years of age, and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in this agreement, and to abide by and comply with this agreement.
            </p>
          </section>

          <!-- Client Usage Section -->
          <section class="terms-section">
            <h2>22. Our Clients</h2>
            <p>
              By registering on Botsify with your company email address and activate it upon registration, we expect you are using Botsify for company purpose and we can use company name (Extracted from Email Address) as our clients; provided that Botsify will promptly remove your company name from all marketing materials upon your request.
            </p>
          </section>

          <!-- Acceptance Section -->
          <section class="terms-section">
            <h2>23. Acceptance</h2>
            <p>
              BY USING, APPLYING FOR, OR ACCEPTING THE SERVICES YOU AGREE THAT YOU HAVE READ AND UNDERSTAND THIS AGREEMENT AND THAT YOU WILL BE BOUND BY AND COMPLY WITH IT. DO NOT USE THE SERVICES IF YOU DO NOT AGREE TO THIS AGREEMENT.
            </p>
          </section>

          <!-- Fair Usage Policy -->
          <section class="terms-section">
            <h2>24. Fair Usage Policy</h2>
            <p>
              Botsify loads website widget as an iframe on your website so the amount of traffic on your website effects on our server performance. We therefore have a fair usage policy of 25 concurrent connections from your website. Means that at any particular point in time only 25 concurrent users can access your agent on your website. If you need more concurrent users accessing the agent, you can contact <a href="mailto:support@botsify.com" class="email-link">support@botsify.com</a> with your requirements.
            </p>
          </section>
        </div>

        <!-- Footer -->
        <div class="terms-footer">
          <p class="footer-text">
            By using Botsify, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
          </p>
          <div class="footer-links">
            <router-link to="/privacy-policy" class="footer-link">Privacy Policy</router-link>
            <a href="mailto:support@botsify.com" class="footer-link">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global Styles */
.terms-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--space-8) var(--space-6) var(--space-7);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 180deg,
    #ff0080,
    #7928ca,
    #2afadf,
    #7928ca,
    #ff0080
  );
  filter: blur(60px);
  opacity: 0.6;
  z-index: 0;
}

.hero-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#ffffff20 1px, transparent 1px);
  background-size: 4px 4px;
  opacity: 0.18;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}

.hero-section > * {
  position: relative;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 20px;
  border-radius: 50px;
  color: #fff;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #feda75, #d21efa, #d62976, #962fbf, #4f5bd5);
  background-size: 600% 600%;
  animation: gradientShift 6s ease infinite;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.1;
  color: #384348;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0;
  color: white;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Content Section */
.content-section {
  background: white;
  padding: var(--space-8) var(--space-6);
}

.content-container {
  max-width: 900px;
  margin: 0 auto;
}

.agreement-notice {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.agreement-notice h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-error);
  margin-bottom: var(--space-4);
  text-align: center;
}

.important-notice {
  color: var(--color-text-primary);
  line-height: 1.6;
  font-size: 0.875rem;
  margin: 0;
}

.important-notice strong {
  color: var(--color-error);
  font-weight: 700;
}

.terms-content {
  margin-bottom: var(--space-8);
}

.terms-section {
  margin-bottom: var(--space-8);
}

.terms-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-primary);
}

.terms-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--space-5) 0 var(--space-3) 0;
}

.terms-section p {
  color: var(--color-text-primary);
  line-height: 1.7;
  margin-bottom: var(--space-4);
  font-size: 0.9rem;
}

.terms-section ul {
  margin: var(--space-3) 0;
  padding-left: var(--space-5);
}

.terms-section li {
  color: var(--color-text-primary);
  line-height: 1.6;
  margin-bottom: var(--space-2);
  font-size: 0.9rem;
}

.email-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-normal);
}

.email-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.terms-footer {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  border: 1px solid var(--color-border);
}

.footer-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-4);
  line-height: 1.6;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.footer-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color var(--transition-normal);
}

.footer-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .content-section {
    padding: var(--space-6) var(--space-4);
  }

  .content-container {
    padding: 0;
  }

  .terms-section h2 {
    font-size: 1.25rem;
  }

  .terms-section h3 {
    font-size: 1rem;
  }

  .footer-links {
    flex-direction: column;
    gap: var(--space-3);
  }

  .agreement-notice {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-6) var(--space-4);
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .content-section {
    padding: var(--space-4) var(--space-3);
  }
}

/* Dark Theme Support */
[data-theme="dark"] .terms-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

[data-theme="dark"] .content-section {
  background: var(--color-bg-primary);
}

[data-theme="dark"] .terms-footer {
  background: var(--color-bg-tertiary);
}

[data-theme="dark"] .agreement-notice {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Print Styles */
@media print {
  .terms-view {
    background: white;
    color: black;
  }
  
  .hero-section {
    background: #2E66F4;
    color: white;
  }
  
  .terms-section {
    break-inside: avoid;
  }
}
</style> 