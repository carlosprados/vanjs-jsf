# 📦 VanJS-JSF a JSON Schema Form Library for VanJS

**Generate dynamic UI forms effortlessly with TypeScript and JSON Schema, powered by the JSON Schema Form Headless UI framework.**

## Description

This library aims to provide a robust and flexible solution for dynamically generating user interface (UI) forms using JSON Schema definitions. It is built on **TypeScript** for type safety and leverages the powerful [JSON Schema Form Headless UI](https://github.com/remoteoss/json-schema-form) framework, which you can find documented [here](https://json-schema-form.vercel.app). It ensures a lightweight, modern, accessible, and customizable form-building experience.

### Features

- [x] **Dynamic Form Generation**: Create forms directly from JSON Schema, reducing repetitive coding tasks.
- [x] **Customizable**: Tailor form styles, layouts, and behaviours to meet specific UI/UX requirements.
- [x] **Headless UI Integration**: Utilize Headless UI's components for accessible and modern interfaces.
- [x] **TypeScript-first Approach**: Enjoy strong typing and enhanced developer experience with TypeScript.
- [x] **Validation Support**: Easily integrate JSON Schema-based validation for seamless user input handling.
- [ ] **Extensible Architecture**: Add custom widgets, field types, and behaviours as needed.

### Available components
The currently supported form element types are:
 - text = "text"
 - number = "number"
 - textarea = "textarea"
 - select = "select"
 - radio = "radio"
 - date = "date" (Pikaday)
 - code = "code" (CodeMirror with JSON, JavaScript, TypeScript support)
 - fieldset = "fieldset"

### Use Cases

- Quickly generate forms for dashboards, admin panels, and dynamic web applications.
- Prototype or test form-based UIs with minimal setup.
- Build reusable form components for your projects.

## Getting Started

1. Install the library:

  ```bash
  npm install vanjs-jsf
  ```

2. Import and define your JSON Schema with `x-jsf-presentation` hints:

  ```typescript
  import van from "vanjs-core";
  import { jsform } from "vanjs-jsf";

  const { div, h1, p, button } = van.tags;

  const schema = {
    type: "object",
    properties: {
      userName: {
        type: "string",
        title: "Name",
        "x-jsf-presentation": { inputType: "text" },
      },
      age: {
        type: "number",
        title: "Age",
        "x-jsf-presentation": { inputType: "number" },
      },
    },
    required: ["userName"],
    "x-jsf-order": ["userName", "age"],
  };
  ```

3. Create a config with initial values and render the form:

  ```typescript
  const initialValues = { userName: "Simon" };
  const config = {
    strictInputType: false,
    initialValues: initialValues,
    formValues: initialValues,
  };

  const handleOnSubmit = (e: Event) => {
    e.preventDefault();
    const values = config.formValues;
    alert(`Submitted: ${JSON.stringify(values, null, 2)}`);
  };

  van.add(
    document.body,
    div(
      h1("json-schema-form + VanJS"),
      p("Dynamic form generated from JSON Schema."),
      jsform(
        {
          name: "my-jsf-form",
          schema: schema,
          config: config,
          onsubmit: handleOnSubmit,
        },
        button({ type: "submit" }, "Submit")
      )
    )
  );
  ```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 3030)
npm run build        # Bundle with esbuild → dist/index.js
npm run types        # Generate type declarations → dist/*.d.ts
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
```

## Publishing

1. Update the version in `package.json`
2. Run the publish script:

```bash
./publish.sh
```

This cleans `dist/`, rebuilds the bundle and type declarations, and publishes to npm.

The package is available at: https://www.npmjs.com/package/vanjs-jsf

## Contributing

Contributions are welcome! Please submit a pull request if you have ideas, feedback, or improvements. Your contributions will help make this library more robust and useful for the community.

## License

This project is licensed under the Apache 2 License. For details, see the [LICENSE](./LICENSE) file.
