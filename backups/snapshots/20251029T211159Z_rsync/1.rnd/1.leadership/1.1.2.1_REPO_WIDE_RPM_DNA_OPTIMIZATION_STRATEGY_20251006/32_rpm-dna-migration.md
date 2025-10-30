### RPM DNA Migration

```bash
#!/bin/bash
# rpm-dna-migration.sh

# Migrate file to RPM DNA
migrate_to_rpm() {
    local old_file=$1
    local aom=$2
    local coi=$3
    local rpm=$4
    local action=$5
    local name=$6
    local timestamp=$(date +%Y%m%d)
    
    local new_file="${aom}.${coi}.${rpm}.${action}_${name}_${timestamp}.md"
    
    echo "Migrating: $old_file → $new_file"
    mv "$old_file" "$new_file"
    git add "$new_file"
    git rm "$old_file"
}

# Batch migration
batch_migrate() {
    local pattern=$1
    local aom=$2
    local coi=$3
    local rpm=$4
    local action=$5
    
    find . -name "${pattern}" -type f | while read file; do
        local basename=$(basename "$file" .md)
        migrate_to_rpm "$file" "$aom" "$coi" "$rpm" "$action" "$basename"
    done
}
```

---
