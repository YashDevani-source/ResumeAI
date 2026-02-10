const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.ZNAPAI_API_KEY,
  baseURL: 'https://api.znapai.com/',
});

const MODEL = 'gpt-4o-mini';

/**
 * Parse raw resume text into structured JSON sections
 */
async function parseResumeContent(rawText) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a resume parser. Extract structured information from the resume text and return valid JSON only. No markdown, no explanation.
Return this exact JSON structure:
{
  "summary": "professional summary or objective text",
  "education": [{"institution":"","degree":"","field":"","startDate":"","endDate":"","gpa":"","details":""}],
  "experience": [{"company":"","role":"","startDate":"","endDate":"","location":"","bullets":["..."]}],
  "skills": {"technical":["..."],"soft":["..."],"languages":["..."],"tools":["..."]},
  "projects": [{"title":"","techStack":["..."],"description":"","bullets":["..."]}],
  "certifications": [{"name":"","issuer":"","date":""}],
  "achievements": ["..."],
  "sectionOrder": ["summary","education","experience","skills","projects","certifications","achievements"],
  "style": "single-column"
}
Only include sections that exist in the resume. Preserve the order of sections as they appear in the original text in the sectionOrder array. If a section doesn't exist, use an empty array or empty string.`,
      },
      {
        role: 'user',
        content: `Parse this resume:\n\n${rawText}`,
      },
    ],
    temperature: 0.1,
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
    temperature: 0.1,
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
    messages: [
      {
        role: 'system',
        content: `You are an expert ATS-optimized resume writer. Generate a tailored resume that:
1. PRESERVES the original resume's section order and structure exactly as specified in templateStructure
2. Optimizes content for the target job description keywords
3. Uses strong action verbs and quantifies impact where possible
4. Does NOT invent any experience or qualifications — only rephrase and optimize existing content
5. Prioritizes the most relevant projects and skills for the target role
6. Ensures ATS-friendly formatting (no tables, no icons, standard headings)

Return valid JSON only with this structure:
{
  "summary": "tailored professional summary",
  "education": [{"institution":"","degree":"","field":"","startDate":"","endDate":"","gpa":"","details":""}],
  "experience": [{"company":"","role":"","startDate":"","endDate":"","location":"","bullets":["..."]}],
  "skills": {"technical":["..."],"soft":["..."],"languages":["..."],"tools":["..."]},
  "projects": [{"title":"","techStack":["..."],"description":"","bullets":["..."]}],
  "certifications": [{"name":"","issuer":"","date":""}],
  "achievements": ["..."],
  "atsScore": 85
}
The atsScore should be your estimate (0-100) of how well this resume matches the job description.`,
      },
      {
        role: 'user',
        content: `Generate a tailored resume.

ORIGINAL RESUME CONTENT:
${JSON.stringify(baseResume, null, 2)}

AVAILABLE PROJECTS:
${JSON.stringify(projects, null, 2)}

JOB ANALYSIS:
${JSON.stringify(jobAnalysis, null, 2)}

TEMPLATE STRUCTURE (must preserve this order):
${JSON.stringify(templateStructure, null, 2)}`,
      },
    ],
    temperature: 0.3,
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
    temperature: 0.4,
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
