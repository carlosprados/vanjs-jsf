#!/bin/bash
rm -rf dist
npm run build
npm run types
cp lib/jsf-defaults.css dist/jsf-defaults.css
npm publish --access public
