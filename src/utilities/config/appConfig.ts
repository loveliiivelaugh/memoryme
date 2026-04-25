const trimTrailingSlash = (value?: string) => value?.replace(/\/+$/, '') ?? '';

const isDev = import.meta.env.MODE === 'development';
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const frontendOrigin = trimTrailingSlash(
  import.meta.env.VITE_PUBLIC_APP_URL || browserOrigin || (isDev ? 'http://localhost:5173' : 'https://memory.woodwardwebdev.com')
);

const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_HOSTNAME || (isDev ? 'http://localhost:5250' : 'https://aegis.woodwardwebdev.com')
);

const controlApiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_CONTROL_API_BASE_URL || apiBaseUrl
);

const controlApiChatPath = import.meta.env.VITE_CONTROL_API_CHAT_PATH || '/api/v1/control/chat/stream';

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Memory.me',
  frontendOrigin,
  apiBaseUrl,
  controlApiBaseUrl,
  controlApiChatPath,
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  adminUserId: import.meta.env.VITE_ADMIN_USER_ID || '',
  memoryEncryptionKey: import.meta.env.VITE_MEMORY_ENCRYPTION_KEY || '',
  masterApiKey: import.meta.env.VITE_MASTER_API_KEY || '',
};

export const getGithubAuthRedirectUrl = () => `${appConfig.frontendOrigin}/auth/callback/github`;
