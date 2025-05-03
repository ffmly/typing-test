import { useState } from 'react';

interface SettingsPanelProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const themes = [
  { name: 'Dark', value: 'dark' },
  { name: 'Light', value: 'light' },
  { name: 'Accent', value: 'accent' },
  { name: 'Pastel', value: 'pastel' },
  { name: 'Solarized', value: 'solarized' },
  { name: 'Nature', value: 'nature' },
  { name: 'Dracula', value: 'dracula' },
  { name: 'Nord', value: 'nord' },
  { name: 'One Dark', value: 'one-dark' },
  { name: 'Gruvbox Dark', value: 'gruvbox-dark' },
  { name: 'Gruvbox Light', value: 'gruvbox-light' },
  { name: 'Catppuccin Mocha', value: 'catppuccin-mocha' },
  { name: 'Catppuccin Latte', value: 'catppuccin-latte' },
  { name: 'Material Ocean', value: 'material-ocean' },
  { name: 'Tokyo Night', value: 'tokyo-night' },
  { name: 'True Black', value: 'true-black' },
];

const SettingsPanel = ({ theme, setTheme }: SettingsPanelProps) => {
  return (
    <div className="modal w-full max-w-md mx-auto mt-4">
      <h3 className="text-lg font-bold mb-6">Theme</h3>
      <div className="flex flex-wrap gap-3 justify-center mb-2">
        {themes.map((t) => (
          <button
            key={t.value}
            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors duration-200 ${theme === t.value ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg)] shadow' : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-primary)]'}`}
            onClick={() => setTheme(t.value)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsPanel; 