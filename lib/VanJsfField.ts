import van, { State } from "vanjs-core"
import { VanJSComponent } from "./VanJSComponent"
import pikaday from "pikaday"
import { basicSetup, EditorView } from "codemirror"
import { javascript, esLint } from "@codemirror/lang-javascript"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import { lintGutter, linter, forEachDiagnostic } from "@codemirror/lint"
import * as eslint from "eslint-linter-browserify"
import { CronComponent } from "van-ui-extended"
import { dracula } from "thememirror"
import "van-ui-extended/dist/index.css"
const {
  div,
  p,
  input,
  label,
  textarea,
  legend,
  link,
  fieldset,
  span,
  select,
  option,
} = van.tags
import globals from "globals"
enum FieldType {
  text = "text",
  code = "code",
  cron = "cron",
  number = "number",
  textarea = "textarea",
  select = "select",
  radio = "radio",
  date = "date",
  fieldset = "fieldset",
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
    "constructor-super": "error",
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-case-declarations": "error",
    "no-class-assign": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-constant-binary-expression": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-else-if": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "error",
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-empty-static-block": "error",
    "no-ex-assign": "error",
    "no-extra-boolean-cast": "error",
    "no-fallthrough": "error",
    "no-func-assign": "error",
    "no-global-assign": "error",
    "no-import-assign": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-loss-of-precision": "error",
    "no-misleading-character-class": "error",
    "no-new-native-nonconstructor": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-obj-calls": "error",
    "no-octal": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-self-assign": "error",
    "no-setter-return": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-this-before-super": "error",
    "no-undef": "error",
    "no-unexpected-multiline": "error",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": "error",
    "no-unused-labels": "error",
    "no-unused-private-class-members": "error",
    "no-unused-vars": "error",
    "no-useless-backreference": "error",
    "no-useless-catch": "error",
    "no-useless-escape": "error",
    "no-with": "error",
    "require-yield": "error",
    "use-isnan": "error",
    "valid-typeof": "error",
  },
}
export interface Option {
  label: string
  value: string
  description?: string
  img?: string
}

export type MultiType = string | number | boolean

export class VanJsfField extends VanJSComponent {
  name: string
  field: Record<string, unknown>
  iniVal: MultiType
  handleChange: (field: VanJsfField, value: MultiType) => void
  isVisibleState: State<boolean>
  errorState: State<string>
  constructor(
    field: Record<string, unknown>,
    initVal: string,
    handleChange: (field: VanJsfField, value: MultiType) => void
  ) {
    super()
    this.field = field
    this.name = field.name as string
    this.iniVal = initVal
    this.handleChange = handleChange
    this.isVisibleState = van.state(this.field.isVisible as boolean)
    this.errorState = van.state("")
    van.derive(() =>
      console.log(`Field ${this.name} isVisible: ${this.isVisibleState.val}`)
    )
  }

  get inputType(): string {
    return this.field.inputType as string
  }
  get label(): string {
    return this.field.label as string
  }
  get class(): string {
    return this.field.class as string
  }
  get errorClass(): string {
    return this.field.errorClass as string
  }
  get codemirrorExtension(): Array<any> {
    const theme = EditorView.theme(
      {
        ".cm-content, .cm-gutter": {
          minHeight:
            this.field["min-height"] &&
            typeof this.field["min-height"] === "string"
              ? this.field["min-height"]
              : "150px",
        },
        ".cm-gutters": {
          margin: "1px",
        },
        ".cm-scroller": {
          overflow: "auto",
        },
        ".cm-wrap": {
          border: "1px solid silver",
        },
      },
      {
        dark: true,
      }
    )
    const extensions = [
      dracula,
      EditorView.updateListener.of((e) => {
        this.field.error = null
        forEachDiagnostic(e.state, (diag) => {
          if (diag.severity === "error") {
            this.field.error = diag.message
          }
        })
        this.handleChange(this, e.state.doc.toString())
      }),
      basicSetup,
      lintGutter(),
    ]
    switch (this.field.codemirrorType) {
      case "json":
        extensions.push(json(), linter(jsonParseLinter()))
        break
      case "javascript":
        extensions.push(
          javascript(),
          linter(esLint(new eslint.Linter(), eslintConfig))
        )
        break
      case "typescript":
        extensions.push(
          javascript({ typescript: true }),
          linter(esLint(new eslint.Linter(), eslintConfig))
        )
        break
      default:
        extensions.push(
          javascript(),
          linter(esLint(new eslint.Linter(), eslintConfig))
        )
        break
    }
    return extensions
  }
  get containerClass(): string {
    return this.field.containerClass as string
  }
  get containerId(): string {
    return this.field.containerId as string
  }
  get titleClass(): string {
    return this.field.titleClass as string
  }
  get descriptionClass(): string {
    return this.field.descriptionClass as string
  }
  get description(): string {
    return this.field.description as string
  }
  get options(): Option[] {
    return this.field.options as Option[]
  }
  get isVisible(): boolean {
    return this.isVisibleState.val
  }
  set isVisible(val: boolean) {
    this.isVisibleState.val = val
  }

