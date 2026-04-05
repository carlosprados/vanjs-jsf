import van, { State } from "vanjs-core";
import { VanJSComponent } from "./VanJSComponent";
import pikaday from "pikaday";
import { basicSetup, EditorView } from "codemirror"
import { javascript, esLint } from "@codemirror/lang-javascript";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { lintGutter, linter, forEachDiagnostic } from "@codemirror/lint";
import * as eslint from "eslint-linter-browserify";
import globals from "globals";
const { div, p, input, label, textarea, legend, link, fieldset, span, select, option, button, table, tr, th, td, strong, small } = van.tags;

enum FieldType {
  text = "text",
  code = "code",
  number = "number",
  textarea = "textarea",
  select = "select",
  radio = "radio",
  date = "date",
  fieldset = "fieldset",
  file = "file"
}
const eslintConfig = {
  // eslint configuration
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
  rules: {
    semi: ["error", "never"],
  },
};
export interface Option {
  label: string;
  value: string;
  description?: string;
  img?: string;
}

export type MultiType = string | number | boolean;

export class VanJsfField extends VanJSComponent {
  name: string;
  field: Record<string, unknown>;
  iniVal: MultiType;
  handleChange: (field: VanJsfField, value: MultiType) => void;
  isVisibleState: State<boolean>;
  errorState: State<string>;
  /** Used by file fields to pass the selected arrayPath key to formValues */
  arrayPathValue: string = "";
  constructor(
    field: Record<string, unknown>,
    initVal: MultiType,
    handleChange: (field: VanJsfField, value: MultiType) => void
  ) {
    super();
    this.field = field;
    this.name = field.name as string;
    this.iniVal = initVal;
    this.handleChange = handleChange;
    this.isVisibleState = van.state(this.field.isVisible as boolean);
    this.errorState = van.state("");
  }

