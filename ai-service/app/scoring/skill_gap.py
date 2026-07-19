import re
from typing import Dict, List, Any, Set
from app.nlp.keyword_extractor import keyword_extractor

# Predefined categorization map for fallback
CORE_LANGUAGES_FRAMEWORKS = {
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "react", "angular", "vue", "next.js", "node.js", "express", "fastapi", "django", "spring boot"
}

SECONDARY_TOOLS_DATABASES = {
    "mongodb", "postgresql", "mysql", "redis", "firebase", "sql", "nosql",
    "aws", "docker", "kubernetes", "git", "github", "ci/cd", "graphql", "rest api"
}

def analyze_skill_gaps(resume_skills: List[str], job_description: str) -> Dict[str, Any]:
    """
    Compares resume skills vs job description skills.
    Categorizes missing skills into High, Medium, and Low priorities:
    - High: Appears 3+ times in the JD, or is a core language/framework.
    - Medium: Appears 2 times in the JD, or is a standard tool/database.
    - Low: Appears 1 time in the JD and is a helper utility.
    """
    resume_skills_lower = {s.lower().strip() for s in resume_skills}
    jd_skills = keyword_extractor.extract_keywords(job_description)
    
    missing_skills = []
    matched_skills = []

    # Identify matches vs missing
    for skill in jd_skills:
        # Check direct match or substring match (e.g. "node" in "node.js")
        is_matched = False
        for rs in resume_skills_lower:
            if skill == rs or (len(skill) > 3 and skill in rs) or (len(rs) > 3 and rs in skill):
                is_matched = True
                break
        
        if is_matched:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    high_priority = []
    medium_priority = []
    low_priority = []

    # Analyze frequencies in Job Description text
    jd_lower = job_description.lower()
    
    for skill in missing_skills:
        # Find frequency of skill using regex word boundaries
        escaped_skill = re.escape(skill)
        matches = re.findall(rf'\b{escaped_skill}\b', jd_lower)
        count = len(matches)
        
        # Categorize
        if count >= 3 or skill in CORE_LANGUAGES_FRAMEWORKS:
            high_priority.append(skill)
        elif count == 2 or skill in SECONDARY_TOOLS_DATABASES:
            medium_priority.append(skill)
        else:
            low_priority.append(skill)

    # Sort each list alphabetically for clean output
    high_priority.sort()
    medium_priority.sort()
    low_priority.sort()

    # Generate a step-by-step learning order
    suggested_order = []
    step_num = 1

    if high_priority:
        suggested_order.append(f"Step {step_num}: Master core foundational requirements ({', '.join(high_priority)}). These are highly demanded in this job description.")
        step_num += 1
    
    if medium_priority:
        suggested_order.append(f"Step {step_num}: Learn supporting tools and databases ({', '.join(medium_priority)}) to strengthen project architecture.")
        step_num += 1
        
    if low_priority:
        suggested_order.append(f"Step {step_num}: Familiarize yourself with secondary utilities and helper libraries ({', '.join(low_priority)}).")
        step_num += 1

    if not suggested_order:
        suggested_order.append("Your skills already cover all requirements identified in the job description!")

    return {
        "missingSkills": missing_skills,
        "highPriority": high_priority,
        "mediumPriority": medium_priority,
        "lowPriority": low_priority,
        "suggestedLearningOrder": suggested_order
    }
