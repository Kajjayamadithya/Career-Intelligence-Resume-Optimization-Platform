from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.embeddings.matcher import semantic_matcher

class ResumeRAGEngine:
    """
    RAG Engine for candidate resume context extraction.
    Chunks structured normalized resume JSON into discrete vectorized segments
    and retrieves top semantic matches for incoming user chat queries.
    """

    def chunk_resume(self, resume_data: Dict[str, Any]) -> List[Dict[str, str]]:
        chunks = []

        if not resume_data:
            return chunks

        # 1. Summary Chunk
        summary = resume_data.get("summary")
        if summary and isinstance(summary, str) and summary.strip():
            chunks.append({
                "category": "Professional Summary",
                "text": f"Candidate Professional Summary: {summary.strip()}"
            })

        # 2. Technical & Soft Skills Chunk
        skills = resume_data.get("skills") or []
        tech_skills = resume_data.get("technicalSkills") or []
        soft_skills = resume_data.get("softSkills") or []

        all_skills = list(set([str(s).strip() for s in skills + tech_skills + soft_skills if s]))
        if all_skills:
            chunks.append({
                "category": "Skills Profile",
                "text": f"Candidate Technical & Core Skills: {', '.join(all_skills)}"
            })

        # 3. Work Experience Chunks
        experience = resume_data.get("experience") or []
        for idx, exp in enumerate(experience):
            if isinstance(exp, dict):
                company = exp.get("company", "Company")
                role = exp.get("role", "Role")
                duration = exp.get("duration", "")
                desc = exp.get("description", "")
                
                exp_text = f"Work Experience ({role} at {company} [{duration}]): {desc}".strip()
                chunks.append({
                    "category": f"Experience #{idx + 1}",
                    "text": exp_text
                })

        # 4. Project Chunks
        projects = resume_data.get("projects") or []
        for idx, proj in enumerate(projects):
            if isinstance(proj, dict):
                title = proj.get("title", "Project")
                desc = proj.get("description", "")
                techs = proj.get("technologies") or []
                tech_str = f" Technologies used: {', '.join(techs)}." if techs else ""
                
                proj_text = f"Project ({title}): {desc}.{tech_str}".strip()
                chunks.append({
                    "category": f"Project #{idx + 1}",
                    "text": proj_text
                })

        # 5. Education Chunks
        education = resume_data.get("education") or []
        for idx, edu in enumerate(education):
            if isinstance(edu, dict):
                degree = edu.get("degree", "Degree")
                college = edu.get("college", "Institution")
                year = edu.get("year", "")
                cgpa = edu.get("cgpa", "")
                cgpa_str = f" CGPA/Grade: {cgpa}." if cgpa else ""
                
                edu_text = f"Education: {degree} from {college} ({year}).{cgpa_str}".strip()
                chunks.append({
                    "category": f"Education #{idx + 1}",
                    "text": edu_text
                })

        # 6. Achievements & Certifications
        achievements = resume_data.get("achievements") or []
        if achievements:
            chunks.append({
                "category": "Achievements",
                "text": f"Key Achievements: {'; '.join([str(a) for a in achievements])}"
            })

        certs = resume_data.get("certifications") or []
        if certs:
            chunks.append({
                "category": "Certifications",
                "text": f"Certifications & Credentials: {'; '.join([str(c) for c in certs])}"
            })

        return chunks

    def _encode_batch(self, texts: list) -> np.ndarray:
        """
        Encodes a list of texts using SentenceTransformer when available,
        or a fresh local TF-IDF vectorizer for this call batch.
        All texts are encoded together so dimensions are guaranteed consistent.
        """
        if semantic_matcher.model and not semantic_matcher.use_tfidf:
            try:
                return semantic_matcher.model.encode(texts)
            except Exception:
                pass

        # TF-IDF fallback — fit on the entire batch so all vectors share the same vocabulary
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        return vectorizer.fit_transform(texts).toarray()

    def retrieve_relevant_context(
        self,
        query: str,
        resume_data: Dict[str, Any],
        top_k: int = 4,
        min_similarity: float = 0.10
    ) -> List[str]:
        """
        Encodes resume chunks and the query vector, calculates cosine similarity,
        and returns the top_k relevant chunk text strings.
        
        Encodes chunks + query together in a single batch to guarantee
        consistent embedding dimensions regardless of the backend (ST vs TF-IDF).
        """
        chunks = self.chunk_resume(resume_data)
        if not chunks:
            return []

        chunk_texts = [c["text"] for c in chunks]

        try:
            # Encode query appended at end so vocab is shared in TF-IDF fallback mode
            all_texts = chunk_texts + [query]
            all_embeddings = self._encode_batch(all_texts)

            # Slice out chunk embeddings and query embedding
            chunk_embeddings = all_embeddings[:-1]
            query_embedding = all_embeddings[-1:]

            # Compute cosine similarity scores
            sim_scores = cosine_similarity(query_embedding, chunk_embeddings)[0]

            # Rank chunks by score descending
            ranked_indices = np.argsort(sim_scores)[::-1]

            relevant_chunks = []
            for idx in ranked_indices[:top_k]:
                score = sim_scores[idx]
                if score >= min_similarity:
                    relevant_chunks.append(chunk_texts[idx])

            return relevant_chunks
        except Exception as e:
            print(f"Error in ResumeRAGEngine vector retrieval: {str(e)}")
            # Fallback: Return first top_k chunks
            return [c["text"] for c in chunks[:top_k]]

resume_rag_engine = ResumeRAGEngine()
