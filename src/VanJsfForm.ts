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
  formValues: Record<string, any>;
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

    this.formValues = this.getInitialValues(
      this.headlessForm,
      this.config.initialValues
    );
  }

  getFieldsFromJsf(
    headlessForm: HeadlessFormOutput,
    initialValues: Record<string, any>
  ): VanJsfField[] {
    const fields: Fields = headlessForm.fields;
    return fields.map((field) => {
      // TODO needs to support field sets recursively
      // `field.default` is not properly documented in
      // https://json-schema-form.vercel.app/?path=/docs/api-reference-api--docs
      // They say the property for defaultValues is `defaultValue` but it's not
      const fieldName: string = field.name as string;
      const initVal = initialValues[fieldName] || field.default || "";
      return new VanJsfField(field, initVal, this.handleFieldChange);
    });
  }

  getInitialValues(
    headlessForm: HeadlessFormOutput,
    initialValues: Record<string, any>
  ): Record<string, any> {
    const fields: Fields = headlessForm.fields;
    return fields.reduce((acc, field) => {
      // TODO needs to support field sets recursively
      // `field.default` is not properly documented in
      // https://json-schema-form.vercel.app/?path=/docs/api-reference-api--docs
      // They say the property for defaultValues is `defaultValue` but it's not
      const fieldName: string = field.name as string;
      const initVal = initialValues[fieldName] || field.default || "";
      acc[fieldName] = initVal;
      return acc;
    }, {});
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
