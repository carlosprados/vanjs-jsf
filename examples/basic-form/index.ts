import { jsform } from "../../src/index";
import van from "vanjs-core";

const { div, p, h1, button } = van.tags;

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
      description:
        "What's your pet's age? With more than 5 years, we need to know more about your pet.",
      "x-jsf-presentation": { inputType: "number" },
      type: "number",
      default: 1,
    },
    dietary_needs: {
      title: "Dietary needs",
      description: "What are your pet's dietary needs?",
      "x-jsf-presentation": { inputType: "textarea", rows: 15, columns: 50 },
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

// App
const App = () => {
  const initialValues = { pet_name: "Simon" };
  const jsfConfig = {
    strictInputType: false,
    initialValues: initialValues,
    formValues: initialValues,
  };

  const handleOnSubmit = (e: Event) => {
    e.preventDefault();
    const values = jsfConfig.formValues;
    alert(`Submitted successfully: ${JSON.stringify(values, null, 2)}`);
    console.log("Submitted!", values);
  };

  return div(
    h1("json-schema-form + VanJS"),
    p("This demo uses VanJS without any other form library."),
    jsform(
      {
        name: "my-jsf-form",
        schema: jsonSchemaDemo,
        config: jsfConfig,
        onsubmit: handleOnSubmit,
      },
      button({ type: "submit" }, "Submit")
    )
  );
};

// Render the app
van.add(document.body, App());
