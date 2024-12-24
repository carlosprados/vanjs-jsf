import van from "vanjs-core";
import * as vanX from "vanjs-ext";

import {
  createHeadlessForm,
  HeadlessFormOutput,
  Fields,
  JSONSchemaObjectType,
} from "@remoteoss/json-schema-form";

import { VanJSComponent } from "./VanJSComponent";
import { VanJsfField, MultiType } from "./VanJsfField";

const { form, button } = van.tags;

export class VanJsfForm extends VanJSComponent {
  name: string;
  schema: JSONSchemaObjectType;
  config: Record<string, any>;
  headlessForm: HeadlessFormOutput;
  formFields: VanJsfField[];
  onSubmit: (data: Record<string, any>) => void;
  formValues: Record<string, any> = {};
  formFieldMap: Record<string, VanJsfField>;

  constructor(
    name: string,
    jsonSchema: JSONSchemaObjectType,
    config: Record<string, any>,
    onSubmit: (data: Record<string, any>) => void
  ) {
    super();
    // Bind methods to instance. Needed to pass functions as props to child components
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    // Receive parameters
    this.name = name;
    this.schema = jsonSchema;
    this.config = config;
    this.onSubmit = onSubmit;
    // Working with parameters
    this.headlessForm = createHeadlessForm(jsonSchema, config);
    // Read documentation about `getFieldsFromJsf` method below
    this.formFields = this.getFieldsFromJsf(
      this.headlessForm,
      this.config.initialValues
    );

    this.formFieldMap = this.formFields.reduce<Record<string, VanJsfField>>(
      (map, field) => {
        map[field.name] = field;
        return map;
      },
      {}
    );
  }

  /**
   * Processes fields from a headless JSON Schema Form (JSF) and maps them to `VanJsfField` instances.
   * It also initializes default values for each field and stores them in the `formValues` object.
   *
   * @param headlessForm - The output object from the `createHeadlessForm` function, containing metadata and configuration for the fields.
   * @param initialValues - An object where the keys represent field names and the values are the initial values for each field.
   *
   * @returns An array of `VanJsfField` objects, each representing a field in the form with its associated initial value and change handler.
   *
   * @remarks
   * - This function currently does not support recursive handling of field sets.
   * - The `field.default` property is not well-documented in the JSF API.
   *   The documentation suggests using `defaultValue`, but in practice, the `field.default` property seems to be used.
   */
  getFieldsFromJsf(
    headlessForm: HeadlessFormOutput,
    initialValues: Record<string, any>
  ): VanJsfField[] {
    const fields: Fields = headlessForm.fields;
    return fields.map((field) => {
      // TODO needs to support field sets recursively
      // Extract the field name as a string
      const fieldName: string = field.name as string;
      // Determine the initial value for the field
      // **Important**!: `field.default` is not properly documented in
      // https://json-schema-form.vercel.app/?path=/docs/api-reference-api--docs
      // They say the property for default values is `defaultValue` but it's not
      const initVal = initialValues[fieldName] || field.default || "";
      // Store the initial value in the form values map
      this.formValues[fieldName] = initVal;
      // Create and return a new VanJsfField instance for this field
      return new VanJsfField(field, initVal, this.handleFieldChange);
    });
  }

  handleFieldChange(field: VanJsfField, value: MultiType) {
    console.log(`Field ${field.name} changed to ${value}`);
    this.formValues[field.name] = value;
    const { formErrors } = this.headlessForm.handleValidation(this.formValues);
    console.log("formErrors", formErrors);
    this.formFields.forEach((f) => {
      f.isVisible = f.field.isVisible as boolean;
      f.error = formErrors?.[f.name] ?? "";
    });
  }

  handleSubmit(event: Event): void {
    event.preventDefault();
    this.onSubmit(this.formValues);
  }

  render(): Element {
    return form(
      { name: this.name, onsubmit: this.handleSubmit },
      this.formFields.map((field: VanJsfField) => field.render()),
      button({ type: "submit" }, "Submit")
    );
  }
}
