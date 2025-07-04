#!/bin/bash

git ls-files --exclude-standard -- ':!:**/*.[pjs][npv]g' ':!:**/*.ai' ':!:.idea' ':!:**/*.eslintrc' ':!:**/package-lock.json' \
    ':!:LICENSE' ':!:**/*.bmp' ':!:**/*.drawio' ':!:**/*.fzz' | sed -r 's/\ /\\ /g' | xargs wc -l

