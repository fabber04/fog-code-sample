const DEFAULT_PROD_API = 'https://api.example.com';

function resolveApiBase() {
  const envApiUrl = process.env.REACT_APP_API_URL;
  if (
    envApiUrl &&
    envApiUrl !== 'undefined' &&
    envApiUrl.trim() !== '' &&
    !envApiUrl.includes('api.familyofgreatness.com')
  ) {
    return envApiUrl;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  return DEFAULT_PROD_API;
}

/** Trigger a browser download for a podcast audio file. */
export function downloadPodcastAudio(podcast) {
  if (!podcast?.audioUrl || podcast.audioUrl === '#') {
    return false;
  }

  const apiBase = resolveApiBase();
  let downloadUrl = podcast.audioUrl;

  if (downloadUrl.startsWith('/')) {
    downloadUrl = `${apiBase}${downloadUrl}`;
  } else if (!downloadUrl.startsWith('http')) {
    downloadUrl = `${apiBase}/${downloadUrl}`;
  }

  const urlPath = podcast.audioUrl.includes('/')
    ? podcast.audioUrl.split('/').pop()
    : podcast.audioUrl;
  const filename =
    decodeURIComponent(urlPath) ||
    `${podcast.title || 'podcast'}.${podcast.audioUrl.split('.').pop() || 'm4a'}`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
