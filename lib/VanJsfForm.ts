import van from "vanjs-core";

import {
  createHeadlessForm,
  HeadlessFormOutput,
  Fields,
  JSONSchemaObjectType,
} from "@remoteoss/json-schema-form";

import { VanJsfField, MultiType } from "./VanJsfField";

const { form } = van.tags;

class VanJsfForm {
  schema: JSONSchemaObjectType;
  config: Record<string, any>;
  headlessForm: HeadlessFormOutput;
  formFields: VanJsfField[];
  formValues: Record<string, any>;

  constructor(jsonSchema: JSONSchemaObjectType, config: Record<string, any>) {
    // Bind methods to instance. Needed to pass functions as props to child components
    //this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    // Receive parameters
    this.schema = jsonSchema;
    this.config = config;
    // Working with parameters
    this.headlessForm = createHeadlessForm(jsonSchema, config);
    // Read documentation about `getFieldsAndValuedFromJsf` method below
    const { vanJsfFields, formValues } = this.getFieldsAndValuesFromJsf(
      this.headlessForm,
      this.config.initialValues
    );
    this.formFields = vanJsfFields;
    this.formValues = formValues;
  }

  /**
   * Generates fields and their initial values from a headless JSON Schema Form (JSF).
   * This method processes the fields provided by the headless form, maps them to `VanJsfField` instances,
   * and initializes the corresponding form values.
   *
   * @param headlessForm - The output of the `createHeadlessForm` function, containing metadata and configuration for the form fields.
   * @param initialValues - A record object where the keys represent field names, and the values are the initial values for the fields.
   *
   * @returns An object containing:
   *  - `vanJsfFields`: An array of `VanJsfField` instances representing the fields in the form.
   *  - `formValues`: A record object mapping field names to their respective initial values.
   *
   * @remarks
   * - **Field Sets**: The method currently does not support field sets recursively. This needs to be implemented as part of future enhancements.
   * - **Default Values**:
   *   - The default values are determined based on the following precedence:
   *     1. Value in `initialValues`.
   *     2. The `field.default` property.
   *     3. An empty string (`""`) if neither is present.
   *   - Note: The `field.default` property is not clearly documented in the JSF API. The documentation mentions `defaultValue` instead, but this is not observed in practice.
   *
   * @example
   * const { vanJsfFields, formValues } = getFieldsFromJsf(headlessForm, initialValues);
   * console.log(vanJsfFields); // Array of VanJsfField instances
   * console.log(formValues);   // Record of field names and their initial values
   */
  getFieldsAndValuesFromJsf(
    headlessForm: HeadlessFormOutput,
    initialValues: Record<string, any>
  ): { vanJsfFields: VanJsfField[]; formValues: Record<string, any> } {
    const fields: Fields = headlessForm.fields;
    const formValues: Record<string, any> = {};
    const vanJsfFields: VanJsfField[] = fields.map((field) => {
      // TODO needs to support field sets recursively
      // Extract the field name as a string
      const fieldName: string = field.name as string;
      // Determine the initial value for the field
      // **Important**!: `field.default` is not properly documented in
      // https://json-schema-form.vercel.app/?path=/docs/api-reference-api--docs
      // They say the property for default values is `defaultValue` but it's not
      const initVal = initialValues[fieldName] || field.default || "";
      // Store the initial value in the form values map
      formValues[fieldName] = initVal;
      // Create and return a new VanJsfField instance for this field
      return new VanJsfField(field, initVal, this.handleFieldChange);
    });
    return { vanJsfFields, formValues };
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
}

export function jsform(
  attributes: Record<string, any>,
  ...children: any[]
): HTMLFormElement {
  if (!attributes.schema) {
    throw new Error("JSON Schema is required");
  }
  let config = attributes.config;
  if (!config) {
    config = { initialValues: {}, formValues: {} };
  } else if (!config.initialValues) {
    config.initialValues = {};
  } else if (!config.formValues) {
    config.formValues = {};
  }
  const vanJsfForm: VanJsfForm = new VanJsfForm(attributes.schema, config);
  const fields: Element[] = vanJsfForm.formFields.map((field: VanJsfField) =>
    field.render()
  );

  const childrenWithFields = [...fields, ...children]; // Concatenate fields with other children

  const originalOnSubmit = attributes.onsubmit;
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    config.formValues = vanJsfForm.formValues;
    originalOnSubmit && originalOnSubmit(e);
  };
  attributes.onsubmit = handleSubmit;
  return form(attributes, ...childrenWithFields);
}
