#!/usr/bin/env bash

poetry export --without-hashes --format=requirements.txt \
    | grep -E -v "Running command|Resolving dependencies" \
    | sed 's/ $//' > requirements.txt
echo "Created $(pwd)/requirements.txt"
