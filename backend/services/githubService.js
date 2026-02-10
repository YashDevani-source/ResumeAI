const https = require('https');

const GITHUB_API = 'https://api.github.com';

/**
 * Make an authenticated GitHub API request
 */
async function githubFetch(endpoint, accessToken) {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'ResumeBuilder',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user's public repos with relevant data
 */
async function fetchUserRepos(accessToken) {
  const repos = await githubFetch(
    '/user/repos?sort=updated&per_page=50&type=owner',
    accessToken
  );

  return repos.map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics || [],
    updatedAt: repo.updated_at,
    isPrivate: repo.private,
  }));
}

/**
 * Fetch the README content for a specific repo
 */
async function fetchRepoReadme(accessToken, owner, repo) {
  try {
    const data = await githubFetch(`/repos/${owner}/${repo}/readme`, accessToken);
    // README content is base64 encoded
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    // Truncate to first 2000 chars for AI processing
    return content.substring(0, 2000);
  } catch {
    return null;
  }
}

/**
 * Fetch the languages used in a repo
 */
async function fetchRepoLanguages(accessToken, owner, repo) {
  try {
    return await githubFetch(`/repos/${owner}/${repo}/languages`, accessToken);
  } catch {
    return {};
  }
}

/**
 * Fetch detailed data for all user repos
 */
async function fetchDetailedRepos(accessToken, username) {
  const repos = await fetchUserRepos(accessToken);

  // Fetch additional data for top 20 repos (by stars, then recency)
  const topRepos = repos
    .sort((a, b) => b.stars - a.stars || new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20);

  const detailed = await Promise.all(
    topRepos.map(async (repo) => {
      const [readme, languages] = await Promise.all([
        fetchRepoReadme(accessToken, username, repo.name),
        fetchRepoLanguages(accessToken, username, repo.name),
      ]);

      return {
        ...repo,
        readme,
        techStack: Object.keys(languages),
      };
    })
  );

  return detailed;
}

module.exports = {
  fetchUserRepos,
  fetchRepoReadme,
  fetchRepoLanguages,
  fetchDetailedRepos,
};
