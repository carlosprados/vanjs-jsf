#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./publish.sh <otp>"
  exit 1
fi
rm -rf dist
npm run build
npm run types
cp lib/jsf-defaults.css dist/jsf-defaults.css
npm publish --access public --otp="$1"
