// src/scripts/utils/path-utils.js
export function getBasePath() {
  const isLocalDevelopment =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return isLocalDevelopment ? '/' : '/GeoTale/';
}

export function getResourcePath(resourcePath) {
  const base = getBasePath();
  const resource = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
  return `${base}${resource}`;
}
