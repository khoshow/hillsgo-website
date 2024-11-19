import React from "react";
import Header from "@/components/Header";
import styles from "../styles/Home.module.css";

const PrivacyPolicy = () => {
  return (
    <>
      <div className={styles.main}>
        <Header />
        <div
          style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
          className="container"
        >
          <h1>Privacy Policy</h1>
          <p>
            <strong>Effective Date:</strong> 19th November 2024
          </p>
          <p>
            <strong>HillsGO</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our
            services, including our app/website.
          </p>
          <p>
            By using our services, you agree to the terms of this Privacy
            Policy. If you do not agree, please do not use our services.
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Personal Information:</strong> Information that identifies
              you, such as your name, email address, phone number, and payment
              details, when you provide it to us voluntarily.
            </li>
            <li>
              <strong>Non-Personal Information:</strong> Data about your use of
              our services, such as device information, location, and browsing
              activity.
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> Cookies and similar
              technologies to improve your experience and analyze usage
              patterns.
            </li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide, maintain, and improve our services.</li>
            <li>
              Communicate with you, including for customer support and updates.
            </li>
            <li>Personalize your experience.</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>
            We do not sell your personal information. However, we may share it
            with:
          </p>
          <ul>
            <li>
              <strong>Service Providers:</strong> Third-party vendors who assist
              us in providing services.
            </li>
            <li>
              <strong>Legal Compliance:</strong> Authorities, if required by law
              or to protect our legal rights.
            </li>
          </ul>

          <h2>4. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal information.</li>
            <li>Opt-out of marketing communications.</li>
            <li>Restrict or object to certain data processing activities.</li>
          </ul>
          <p>
            To exercise these rights, contact us at
            <strong> contact@hillsgo.com</strong>.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your
            information. However, no system is completely secure, and we cannot
            guarantee the security of your data.
          </p>

          <h2>6. Third-Party Links</h2>
          <p>
            Our services may contain links to third-party websites or services.
            We are not responsible for their privacy practices.
          </p>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated
            version will be posted with a new &quot;Effective Date.&quot;
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>Email: contact@hillsgo.com</li>
            <li>Webiste:www.hillsgo.com</li>
            <li>Address: Senapati, India</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
