#!/bin/bash
rm -rf dist
npm run build
npm run types
npm publish --access public
