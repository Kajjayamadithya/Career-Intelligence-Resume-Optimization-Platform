# System Architecture Documentation

This document describes the design, directory structures, data models, communication flow, and security layers of the **AI Career Intelligence Platform**.

---

## 1. Overall System Architecture

The application is structured as a decoupled multi-tier architecture to promote clean separation of concerns, scalability, and ease of deployment:

1.  **Presentation Layer (React Single Page App)**:
    *   Powered by Vite for high-speed local development and optimized builds.
    *   State management handled via **Redux Toolkit** (auth state, resume history, dashboard stats).
    *   Styled with **Tailwind CSS** following custom modern SaaS glassmorphic patterns.
    *   Uses **Framer Motion** for micro-interactions/transitions and **Recharts** for visualizations.
2.  **API Gateway / Backend Service (Express.js)**:
    *   Provides secure JSON REST endpoints.
    *   Handles file uploads using **Multer** and persists raw PDFs securely on **Cloudinary**.
    *   Communicates with **APILayer Resume Parser API** to parse PDFs into raw structured JSON.
    *   Performs database actions using **Mongoose ODM**.
    *   Bridges requests to the FastAPI AI Service for high-performance ML calculations (semantic matching).
3.  **Semantic / AI Service (FastAPI)**:
    *   Runs a Python-based FastAPI web app.
    *   Embeds resume and job description texts using **Sentence Transformers** (`all-MiniLM-L6-v2`) locally to compute cosine similarity scores.
    *   Utilizes **spaCy** for custom keyword extraction and syntax analysis.
    *   Communicates with the Google **Gemini API** for generative modules: resume improvement tips, career roadmap generation, stateful mentor chat, and mock interview evaluation.
4.  **Database Layer (MongoDB)**:
    *   Document-based persistence.
    *   Normalized schemas with proper indexes (`userId`, `resumeId`, `email`) for rapid queries.

---

## 2. Communication & Data Flow

```
[React App]  <-- Axios (JWT Header) -->  [Express Backend]  <-- Mongoose --> [MongoDB]
                                                 |
                                                 +<-- HTTPS SDK --> [Cloudinary]
                                                 +<-- HTTPS REST --> [APILayer Parser]
                                                 +<-- HTTP REST -->  [FastAPI Service]
                                                                            |
                                                                            +<-- HTTPS REST --> [Gemini API]
```

### Flow Example: Resume Upload & Analysis
1.  User drops a `.pdf` file in the frontend dashboard.
2.  The frontend validates the file type/size and sends a `multipart/form-data` request to `POST /api/resume/upload`.
3.  The Express Backend handles the file via Multer, uploads it to Cloudinary, and receives a secure HTTPS PDF URL.
4.  The Backend forwards the PDF to the **APILayer Resume Parser API**.
5.  APILayer returns structured raw resume JSON (skills, experience, education, etc.).
6.  The Backend saves the raw JSON and creates a normalized database entry in the `resumes` collection.
7.  The user requests an ATS calculation against a job description. The Express backend sends the normalized resume and job description to the FastAPI AI service.
8.  The FastAPI service runs embeddings, calculates cosine similarity, performs skill overlap, builds a weighted report, and calls Gemini to generate expansion ideas.
9.  The result is returned to the Node backend, saved in MongoDB, and delivered to the frontend dashboard.

---

## 3. Database Schema Models (Mongoose)

### 3.1 Users Collection
Stores credentials, roles, and profile information.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Recruiter', 'Admin'], default: 'Student' },
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 Resumes Collection
Stores both the raw API parser payload and normalized properties for version history.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  fileName: String,
  pdfUrl: String,
  cloudinaryId: String,
  rawParserJson: Object, // Raw response from APILayer
  normalizedData: {
    fullName: String,
    email: String,
    phone: String,
    skills: [String],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: String,
      endYear: String
    }],
    experience: [{
      company: String,
      title: String,
      startDate: String,
      endDate: String,
      description: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String]
    }],
    certifications: [String],
    languages: [String],
    summary: String
  },
  isLatest: { type: Boolean, default: true },
  createdAt: Date
}
```

### 3.3 ATS Reports Collection
Stores weighted comparison calculations and improvement tips.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  resumeId: { type: ObjectId, ref: 'Resume', required: true },
  jobDescriptionText: String,
  jobTitle: String,
  scores: {
    overall: Number,        // Max 100
    skillMatch: Number,     // Weighted 40%
    semanticMatch: Number,  // Weighted 15%
    experience: Number,     // Weighted 15%
    projects: Number,       // Weighted 10%
    education: Number,      // Weighted 10%
    structure: Number,      // Weighted 5%
    certifications: Number  // Weighted 5%
  },
  analysis: {
    matchedSkills: [String],
    missingSkills: [String],
    strengths: [String],
    weaknesses: [String],
    improvementTips: [String] // Populated by Gemini service
  },
  createdAt: Date
}
```

---

## 4. Custom ATS Scoring Pipeline

To keep the platform highly consistent, the **ATS Score is NOT calculated by LLMs** (which are prone to variance and high latency). Instead, a custom hybrid pipeline is used:

$$\text{Final ATS Score} = (S_m \times 0.40) + (C_s \times 0.15) + (E_w \times 0.15) + (P_w \times 0.10) + (Ed_w \times 0.10) + (St_w \times 0.05) + (Ce_w \times 0.05)$$

Where:
*   **Skill Match ($S_m$) - 40%**: Direct keyword exact/alias match of parsed resume skills vs. job description skills.
*   **Cosine Similarity ($C_s$) - 15%**: Local semantic similarity between the job description and the raw text/summary of the resume using `all-MiniLM-L6-v2`.
*   **Experience Match ($E_w$) - 15%**: Evaluates title relevance and duration of professional experience.
*   **Projects Match ($P_w$) - 10%**: Evaluates project content matching technologies listed in the JD.
*   **Education ($Ed_w$) - 10%**: Checks level of study (Bachelors, Masters, etc.) against optional requirements.
*   **Structure ($St_w$) - 5%**: Validates typical resume sections (Summary, Experience, Projects, Education, Skills).
*   **Certifications ($Ce_w$) - 5%**: Validates the presence of relevant professional credentials.

---

## 5. Security Architecture

1.  **API Protections**:
    *   **Helmet**: Set HTTP headers for security (prevent clickjacking, XSS, etc.).
    *   **Rate Limiting**: Limit API requests to prevent DDoS and brute-force attacks (`express-rate-limit`).
    *   **CORS Configuration**: Restrict API usage exclusively to the client-side domain.
2.  **Authentication**:
    *   Short-lived JWT Access Tokens (e.g., 15 minutes) passed in the `Authorization` bearer header.
    *   Long-lived Refresh Tokens stored in secure, `httpOnly`, `sameSite` cookies to securely handle session renewal.
    *   Password salting and hashing using `bcrypt` (12 rounds).
3.  **Validation & Sanitization**:
    *   Strict schema verification at the entry endpoints using `express-validator`.
    *   Input sanitization to protect against NoSQL injections and Cross-Site Scripting.
