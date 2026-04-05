#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./publish.sh <otp>"
  exit 1
fi
if ! npm whoami &>/dev/null; then
  echo "Not logged in to npm. Run 'npm login' first."
  exit 1
fi
rm -rf dist
npm run build
npm run types
cp lib/jsf-defaults.css dist/jsf-defaults.css
npm publish --access public
