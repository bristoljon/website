#!/bin/sh
# Build the Dozenal Calculator (its own repo, a sibling of this one by
# default) and copy it into static/projects/dozenal/, where the site serves
# it. Old hashed bundles are removed, but v1/ (the 2015 version) is left
# alone. Commit the result and deploy as usual.
#
#   npm run sync:dozenal
#   DOZENAL_DIR=~/somewhere/else npm run sync:dozenal
set -e

DOZENAL_DIR="${DOZENAL_DIR:-../dozenal-calculator}"
DEST=static/projects/dozenal

# react-scripts 4 uses webpack 4, which needs the legacy OpenSSL provider on
# Node 17+. PUBLIC_URL makes asset paths start /projects/dozenal/.
(
  cd "$DOZENAL_DIR"
  PUBLIC_URL=/projects/dozenal NODE_OPTIONS=--openssl-legacy-provider \
    npx react-scripts build
)

# The SEO tags live in the app's public/index.html. Stop if they've gone.
grep -q 'rel="canonical"' "$DOZENAL_DIR/build/index.html" || {
  echo "build/index.html has no canonical tag; check public/index.html" >&2
  exit 1
}

# v1/ is the original 2015 calculator, which lives only here; keep it.
rsync -a --delete --exclude=/v1/ "$DOZENAL_DIR/build/" "$DEST/"
echo "Copied $DOZENAL_DIR/build to $DEST"
