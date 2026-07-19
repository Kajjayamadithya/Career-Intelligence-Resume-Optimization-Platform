from typing import Dict, List, Any
from app.embeddings.matcher import semantic_matcher
from app.nlp.keyword_extractor import keyword_extractor

def calculate_ats_report(resume_data: Dict[str, Any], job_description: str, target_title: str = "") -> Dict[str, Any]:
    """
    Computes a weighted ATS report based on:
    - Skill Match (40%)
    - Cosine Similarity (15%)
    - Experience Match (15%)
    - Projects Match (10%)
    - Education Match (10%)
    - Resume Structure (5%)
    - Certifications (5%)
    """
    normalized = resume_data.get("normalizedData", {})
    
    # --- 1. Skill Match (40%) ---
    resume_skills = [s.lower() for s in normalized.get("skills", [])]
    jd_skills = keyword_extractor.extract_keywords(job_description)
    
    matched_skills = []
    missing_skills = []
    
    if jd_skills:
        for skill in jd_skills:
            # Check for direct inclusion or word boundaries
            if any(skill in rs or rs in skill for rs in resume_skills):
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        skill_match_ratio = len(matched_skills) / len(jd_skills)
        skill_score = round(skill_match_ratio * 100, 2)
    else:
        # If JD has no identifiable skills, give full score by default
        skill_score = 100.0
    
    # --- 2. Cosine Similarity (15%) ---
    # Construct full resume text block for vector embeddings
    experience_texts = [
        f"{exp.get('title', '')} at {exp.get('company', '')}: {exp.get('description', '')}"
        for exp in normalized.get("experience", [])
    ]
    project_texts = [
        f"{proj.get('title', '')}: {proj.get('description', '')}"
        for proj in normalized.get("projects", [])
    ]
    resume_text = " ".join([
        normalized.get("summary", ""),
        " ".join(normalized.get("skills", [])),
        " ".join(experience_texts),
        " ".join(project_texts)
    ])
    
    cosine_score = semantic_matcher.calculate_similarity(resume_text, job_description)

    # --- 3. Experience Match (15%) ---
    experience_list = normalized.get("experience", [])
    exp_score = 50.0 # Base score for having the section
    
    if experience_list:
        # Give points based on length of experience
        exp_score = 70.0
        if len(experience_list) >= 2:
            exp_score = 85.0
        if len(experience_list) >= 4:
            exp_score = 100.0
            
        # Match target title overlap if provided
        if target_title:
            title_match = False
            for exp in experience_list:
                title = exp.get("title", "").lower()
                if target_title.lower() in title or any(word in title for word in target_title.lower().split()):
                    title_match = True
                    break
            if title_match:
                exp_score = min(exp_score + 15, 100.0)
    else:
        exp_score = 0.0

    # --- 4. Projects Match (10%) ---
    projects_list = normalized.get("projects", [])
    project_score = 0.0
    
    if projects_list:
        project_score = 70.0
        if len(projects_list) >= 2:
            project_score = 90.0
        # If projects describe skills matching the JD, top up the score
        project_tech = []
        for p in projects_list:
            project_tech.extend([t.lower() for t in p.get("technologies", [])])
        
        tech_matches = set(project_tech).intersection(set(matched_skills))
        if len(tech_matches) >= 2:
            project_score = 100.0

    # --- 5. Education Match (10%) ---
    education_list = normalized.get("education", [])
    edu_score = 0.0
    
    if education_list:
        edu_score = 70.0 # Standard base score for having education
        degrees = [edu.get("degree", "").lower() for edu in education_list]
        for d in degrees:
            if any(term in d for term in ["bachelor", "master", "phd", "b.s", "m.s", "btech", "mtech", "degree", "bs", "ms"]):
                edu_score = 100.0
                break

    # --- 6. Resume Structure (5%) ---
    # Check present keys
    structure_score = 100.0
    deduction = 20.0
    
    if not normalized.get("summary"):
        structure_score -= deduction
    if not normalized.get("skills"):
        structure_score -= deduction
    if not normalized.get("experience"):
        structure_score -= deduction
    if not normalized.get("education"):
        structure_score -= deduction
    if not normalized.get("projects"):
        structure_score -= deduction
        
    structure_score = max(0.0, structure_score)

    # --- 7. Certifications (5%) ---
    cert_list = normalized.get("certifications", [])
    cert_score = 50.0 # Fair baseline
    if cert_list:
        cert_score = 100.0

    # --- Compute Final Weighted Score ---
    overall_score = (
        (skill_score * 0.40) +
        (cosine_score * 0.15) +
        (exp_score * 0.15) +
        (project_score * 0.10) +
        (edu_score * 0.10) +
        (structure_score * 0.05) +
        (cert_score * 0.05)
    )
    overall_score = round(min(overall_score, 100.0), 2)

    # --- Strengths, Weaknesses, and Improvement Tips ---
    strengths = []
    weaknesses = []
    improvement_suggestions = []

    if skill_score >= 75:
        strengths.append("Strong technical skill set alignment with target job requirements.")
    else:
        weaknesses.append("Significant technical skill gaps discovered compared to job requirements.")
        improvement_suggestions.append("Integrate key missing keywords and skills highlighted in the gap analysis.")

    if cosine_score >= 60:
        strengths.append("High semantic context match; document wording matches job description styling.")
    else:
        weaknesses.append("Poor semantic keyword density; summary and experience text wording does not match JD context.")
        improvement_suggestions.append("Revise your resume summary and project bullet points to echo terms used in the JD.")

    if exp_score >= 80:
        strengths.append("Adequate depth of professional experience for this role.")
    else:
        weaknesses.append("Limited depth or duration of relevant professional experience.")
        improvement_suggestions.append("Clarify achievements and structure job role descriptions using action-oriented metrics.")

    if structure_score == 100.0:
        strengths.append("Standard, readable resume layout structures detected.")
    else:
        weaknesses.append("Missing core resume sections (Summary, Experience, Projects, or Education).")
        improvement_suggestions.append("Re-add missing core sections such as a professional summary or dedicated projects index.")

    return {
        "overallScore": overall_score,
        "sectionScores": {
            "skillMatch": skill_score,
            "semanticMatch": cosine_score,
            "experience": exp_score,
            "projects": project_score,
            "education": edu_score,
            "structure": structure_score,
            "certifications": cert_score
        },
        "analysis": {
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvementTips": improvement_suggestions
        }
    }
