import van, { State } from "vanjs-core";
import { VanJSComponent } from "./VanJSComponent";

const { div, p, input, label, textarea, legend } = van.tags;

enum FieldType {
  text = "text",
  number = "number",
  textarea = "textarea",
  radio = "radio",
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
    };
    switch (this.inputType) {
      case FieldType.text:
        el = div(
          props,
          label({ for: this.name }, this.label),
          this.description &&
            div({ id: `${this.name}-description` }, this.description),
          input({
            id: this.name,
            type: "text",
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          }),
          p(() => this.error)
        );
        break;

      case FieldType.textarea:
        el = div(
          props,
          label({ for: this.name }, this.label),
          this.description &&
            div({ id: `${this.name}-description` }, this.description),
          textarea({
            id: this.name,
            name: this.name,
            rows: this.field.rows as number,
            cols: this.field.columns as number,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          })
        );
        break;
      case FieldType.number:
        el = div(
          props,
          label({ for: this.name }, this.label),
          this.description &&
            div({ id: `${this.name}-description` }, this.description),
          input({
            id: this.name,
            type: "number",
            value: this.iniVal,
            oninput: (e: any) => this.handleChange(this, e.target.value),
          })
        );
        break;
      case FieldType.radio:
        el = div(
          legend(this.label),
          this.description && div(this.description),
          div(
            this.options?.map((opt: any) =>
              label(
                input({
                  type: "radio",
                  name: this.name,
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
}
