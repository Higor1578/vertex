export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem('hg-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('hg-theme', theme);
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}
