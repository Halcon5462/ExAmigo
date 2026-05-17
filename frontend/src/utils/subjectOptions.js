export const SUBJECT_OPTIONS = [
  { value: 'prof_math', label: 'Профильная математика' },
  { value: 'russian', label: 'Русский язык' },
  { value: 'physics', label: 'Физика' },
  { value: 'informatic', label: 'Информатика' },
];

export const getSubjectLabel = (subject) => SUBJECT_OPTIONS.find((option) => option.value === subject)?.label || subject;
