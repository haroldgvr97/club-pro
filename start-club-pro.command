#!/bin/zsh

cd "$(dirname "$0")" || exit 1
echo "Iniciando Club Pro en http://localhost:3000"
npm run dev
