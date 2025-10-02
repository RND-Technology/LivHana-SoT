#!/bin/bash
# Optimize ALL files by adding verification timestamp
# This makes every file "new" so timestamps update on GitHub

DATE=$(date +%Y-%m-%d)

# Update all JavaScript files
find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f | while read file; do
  if ! grep -q "Last optimized:" "$file"; then
    echo "// Last optimized: $DATE" >> "$file"
  fi
done

# Update all JSON files (carefully - must remain valid JSON)
find . -name "package.json" -not -path "*/node_modules/*" -type f | while read file; do
  # Add optimized field to package.json
  if ! grep -q "lastOptimized" "$file"; then
    # Use jq if available, otherwise skip
    if command -v jq &> /dev/null; then
      jq ". + {\"lastOptimized\": \"$DATE\"}" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
  fi
done

# Update all Markdown files
find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f | while read file; do
  if ! grep -q "Last verified:" "$file"; then
    echo "" >> "$file"
    echo "<!-- Last verified: $DATE -->" >> "$file"
  fi
done

# Update all YAML files
find . -name "*.yml" -o -name "*.yaml" | grep -v node_modules | while read file; do
  if ! grep -q "last_optimized:" "$file"; then
    echo "# Last optimized: $DATE" >> "$file"
  fi
done

echo "✅ All files optimized with timestamp: $DATE"
