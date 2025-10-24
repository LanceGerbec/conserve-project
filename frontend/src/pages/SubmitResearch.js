// src/pages/SubmitResearch.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, X, Plus, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingButton from '../components/LoadingButton';

const SubmitResearch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    subjectArea: '',
    yearPublished: new Date().getFullYear(),
    authors: [{ name: '', email: '' }],
    keywords: ['']
  });

  useEffect(() => {
    fetchSubjectAreas();
  }, []);

  const fetchSubjectAreas = async () => {
    try {
      const { data } = await api.get('/admin/subjects');
      console.log('✅ Subjects loaded:', data.subjects);
      if (data.success && data.subjects) {
        setSubjectAreas(data.subjects);
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      toast.error('Failed to load subject areas. Please refresh the page.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthorChange = (index, field, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index][field] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: '', email: '' }]
    });
  };

  const removeAuthor = (index) => {
    const newAuthors = formData.authors.filter((_, i) => i !== index);
    setFormData({ ...formData, authors: newAuthors });
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({ ...formData, keywords: newKeywords });
  };

  const addKeyword = () => {
    setFormData({
      ...formData,
      keywords: [...formData.keywords, '']
    });
  };

  const removeKeyword = (index) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData({ ...formData, keywords: newKeywords });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('PDF file must be less than 10MB');
        e.target.value = '';
        return;
      }
      console.log('✅ PDF selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      setPdfFile(file);
    } else {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        e.target.value = '';
        return;
      }
      console.log('✅ Cover image selected:', file.name);
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔍 Starting submission validation...');

    // Check terms agreement
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Privacy Policy');
      setShowTermsModal(true);
      return;
    }

    // Validation checks
    if (!pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.abstract.trim()) {
      toast.error('Please enter an abstract');
      return;
    }

    if (!formData.subjectArea) {
      toast.error('Please select a subject area');
      return;
    }

    if (formData.authors.some(a => !a.name.trim())) {
      toast.error('Please fill in all author names');
      return;
    }

    if (formData.keywords.some(k => !k.trim())) {
      toast.error('Please fill in all keywords or remove empty ones');
      return;
    }

    // Filter out empty keywords and authors
    const validAuthors = formData.authors.filter(a => a.name.trim());
    const validKeywords = formData.keywords.filter(k => k.trim());

    if (validAuthors.length === 0) {
      toast.error('At least one author is required');
      return;
    }

    if (validKeywords.length === 0) {
      toast.error('At least one keyword is required');
      return;
    }

    console.log('✅ All validations passed');
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title.trim());
      submitData.append('abstract', formData.abstract.trim());
      submitData.append('subjectArea', formData.subjectArea);
      submitData.append('yearPublished', formData.yearPublished.toString());
      
      // Add arrays as JSON strings
      submitData.append('authors', JSON.stringify(validAuthors));
      submitData.append('keywords', JSON.stringify(validKeywords));
      
      // Add files
      submitData.append('pdf', pdfFile);
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      // Debug: Log what we're sending
      console.log('📤 Submitting data:', {
        title: formData.title,
        abstract: formData.abstract.substring(0, 50) + '...',
        subjectArea: formData.subjectArea,
        yearPublished: formData.yearPublished,
        authors: validAuthors,
        keywords: validKeywords,
        pdfSize: (pdfFile.size / 1024 / 1024).toFixed(2) + ' MB',
        hasCoverImage: !!coverImage
      });

      const response = await api.post('/research/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Submission successful:', response.data);
      toast.success('Research submitted successfully! Waiting for approval.');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Submit error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.[0]?.msg
        || 'Failed to submit research. Please check all fields and try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Submit Research Paper
          </h1>
          <p className="text-gray-600">
            Fill in the details below to submit your research for review
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Research Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter the full title of your research"
              required
            />
          </div>

          {/* Abstract */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Abstract *
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              className="input-field"
              rows="6"
              placeholder="Provide a brief summary of your research..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.abstract.length} characters
            </p>
          </div>

          {/* Authors */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Authors * (At least one required)
              </label>
              <button
                type="button"
                onClick={addAuthor}
                className="text-sm text-navy-700 hover:text-navy-800 font-medium flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Author
              </button>
            </div>

            {formData.authors.map((author, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={author.name}
                  onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Author name *"
                  required
                />
                <input
                  type="email"
                  value={author.email}
                  onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                  className="input-field flex-1"
                  placeholder="Email (optional)"
                />
                {formData.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Keywords * (At least one required)
              </label>
              <button
                type="button"
                onClick={addKeyword}
                className="text-sm text-navy-700 hover:text-navy-800 font-medium flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Keyword
              </button>
            </div>

            {formData.keywords.map((keyword, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="Enter keyword *"
                  required
                />
                {formData.keywords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Subject Area & Year */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Area *
                </label>
                <select
                  name="subjectArea"
                  value={formData.subjectArea}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select subject area</option>
                  {subjectAreas.length === 0 ? (
                    <option disabled>Loading subjects...</option>
                  ) : (
                    subjectAreas.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))
                  )}
                </select>
                {subjectAreas.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    If subjects don't load, please refresh the page
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Published *
                </label>
                <select
                  name="yearPublished"
                  value={formData.yearPublished}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              File Uploads
            </h3>

            {/* PDF Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Paper (PDF) * - Required
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-500 transition">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e, 'pdf')}
                  className="hidden"
                  id="pdf-upload"
                  required
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  {pdfFile ? (
                    <div className="text-center">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        ✅ {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-navy-600 mt-2">
                        Click to change file
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-1 font-medium">
                        Click to upload PDF
                      </p>
                      <p className="text-xs text-gray-500">Max size: 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  {coverImage ? (
                    <div className="text-center">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        ✅ {coverImage.name}
                      </p>
                      <p className="text-xs text-navy-600 mt-2">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-1">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500">Max size: 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-navy-200">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 mr-3 w-5 h-5 text-navy-700 border-gray-300 rounded focus:ring-navy-500"
                required
              />
              <label htmlFor="terms-checkbox" className="text-sm text-gray-700">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-navy-700 font-semibold hover:underline"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-navy-700 font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                . I confirm that this research is original work and I have the right to submit it for publication. *
              </label>
            </div>
            {!agreedToTerms && (
              <p className="text-xs text-red-600 mt-2 ml-8 font-medium">
                * Required: You must agree to the terms before submitting
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={!agreedToTerms || !pdfFile}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Research'}
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Research Submission Agreement
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Terms and Conditions for Research Submission
                </h3>
                <p className="mb-4">
                  By submitting your research to ConServe, you agree to the following terms:
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">1. Originality</h4>
                <p>
                  You certify that the research paper you are submitting is your original work and has not been plagiarized from any source. All sources used must be properly cited.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">2. Ownership Rights</h4>
                <p>
                  You confirm that you own the rights to this research or have obtained necessary permissions from all co-authors to submit it to ConServe.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">3. Review Process</h4>
                <p>
                  All submitted research undergoes review by ConServe administrators. Approval is not guaranteed and may take 2-5 business days. You will be notified via email of the decision.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">4. Public Access</h4>
                <p>
                  Once approved, your research will be publicly accessible in the ConServe repository. This promotes knowledge sharing within the nursing community.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">5. Accuracy</h4>
                <p>
                  You are responsible for the accuracy and validity of the information provided in your research. ConServe is not liable for any inaccuracies in submitted content.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">6. Data Privacy</h4>
                <p>
                  Your personal information will be handled according to our Privacy Policy. Only your name and institutional affiliation will be displayed publicly with your research.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">7. Right to Remove</h4>
                <p>
                  ConServe reserves the right to remove any research that violates these terms, contains inappropriate content, or infringes on intellectual property rights.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">8. Ethical Standards</h4>
                <p>
                  All research must comply with ethical research standards. Studies involving human subjects must have appropriate ethical approval.
                </p>
              </section>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                  toast.success('Thank you for agreeing to the terms');
                }}
                className="flex-1 px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition font-medium"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitResearch;