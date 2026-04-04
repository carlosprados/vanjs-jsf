# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vanjs-jsf is a TypeScript library that generates dynamic UI forms from JSON Schema definitions. It builds on [@remoteoss/json-schema-form](https://github.com/remoteoss/json-schema-form) (headless form logic/validation) and [VanJS](https://vanjs.org/) (lightweight reactive UI framework).

## Git Rules

- **Never work directly on `develop` or `main`**. Always create a feature/fix branch from `develop`.
- **Never commit without notifying the user first.** Always ask before committing.
- **Never push without explicit user approval.** Always ask and wait for confirmation before any `git push`.
- Branch naming: `feature/<description>` or `fix/<description>`.
- Merge flow: feature branch → develop → main.

## Commands

```bash
npm run dev      # Start Vite dev server (port 3030, auto-opens browser)
npm run build    # Bundle with esbuild → dist/index.js (ESM)
npm run types    # Generate type declarations → dist/*.d.ts
npm run lint     # Run ESLint on lib/
npm run lint:fix # Run ESLint with auto-fix
```

## Build Details

- **esbuild** (build.js): bundles `lib/index.ts` → `dist/index.js`. Externalizes `@remoteoss/json-schema-form`, `vanjs-core`, `vanjs-ext`.
- **TypeScript**: strict mode, ESNext target/module, declarations emitted to `dist/`.
- **publish.sh**: removes dist/, runs build + types, then `npm publish --access public`.
- **npm package**: https://www.npmjs.com/package/vanjs-jsf

## Architecture

The library exports a single function `jsform()` that returns an `HTMLFormElement`:

```
lib/index.ts          → Re-exports jsform from VanJsfForm
lib/VanJsfForm.ts     → jsform() function + VanJsfForm class (form state, validation, field coordination)
lib/VanJsfField.ts    → VanJsfField class (renders individual fields using VanJS tags)
lib/VanJSComponent.ts → Abstract base with render() contract
lib/JsfUtils.ts       → Helper to find fields by name
lib/main.ts           → Demo app (not part of the published package)
```

### Data Flow

1. `jsform({schema, config, ...})` creates a `VanJsfForm` which calls `createHeadlessForm()` from @remoteoss/json-schema-form
2. `VanJsfForm.getFieldsAndValuesFromJsf()` recursively maps headless fields → `VanJsfField` instances (supports nested fieldsets)
3. Each `VanJsfField.render()` produces DOM elements using VanJS tag functions, with reactive `State<T>` for visibility and errors
4. On input change → `VanJsfForm.handleFieldChange()` → updates `formValues` → calls `headlessForm.handleValidation()` → updates field visibility/errors via reactive state

### Supported Field Types

text, number, textarea, select, radio, date (Pikaday), code (CodeMirror), fieldset

### JSON Schema Extensions

Fields use `x-jsf-presentation` for UI hints (`inputType`, `rows`, `columns`, `codemirrorType`). Conditional visibility uses standard `allOf` with `if/then/else`. Field order is controlled by `x-jsf-order`.

## Key Patterns

- All UI reactivity through VanJS `van.state()` and `van.derive()` — no other state management
- Field rendering is a switch on `inputType` inside `VanJsfField.render()`
- To add a new field type: add a case in `VanJsfField.render()` with appropriate HTML structure and change handler
