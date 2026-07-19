from pydantic import BaseModel, Field
from typing import List, Optional

class EducationItem(BaseModel):
    degree: str = Field(default="", description="Degree obtained (e.g. B.Tech, MS)")
    college: str = Field(default="", description="Name of the university or college")
    year: str = Field(default="", description="Year of graduation or study duration")
    cgpa: str = Field(default="", description="Grade Point Average or percentage, if specified")

class ExperienceItem(BaseModel):
    company: str = Field(default="", description="Name of the organization/company")
    role: str = Field(default="", description="Job title/role")
    duration: str = Field(default="", description="Duration of employment (e.g. 6 Months, Jan 2021 - Present)")
    description: str = Field(default="", description="Description of responsibilities and accomplishments")

class ProjectItem(BaseModel):
    title: str = Field(default="", description="Title of the project")
    description: str = Field(default="", description="Short description of the project")
    technologies: List[str] = Field(default_factory=list, description="Technologies used in the project")

class ResumeSchema(BaseModel):
    name: str = Field(default="", description="Full name of the candidate")
    email: str = Field(default="", description="Email address")
    phone: str = Field(default="", description="Contact phone number")
    linkedin: str = Field(default="", description="LinkedIn profile URL")
    github: str = Field(default="", description="GitHub profile URL")
    portfolio: str = Field(default="", description="Portfolio URL or personal website")
    location: str = Field(default="", description="City and country, or address")
    summary: str = Field(default="", description="Professional summary or profile statement")
    skills: List[str] = Field(default_factory=list, description="List of overall skills")
    education: List[EducationItem] = Field(default_factory=list, description="List of education records")
    experience: List[ExperienceItem] = Field(default_factory=list, description="List of work experience records")
    projects: List[ProjectItem] = Field(default_factory=list, description="List of key projects")
    certifications: List[str] = Field(default_factory=list, description="List of certifications")
    languages: List[str] = Field(default_factory=list, description="List of languages spoken")
    achievements: List[str] = Field(default_factory=list, description="List of accomplishments or awards")
    softSkills: List[str] = Field(default_factory=list, description="List of soft skills (e.g. communication, leadership)")
    technicalSkills: List[str] = Field(default_factory=list, description="List of technical/hard skills (e.g. python, fastapi)")
