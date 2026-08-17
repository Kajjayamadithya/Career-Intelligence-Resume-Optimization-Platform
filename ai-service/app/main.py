import os
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from app.scoring.ats_scoring import calculate_ats_report
from app.scoring.skill_gap import analyze_skill_gaps
from app.services.gemini_service import gemini_service
from app.utils.pdf_parser import extract_text_from_pdf, clean_extracted_text, PDFParsingError
from dotenv import load_dotenv


# Load env variables
load_dotenv()

app = FastAPI(
    title="AI Career Intelligence ML Service",
    description="Python FastAPI Semantic Matching & NLP Extraction Service",
    version="1.0.0"
)

# Enable CORS for internal cross-talk
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas for request validation
class ATSCalculateRequest(BaseModel):
    resume_data: Dict[str, Any] = Field(..., description="Normalized Mongoose Resume data payload")
    job_description: str = Field(..., description="Job Description text to compare against")
    target_title: Optional[str] = Field("", description="Target job title to inspect matches")

class SkillGapRequest(BaseModel):
    resume_skills: List[str] = Field(..., description="List of user resume skills")
    job_description: str = Field(..., description="Job Description text to match against")

class RoadmapRequest(BaseModel):
    career_goal: str = Field(..., description="Target career goal role")
    resume_skills: List[str] = Field(..., description="List of user resume skills")

class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User's chat input")
    history: List[Dict[str, str]] = Field(default=[], description="List of previous messages in history")
    resume_skills: List[str] = Field(default=[], description="User's resume skills")
    resume_data: Optional[Dict[str, Any]] = Field(default=None, description="Candidate normalized resume payload for RAG vector search")

class ResourceSearchRequest(BaseModel):
    topic: str = Field(..., description="Learning topic string")
    objectives: List[str] = Field(default=[], description="List of learning objectives")

class InterviewQuestionsRequest(BaseModel):
    role: str = Field(..., description="Target job role")
    category: str = Field(..., description="Interview category, e.g., Technical, Behavioral, HR")

class InterviewEvaluateRequest(BaseModel):
    question: str = Field(..., description="Question being evaluated")
    answer: str = Field(..., description="Candidate's answer")
    role: str = Field(..., description="Target job role")
    category: str = Field(..., description="Interview category")

class InterviewFeedbackRequest(BaseModel):
    role: str = Field(..., description="Target job role")
    category: str = Field(..., description="Interview category")
    qas: List[Dict[str, Any]] = Field(..., description="Questions, answers, scores, and feedback")

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "AI Career Intelligence ML Engine",
        "model": "all-MiniLM-L6-v2"
    }

@app.post("/api/ats/calculate")
def calculate_ats(payload: ATSCalculateRequest):
    try:
        report = calculate_ats_report(
            resume_data=payload.resume_data,
            job_description=payload.job_description,
            target_title=payload.target_title
        )
        return {
            "success": True,
            "report": report
        }
    except Exception as e:
        print(f"Error in /api/ats/calculate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ML calculation failure: {str(e)}")

@app.post("/api/skills/analyze")
def analyze_skills(payload: SkillGapRequest):
    try:
        gap_report = analyze_skill_gaps(
            resume_skills=payload.resume_skills,
            job_description=payload.job_description
        )
        return {
            "success": True,
            "analysis": gap_report
        }
    except Exception as e:
        print(f"Error in /api/skills/analyze: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failure: {str(e)}")

@app.post("/api/career/roadmap")
def generate_roadmap(payload: RoadmapRequest):
    try:
        roadmap = gemini_service.generate_roadmap(
            career_goal=payload.career_goal,
            resume_skills=payload.resume_skills
        )
        return {
            "success": True,
            "roadmap": roadmap
        }
    except Exception as e:
        print(f"Error in /api/career/roadmap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/message")
def chat_message_route(payload: ChatMessageRequest):
    try:
        reply = gemini_service.chat_message(
            message=payload.message,
            history=payload.history,
            resume_skills=payload.resume_skills,
            resume_data=payload.resume_data
        )
        return {
            "success": True,
            "reply": reply
        }
    except Exception as e:
        print(f"Error in /api/chat/message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/resources/search")
def search_resources_route(payload: ResourceSearchRequest):
    try:
        from app.rag.resource_rag import resource_rag_engine
        resource = resource_rag_engine.search_resources(
            topic=payload.topic,
            objectives=payload.objectives
        )
        return {
            "success": True,
            "resource": resource
        }
    except Exception as e:
        print(f"Error in /api/rag/resources/search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/questions")
def generate_interview_questions_route(payload: InterviewQuestionsRequest):
    try:
        questions = gemini_service.generate_interview_questions(
            role=payload.role,
            category=payload.category
        )
        return {
            "success": True,
            "questions": questions
        }
    except Exception as e:
        print(f"Error in /api/interview/questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/evaluate")
def evaluate_interview_answer_route(payload: InterviewEvaluateRequest):
    try:
        evaluation = gemini_service.evaluate_interview_answer(
            question=payload.question,
            answer=payload.answer,
            role=payload.role,
            category=payload.category
        )
        return {
            "success": True,
            "evaluation": evaluation
        }
    except Exception as e:
        print(f"Error in /api/interview/evaluate: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/feedback")
def generate_overall_feedback_route(payload: InterviewFeedbackRequest):
    try:
        feedback = gemini_service.generate_overall_interview_feedback(
            role=payload.role,
            category=payload.category,
            qas=payload.qas
        )
        return {
            "success": True,
            "feedback": feedback
        }
    except Exception as e:
        print(f"Error in /api/interview/feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume/parse")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    # Validate file type
    is_pdf = file.filename.lower().endswith('.pdf') or (file.content_type and 'pdf' in file.content_type.lower())
    if not is_pdf:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        pdf_bytes = await file.read()
        
        # 1. Extract text using PyMuPDF
        raw_text = extract_text_from_pdf(pdf_bytes)
        
        # 2. Clean extracted text
        cleaned_text = clean_extracted_text(raw_text)
        
        # 3. Parse with Gemini and validate using Pydantic (with retries on validation fail)
        parsed_resume = gemini_service.parse_resume_text(cleaned_text)
        
        return {
            "success": True,
            "message": "Resume parsed successfully.",
            "data": {
                "rawResumeText": cleaned_text,
                "parsedResume": parsed_resume
            }
        }
    except PDFParsingError as pe:
        print(f"PDF Parsing Error: {str(pe)}")
        raise HTTPException(status_code=400, detail=str(pe))
    except Exception as e:
        print(f"Error during resume parsing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

