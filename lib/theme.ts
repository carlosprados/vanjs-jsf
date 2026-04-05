export interface JsfTheme {
  // Structure
  container?: string;
  label?: string;
  description?: string;
  error?: string;

  // Inputs
  input?: string;
  textarea?: string;
  select?: string;
  option?: string;

  // Radio
  radioGroup?: string;
  radioLabel?: string;
  radioInput?: string;

  // Fieldset
  fieldset?: string;
  legend?: string;

  // File upload
  dropZone?: string;
  dropZoneActive?: string;
  dropZoneText?: string;
  fileInfoBar?: string;
  fileName?: string;
  fileSize?: string;
  fileClearButton?: string;
  fileReading?: string;

  // Required
  requiredIndicator?: string;
}

/** Maps field names to extra CSS classes for their container div */
export type JsfLayout = Record<string, string>;

/** Resolve a class: field class > theme class > empty string */
export const resolve = (fieldClass: string | undefined, themeClass: string | undefined): string =>
  fieldClass || themeClass || "";
