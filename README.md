# 📦 VanJS-JSF a JSON Schema Form Library for VanJS

**Generate dynamic UI forms effortlessly with TypeScript and JSON Schema, powered by the JSON Schema Form Headless UI framework.**

## Description

This library provides a robust and flexible solution for generating user interface (UI) forms dynamically using JSON Schema definitions. Built on **TypeScript** for type safety and leveraging the powerful **Headless UI** framework, it ensures a modern, accessible, and customizable form-building experience.

### Features to implement

- [ ] **Dynamic Form Generation**: Create forms directly from JSON Schema, reducing repetitive coding tasks.
- [ ] **Customizable**: Tailor form styles, layouts, and behaviors to meet specific UI/UX requirements.
- [ ] **Headless UI Integration**: Utilize Headless UI's components for accessible and modern interfaces.
- [ ] **TypeScript-first Approach**: Enjoy strong typing and enhanced developer experience with TypeScript.
- [ ] **Validation Support**: Easily integrate JSON Schema-based validation for seamless user input handling.
- [ ] **Extensible Architecture**: Add custom widgets, field types, and behaviors as needed.

### Use Cases

- Quickly generate forms for dashboards, admin panels, and dynamic web applications.
- Prototype or test form-based UIs with minimal setup.
- Build reusable form components for your projects.

## Getting Started

This is what we want to have when the work will be done:

1. Install the library:

   ```bash
   npm install vanjs-jsf
   ```

2. Import and use it in your project:

   ```typescript
   import { VanJsfForm } from 'vanjs-jsf';

   const schema = {
     type: 'object',
     properties: {
       name: { type: 'string', title: 'Name' },
       age: { type: 'number', title: 'Age' },
     },
   };

   const vanJsfForm = new VanJsfForm (schema);
   // To add the form to an VanJS element you have to call the `render` function
   el = div(
    h1("json-schema-form + VanJS"),
    p("This demo uses VanJS without any other form library."),
    vanJsfForm.render() // Call render function
   );

   ```

3. Render the generated form using VanJS UI framework.

## Contributing

Contributions are welcome! Please check out the [Contributing Guidelines](./CONTRIBUTING.md) to get started. We are actively looking for feedback and feature suggestions to improve the library.

## License

This project is licensed under the Apache 2 License. See the [LICENSE](./LICENSE) file for details.
