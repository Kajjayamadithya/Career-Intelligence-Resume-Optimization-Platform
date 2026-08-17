from typing import Dict, Any, List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.embeddings.matcher import semantic_matcher

RESOURCE_DATABASE = [
    {
        "id": "react",
        "technology": "React & Frontend Architecture",
        "keywords": "react reactjs frontend component state hooks jsx redux virtual dom spa web",
        "officialDocs": {"name": "React Official Documentation", "url": "https://react.dev"},
        "youtube": {
            "channel": "freeCodeCamp.org",
            "title": "React JS Full Course for Beginners",
            "url": "https://www.youtube.com/watch?v=bMknfKXIFA8"
        },
        "practice": {"name": "Frontend Mentor Practice Projects", "url": "https://www.frontendmentor.io"},
        "github": {
            "awesome": "https://github.com/enaqx/awesome-react",
            "beginner": "https://github.com/gitdagray/react_resources",
            "advanced": "https://github.com/alan2207/bulletproof-react"
        },
        "articles": {"name": "React Beta Documentation & Component Reference", "url": "https://react.dev/reference/react"},
        "courses": {"name": "Harvard CS50 Web Programming with Python & JavaScript", "url": "https://cs50.harvard.edu/web/"}
    },
    {
        "id": "nextjs",
        "technology": "Next.js & SSR React Frameworks",
        "keywords": "nextjs next.js ssr server side rendering app router static site generation fullstack react",
        "officialDocs": {"name": "Next.js Official Documentation", "url": "https://nextjs.org/docs"},
        "youtube": {
            "channel": "Fireship",
            "title": "Next.js in 100 Seconds / Full Course",
            "url": "https://www.youtube.com/watch?v=wm5gMKCORLk"
        },
        "practice": {"name": "Next.js Learn Interactive Dashboard Tutorial", "url": "https://nextjs.org/learn"},
        "github": {
            "awesome": "https://github.com/unicodeveloper/awesome-nextjs",
            "beginner": "https://github.com/vercel/next.js/tree/canary/examples",
            "advanced": "https://github.com/shadcn-ui/taxonomy"
        },
        "articles": {"name": "Vercel Next.js Architectural Guides", "url": "https://nextjs.org/docs/app/building-your-application"},
        "courses": {"name": "freeCodeCamp Next.js Full Stack Course", "url": "https://www.youtube.com/watch?v=ZVnjOPwWZuQ"}
    },
    {
        "id": "node",
        "technology": "Node.js & Express Server Development",
        "keywords": "node nodejs express javascript backend server REST API npm async event loop middleware",
        "officialDocs": {"name": "Node.js Official Documentation", "url": "https://nodejs.org/en/docs/"},
        "youtube": {
            "channel": "Programming with Mosh",
            "title": "Node.js Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4"
        },
        "practice": {"name": "Exercism JavaScript Track", "url": "https://exercism.org/tracks/javascript"},
        "github": {
            "awesome": "https://github.com/sindresorhus/awesome-nodejs",
            "beginner": "https://github.com/workshopper/learnyounode",
            "advanced": "https://github.com/goldbergyoni/nodebestpractices"
        },
        "articles": {"name": "MDN Node.js Express Tutorial Series", "url": "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs"},
        "courses": {"name": "freeCodeCamp Backend Development and APIs", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/"}
    },
    {
        "id": "python",
        "technology": "Python Programming & Scripting",
        "keywords": "python py scripting data structures OOP django flask fastapi pip virtualenv modules functions",
        "officialDocs": {"name": "Python 3 Official Documentation & Tutorial", "url": "https://docs.python.org/3/"},
        "youtube": {
            "channel": "Programming with Mosh",
            "title": "Python Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"
        },
        "practice": {"name": "LeetCode Python Interactive Exercises", "url": "https://leetcode.com/"},
        "github": {
            "awesome": "https://github.com/vinta/awesome-python",
            "beginner": "https://github.com/jakevdp/WhirlwindTourOfPython",
            "advanced": "https://github.com/faif/python-patterns"
        },
        "articles": {"name": "Real Python Deep-Dive Guides", "url": "https://realpython.com/"},
        "courses": {"name": "Harvard CS50 Introduction to Programming with Python", "url": "https://cs50.harvard.edu/python/"}
    },
    {
        "id": "mongodb",
        "technology": "MongoDB & NoSQL Databases",
        "keywords": "mongodb nosql database mongoose document BSON aggregation index atlas queries",
        "officialDocs": {"name": "MongoDB Official Manual", "url": "https://www.mongodb.com/docs/manual/"},
        "youtube": {
            "channel": "freeCodeCamp.org",
            "title": "MongoDB Complete Tutorial",
            "url": "https://www.youtube.com/watch?v=ofme2o290Y4"
        },
        "practice": {"name": "MongoDB University Interactive Labs", "url": "https://learn.mongodb.com/"},
        "github": {
            "awesome": "https://github.com/ramnes/awesome-mongodb",
            "beginner": "https://github.com/mongodb/mongo",
            "advanced": "https://github.com/mongodb-developer/nodejs-quickstart"
        },
        "articles": {"name": "MongoDB Developer Blog & Architecture Guides", "url": "https://www.mongodb.com/blog"},
        "courses": {"name": "MongoDB Basics Learning Path", "url": "https://learn.mongodb.com/learning-paths/mongodb-basics"}
    },
    {
        "id": "sql",
        "technology": "SQL & Relational Databases",
        "keywords": "sql postgresql mysql database relational join indexing query transaction schema normalization tables",
        "officialDocs": {"name": "PostgreSQL Official Reference Manual", "url": "https://www.postgresql.org/docs/"},
        "youtube": {
            "channel": "Traversy Media",
            "title": "SQL Databases for Beginners",
            "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"
        },
        "practice": {"name": "HackerRank SQL Practice Challenges", "url": "https://www.hackerrank.com/domains/sql"},
        "github": {
            "awesome": "https://github.com/numetriclabz/awesome-db",
            "beginner": "https://github.com/major/sql-cheat-sheet",
            "advanced": "https://github.com/karanpratapsingh/system-design"
        },
        "articles": {"name": "Use The Index, Luke (SQL Performance & Indexing)", "url": "https://use-the-index-luke.com/"},
        "courses": {"name": "freeCodeCamp Relational Database Certification", "url": "https://www.freecodecamp.org/learn/relational-database/"}
    },
    {
        "id": "docker",
        "technology": "Docker & Containerization",
        "keywords": "docker container containerization dockerfile docker-compose image registry volume devops environment deployment",
        "officialDocs": {"name": "Docker Official Documentation", "url": "https://docs.docker.com/"},
        "youtube": {
            "channel": "TechWorld with Nana",
            "title": "Docker Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=3c-iKanevFo"
        },
        "practice": {"name": "Play with Docker Interactive Browser Labs", "url": "https://labs.play-with-docker.com/"},
        "github": {
            "awesome": "https://github.com/veggiemonk/awesome-docker",
            "beginner": "https://github.com/docker/labs",
            "advanced": "https://github.com/wsargent/docker-cheat-sheet"
        },
        "articles": {"name": "Docker Containerization Get Started Guides", "url": "https://docs.docker.com/get-started/"},
        "courses": {"name": "freeCodeCamp Docker for Beginners Course", "url": "https://www.freecodecamp.org/news/run-docker-locally/"}
    },
    {
        "id": "kubernetes",
        "technology": "Kubernetes & Container Orchestration",
        "keywords": "kubernetes k8s orchestration pod deployment service ingress helm cluster cloud native devops microservices",
        "officialDocs": {"name": "Kubernetes Official Reference Documentation", "url": "https://kubernetes.io/docs/home/"},
        "youtube": {
            "channel": "TechWorld with Nana",
            "title": "Kubernetes Tutorial for Beginners",
            "url": "https://www.youtube.com/watch?v=X48VuDVv0do"
        },
        "practice": {"name": "Killercoda Interactive Kubernetes Scenarios", "url": "https://killercoda.com/"},
        "github": {
            "awesome": "https://github.com/ramitsurana/awesome-kubernetes",
            "beginner": "https://github.com/kubernetes/kubernetes",
            "advanced": "https://github.com/kelseyhightower/kubernetes-the-hard-way"
        },
        "articles": {"name": "Kubernetes Blog & Cloud-Native Tutorials", "url": "https://kubernetes.io/blog/"},
        "courses": {"name": "Udacity Scalable Microservices with Kubernetes", "url": "https://www.udacity.com/course/scalable-microservices-with-kubernetes--ud615"}
    },
    {
        "id": "aws",
        "technology": "AWS & Cloud Computing",
        "keywords": "aws cloud amazon web services ec2 s3 lambda cloudfront iam rds vpc cloud formation devops serverless",
        "officialDocs": {"name": "AWS Developer Official Documentation", "url": "https://docs.aws.amazon.com/"},
        "youtube": {
            "channel": "freeCodeCamp.org",
            "title": "AWS Certified Cloud Practitioner Course",
            "url": "https://www.youtube.com/watch?v=SOTamWGuDKc"
        },
        "practice": {"name": "AWS Hands-On Workshop Center", "url": "https://workshops.aws/"},
        "github": {
            "awesome": "https://github.com/donnemartin/awesome-aws",
            "beginner": "https://github.com/aws/aws-cli",
            "advanced": "https://github.com/aws-samples/aws-bootstrap-templates"
        },
        "articles": {"name": "AWS Architecture Official Blog", "url": "https://aws.amazon.com/blogs/architecture/"},
        "courses": {"name": "Coursera AWS Cloud Practitioner Essentials", "url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials"}
    },
    {
        "id": "ml",
        "technology": "Machine Learning & Artificial Intelligence",
        "keywords": "machine learning ml ai deep learning pytorch tensorflow scikit-learn neural networks nlp data science model training pandas numpy",
        "officialDocs": {"name": "Scikit-Learn Machine Learning Documentation", "url": "https://scikit-learn.org/stable/"},
        "youtube": {
            "channel": "freeCodeCamp.org",
            "title": "Machine Learning Course for Beginners",
            "url": "https://www.youtube.com/watch?v=NWONeJKn6kc"
        },
        "practice": {"name": "Kaggle Data Science & ML Competitions", "url": "https://www.kaggle.com/"},
        "github": {
            "awesome": "https://github.com/josephmisiti/awesome-machine-learning",
            "beginner": "https://github.com/ageron/handson-ml3",
            "advanced": "https://github.com/scikit-learn/scikit-learn"
        },
        "articles": {"name": "Towards Data Science Publication", "url": "https://towardsdatascience.com/"},
        "courses": {"name": "DeepLearning.AI Machine Learning Specialization", "url": "https://www.deeplearning.ai/"}
    },
    {
        "id": "dsa",
        "technology": "Data Structures & Algorithms",
        "keywords": "dsa data structures algorithms leetcode arrays linked list trees graphs dynamic programming recursion sorting searching big o interview prep",
        "officialDocs": {"name": "GeeksforGeeks Data Structures & Algorithms Library", "url": "https://www.geeksforgeeks.org/data-structures/"},
        "youtube": {
            "channel": "NeetCode",
            "title": "Data Structures & Algorithms for Beginners",
            "url": "https://www.youtube.com/c/NeetCode"
        },
        "practice": {"name": "LeetCode Coding Interview Platform", "url": "https://leetcode.com/"},
        "github": {
            "awesome": "https://github.com/jwasham/coding-interview-university",
            "beginner": "https://github.com/TheAlgorithms/Python",
            "advanced": "https://github.com/youngyangyang04/leetcode-master"
        },
        "articles": {"name": "NeetCode 150 Standard Roadmap", "url": "https://neetcode.io/"},
        "courses": {"name": "Princeton Algorithms Course (Coursera)", "url": "https://www.coursera.org/learn/algorithms-part1"}
    },
    {
        "id": "system-design",
        "technology": "System Design & Distributed Systems",
        "keywords": "system design distributed systems scalability load balancer microservices caching redis message queue kafka database sharding high availability architecture",
        "officialDocs": {"name": "System Design Primer Official Guide", "url": "https://github.com/donnemartin/system-design-primer"},
        "youtube": {
            "channel": "Gaurav Sen",
            "title": "System Design Simplified Playlist",
            "url": "https://www.youtube.com/c/GauravSensei"
        },
        "practice": {"name": "ByteByteGo Interactive System Design Course", "url": "https://bytebytego.com/"},
        "github": {
            "awesome": "https://github.com/donnemartin/system-design-primer",
            "beginner": "https://github.com/karanpratapsingh/system-design",
            "advanced": "https://github.com/binhnguyennus/awesome-scalability"
        },
        "articles": {"name": "High Scalability Real-World Architecture Case Studies", "url": "http://highscalability.com/"},
        "courses": {"name": "Grokking the System Design Interview", "url": "https://www.educative.io/courses/grokking-the-system-design-interview"}
    },
    {
        "id": "git",
        "technology": "Git & GitHub Version Control",
        "keywords": "git github version control rebase merge branch commit pull request repository workflow devops",
        "officialDocs": {"name": "Git Official Reference Manual", "url": "https://git-scm.com/docs"},
        "youtube": {
            "channel": "Fireship",
            "title": "Git & GitHub Tutorial in 10 Minutes",
            "url": "https://www.youtube.com/watch?v=hwP7WQhECEc"
        },
        "practice": {"name": "Learn Git Branching Interactive Sandbox", "url": "https://learngitbranching.js.org/"},
        "github": {
            "awesome": "https://github.com/dictcp/awesome-git",
            "beginner": "https://github.com/jlord/git-it-electron",
            "advanced": "https://github.com/k88hudson/git-flight-rules"
        },
        "articles": {"name": "Atlassian Git Interactive Guides & Workflow Documentation", "url": "https://www.atlassian.com/git/tutorials"},
        "courses": {"name": "GitHub Skills Interactive Hands-on Training", "url": "https://skills.github.com/"}
    }
]

class ResourceRAGEngine:
    """
    Semantic RAG Vector Engine for Verified Learning Resources.
    Pre-computes embeddings for resource entries and performs top-k semantic vector search
    against weekly learning topics and objectives.
    
    Uses its own TF-IDF vectorizer instance (independent of the shared SemanticMatcher singleton)
    so corpus and query embeddings always share the same vocabulary/dimensions.
    """

    def __init__(self):
        self._embeddings = None
        self._initialized = False
        self._tfidf_vectorizer = None  # Engine-local vectorizer for TF-IDF fallback

    def _encode(self, texts: list) -> np.ndarray:
        """
        Encodes texts using SentenceTransformer when available, or falls back to
        a local TF-IDF vectorizer (fit once on first call, transform-only thereafter).
        """
        if semantic_matcher.model and not semantic_matcher.use_tfidf:
            try:
                return semantic_matcher.model.encode(texts)
            except Exception:
                pass

        # TF-IDF fallback with a local persistent vectorizer
        from sklearn.feature_extraction.text import TfidfVectorizer
        if self._tfidf_vectorizer is None:
            self._tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            return self._tfidf_vectorizer.fit_transform(texts).toarray()
        else:
            return self._tfidf_vectorizer.transform(texts).toarray()

    def _ensure_initialized(self):
        if not self._initialized:
            corpus_texts = [
                f"{res['technology']} {res['keywords']} {res['officialDocs']['name']}"
                for res in RESOURCE_DATABASE
            ]
            self._embeddings = self._encode(corpus_texts)
            self._initialized = True

    def search_resources(self, topic: str, objectives: List[str] = []) -> Dict[str, Any]:
        """
        Calculates cosine similarity between incoming topic vector and verified resources.
        Returns the top semantically matched resource dictionary.
        """
        self._ensure_initialized()

        query_text = f"{topic} {' '.join(objectives)}".strip()
        if not query_text:
            return RESOURCE_DATABASE[0]

        try:
            query_vec = self._encode([query_text])
            sim_scores = cosine_similarity(query_vec, self._embeddings)[0]
            best_idx = int(np.argmax(sim_scores))

            best_match = RESOURCE_DATABASE[best_idx].copy()
            best_match["relevanceScore"] = float(np.round(sim_scores[best_idx] * 100, 2))
            return best_match
        except Exception as e:
            print(f"Error in ResourceRAGEngine search: {str(e)}")
            return RESOURCE_DATABASE[0]

resource_rag_engine = ResourceRAGEngine()
