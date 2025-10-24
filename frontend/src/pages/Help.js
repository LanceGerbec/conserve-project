// src/pages/Help.js
// Purpose: Help and FAQ page

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I register for an account?',
      answer: 'Click the "Register" button in the navigation bar, fill in your details including your name, email, and choose whether you are a student or faculty member. Students will need to provide their Student ID.'
    },
    {
      question: 'How do I search for research papers?',
      answer: 'Use the search bar on the home page. You can search by title, author name, or keywords. Our smart search system can handle typos and will show relevant results.'
    },
    {
      question: 'How do I submit my research?',
      answer: 'After logging in, click "Submit Your Research" from the home page. Fill in all required information including title, abstract, authors, keywords, and upload your PDF file.'
    },
    {
      question: 'How long does it take for my research to be approved?',
      answer: 'Research submissions are reviewed by administrators. The approval process typically takes 2-5 business days. You will receive an email notification once your research is approved or if revisions are needed.'
    },
    {
      question: 'Can I bookmark research papers?',
      answer: 'Yes! When viewing any research paper, click the bookmark icon to save it to your bookmarks. You can access all your bookmarked papers from the Bookmarks section in the navigation menu.'
    },
    {
      question: 'How do I cite a research paper?',
      answer: 'Each research detail page includes a citation button that provides properly formatted citations in various styles (APA, MLA, Chicago).'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security seriously. All passwords are encrypted, and we follow best practices for data protection and privacy.'
    },
    {
      question: 'Who can I contact for technical support?',
      answer: 'For technical support, please contact the NEUST College of Nursing IT department or email support through the contact information provided in the About page.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about ConServe
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Learn how to create an account and navigate ConServe
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-3">📤</div>
            <h3 className="font-bold text-gray-900 mb-2">Submitting Research</h3>
            <p className="text-sm text-gray-600">
              Guidelines for submitting your research papers
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-900 mb-2">Search Tips</h3>
            <p className="text-sm text-gray-600">
              Make the most of our advanced search features
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left py-3"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="flex-shrink-0 text-navy-600" />
                  ) : (
                    <ChevronDown className="flex-shrink-0 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="mt-2 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-navy-700 to-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-200 mb-6">
            Can't find the answer you're looking for? Contact us directly.
          </p>
          <p className="text-lg">
            Email: <span className="font-semibold">support@conserve.neust.edu.ph</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;