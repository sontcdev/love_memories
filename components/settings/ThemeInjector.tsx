import { generateThemeCSS } from '@/lib/theme';

interface ThemeInjectorProps {
    themeColor?: string;
}

/**
 * Server-side component to inject theme CSS variables
 * Prevents FOUC (Flash of Unstyled Content)
 */
export default function ThemeInjector({ themeColor = '#9333ea' }: ThemeInjectorProps) {
    const themeCSS = generateThemeCSS(themeColor);

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
          :root {
            ${themeCSS}
          }
        `,
            }}
        />
    );
}
