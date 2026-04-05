# VanJS-JSF — a JSON Schema Form Library for VanJS

**Generate dynamic UI forms effortlessly with TypeScript and JSON Schema, powered by the JSON Schema Form Headless UI framework.**

## Description

This library provides a robust and flexible solution for dynamically generating user interface (UI) forms using JSON Schema definitions. It is built on **TypeScript** for type safety and leverages the powerful [JSON Schema Form Headless UI](https://github.com/remoteoss/json-schema-form) framework, which you can find documented [here](https://json-schema-form.vercel.app). It ensures a lightweight, modern, accessible, and customizable form-building experience.

### Features

- [x] **Dynamic Form Generation**: Create forms directly from JSON Schema, reducing repetitive coding tasks.
- [x] **Theming API**: Inject CSS classes for every form element via a `theme` object — works with Tailwind, Bootstrap, or any CSS framework.
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
- file = "file" (drag & drop, with configurable `readAs` mode and size validation)

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
      button({ type: "submit" }, "Submit"),
    ),
  ),
);
```

## File Upload Field

The `file` field type renders a drag & drop zone with file info display. Define it in your schema:

```typescript
const schema = {
  type: "object",
  properties: {
    document: {
      type: "string",
      title: "Upload Document",
      description: "PDF or image, max 5 MB",
      "x-jsf-presentation": {
        inputType: "file",
        accept: ".pdf,.png,.jpg",
        maxSizeMB: 5,
        readAs: "auto",
      },
    },
  },
  "x-jsf-order": ["document"],
};
```

### `readAs` modes

| Value              | Behaviour                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"auto"` (default) | Text extensions (json, csv, txt, xml, yaml, md, html, css, js, ts, sql, etc.) are read as text. All other files are read as binary and returned as base64. |
| `"text"`           | Always reads the file as text (`readAsText`).                                                                                                              |
| `"dataURL"`        | Returns a data URL string (`readAsDataURL`).                                                                                                               |
| `"arrayBuffer"`    | Reads as ArrayBuffer and returns base64 (`readAsArrayBuffer`).                                                                                             |

The file content is stored in `formValues` under the field name. Additional metadata is stored as `<fieldName>__fileName`, `<fieldName>__fileSize`, and `<fieldName>__fileType`.

## Theming

By default, vanjs-jsf applies minimal semantic CSS classes (e.g. `jsf-dropzone`, `jsf-file-info`). You can import the default styles:

```typescript
import "vanjs-jsf/dist/jsf-defaults.css";
```

To fully customize the appearance, pass a `theme` object to `jsform()`. Theme classes apply to every element type in the form. Per-field classes defined in `x-jsf-presentation` (e.g. `class`, `titleClass`, `containerClass`) take priority over theme classes.

```typescript
import { jsform, JsfTheme } from "vanjs-jsf";

const myTheme: JsfTheme = {
  // Structure
  container: "mb-4",
  label: "block text-sm font-medium text-gray-700 mb-1",
  description: "text-gray-500 text-xs mb-1",
  error: "text-red-500 text-xs mt-1",
  requiredIndicator: "text-red-500 ml-1",

  // Inputs
  input: "w-full border border-gray-300 rounded px-3 py-2",
  textarea: "w-full border border-gray-300 rounded px-3 py-2 resize-y",
  select: "w-full border border-gray-300 rounded px-3 py-2",
  option: "bg-white",

  // Radio
  radioGroup: "flex flex-col gap-2",
  radioLabel: "flex items-center gap-2 cursor-pointer",
  radioInput: "accent-blue-500",

  // Fieldset
  fieldset: "border border-gray-200 rounded p-4",
  legend: "text-sm font-semibold text-gray-700",

  // File upload
  dropZone:
    "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors",
  dropZoneActive:
    "border-2 border-dashed border-blue-500 rounded-lg p-6 text-center cursor-pointer bg-blue-50",
  dropZoneText: "text-gray-500 text-sm m-0",
  fileInfoBar: "mt-2 flex items-center gap-2",
  fileName: "font-semibold",
  fileSize: "text-gray-400 text-sm",
  fileClearButton:
    "text-sm border border-gray-300 rounded px-2 py-0.5 hover:bg-gray-100",
  fileReading: "mt-2 text-gray-400 text-sm",
};

const formEl = jsform({
  schema: mySchema,
  config: { initialValues: {}, formValues: {} },
  theme: myTheme,
  onsubmit: handleSubmit,
});
```

### JsfTheme properties

| Property            | Applies to                                             |
| ------------------- | ------------------------------------------------------ |
| `container`         | Wrapper `<div>` of each field                          |
| `label`             | `<label>` elements                                     |
| `description`       | Description `<div>` below the label                    |
| `error`             | Error `<p>` below the input                            |
| `requiredIndicator` | `<span>` with "\*" next to required field labels       |
| `input`             | `<input>` for text, number, and date fields            |
| `textarea`          | `<textarea>` elements                                  |
| `select`            | `<select>` elements                                    |
| `option`            | `<option>` elements inside selects                     |
| `radioGroup`        | Container `<div>` for radio options                    |
| `radioLabel`        | `<label>` wrapping each radio option                   |
| `radioInput`        | `<input type="radio">` elements                        |
| `fieldset`          | `<fieldset>` elements                                  |
| `legend`            | `<legend>` elements (falls back to `label` if not set) |
| `dropZone`          | File drop zone container (normal state)                |
| `dropZoneActive`    | File drop zone during dragover                         |
| `dropZoneText`      | Text inside the drop zone                              |
| `fileInfoBar`       | Container for uploaded file info                       |
| `fileName`          | File name `<strong>`                                   |
| `fileSize`          | File size `<small>`                                    |
| `fileClearButton`   | "Clear" button                                         |
| `fileReading`       | "Reading file..." indicator                            |

### Class resolution order

For each element, the resolved class follows this priority:

1. **Per-field class** from `x-jsf-presentation` (e.g. `class`, `titleClass`, `containerClass`)
2. **Theme class** from the `theme` object
3. **Empty string** (no class applied)

### Visibility

Hidden fields receive the `jsf-hidden` CSS class instead of inline `display: none`. Make sure your CSS includes:

```css
.jsf-hidden {
  display: none;
}
```

This is included in `jsf-defaults.css`.

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
2. Run the publish script with your npm OTP:

```bash
./publish.sh <otp>
```

This cleans `dist/`, rebuilds the bundle and type declarations, copies `jsf-defaults.css` to `dist/`, and publishes to npm.

The package is available at: https://www.npmjs.com/package/vanjs-jsf

## Contributing

Contributions are welcome! Please submit a pull request if you have ideas, feedback, or improvements. Your contributions will help make this library more robust and useful for the community.

## License

This project is licensed under the Apache 2 License. For details, see the [LICENSE](./LICENSE) file.
