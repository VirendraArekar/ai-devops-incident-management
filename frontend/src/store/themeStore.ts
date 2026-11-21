import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme') as Theme | null;
    if (themeParam === 'light' || themeParam === 'dark') {
      return themeParam;
    }
    const saved = localStorage.getItem('sre_app_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('sre_app_theme', theme);
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = getInitialTheme();
  applyThemeToDOM(initialTheme);

  return {
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyThemeToDOM(nextTheme);
        return { theme: nextTheme };
      }),
    setTheme: (theme: Theme) => {
      applyThemeToDOM(theme);
      set({ theme });
    },
  };
});
