const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class ParserService {
  /**
   * Dispatches the local PDF file to the local FastAPI Resume Parser service.
   * @param {string} localFilePath - Path to the local temporary PDF file
   * @returns {Promise<Object>} The response containing rawResumeText and parsedResume
   */
  async parseResume(localFilePath) {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
      const url = `${aiServiceUrl}/api/resume/parse`;

      if (!fs.existsSync(localFilePath)) {
        throw new Error(`Local file not found for parsing: ${localFilePath}`);
      }

      const path = require('path');
      const fileBuffer = fs.readFileSync(localFilePath);
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: path.basename(localFilePath),
        contentType: 'application/pdf'
      });

      const response = await axios.post(url, form, {
        headers: {
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to parse resume via AI service.');
      }
    } catch (error) {
      console.error('FastAPI Resume Parser request failed:', error.message);
      if (error.response) {
        console.error('FastAPI response details:', error.response.status, error.response.data);
        throw new Error(`AI parser service error (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || error.message}`);
      }
      throw new Error(`AI parser network failure: ${error.message}`);
    }
  }

  /**
   * Cleans and formats the raw JSON payload to match the database schema.
   * Maps fields from the structured parsedResume to the legacy normalizedData structure.
   * @param {Object} parsedResume - The parsed JSON structure from Gemini
   * @returns {Object} Cleaned, standardized structure matching Resume schema
   */
  normalizeData(parsedResume) {
    if (!parsedResume) return {};

    const name = parsedResume.name || '';
    const email = parsedResume.email || '';
    const phone = parsedResume.phone || '';
    const summary = parsedResume.summary || '';

    // Merge skills, technicalSkills, softSkills into one flat list
    const parsedSkills = Array.isArray(parsedResume.skills) ? parsedResume.skills : [];
    const techSkills = Array.isArray(parsedResume.technicalSkills) ? parsedResume.technicalSkills : [];
    const softSkills = Array.isArray(parsedResume.softSkills) ? parsedResume.softSkills : [];
    
    // Combine and deduplicate
    const combinedSkillsSet = new Set([
      ...parsedSkills.map(s => String(s).trim()),
      ...techSkills.map(s => String(s).trim()),
      ...softSkills.map(s => String(s).trim())
    ]);
    const skills = Array.from(combinedSkillsSet).filter(Boolean);

    // Map education
    const educationList = Array.isArray(parsedResume.education) ? parsedResume.education : [];
    const education = educationList.map(edu => ({
      institution: edu.college || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startYear: '', 
      endYear: edu.year || ''
    }));

    // Map experience
    const experienceList = Array.isArray(parsedResume.experience) ? parsedResume.experience : [];
    const experience = experienceList.map(exp => ({
      company: exp.company || '',
      title: exp.role || '',
      startDate: exp.duration || '', 
      endDate: '',
      description: exp.description || ''
    }));

    // Map projects
    const projectsList = Array.isArray(parsedResume.projects) ? parsedResume.projects : [];
    const projects = projectsList.map(proj => ({
      title: proj.title || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies.map(t => String(t).trim()) : []
    }));

    // Map certifications
    const certsList = Array.isArray(parsedResume.certifications) ? parsedResume.certifications : [];
    const certifications = certsList.map(cert => String(cert).trim()).filter(Boolean);

    // Map languages
    const langsList = Array.isArray(parsedResume.languages) ? parsedResume.languages : [];
    const languages = langsList.map(lang => String(lang).trim()).filter(Boolean);

    return {
      fullName: name,
      email,
      phone,
      skills,
      education,
      experience,
      projects,
      certifications,
      languages,
      summary
    };
  }
}

module.exports = new ParserService();
