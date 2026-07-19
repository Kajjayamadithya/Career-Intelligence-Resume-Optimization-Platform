from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SemanticMatcher:
    def __init__(self):
        # Load the sentence transformer model locally
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def calculate_similarity(self, resume_text: str, jd_text: str) -> float:
        """
        Generates sentence embeddings for resume and job description text
        and returns the cosine similarity score as a percentage.
        """
        if not resume_text or not resume_text.strip() or not jd_text or not jd_text.strip():
            return 0.0
        
        try:
            # Generate embeddings
            embeddings = self.model.encode([resume_text, jd_text])
            
            # Calculate Cosine Similarity
            sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            
            # Normalize to 0-100 range, clamping negative similarities to 0
            score = max(0.0, float(np.round(sim * 100, 2)))
            return score
        except Exception as e:
            print(f"Error calculating semantic similarity: {str(e)}")
            return 0.0

# Initialize singleton instance
semantic_matcher = SemanticMatcher()
