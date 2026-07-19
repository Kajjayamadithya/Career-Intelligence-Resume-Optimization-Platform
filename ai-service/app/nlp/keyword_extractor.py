import spacy
import subprocess
from typing import Set

class KeywordExtractor:
    def __init__(self):
        # Gracefully load or download the spaCy English pipeline
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            try:
                print("spaCy model 'en_core_web_sm' not found. Downloading...")
                subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
                self.nlp = spacy.load("en_core_web_sm")
            except Exception as e:
                print(f"Failed to auto-download spaCy pipeline, loading empty fallback: {str(e)}")
                self.nlp = None

        # Comprehensive predefined list of modern software, AI/ML, and DevOps skills
        self.tech_vocabulary = {
            "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "php", "swift", "kotlin", "golang", "go", "rust",
            "html", "html5", "css", "css3", "tailwind", "bootstrap", "sass", "lass",
            "react", "react.js", "angular", "vue", "vue.js", "next.js", "nuxt", "svelte", "redux", "graphql", "apollo",
            "node.js", "node", "express", "express.js", "fastapi", "django", "flask", "spring", "spring boot", "laravel", "nest.js",
            "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "cassandra", "dynamodb", "firebase", "oracle", "sql", "nosql",
            "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "jenkins", "git", "github",
            "gitlab", "ci/cd", "terraform", "ansible", "docker-compose", "aws lambda", "s3", "ec2", "rds",
            "machine learning", "deep learning", "nlp", "natural language processing", "computer vision", "tensorflow", "pytorch",
            "keras", "scikit-learn", "numpy", "pandas", "matplotlib", "seaborn", "opencv", "huggingface", "llm", "gemini", "openai",
            "agile", "scrum", "rest", "restful", "rest api", "grpc", "microservices", "unit testing", "jest", "cypress",
            "linux", "unix", "bash", "shell", "powershell", "devops", "system design", "data structures", "algorithms"
        }

    def extract_keywords(self, text: str) -> Set[str]:
        """
        Parses text to extract matches from the predefined tech vocabulary,
        along with proper noun phrases.
        """
        if not text:
            return set()
        
        extracted = set()
        text_lower = text.lower()

        # 1. Exact matching for vocabulary phrases
        for vocab in self.tech_vocabulary:
            if vocab in text_lower:
                extracted.add(vocab)

        # 2. Part of Speech / Noun Phrase extraction using spaCy (if loaded successfully)
        if self.nlp:
            try:
                doc = self.nlp(text_lower)
                # Add proper noun tokens
                for token in doc:
                    if token.pos_ in {"PROPN"} and len(token.text) > 2:
                        extracted.add(token.text)
                
                # Add noun phrases that match sub-words
                for chunk in doc.noun_chunks:
                    chunk_text = chunk.text.strip()
                    if len(chunk_text) > 2 and any(v in chunk_text for v in self.tech_vocabulary):
                        extracted.add(chunk_text)
            except Exception as e:
                print(f"Error parsing text with spaCy: {str(e)}")

        return {k.strip() for k in extracted if k.strip()}

# Initialize singleton keyword extractor
keyword_extractor = KeywordExtractor()
