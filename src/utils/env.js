const getImportMetaEnv = () => {
  try {
    return import.meta.env || {};
  } catch (error) {
    return {};
  }
};

const getProcessEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  return {};
};

export const getEnvValue = (viteKey, reactAppKey, fallback = undefined) => {
  const importMetaEnv = getImportMetaEnv();
  const processEnv = getProcessEnv();

  if (viteKey && importMetaEnv[viteKey] !== undefined) {
    return importMetaEnv[viteKey];
  }

  if (reactAppKey && importMetaEnv[reactAppKey] !== undefined) {
    return importMetaEnv[reactAppKey];
  }

  if (viteKey && processEnv[viteKey] !== undefined) {
    return processEnv[viteKey];
  }

  if (reactAppKey && processEnv[reactAppKey] !== undefined) {
    return processEnv[reactAppKey];
  }

  return fallback;
};

export const getBooleanEnvValue = (viteKey, reactAppKey, fallback = false) => {
  const value = getEnvValue(viteKey, reactAppKey);
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
};

export const isDevelopment = (() => {
  const importMetaEnv = getImportMetaEnv();
  if (typeof importMetaEnv.DEV === 'boolean') {
    return importMetaEnv.DEV;
  }

  const nodeEnv = getEnvValue('NODE_ENV', 'NODE_ENV', 'production');
  return nodeEnv === 'development';
})();

export const getRuntimeMode = () =>
  getEnvValue('MODE', 'NODE_ENV', isDevelopment ? 'development' : 'production');

export const getBaseUrl = () => {
  const importMetaEnv = getImportMetaEnv();
  const explicitBase = getEnvValue('VITE_PUBLIC_BASE_URL', 'REACT_APP_PUBLIC_BASE_URL', '');
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  const viteBase = importMetaEnv.BASE_URL || '/';
  if (viteBase === '/') {
    return '';
  }

  return viteBase.replace(/\/$/, '');
};

export const withBaseUrl = (path = '') => {
  if (!path) {
    return getBaseUrl() || '/';
  }

  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
};

