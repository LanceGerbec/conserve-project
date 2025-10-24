// src/utils/constants.js
// Purpose: App-wide constants

export const SUBJECT_AREAS = [
  'Geriatric Nursing',
  'Pediatric Nursing',
  'Community Health Nursing',
  'Medical-Surgical Nursing',
  'Maternal and Child Health Nursing',
  'Psychiatric Nursing',
  'Emergency Nursing',
  'Critical Care Nursing',
  'Nursing Education',
  'Nursing Administration'
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'mostCited', label: 'Most Cited' }
];

export const YEARS = [];
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= 2000; year--) {
  YEARS.push(year);
}

export const CITATION_FORMATS = {
  APA: 'apa',
  MLA: 'mla',
  CHICAGO: 'chicago'
};