### RPM DNA Search

```bash
#!/bin/bash
# rpm-dna-search.sh

# Search by business area
search_by_aom() {
    local aom=$1
    find . -name "${aom}.*" -type f
}

# Search by capability
search_by_coi() {
    local coi=$1
    find . -name "*.${coi}.*" -type f
}

# Search by priority
search_by_rpm() {
    local rpm=$1
    find . -name "*.*.${rpm}.*" -type f
}

# Search by action
search_by_action() {
    local action=$1
    find . -name "*.*.*.${action}_*" -type f
}
```
