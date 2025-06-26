#!/bin/bash

git ls-files --exclude-standard -- ':!:**/*.[pjs][npv]g' ':!:**/*.ai' ':!:.idea' ':!:**/*.eslintrc' ':!:**/package-lock.json' \
    ':!:LICENSE' ':!:**/*.drawio' | xargs wc -l

