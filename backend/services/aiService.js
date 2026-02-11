const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.ZNAPAI_API_KEY,
  baseURL: 'https://api.znapai.com/',
});

const MODEL = 'gpt-5';
const REASONING_EFFORT = 'high';

/**
 * Parse raw resume text into structured JSON sections
 */
async function parseResumeContent(rawText) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      {
        role: 'system',
        content: `You are an expert resume parser. content extraction engine. Extract structured information from the resume text and return valid JSON only.
        
CRITICAL RULES:
1.  **Format**: Return ONLY valid JSON.
2.  **Structure**: Follow the exact JSON schema provided below.
3.  **Section Order**: Capture the *original* order of sections in the "sectionOrder" array. This is vital for preserving the user's intended layout.
4.  **Content**: Do not summarize or truncate content unless it's boilerplate. Extract the full text for descriptions.
5.  **Dates**: Standardize all dates to "Month YYYY" format (e.g., "May 2023") or "Present".

JSON Structure:
{
  "summary": "Full professional summary text",
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Name",
      "field": "Field of Study",
      "startDate": "Month YYYY",
      "endDate": "Month YYYY or Present",
      "gpa": "3.8/4.0",
      "details": "Honors, coursework, etc."
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Month YYYY",
      "endDate": "Month YYYY or Present",
      "location": "City, State",
      "bullets": ["Action verb + task + result", "..."]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill 1", "Skill 2"],
    "languages": ["Language 1"],
    "tools": ["Tool 1"]
  },
  "projects": [
    {
      "title": "Project Name",
      "techStack": ["Tech 1", "Tech 2"],
      "description": "Project description",
      "bullets": ["Key contribution 1", "Key contribution 2"]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Month YYYY"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"],
  "sectionOrder": ["summary", "education", "experience", "projects", "skills", "certifications", "achievements"],
  "style": "single-column"
}`,
      },
      {
        role: 'user',
        content: `Parse this resume text:\n\n${rawText}`,
      },
    ],
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  return parsed;
}

/**
 * Extract keywords and requirements from a job description
 */
async function extractJobKeywords(jobDescription) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      {
        role: 'system',
        content: `You are a job description analyzer. Extract key information and return valid JSON only.
Return this exact JSON structure:
{
  "roleTitle": "the job title",
  "requiredSkills": ["..."],
  "preferredSkills": ["..."],
  "keywords": ["ATS-relevant keywords and phrases"],
  "responsibilities": ["key responsibilities"],
  "experienceLevel": "entry/mid/senior",
  "industry": "industry name"
}`,
      },
      {
        role: 'user',
        content: `Analyze this job description:\n\n${jobDescription}`,
      },
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * Generate a tailored resume based on base resume, projects, and job description
 */
async function generateResume(baseResume, projects, jobAnalysis, templateStructure) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      {
        role: 'system',
        content: `You are an expert Resume Writer and Career Coach specializing in ATS-optimized resumes.
        
Your goal is to rewrite the user's resume to perfectly target the provided Job Description while maintaining honesty and professional standards.

RULES:
1.  **ATS Optimization**: Use standard keywords from the job description. Avoid creative headings; use standard ones (Experience, Education, Skills).
2.  **Impact-Driven**: Rewrite bullet points to follow the formula "Action Verb + Task + Result". Quantify results where possible (e.g., "Improved performance by 20%").
3.  **Relevance**: Prioritize experience and projects that match the job description. You can reorder bullet points within an entry, but do not reorder the entries themselves (chronological order must be preserved).
4.  **Tone**: Professional, confident, and concise. No personal pronouns (I, me, my).
5.  **Structure**: Strictly follow the requested JSON structure.
6.  **Formatting**: Ensure all dates are consistent "Month YYYY".

Return valid JSON only:
{
  "summary": "Compelling professional summary tailored to the role",
  "education": [...],
  "experience": [
    {
      "company": "Company",
      "role": "Role",
      "startDate": "Month YYYY",
      "endDate": "Month YYYY",
      "location": "City, State",
      "bullets": ["Tailored bullet 1", "Tailored bullet 2"]
    }
  ],
  "skills": {
    "technical": ["..."],
    "soft": ["..."],
    "languages": ["..."],
    "tools": ["..."]
  },
  "projects": [...],
  "certifications": [...],
  "achievements": [...],
  "atsScore": 90
}

Evaluate the match between the generated resume and the job description and assign an 'atsScore' (0-100).`,
      },
      {
        role: 'user',
        content: `Generate a tailored resume.

BASE RESUME:
${JSON.stringify(baseResume, null, 2)}

RELEVANT PROJECTS (Include these if they add value):
${JSON.stringify(projects, null, 2)}

TARGET JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

TEMPLATE STRUCTURE (Preserve this section order):
${JSON.stringify(templateStructure, null, 2)}`,
      },
    ],
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * Generate resume-ready bullet points from GitHub project data
 */
async function generateProjectBullets(projectData) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    reasoning_effort: REASONING_EFFORT,
    messages: [
      {
        role: 'system',
        content: `You are a resume writing expert. Transform project data into 2-4 impactful resume bullet points.
Each bullet should:
- Start with a strong action verb
- Highlight technical skills used
- Quantify impact where possible
- Be concise (one line each)

Return valid JSON: {"bullets": ["...", "..."], "description": "one-line project description"}`,
      },
      {
        role: 'user',
        content: `Generate resume bullets for this project:
Title: ${projectData.title}
Tech Stack: ${projectData.techStack?.join(', ') || 'N/A'}
Description/README: ${projectData.readme || projectData.description || 'N/A'}
Stars: ${projectData.stars || 0}, Forks: ${projectData.forks || 0}`,
      },
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

module.exports = {
  parseResumeContent,
  extractJobKeywords,
  generateResume,
  generateProjectBullets,
};
