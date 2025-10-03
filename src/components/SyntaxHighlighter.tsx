import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/use-theme';
interface CustomSyntaxHighlighterProps {
  language: string;
  children: string;
}
export function CustomSyntaxHighlighter({ language, children }: CustomSyntaxHighlighterProps) {
  const { isDark } = useTheme();
  const themeStyle = isDark ? vscDarkPlus : prism;
  const customStyle = {
    ...themeStyle,
    'pre[class*="language-"]': {
      ...themeStyle['pre[class*="language-"]'],
      backgroundColor: isDark ? 'rgb(30 41 59 / 0.8)' : 'rgb(241 245 249 / 0.8)',
      border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      fontSize: '0.9rem',
      lineHeight: '1.6',
      fontFamily: 'var(--font-mono)',
    },
  };
  return (
    <SyntaxHighlighter
      language={language}
      style={customStyle}
      showLineNumbers
      wrapLines
      wrapLongLines
    >
      {children}
    </SyntaxHighlighter>
  );
}