// utils/fuzzySearch.js
// Purpose: Smart search with typo tolerance

// Calculate similarity between two strings (Levenshtein distance)
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Calculate similarity score (0-1, higher is better)
function similarityScore(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Fuzzy search function
exports.fuzzySearch = (query, researches) => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return researches.map(research => {
    let score = 0;
    
    // Check title similarity
    const titleScore = similarityScore(normalizedQuery, research.title.toLowerCase());
    score += titleScore * 3; // Title is most important
    
    // Check author names
    research.authors.forEach(author => {
      const authorScore = similarityScore(normalizedQuery, author.name.toLowerCase());
      score += authorScore * 2;
    });
    
    // Check keywords
    research.keywords.forEach(keyword => {
      const keywordScore = similarityScore(normalizedQuery, keyword.toLowerCase());
      score += keywordScore * 1.5;
    });
    
    // Check abstract
    const abstractScore = research.abstract.toLowerCase().includes(normalizedQuery) ? 1 : 0;
    score += abstractScore * 0.5;
    
    return {
      research,
      score
    };
  })
  .filter(item => item.score > 0.3) // Only return if score is above threshold
  .sort((a, b) => b.score - a.score) // Sort by relevance
  .map(item => item.research);
};