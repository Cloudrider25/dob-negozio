#!/bin/bash

BRANCH="${VERCEL_GIT_COMMIT_REF:-$VERCEL_BRANCH}"

if [ "$BRANCH" = "dev" ]; then
  echo "Skipping build on dev"
  exit 0
fi

echo "Running build on branch: $BRANCH"
exit 1
