// Type declarations for optional peer dependencies (dynamically imported)
declare module "papaparse" {
  interface ParseResult<T> {
    data: T[];
    errors: Array<{ message: string; row?: number }>;
    meta: { fields?: string[] };
  }
  interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean;
  }
  const Papa: {
    parse<T = Record<string, unknown>>(input: string, config?: ParseConfig): ParseResult<T>;
  };
  export default Papa;
}

declare module "xlsx" {
  interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WorkSheet {}
  export function read(data: ArrayBuffer | string, opts?: Record<string, unknown>): WorkBook;
  export const utils: {
    sheet_to_json<T = Record<string, unknown>>(sheet: WorkSheet, opts?: Record<string, unknown>): T[];
  };
}