  get inputType(): string {
    return this.field.inputType as string;
  }
  get label(): string {
    return this.field.label as string;
  }
  get class(): string {
    return this.field.class as string;
  }
  get errorClass(): string {
    return this.field.errorClass as string;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get codemirrorExtension(): Array<any> {
    const theme = EditorView.theme({
      '.cm-content, .cm-gutter': {
        "min-height": "150px",
      },
      '.cm-content': {
        "min-height": "150px",
      },
      '.cm-gutters': {
        margin: '1px',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
      '.cm-wrap': {
        border: '1px solid silver',
      },
    });
    const extensions = [theme, EditorView.updateListener.of((e) => {
      this.field.error = null
      forEachDiagnostic(e.state, (diag) => {
        if (diag.severity === "error") {
          this.field.error = diag.message
        }
      })
      this.handleChange(this, e.state.doc.toString())
    }), basicSetup, lintGutter()]
    switch (this.field.codemirrorType) {
      case "json": extensions.push(json(), linter(jsonParseLinter())); break;
      case "javascript": extensions.push(javascript(), linter(esLint(new eslint.Linter(), eslintConfig))); break;
      case "typescript": extensions.push(javascript({ typescript: true }), linter(esLint(new eslint.Linter(), eslintConfig))); break;
      default: extensions.push(javascript(), linter(esLint(new eslint.Linter(), eslintConfig))); break;
    }
    return extensions
  }
  get containerClass(): string {
    return this.field.containerClass as string;
  }
  get containerId(): string {
    return this.field.containerId as string;
  }
  get titleClass(): string {
    return this.field.titleClass as string;
  }
  get descriptionClass(): string {
    return this.field.descriptionClass as string;
  }
  get description(): string {
    return this.field.description as string;
  }
  get options(): Option[] {
    return this.field.options as Option[];
  }
  get isVisible(): boolean {
    return this.isVisibleState.val;
  }
  set isVisible(val: boolean) {
    this.isVisibleState.val = val;
  }

  get error(): string {
    return this.errorState.val;
  }

  set error(val: string) {
    this.errorState.val = val;
  }
  render(): Element {
    let el: Element;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: Record<string, any> = {
      style: () => (this.isVisible ? "display: block" : "display: none"),
      class: this.containerClass || ''
    };
    switch (this.inputType) {
      case FieldType.text:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
          input({
            id: this.name,
            type: "text",
            class: this.class || '',
            value: this.iniVal,
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
          }),
          p({ class: this.errorClass }, () => this.error)
        );
        break;

      case FieldType.textarea:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
          textarea({
            id: this.name,
            name: this.name,
            class: this.class || '',
            rows: this.field.rows as number,
            cols: this.field.columns as number,
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLTextAreaElement).value),
          }),
          p({ class: this.errorClass }, () => this.error)
        );
        break;
      case FieldType.code:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
        );
        new EditorView({
          doc: String(this.iniVal),
          parent: el,
          extensions: this.codemirrorExtension
        });
        break;
      case FieldType.select:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
          select({
            id: this.name,
            name: this.name,
            class: this.class || '',
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLSelectElement).value),
          },
            this.options?.map((opt: Option) =>
              option({ class: this.class || '', value: opt.value },
                opt.label,
                opt.description,
              )
            )
          ), p({ class: this.errorClass }, () => this.error)
        );
        break;

      case FieldType.date: {
        const calendarInput = input({
          id: this.name,
          type: "text",
          class: this.class || '',
          value: this.iniVal,
          onchange: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
        });
        el =
          div(
            props,
            label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
            this.description &&
            div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
            calendarInput,
            p({ class: this.errorClass }, () => this.error),
            // External CDN dependency for Pikaday CSS — consider bundling for production
            link({ rel: "stylesheet", type: "text/css", href: "https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css" })
          );
        new pikaday({
          field: calendarInput,
          format: 'YYYY-MM-DD',
          container: el as HTMLElement,
          firstDay: 1,
          toString(date: Date) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`;
          },
          parse(dateString: string) {
            const parts = dateString.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
          }
        });
        break;
      }
      case FieldType.number:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
          input({
            id: this.name,
            type: "number",
            class: this.class || '',
            value: this.iniVal,
            oninput: (e: Event) => {
              const val = (e.target as HTMLInputElement).value;
              this.handleChange(this, val === "" ? "" : Number(val));
            },
          }),
          p({ class: this.errorClass }, () => this.error)
        );
        break;
      case FieldType.fieldset:
        el = div(
          props,
          fieldset(legend({ class: this.titleClass || '' }, this.label), this.description &&
            span({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description), this.isVanJsfFieldArray(this.field.fields) ? this.field.fields.map((field: VanJsfField) =>
              field.render()
            ) : null)
        );
        break;
      case FieldType.radio:
        el = div(
          legend({ class: this.titleClass || '' }, this.label),
          this.description && div(this.description),
          div(
            this.options?.map((opt: Option) =>
              label(
                input({
                  type: "radio",
                  name: this.name,
                  class: this.class || '',
                  value: opt.value,
                  checked: this.iniVal === opt.value,
                  onchange: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
                }),
                opt.label,
                opt.description
              )
            )
          ),
          p({ class: this.errorClass }, () => this.error)
        );
        break;
      case FieldType.file: {
        const accept = (this.field.accept as string) || ".json,.csv,.xlsx";
        const maxSizeMB = (this.field.maxSizeMB as number) || 50;
        const previewRows = (this.field.previewRows as number) || 5;

        // Reactive states
        const fileNameState = van.state("");
        const fileSizeState = van.state("");
        const parsingState = van.state(false);
        const parsedDataState: State<Record<string, unknown>[] | null> = van.state(null);
        const arrayPathOptionsState: State<string[]> = van.state([]);
        const selectedArrayPathState = van.state("");
        const dragOverState = van.state(false);

        const formatSize = (bytes: number): string => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        const formatNumber = (n: number): string => n.toLocaleString();

        const resolveArrayFromJson = (parsed: unknown): { data: Record<string, unknown>[] | null; paths: string[] } => {
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
            return { data: parsed, paths: [] };
          }
          if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            const candidates: string[] = [];
            for (const [key, val] of Object.entries(parsed)) {
              if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
                candidates.push(key);
              }
            }
            if (candidates.length === 1) {
              return { data: (parsed as Record<string, unknown>)[candidates[0]] as Record<string, unknown>[], paths: [] };
            }
            if (candidates.length > 1) {
              return { data: null, paths: candidates };
            }
          }
          return { data: null, paths: [] };
        };

        const setData = (data: Record<string, unknown>[], arrayPath: string) => {
          parsedDataState.val = data;
          this.arrayPathValue = arrayPath;
          selectedArrayPathState.val = arrayPath;
          parsingState.val = false;
          this.handleChange(this, JSON.stringify(data));
        };

        const setError = (msg: string) => {
          parsingState.val = false;
          parsedDataState.val = null;
          this.error = msg;
        };

        const processFile = async (file: File) => {
          // Reset state
          this.error = "";
          parsedDataState.val = null;
          arrayPathOptionsState.val = [];
          selectedArrayPathState.val = "";
          this.arrayPathValue = "";

          // Validate size
          if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File exceeds maximum size of ${maxSizeMB} MB`);
            return;
          }

          fileNameState.val = file.name;
          fileSizeState.val = formatSize(file.size);
          parsingState.val = true;

          const ext = file.name.split(".").pop()?.toLowerCase() || "";

          try {
            if (ext === "json") {
              const text = await file.text();
              let parsed: unknown;
              try { parsed = JSON.parse(text); } catch { setError("Invalid JSON file"); return; }
              const { data, paths } = resolveArrayFromJson(parsed);
              if (data) {
                setData(data, "");
              } else if (paths.length > 1) {
                arrayPathOptionsState.val = paths;
                parsingState.val = false;
              } else {
                setError("JSON does not contain an array of objects");
              }
            } else if (ext === "csv") {
              try {
                const Papa = await import("papaparse");
                const text = await file.text();
                const result = Papa.default.parse(text, { header: true, skipEmptyLines: true });
                if (result.errors.length > 0) {
                  setError(`CSV parse error: ${result.errors[0].message}`);
                } else if (!result.data || result.data.length === 0) {
                  setError("CSV file is empty or has no data rows");
                } else {
                  setData(result.data as Record<string, unknown>[], "");
                }
              } catch {
                setError("Install papaparse to support CSV files: npm install papaparse");
              }
            } else if (ext === "xlsx" || ext === "xls") {
              try {
                const XLSX = await import("xlsx");
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer);
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) { setError("XLSX file has no sheets"); return; }
                const sheet = workbook.Sheets[firstSheetName];
                const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
                if (data.length === 0) { setError("XLSX sheet is empty"); return; }
                setData(data, "");
              } catch (e) {
                if (e instanceof Error && e.message.includes("Failed to fetch dynamically imported module")) {
                  setError("Install xlsx to support XLSX files: npm install xlsx");
                } else if (e instanceof Error) {
                  setError(`XLSX parse error: ${e.message}`);
                } else {
                  setError("Install xlsx to support XLSX files: npm install xlsx");
                }
              }
            } else {
              setError(`Unsupported file extension: .${ext}`);
            }
          } catch (e) {
            setError(e instanceof Error ? e.message : "Error processing file");
          }
        };

        const clearFile = () => {
          fileNameState.val = "";
          fileSizeState.val = "";
          parsedDataState.val = null;
          parsingState.val = false;
          arrayPathOptionsState.val = [];
          selectedArrayPathState.val = "";
          this.arrayPathValue = "";
          this.error = "";
          this.handleChange(this, "");
        };

        const fileInput = input({
          type: "file",
          accept,
          style: "display: none;",
          onchange: (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) processFile(files[0]);
          },
        });

        const dropZone = div(
          {
            style: () => {
              const over = dragOverState.val;
              return `border: 2px dashed ${over ? "#4a90d9" : "#ccc"}; border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: border-color 0.2s; background: ${over ? "#f0f7ff" : "transparent"};`;
            },
            ondragover: (e: DragEvent) => { e.preventDefault(); dragOverState.val = true; },
            ondragleave: () => { dragOverState.val = false; },
            ondrop: (e: DragEvent) => {
              e.preventDefault();
              dragOverState.val = false;
              const files = e.dataTransfer?.files;
              if (files && files[0]) processFile(files[0]);
            },
            onclick: () => fileInput.click(),
          },
          p({ style: "margin: 0; color: #666;" }, `Drop a file here or click to browse (${accept})`),
        );

        // We need to store the raw JSON for arrayPath selection
        const rawJsonState: State<Record<string, unknown> | null> = van.state(null);

        // Override processFile's JSON branch to also store raw JSON
        const originalProcessFile = processFile;
        const processFileWrapped = async (file: File) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          if (ext === "json") {
            this.error = "";
            parsedDataState.val = null;
            arrayPathOptionsState.val = [];
            selectedArrayPathState.val = "";
            this.arrayPathValue = "";
            if (file.size > maxSizeMB * 1024 * 1024) {
              setError(`File exceeds maximum size of ${maxSizeMB} MB`);
              return;
            }
            fileNameState.val = file.name;
            fileSizeState.val = formatSize(file.size);
            parsingState.val = true;
            try {
              const text = await file.text();
              let parsed: unknown;
              try { parsed = JSON.parse(text); } catch { setError("Invalid JSON file"); return; }
              const { data, paths } = resolveArrayFromJson(parsed);
              if (data) {
                setData(data, "");
              } else if (paths.length > 1) {
                rawJsonState.val = parsed as Record<string, unknown>;
                arrayPathOptionsState.val = paths;
                parsingState.val = false;
              } else {
                setError("JSON does not contain an array of objects");
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error processing file");
            }
          } else {
            await originalProcessFile(file);
          }
        };

        // Re-bind event handlers to use wrapped version
        fileInput.onchange = (e: Event) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files[0]) processFileWrapped(files[0]);
        };
        dropZone.ondrop = (e: DragEvent) => {
          e.preventDefault();
          dragOverState.val = false;
          const files = e.dataTransfer?.files;
          if (files && files[0]) processFileWrapped(files[0]);
        };

        // Preview table
        const previewTable = (): Element => {
          return div(() => {
            const data = parsedDataState.val;
            if (!data || data.length === 0) return div();
            const columns = Object.keys(data[0]);
            const rows = data.slice(0, previewRows);
            return div(
              { style: "margin-top: 8px; overflow-x: auto;" },
              div(
                { style: "margin-bottom: 4px; font-size: 0.9em; color: #666;" },
                `Showing ${Math.min(previewRows, data.length)} of ${formatNumber(data.length)} rows`,
              ),
              table(
                { style: "border-collapse: collapse; width: 100%; font-size: 0.85em;" },
                tr(
                  ...columns.map((col) =>
                    th({ style: "border: 1px solid #ddd; padding: 4px 8px; background: #f5f5f5; text-align: left; white-space: nowrap;" }, col)
                  ),
                ),
                ...rows.map((row) =>
                  tr(
                    ...columns.map((col) =>
                      td({ style: "border: 1px solid #ddd; padding: 4px 8px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                        String(row[col] ?? ""))
                    ),
                  )
                ),
              ),
            );
          });
        };

        // arrayPath select handler — when user picks a path, extract data
        const arrayPathSelectorEl = div(() => {
          const options = arrayPathOptionsState.val;
          if (options.length === 0) return div();
          return div(
            { style: "margin-top: 8px;" },
            label({ style: "margin-right: 5px;" }, "Select data array:"),
            select(
              {
                onchange: (e: Event) => {
                  const key = (e.target as HTMLSelectElement).value;
                  if (!key) return;
                  const raw = rawJsonState.val;
                  if (raw && Array.isArray(raw[key])) {
                    setData(raw[key] as Record<string, unknown>[], key);
                  }
                },
              },
              option({ value: "" }, "-- choose --"),
              ...options.map((k: string) => option({ value: k }, k)),
            ),
          );
        });

        // File info bar + clear button
        const fileInfoBar = (): Element => {
          return div(() => {
            const name = fileNameState.val;
            if (!name) return div();
            return div(
              { style: "margin-top: 8px; display: flex; align-items: center; gap: 8px;" },
              strong(name),
              small({ style: "color: #888;" }, `(${fileSizeState.val})`),
              button({
                type: "button",
                style: "cursor: pointer; background: none; border: 1px solid #ccc; border-radius: 4px; padding: 2px 8px; font-size: 0.85em;",
                onclick: (e: Event) => {
                  e.stopPropagation();
                  clearFile();
                  // Reset the file input so the same file can be re-selected
                  (fileInput as HTMLInputElement).value = "";
                },
              }, "Clear"),
            );
          });
        };

        // Parsing indicator
        const parsingIndicator = (): Element => {
          return div(() => {
            if (!parsingState.val) return div();
            return div({ style: "margin-top: 8px; color: #666;" }, "Parsing file...");
          });
        };

        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass || '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass || '' }, this.description),
          fileInput,
          dropZone,
          fileInfoBar(),
          parsingIndicator(),
          arrayPathSelectorEl,
          previewTable(),
          p({ class: this.errorClass }, () => this.error),
        );
        break;
      }
      default:
        el = div(
          { style: "border: 1px dashed gray; padding: 8px;" },
          `Field "${this.name}" unsupported: The type "${this.inputType}" has no UI component built yet.`
        );
    }
    return el;
  }
  isVanJsfFieldArray(fields: unknown): fields is VanJsfField[] {
    return Array.isArray(fields) && fields.every(field => field instanceof VanJsfField);
  }
}

