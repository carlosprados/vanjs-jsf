import van, { State } from "vanjs-core";
import { VanJSComponent } from "./VanJSComponent";
import { JsfTheme, resolve } from "./theme";
import pikaday from "pikaday";
import { basicSetup, EditorView } from "codemirror"
import { javascript, esLint } from "@codemirror/lang-javascript";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { lintGutter, linter, forEachDiagnostic } from "@codemirror/lint";
import * as eslint from "eslint-linter-browserify";
import globals from "globals";
const { div, p, input, label, textarea, legend, link, fieldset, span, select, option, button, strong, small } = van.tags;

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
  theme: JsfTheme;
  layoutClass: string;
  /** Used by file fields to pass file metadata to formValues */
  fileNameValue: string = "";
  fileSizeValue: string = "";
  fileTypeValue: string = "";
  constructor(
    field: Record<string, unknown>,
    initVal: MultiType,
    handleChange: (field: VanJsfField, value: MultiType) => void,
    theme: JsfTheme = {},
    layoutClass: string = "",
  ) {
    super();
    this.field = field;
    this.name = field.name as string;
    this.iniVal = initVal;
    this.handleChange = handleChange;
    this.theme = theme;
    this.layoutClass = layoutClass;
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
  get isRequired(): boolean {
    return this.field.required as boolean ?? false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get codemirrorExtension(): Array<any> {
    const cmTheme = EditorView.theme({
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
    const extensions = [cmTheme, EditorView.updateListener.of((e) => {
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

  private renderLabel(): Element {
    const cls = resolve(this.titleClass, this.theme.label);
    return label(
      { for: this.name, class: cls },
      this.label,
      this.isRequired
        ? span({ class: this.theme.requiredIndicator || "" }, " *")
        : null,
    );
  }

  private renderDescription(): Element | null {
    if (!this.description) return null;
    return div({
      id: `${this.name}-description`,
      class: resolve(this.descriptionClass, this.theme.description),
    }, this.description);
  }

  private renderError(): Element {
    return p({ class: resolve(this.errorClass, this.theme.error) }, () => this.error);
  }

  render(): Element {
    let el: Element;
    const baseContainer = resolve(this.containerClass, this.theme.container);
    const containerCls = this.layoutClass ? `${baseContainer} ${this.layoutClass}` : baseContainer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: Record<string, any> = {
      class: () => this.isVisible ? containerCls : `${containerCls} jsf-hidden`.trim(),
    };
    switch (this.inputType) {
      case FieldType.text:
        el = div(
          props,
          this.renderLabel(),
          this.renderDescription(),
          input({
            id: this.name,
            type: "text",
            class: resolve(this.class, this.theme.input),
            value: this.iniVal,
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
          }),
          this.renderError(),
        );
        break;

      case FieldType.textarea:
        el = div(
          props,
          this.renderLabel(),
          this.renderDescription(),
          textarea({
            id: this.name,
            name: this.name,
            class: resolve(this.class, this.theme.textarea),
            rows: this.field.rows as number,
            cols: this.field.columns as number,
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLTextAreaElement).value),
          }),
          this.renderError(),
        );
        break;
      case FieldType.code:
        el = div(
          props,
          this.renderLabel(),
          this.renderDescription(),
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
          this.renderLabel(),
          this.renderDescription(),
          select({
            id: this.name,
            name: this.name,
            class: resolve(this.class, this.theme.select),
            oninput: (e: Event) => this.handleChange(this, (e.target as HTMLSelectElement).value),
          },
            this.options?.map((opt: Option) =>
              option({ class: this.theme.option || "", value: opt.value },
                opt.label,
                opt.description,
              )
            )
          ),
          this.renderError(),
        );
        break;

      case FieldType.date: {
        const calendarInput = input({
          id: this.name,
          type: "text",
          class: resolve(this.class, this.theme.input),
          value: this.iniVal,
          onchange: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
        });
        el =
          div(
            props,
            this.renderLabel(),
            this.renderDescription(),
            calendarInput,
            this.renderError(),
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
          this.renderLabel(),
          this.renderDescription(),
          input({
            id: this.name,
            type: "number",
            class: resolve(this.class, this.theme.input),
            value: this.iniVal,
            oninput: (e: Event) => {
              const val = (e.target as HTMLInputElement).value;
              this.handleChange(this, val === "" ? "" : Number(val));
            },
          }),
          this.renderError(),
        );
        break;
      case FieldType.fieldset:
        el = div(
          props,
          fieldset(
            { class: this.theme.fieldset || "" },
            legend({ class: resolve(this.titleClass, this.theme.legend || this.theme.label) }, this.label),
            this.renderDescription(),
            this.isVanJsfFieldArray(this.field.fields)
              ? this.field.fields.map((field: VanJsfField) => field.render())
              : null,
          ),
        );
        break;
      case FieldType.radio:
        el = div(
          props,
          legend({ class: resolve(this.titleClass, this.theme.legend || this.theme.label) }, this.label),
          this.renderDescription(),
          div(
            { class: this.theme.radioGroup || "" },
            this.options?.map((opt: Option) =>
              label(
                { class: this.theme.radioLabel || "" },
                input({
                  type: "radio",
                  name: this.name,
                  class: resolve(this.class, this.theme.radioInput),
                  value: opt.value,
                  checked: this.iniVal === opt.value,
                  onchange: (e: Event) => this.handleChange(this, (e.target as HTMLInputElement).value),
                }),
                opt.label,
                opt.description,
              )
            )
          ),
          this.renderError(),
        );
        break;
      case FieldType.file: {
        const accept = (this.field.accept as string) || "";
        const maxSizeMB = this.field.maxSizeMB as number | undefined;
        const readAs = (this.field.readAs as string) || "auto";

        const TEXT_EXTENSIONS = new Set([
          "json", "csv", "tsv", "txt", "xml", "yaml", "yml",
          "log", "md", "html", "css", "js", "ts", "sql", "env",
        ]);

        // Reactive states
        const fileNameState = van.state("");
        const fileSizeState = van.state("");
        const dragOverState = van.state(false);
        const readingState = van.state(false);

        const formatSize = (bytes: number): string => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        };

        const readFile = (file: File) => {
          this.error = "";

          // Validate size
          if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
            this.error = `File exceeds maximum size of ${maxSizeMB} MB`;
            return;
          }

          fileNameState.val = file.name;
          fileSizeState.val = formatSize(file.size);
          readingState.val = true;

          // Store metadata
          this.fileNameValue = file.name;
          this.fileSizeValue = String(file.size);
          this.fileTypeValue = file.type;

          const reader = new FileReader();
          reader.onload = () => {
            readingState.val = false;
            let result = reader.result as string;
            if (reader.result instanceof ArrayBuffer) {
              // Convert binary to base64 (applies to "arrayBuffer" and "auto" for binary files)
              const bytes = new Uint8Array(reader.result);
              let binary = "";
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              result = btoa(binary);
            }
            this.handleChange(this, result);
          };
          reader.onerror = () => {
            readingState.val = false;
            this.error = "Error reading file";
          };

          if (readAs === "dataURL") {
            reader.readAsDataURL(file);
          } else if (readAs === "arrayBuffer") {
            reader.readAsArrayBuffer(file);
          } else if (readAs === "auto") {
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            if (TEXT_EXTENSIONS.has(ext)) {
              reader.readAsText(file);
            } else {
              reader.readAsArrayBuffer(file);
            }
          } else {
            reader.readAsText(file);
          }
        };

        const clearFile = () => {
          fileNameState.val = "";
          fileSizeState.val = "";
          readingState.val = false;
          this.fileNameValue = "";
          this.fileSizeValue = "";
          this.fileTypeValue = "";
          this.error = "";
          this.handleChange(this, "");
        };

        const fileInput = input({
          type: "file",
          accept,
          style: "display: none;",
          onchange: (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) readFile(files[0]);
          },
        });

        const dzBase = this.theme.dropZone || "jsf-dropzone";
        const dzActive = this.theme.dropZoneActive || "jsf-dropzone-active";

        const dropZone = div(
          {
            class: () => dragOverState.val ? `${dzBase} ${dzActive}` : dzBase,
            ondragover: (e: DragEvent) => { e.preventDefault(); dragOverState.val = true; },
            ondragleave: () => { dragOverState.val = false; },
            ondrop: (e: DragEvent) => {
              e.preventDefault();
              dragOverState.val = false;
              const files = e.dataTransfer?.files;
              if (files && files[0]) readFile(files[0]);
            },
            onclick: () => fileInput.click(),
          },
          p(
            { class: this.theme.dropZoneText || "jsf-dropzone-text" },
            accept
              ? `Drop a file here or click to browse (${accept})`
              : "Drop a file here or click to browse",
          ),
        );

        const fileInfoBar = (): Element => {
          return div(() => {
            const name = fileNameState.val;
            if (!name) return div();
            return div(
              { class: this.theme.fileInfoBar || "jsf-file-info" },
              strong({ class: this.theme.fileName || "" }, name),
              small({ class: this.theme.fileSize || "jsf-file-size" }, `(${fileSizeState.val})`),
              button({
                type: "button",
                class: this.theme.fileClearButton || "jsf-file-clear",
                onclick: (e: Event) => {
                  e.stopPropagation();
                  clearFile();
                  (fileInput as HTMLInputElement).value = "";
                },
              }, "Clear"),
            );
          });
        };

        const readingIndicator = (): Element => {
          return div(() => {
            if (!readingState.val) return div();
            return div({ class: this.theme.fileReading || "jsf-file-reading" }, "Reading file...");
          });
        };

        el = div(
          props,
          this.renderLabel(),
          this.renderDescription(),
          fileInput,
          dropZone,
          fileInfoBar(),
          readingIndicator(),
          this.renderError(),
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
