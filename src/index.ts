import "./style.css";
import van from "vanjs-core";
import { createHeadlessForm } from "@remoteoss/json-schema-form";
import { formValuesToJsonValues, getDefaultValuesFromFields } from "./utils";
const { div, label, input, form, button, legend, p, h1 } = van.tags;

const jsonSchemaDemo = {
  type: "object",
  additionalProperties: false,
  properties: {
    has_pet: {
      title: "Has Pet",
      description: "Do you have a pet?",
      oneOf: [
        { title: "Yes", const: "yes" },
        { title: "No", const: "no" },
      ],
      "x-jsf-presentation": { inputType: "radio" },
      type: "string",
    },
    pet_name: {
      title: "Pet's name",
      description: "What's your pet's name?",
      "x-jsf-presentation": { inputType: "text" },
      type: "string",
    },
    pet_age: {
      title: "Pet's age",
      description: "What's your pet's age",
      "x-jsf-presentation": { inputType: "number" },
      type: "number",
    },
    dietary_needs: {
      title: "Dietary needs",
      description: "What are your pet's dietary needs?",
      "x-jsf-presentation": { inputType: "textarea" },
      type: "string",
    },
  },
  required: ["has_pet"],
  "x-jsf-order": ["has_pet", "pet_name", "pet_age", "dietary_needs"],
  allOf: [
    {
      if: { properties: { has_pet: { const: "yes" } }, required: ["has_pet"] },
      then: { required: ["pet_age", "pet_name"] },
      else: { properties: { pet_age: false, pet_name: false } },
    },
    {
      if: {
        properties: { has_pet: { const: "yes" }, pet_age: { minimum: 5 } },
        required: ["pet_age"],
      },
      then: { required: ["dietary_needs"] },
      else: { properties: { dietary_needs: false } },
    },
  ],
};

const initialValuesFromAPI = { name: "Mega team" };

// Core form logic
const { fields, handleValidation } = createHeadlessForm(jsonSchemaDemo, {
  strictInputType: false,
  initialValues: initialValuesFromAPI,
});

// UI Components
const FieldText = ({
  field,
  value,
  error,
  submited,
  onChange,
}: {
  field: any;
  value: any;
  error: string;
  submited: boolean;
  onChange: (name: string, value: any) => void;
}) => {
  const touched = van.state(false);

  const handleChange = (e: Event) => {
    touched.val = true;
    onChange(field.name, (e.target as HTMLInputElement).value);
  };

  return field.isVisible
    ? div(
        label({ for: field.name }, field.label),
        field.description &&
          div({ id: `${field.name}-description` }, field.description),
        input({
          id: field.name,
          type: "text",
          value,
          oninput: handleChange,
          "aria-invalid": !!error,
          "aria-required": field.required,
        }),
        (touched.val || submited) &&
          error &&
          div({ style: "color: red;" }, error),
      )
    : null;
};

const FieldRadio = ({
  field,
  value,
  error,
  submited,
  onChange,
}: {
  field: any;
  value: any;
  error: string;
  submited: boolean;
  onChange: (name: string, value: any) => void;
}) => {
  const touched = van.state(false);

  const handleChange = (e: Event) => {
    touched.val = true;
    onChange(field.name, (e.target as HTMLInputElement).value);
  };

  return field.isVisible
    ? div(
        legend(field.label),
        field.description && div(field.description),
        div(
          field.options.map((opt: any) =>
            label(
              input({
                type: "radio",
                name: field.name,
                value: opt.value,
                checked: value === opt.value,
                onchange: handleChange,
              }),
              opt.label,
            ),
          ),
        ),
        (touched.val || submited) &&
          error &&
          div({ style: "color: red;" }, error),
      )
    : null;
};

const FieldUnknown = ({ field }: { field: any }) => {
  return div(
    { style: "border: 1px dashed gray; padding: 8px;" },
    `Field "${field.name}" unsupported: The type "${field.inputType}" has no UI component built yet.`,
  );
};

// Form Renderer
const SmartForm = ({
  fields,
  initialValues,
  handleValidation,
  onSubmit,
}: {
  fields: any[];
  initialValues: any;
  handleValidation: (values: any) => any;
  onSubmit: (jsonValues: any, context: any) => void;
}) => {
  const values = van.state(getDefaultValuesFromFields(fields, initialValues));
  const errors = van.state<Record<string, string>>({});
  const submited = van.state(false);

  const handleFieldChange = (fieldName: string, value: any) => {
    values.val = { ...values.val, [fieldName]: value };
    validate(values.val);
  };

  const validate = (valuesToValidate: any) => {
    const { formErrors, jsonValues } = handleValidation(
      formValuesToJsonValues(fields, valuesToValidate),
    );
    errors.val = formErrors || {};
    return { errors: formErrors, jsonValues };
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    submited.val = true;

    const validation = validate(values.val);

    if (validation.errors) return;

    onSubmit(validation.jsonValues, { formValues: values.val });
  };

  return form(
    { onsubmit: handleSubmit },
    fields.map((field) => {
      const { inputType } = field;

      const componentsMap: Record<string, any> = {
        text: FieldText,
        number: FieldText,
        radio: FieldRadio,
      };

      const FieldComponent = componentsMap[inputType] || FieldUnknown;

      return FieldComponent({
        field,
        value: values.val[field.name],
        error: errors.val[field.name],
        submited: submited.val,
        onChange: handleFieldChange,
      });
    }),
    button({ type: "submit" }, "Submit"),
  );
};

// App
const App = () => {
  const handleOnSubmit = (jsonValues: any, { formValues }: any) => {
    alert(
      `Submitted successfully: ${JSON.stringify(
        { formValues, jsonValues },
        null,
        2,
      )}`,
    );
    console.log("Submitted!", { formValues, jsonValues });
  };

  return div(
    h1("json-schema-form + VanJS"),
    p("This demo uses VanJS without any other form library."),
    SmartForm({
      fields,
      initialValues: initialValuesFromAPI,
      handleValidation,
      onSubmit: handleOnSubmit,
    }),
  );
};

// Render the app
van.add(document.body, App());
