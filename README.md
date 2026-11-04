# AI Resume Builder

## Project Description
The AI Resume Builder is a powerful web application designed to help users create ATS-optimized resumes effortlessly. By leveraging AI (powered by ZnapAI/OpenAI), it analyzes job descriptions and tailors resumes to increase the chances of passing Applicant Tracking Systems. Users can upload existing resumes, import projects from GitHub, and generate multiple versions of their resume tailored to specific job applications.

## Key Features
- **AI-Powered Generation**: Automatically tailor resumes based on job descriptions.
- **ATS Optimization**: Ensures resumes are formatted and keyword-optimized for ATS.
- **GitHub Integration**: Import projects directly from GitHub to showcase your portfolio.
- **Resume Management**: Store and manage multiple versions of your resume.
- **PDF/DOCX Export**: Download generated resumes in standard formats.
- **User Authentication**: Secure login and registration.

## Tech Stack
### Frontend
- **React (Vite)**: Fast and modern frontend framework.
- **React Router**: For seamless navigation.
- **Axios**: For API requests.
- **Lucide React**: For beautiful SVG icons.
- **CSS**: Custom styling for a responsive and premium UI.

### Backend
- **Node.js & Express**: Robust backend server.
- **MongoDB & Mongoose**: NoSQL database for flexible data storage.
- **Passport.js**: Authentication middleware (GitHub OAuth).
- **OpenAI/ZnapAI API**: For AI-driven content generation.
- **PDFKit / PDF-Parse**: For PDF generation and parsing.

## Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or a cloud instance like Atlas)
- Git

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/resume-builder.git
cd resume-builder
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ZNAPAI_API_KEY=your_znapai_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## Platform Walkthrough

### 1. Registration & Login
- **Sign Up**: Create an account using your email and password.
- **Login**: Access your account securely to manage your resumes.

### 2. Dashboard Overview
- Upon logging in, you'll land on the **Dashboard**.
- Here you can see quick stats: Total Resumes, Projects Imported, and Generated Resumes.
- Quick actions allow you to jump straight to uploading, importing projects, or generating a resume.

### 3. Uploading a Base Resume
- Navigate to the **Upload Resume** section.
- Upload your existing resume (PDF or DOCX).
- The system parses your resume to extract key details which will be used as a base for AI generation.

### 4. Importing Projects (GitHub)
- Go to the **Projects** page.
- Click **Sync GitHub** to automatically fetch your public repositories.
- You can also manually add projects if they are not on GitHub.
- Select which projects you want to feature in your resume.

### 5. Generating a Tailored Resume
- Navigate to the **Generate Resume** page.
- **Select Base Resume**: Choose one of your uploaded resumes.
- **Job Description**: Paste the job description you are applying for.
- **AI Customization**: The AI analyzes the job requirements and your profile to generate a tailored resume.
- It highlights relevant skills and experiences to match the job description.

### 6. Review & Download
- View the generated resume in the **Resume Preview** section.
- You can compare it with the original.
- **Download**: Export the final resume as a PDF or DOCX file, ready for application.

## GitHub Upload Guide

To upload this project to GitHub, follow these steps:

1.  **Initialize Git**:
    ```bash
    git init
    ```

2.  **Create a .gitignore**:
    Ensure you have a `.gitignore` file in the root directory (or in both `backend` and `frontend`) to exclude `node_modules` and `.env` files.
    
    Example root `.gitignore`:
    ```
    node_modules/
    .env
    .DS_Store
    dist/
    ```

3.  **Add Files**:
    ```bash
    git add .
    ```

4.  **Commit Changes**:
    ```bash
    git commit -m "Initial commit: AI Resume Builder"
    ```

5.  **Create a Repository on GitHub**:
    Go to [GitHub](https://github.com/new) and create a new repository.

6.  **Push to GitHub**:
    Link your local repository to the remote one and push the changes:
    ```bash
    git remote add origin https://github.com/yourusername/resume-builder.git
    git branch -M main
    git push -u origin main
    ```

## Vercel Deployment Guide

### Backend Deployment
1.  **Install Vercel CLI** (optional) or push your code to GitHub.
2.  **Go to Vercel Dashboard** and create a new project.
3.  **Import your repository**.
4.  **Configure Project**:
    - **Root Directory**: Select `backend`.
    - **Environment Variables**: Add all variables from your `backend/.env` file.
        | Variable | Development Value | Production Value (Vercel) |
        |----------|-------------------|---------------------------|
        | `PORT` | `5001` | (Vercel handles this, can omit) |
        | `NODE_ENV` | `development` | `production` |
        | `MONGODB_URI` | `...` | Same (or use prod DB) |
        | `JWT_SECRET` | `secret` | **New strong secret** |
        | `CLIENT_URL` | `http://localhost:5173` | `https://your-frontend-project.vercel.app` |
        | `GITHUB_CALLBACK_URL` | `http://localhost:5001/api/auth/github/callback` | `https://your-backend-project.vercel.app/api/auth/github/callback` |
        | `LINKEDIN_CALLBACK_URL` | `http://localhost:5001/api/auth/linkedin/callback` | `https://your-backend-project.vercel.app/api/auth/linkedin/callback` |
        | `ZNAPAI_API_KEY` | `...` | Same |
5.  **Deploy**: Click Deploy.

### Frontend Deployment
1.  **Create a new Project** in Vercel.
2.  **Import the same repository**.
3.  **Configure Project**:
    - **Root Directory**: Select `frontend`.
    - **Environment Variables**:
        - Add `VITE_API_URL` and set it to your deployed backend URL (e.g., `https://your-backend.vercel.app/api`).
4.  **Deploy**: Click Deploy.

## License
This project is open-source and available under the [MIT License](LICENSE).
