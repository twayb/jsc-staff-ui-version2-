export function stripHtmlTags(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export interface YearOption {
  name: number;
}

export function getYears(from: number): { years: YearOption[]; currentYear: number } {
  const currentYear = getCurrentYear();
  const years: YearOption[] = [];

  for (let index = 0; index <= currentYear - from; index++) {
    years.push({ name: from + index });
  }

  years.sort((a, b) => b.name - a.name);

  return { years, currentYear };
}

export function cando(permissionCode: string): boolean {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return !!user.permissions?.includes(permissionCode);
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}
