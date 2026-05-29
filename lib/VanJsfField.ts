import van, { State } from "vanjs-core";
import { VanJSComponent } from "./VanJSComponent";
import { JsfTheme, resolve } from "./theme";
// Heavy, field-type-specific dependencies (CodeMirror + ESLint for the `code`
// field, Pikaday for the `date` field) are loaded lazily via dynamic import inside
// the relevant renderers. This keeps them out of the main bundle so a form that
// only uses text/number/select/etc. never pays for them.
const { div, p, input, label, textarea, legend, link, fieldset, span, select, option, button, strong, small } = van.tags;

enum FieldType {
  text = "text",
  password = "password",
  code = "code",
  number = "number",
  textarea = "textarea",
  select = "select",
  radio = "radio",
  date = "date",
  fieldset = "fieldset",
  file = "file"
}
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

  /**
   * Lazily loads CodeMirror + ESLint and mounts a code editor into `parent`.
   * These are the heaviest dependencies in the library; importing them only here
   * keeps them out of the main bundle for forms that don't use a `code` field.
   */
  private async mountCodeEditor(parent: HTMLElement): Promise<void> {
    const [
      { basicSetup, EditorView },
      { javascript, esLint },
      { json, jsonParseLinter },
      { lintGutter, linter, forEachDiagnostic },
      eslint,
      globalsModule,
    ] = await Promise.all([
      import("codemirror"),
      import("@codemirror/lang-javascript"),
      import("@codemirror/lang-json"),
      import("@codemirror/lint"),
      import("eslint-linter-browserify"),
      import("globals"),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globals: any = (globalsModule as any).default ?? globalsModule;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eslintConfig: any = {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: { ecmaVersion: 2022, sourceType: "module" },
      },
      rules: { semi: ["error", "never"] },
    };
    const cmTheme = EditorView.theme({
      '.cm-content, .cm-gutter': { "min-height": "150px" },
      '.cm-content': { "min-height": "150px" },
      '.cm-gutters': { margin: '1px' },
      '.cm-scroller': { overflow: 'auto' },
      '.cm-wrap': { border: '1px solid silver' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extensions: any[] = [cmTheme, EditorView.updateListener.of((e) => {
      this.field.error = null;
      forEachDiagnostic(e.state, (diag) => {
        if (diag.severity === "error") {
          this.field.error = diag.message;
        }
      });
      this.handleChange(this, e.state.doc.toString());
    }), basicSetup, lintGutter()];
    switch (this.field.codemirrorType) {
      case "json": extensions.push(json(), linter(jsonParseLinter())); break;
      case "javascript": extensions.push(javascript(), linter(esLint(new eslint.Linter(), eslintConfig))); break;
      case "typescript": extensions.push(javascript({ typescript: true }), linter(esLint(new eslint.Linter(), eslintConfig))); break;
      default: extensions.push(javascript(), linter(esLint(new eslint.Linter(), eslintConfig))); break;
    }
    new EditorView({ doc: String(this.iniVal), parent, extensions });
  }

  /** Lazily loads Pikaday and attaches a date picker to `calendarInput`. */
  private async mountDatePicker(parent: HTMLElement, calendarInput: HTMLInputElement): Promise<void> {
    const Pikaday = (await import("pikaday")).default;
    new Pikaday({
      field: calendarInput,
      format: 'YYYY-MM-DD',
      container: parent,
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
  }

  /**
   * Renders an editable list for an array property. json-schema-form reports
   * arrays as an unusable "select", so we read the item schema from the field's
   * scopedJsonSchema and render one input per element with add/remove controls.
   * Supports scalar item types (number/integer/string/boolean). The value is kept
   * in formValues as a real JS array.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderArray(props: Record<string, any>): Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoped = this.field.scopedJsonSchema as any;
    const arraySchema = scoped?.properties?.[this.name] ?? {};
    const itemSchema = arraySchema.items ?? { type: "string" };
    const itemType: string = itemSchema.type ?? "string";
    const isNumeric = itemType === "number" || itemType === "integer";
    const isBoolean = itemType === "boolean";
    const minItems: number = arraySchema.minItems ?? 0;
    const maxItems: number = arraySchema.maxItems ?? Infinity;

    const blank = (): MultiType => (isNumeric ? 0 : isBoolean ? false : "");
    const coerce = (raw: string): MultiType => (isNumeric ? (raw === "" ? "" : Number(raw)) : raw);

    const values: MultiType[] = Array.isArray(this.iniVal) ? [...(this.iniVal as MultiType[])] : [];
    while (values.length < minItems) values.push(blank());

    // Bumped only on add/remove so typing into a row never re-renders it (avoids
    // losing input focus on every keystroke).
    const version = van.state(0);
    const emit = () => this.handleChange(this, values.slice() as unknown as MultiType);
    emit();

    const itemClass = resolve(this.class, this.theme.input);

    const rowInput = (i: number): Element => {
      if (isBoolean) {
        return input({
          type: "checkbox",
          class: itemClass,
          checked: Boolean(values[i]),
          onchange: (e: Event) => { values[i] = (e.target as HTMLInputElement).checked; emit(); },
        });
      }
      return input({
        type: isNumeric ? "number" : "text",
        class: itemClass,
        value: String(values[i] ?? ""),
        oninput: (e: Event) => { values[i] = coerce((e.target as HTMLInputElement).value); emit(); },
      });
    };

    const rows = (): Element => div(
      { class: this.theme.arrayItems || "jsf-array-items" },
      values.map((_, i) =>
        div({ class: this.theme.arrayRow || "jsf-array-row" },
          rowInput(i),
          button({
            type: "button",
            class: this.theme.arrayRemoveButton || "jsf-array-remove",
            disabled: values.length <= minItems,
            onclick: () => { values.splice(i, 1); version.val++; emit(); },
          }, "✕"),
        )
      ),
    );

    return div(
      props,
      this.renderLabel(),
      this.renderDescription(),
      // Re-render the row list whenever an item is added or removed.
      () => { void version.val; return rows(); },
      button({
        type: "button",
        class: this.theme.arrayAddButton || "jsf-array-add",
        onclick: () => { if (values.length < maxItems) { values.push(blank()); version.val++; emit(); } },
      }, "+ Add"),
      this.renderError(),
    );
  }

  render(): Element {
    let el: Element;
    const baseContainer = resolve(this.containerClass, this.theme.container);
    const containerCls = this.layoutClass ? `${baseContainer} ${this.layoutClass}` : baseContainer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: Record<string, any> = {
      class: () => this.isVisible ? containerCls : `${containerCls} jsf-hidden`.trim(),
    };
    // json-schema-form reports arrays as inputType "select" with no options, which
    // is not usable. Detect the array jsonType and render an editable repeatable
    // list of scalar items instead.
    if (this.field.jsonType === "array") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.renderArray(props);
    }
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

      case FieldType.password:
        // Password is rendered with type="password" so the user agent
        // masks the value as it is typed. Otherwise behaves identically
        // to a text input — same theme.input class, same oninput
        // wiring. autocomplete="new-password" hints to browsers that
        // this is a credential entry form, not a "remember me" field.
        el = div(
          props,
          this.renderLabel(),
          this.renderDescription(),
          input({
            id: this.name,
            type: "password",
            autocomplete: "new-password",
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
        // CodeMirror + ESLint are loaded on demand; the editor mounts into `el`
        // once the chunk resolves.
        void this.mountCodeEditor(el as HTMLElement);
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
        // Pikaday is loaded on demand and attached to the input once available.
        void this.mountDatePicker(el as HTMLElement, calendarInput as HTMLInputElement);
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
