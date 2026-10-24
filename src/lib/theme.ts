/** U9: the persistent UI's colour follows the act it sits over (ink by default, bone for the experience act). */
export function setUiTheme(theme: 'ink' | 'bone'): void {
  document.documentElement.dataset.act = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'bone' ? '#EDE8DC' : '#0A0A0A');
}
