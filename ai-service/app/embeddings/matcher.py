import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

class SemanticMatcher:
    def __init__(self):
        self.model = None
        self.use_tfidf = False
        self._tfidf_vectorizer: TfidfVectorizer = None

        # Attempt to load SentenceTransformer gracefully with DLL handling
        try:
            import torch
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("Loaded SentenceTransformer ('all-MiniLM-L6-v2') successfully.")
        except Exception as e:
            print(f"SentenceTransformer load warning ({str(e)}). Falling back to TF-IDF vector matcher.")
            self.use_tfidf = True

    def encode(self, texts: list) -> np.ndarray:
        """
        Generates vector representation array for a list of input texts.
        Uses SentenceTransformer if available, or TF-IDF Vectorizer fallback.
        
        TF-IDF mode: fits a shared vectorizer on the first call (corpus) and
        uses transform-only on subsequent calls so dimensions always match.
        """
        if not texts:
            return np.array([])

        if self.model and not self.use_tfidf:
            try:
                return self.model.encode(texts)
            except Exception as e:
                print(f"SentenceTransformer encode error ({str(e)}). Switching to TF-IDF vectorizer.")
                self.use_tfidf = True

        # TF-IDF fallback — persist the vectorizer to keep vocabulary consistent
        if self._tfidf_vectorizer is None:
            # First call: fit on the provided corpus and store the vectorizer
            self._tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            return self._tfidf_vectorizer.fit_transform(texts).toarray()
        else:
            # Subsequent calls: transform only (same vocabulary = same dimensions)
            return self._tfidf_vectorizer.transform(texts).toarray()

    def reset_tfidf(self):
        """Reset the stored vectorizer (useful when switching corpus contexts)."""
        self._tfidf_vectorizer = None

    def calculate_similarity(self, resume_text: str, jd_text: str) -> float:
        """
        Generates sentence embeddings for resume and job description text
        and returns the cosine similarity score as a percentage.
        """
        if not resume_text or not resume_text.strip() or not jd_text or not jd_text.strip():
            return 0.0
        
        try:
            # Encode both texts together so TF-IDF vocab is consistent
            embeddings = self.encode([resume_text, jd_text])
            sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            score = max(0.0, float(np.round(sim * 100, 2)))
            return score
        except Exception as e:
            print(f"Error calculating semantic similarity: {str(e)}")
            return 0.0

# Initialize singleton instance
semantic_matcher = SemanticMatcher()