  get error(): string {
    return this.errorState.val
  }

  set error(val: string) {
    this.errorState.val = val
  }
  render(): Element {
    let el: Element
    const props: Record<string, any> = {
      style: () => (this.isVisible ? "display: block" : "display: none"),
      class: this.containerClass ? this.containerClass : "",
    }
    switch (this.inputType) {
      case FieldType.text:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          input({
            id: this.name,
            type: "text",
            class: this.class ? this.class : "",
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          }),
          p({ class: this.errorClass }, () => this.error)
        )
        break

      case FieldType.textarea:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          textarea({
            id: this.name,
            name: this.name,
            class: this.class ? this.class : null,
            rows: this.field.rows as number,
            cols: this.field.columns as number,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          }),
          p({ class: this.errorClass }, () => this.error)
        )
        break
      case FieldType.code:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            )
        )
        new EditorView({
          doc: new String(this.iniVal).toString(),
          parent: el,
          extensions: this.codemirrorExtension,
        })
        break
      case FieldType.select:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          select(
            {
              id: this.name,
              name: this.name,
              class: this.class ? this.class : null,
              oninput: (e: any) => this.handleChange(this, e.target.value),
            },
            this.options?.map((opt: any) =>
              option(
                { class: this.class ? this.class : null, value: opt.value },
                opt.label,
                opt.description
              )
            )
          ),
          p({ class: this.errorClass }, () => this.error)
        )
        break

      case FieldType.date:
        const calendarInput = input({
          id: this.name,
          type: "text",
          class: this.class ? this.class : null,
          value: this.iniVal,
          onchange: (e: any) => this.handleChange(this, e.target.value),
        })
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          calendarInput,
          p({ class: this.errorClass }, () => this.error),
          link({
            rel: "stylesheet",
            type: "text/css",
            href: "https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css",
          })
        )
        new pikaday({
          field: calendarInput,
          format: "YYYY/MM/DD",
          container: el as HTMLElement,
          firstDay: 1,
          toString(date) {
            // you should do formatting based on the passed format,
            // but we will just return 'D/M/YYYY' for simplicity
            const day = date.getDate()
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`
          },
          parse(dateString, format) {
            // dateString is the result of `toString` method
            const parts = dateString.split("/")
            const day = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10) - 1
            const year = parseInt(parts[2], 10)
            return new Date(year, month, day)
          },
        })
        break
      case FieldType.cron:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          p({ class: this.errorClass }, () => this.error),
          () => {
            let ele: any
            if (CronComponent) {
              ele = new CronComponent() || null
              ele.setAttribute("color", "d58512")
              ele.setAttribute("extraClass", this.class ? this.class : "")
              ele.setAttribute("value", this.iniVal.toString())
              ele.oninput = (e: any) => this.handleChange(this, e.detail.value)
            }
            return ele
          }
        )

        break
      case FieldType.number:
        el = div(
          props,
          label(
            {
              for: this.name,
              style: "margin-right: 5px;",
              class: this.titleClass ? this.titleClass : "",
            },
            this.label
          ),
          this.description &&
            div(
              {
                id: `${this.name}-description`,
                class: this.descriptionClass ? this.descriptionClass : "",
              },
              this.description
            ),
          input({
            id: this.name,
            type: "number",
            class: this.class ? this.class : null,
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          }),
          p({ class: this.errorClass }, () => this.error)
        )
        break
      case FieldType.fieldset:
        console.log(this.field)
        el = div(
          props,
          fieldset(
            legend(
              { class: this.titleClass ? this.titleClass : "" },
              this.label
            ),
            this.description &&
              span(
                {
                  id: `${this.name}-description`,
                  class: this.descriptionClass ? this.descriptionClass : "",
                },
                this.description
              ),
            this.isVanJsfFieldArray(this.field.fields)
              ? this.field.fields.map((field: VanJsfField) => field.render())
              : null
          )
        )
        break
      case FieldType.radio:
        el = div(
          legend({ class: this.titleClass ? this.titleClass : "" }, this.label),
          this.description && div(this.description),
          div(
            this.options?.map(
              (opt: any) =>
                label(
                  input({
                    type: "radio",
                    name: this.name,
                    class: this.class ? this.class : null,
                    value: opt.value,
                    checked: this.iniVal === opt.value,
                    onchange: (e: any) =>
                      this.handleChange(this, e.target.value),
                  }),
                  opt.label,
                  opt.description
                ),
              p({ class: this.errorClass }, () => this.error)
            )
          )
        )
        break
      default:
        el = div(
          { style: "border: 1px dashed gray; padding: 8px;" },
          `Field "${this.name}" unsupported: The type "${this.inputType}" has no UI component built yet.`
        )
    }
    return el
  }
  isVanJsfFieldArray(fields: any): fields is VanJsfField[] {
    return (
      Array.isArray(fields) &&
      fields.every((field) => field instanceof VanJsfField)
    )
  }
}
