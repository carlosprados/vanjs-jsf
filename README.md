# 📦 VanJS-JSF a JSON Schema Form Library for VanJS

**Generate dynamic UI forms effortlessly with TypeScript and JSON Schema, powered by the JSON Schema Form Headless UI framework.**

## Description

This library aims to provide a robust and flexible solution for dynamically generating user interface (UI) forms using JSON Schema definitions. It is built on **TypeScript** for type safety and leverages the powerful [JSON Schema Form Headless UI](https://github.com/remoteoss/json-schema-form) framework, which you can find documented [here](https://json-schema-form.vercel.app). It ensures a lightweight, modern, accessible, and customizable form-building experience.

### Features to implement

- [ ] **Dynamic Form Generation**: Create forms directly from JSON Schema, reducing repetitive coding tasks.
- [ ] **Customizable**: Tailor form styles, layouts, and behaviours to meet specific UI/UX requirements.
- [ ] **Headless UI Integration**: Utilize Headless UI's components for accessible and modern interfaces.
- [ ] **TypeScript-first Approach**: Enjoy strong typing and enhanced developer experience with TypeScript.
- [ ] **Validation Support**: Easily integrate JSON Schema-based validation for seamless user input handling.
- [ ] **Extensible Architecture**: Add custom widgets, field types, and behaviours as needed.

### Use Cases

- Quickly generate forms for dashboards, admin panels, and dynamic web applications.
- Prototype or test form-based UIs with minimal setup.
- Build reusable form components for your projects.

## Getting Started

1. Install the library:

We're working on publishing the library in the `nmp` repository.

  ```bash
  npm install vanjs-jsf
  ```

1. Import it in your project & define your JSON schema + config:

  ```typescript
  import { jsform } from 'vanjs-jsf';

  const schema = {
    type: 'object',
    properties: {
      userName: { type: 'string', title: 'Name' },
      age: { type: 'number', title: 'Age' },
    },
  };

  // Initial values to fill the form
  const initialValues = { userName: "Simon" };
  // JSON Schema Form config
  const config = {
    strictInputType: false,
    initialValues: initialValues,
    formValues: initialValues,
  };
   ```

1. Render the form using VanJS UI framework & handle form submit.

  This library will call the `onsubmit` handler set using the VanJS `props` passing the original source event.

  ```typescript
  const handleOnSubmit = (e: Event) => {
    e.preventDefault();
    const values = jsfConfig.formValues;
    alert(`Submitted successfully: ${JSON.stringify(values, null, 2)}`);
    console.log("Submitted!", values);
  };

   // Add the JSON Schema Form to an VanJS element 
  div(
      h1("json-schema-form + VanJS"),
      p("This demo uses VanJS without any other form library."),
      jsform(
        {
          name: "my-jsf-form",
          schema: schema, // JSON Schema defined previously
          config: config, // JSON Schema Form configuration
          onsubmit: handleOnSubmit,
        },
        button({ type: "submit" }, "Submit")
      )
    );

  ```

## Contributing

Contributions are welcome! Please submit a pull request if you have ideas, feedback, or improvements. Your contributions will help make this library more robust and useful for the community.

## License

This project is licensed under the Apache 2 License. For details, see the [LICENSE](./LICENSE) file.
