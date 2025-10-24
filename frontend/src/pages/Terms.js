// src/pages/Terms.js
// Purpose: Terms and Conditions page

import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Terms and Conditions
        </h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using ConServe (the "Service"), you accept and agree
              to be bound by the terms and provision of this agreement. If you do
              not agree to these terms, please do not use this Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              2. User Accounts
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              To access certain features of the Service, you must register for an
              account. When you register, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              3. Research Submission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              When submitting research papers, you represent that you have the
              right to submit the content and grant ConServe the license to
              display, distribute, and archive your research. All submissions are
              subject to review and approval by administrators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              4. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All research papers remain the intellectual property of their
              respective authors. ConServe serves only as a repository and does
              not claim ownership of submitted content. Users must respect
              copyright and properly cite all sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              5. Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Upload malicious content or viruses</li>
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Submit false, misleading, or plagiarized content</li>
              <li>Use the Service for any illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              6. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account and access
              to the Service immediately, without prior notice, for conduct that
              we believe violates these Terms or is harmful to other users or the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              7. Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is provided "as is" without warranties of any kind. We
              do not guarantee that the Service will be uninterrupted, secure, or
              error-free. Research content is provided by users and we are not
              responsible for its accuracy or completeness.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              8. Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes. Your continued use of the
              Service after such modifications constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              9. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
              <br />
              <span className="font-semibold">
                NEUST College of Nursing
                <br />
                Cabanatuan City, Nueva Ecija, Philippines
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;