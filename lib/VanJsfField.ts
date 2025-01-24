import van, { State } from "vanjs-core";
import { VanJSComponent } from "./VanJSComponent";
import pikaday from "pikaday";
const { div, p, input, label, textarea, legend, link, fieldset, span } = van.tags;

enum FieldType {
  text = "text",
  number = "number",
  textarea = "textarea",
  radio = "radio",
  date = "date",
  fieldset = "fieldset"
}

export interface Option {
  label: string;
  value: string;
  description: string;
}

export type MultiType = string | number | boolean;

export class VanJsfField extends VanJSComponent {
  name: string;
  field: Record<string, unknown>;
  iniVal: MultiType;
  handleChange: (field: VanJsfField, value: MultiType) => void;
  isVisibleState: State<boolean>;
  errorState: State<string>;
  constructor(
    field: Record<string, unknown>,
    initVal: string,
    handleChange: (field: VanJsfField, value: MultiType) => void
  ) {
    super();
    this.field = field;
    this.name = field.name as string;
    this.iniVal = initVal;
    this.handleChange = handleChange;
    this.isVisibleState = van.state(this.field.isVisible as boolean);
    this.errorState = van.state("");
    van.derive(() =>
      console.log(`Field ${this.name} isVisible: ${this.isVisibleState.val}`)
    );
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
  get containerClass(): string {
    return this.field.containerClass as string;
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
    const props: Record<string, any> = {
      style: () => (this.isVisible ? "display: block" : "display: none"),
      class: this.containerClass ? this.containerClass : ''
    };
    switch (this.inputType) {
      case FieldType.text:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass ? this.titleClass : '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass ? this.descriptionClass : '' }, this.description),
          input({
            id: this.name,
            type: "text",
            class: this.class ? this.class : '',
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          }),
          p(() => this.error)
        );
        break;

      case FieldType.textarea:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass ? this.titleClass : '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass ? this.descriptionClass : '' }, this.description),
          textarea({
            id: this.name,
            name: this.name,
            class: this.class ? this.class : null,
            rows: this.field.rows as number,
            cols: this.field.columns as number,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          })
        );
        break;
      case FieldType.date:
        const calendarInput = input({
          id: this.name,
          type: "text",
          class: this.class ? this.class : null,
          value: this.iniVal,
          onchange: (e: any) => this.handleChange(this, e.target.value),
        })
        el =
          div(
            props,
            label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass ? this.titleClass : '' }, this.label),
            this.description &&
            div({ id: `${this.name}-description`, class: this.descriptionClass ? this.descriptionClass : '' }, this.description),
            calendarInput,
            link({ rel: "stylesheet", type: "text/css", href: "https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css" })
          );
        new pikaday({
          field: calendarInput,
          format: 'D/M/YYYY',
          toString(date, format) {
            // you should do formatting based on the passed format,
            // but we will just return 'D/M/YYYY' for simplicity
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          },
        });
        break;
      case FieldType.number:
        el = div(
          props,
          label({ for: this.name, style: "margin-right: 5px;", class: this.titleClass ? this.titleClass : '' }, this.label),
          this.description &&
          div({ id: `${this.name}-description`, class: this.descriptionClass ? this.descriptionClass : '' }, this.description),
          input({
            id: this.name,
            type: "number",
            class: this.class ? this.class : null,
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          })
        );
        break;
      case FieldType.fieldset:
        console.log(this.field)
        el = div(
          props,
          fieldset(legend({ class: this.titleClass ? this.titleClass : '' }, this.label), this.description &&
            span({ id: `${this.name}-description`, class: this.descriptionClass ? this.descriptionClass : '' }, this.description), this.isVanJsfFieldArray(this.field.fields) ? this.field.fields.map((field: VanJsfField) =>
              field.render()
            ) : null)
        );
        break;
      case FieldType.radio:
        el = div(
          legend({ class: this.titleClass ? this.titleClass : '' }, this.label),
          this.description && div(this.description),
          div(
            this.options?.map((opt: any) =>
              label(
                input({
                  type: "radio",
                  name: this.name,
                  class: this.class ? this.class : null,
                  value: opt.value,
                  checked: this.iniVal === opt.value,
                  onchange: (e: any) => this.handleChange(this, e.target.value),
                }),
                opt.label,
                opt.description
              )
            )
          )
        );
        break;
      default:
        el = div(
          { style: "border: 1px dashed gray; padding: 8px;" },
          `Field "${this.name}" unsupported: The type "${this.inputType}" has no UI component built yet.`
        );
    }
    return el;
  }
  isVanJsfFieldArray(fields: any): fields is VanJsfField[] {
    return Array.isArray(fields) && fields.every(field => field instanceof VanJsfField);
  }
}

