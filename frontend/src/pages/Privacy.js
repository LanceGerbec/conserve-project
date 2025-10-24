// src/pages/Privacy.js
// Purpose: Privacy Policy page

import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Name, email address, and student/faculty ID</li>
              <li>Research papers and associated metadata</li>
              <li>Account credentials (encrypted)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              We use collected information for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Providing and maintaining the Service</li>
              <li>Processing research submissions and reviews</li>
              <li>Sending notifications about your submissions</li>
              <li>Improving our services and user experience</li>
              <li>Ensuring security and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. All passwords are encrypted,
              and we use secure protocols for data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4. Data Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell, trade, or rent your personal information to third
              parties. Research papers you submit become publicly accessible once
              approved, but your contact information remains private unless you
              choose to include it in your research.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              5. Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6. Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use local storage to maintain your session and preferences. We
              may collect analytics data to understand how users interact with our
              Service to improve functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data for as long as your account is active
              or as needed to provide services. Research papers are retained
              indefinitely as part of the academic repository unless you request
              removal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is intended for students and faculty of NEUST College
              of Nursing. We do not knowingly collect information from individuals
              under 18 without parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9. Changes to Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              10. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact:
              <br />
              <span className="font-semibold">
                NEUST College of Nursing Data Protection Officer
                <br />
                Email: privacy@conserve.neust.edu.ph
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;