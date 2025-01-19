#!/bin/bash
rm -rf dist
npm run build
npm publish --access public
