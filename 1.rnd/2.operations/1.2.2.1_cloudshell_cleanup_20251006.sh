#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1

# Liv Hana Cloud Shell housekeeping utility.
# Usage: bash cloudshell_cleanup.sh [--nuke]
#   --nuke : also delete all files in $HOME except livhana truth artifacts.


STAMP=$(date -u +%Y%m%d_%H%M%S)
WORKDIR="$HOME/livhana_cleanup"
LOGDIR="$WORKDIR/logs"
mkdir -p "$LOGDIR"

printf '📦 Liv Hana Cloud Shell Cleanup (%s UTC)\n' "$STAMP"
printf 'Output directory: %s\n' "$LOGDIR"

# 1. Inventory of top-level files/dirs (human-readable)
ls -alh --color=never "$HOME" > "$LOGDIR/ls_home_$STAMP.log"
printf '  • Home inventory captured -> %s\n' "$LOGDIR/ls_home_$STAMP.log"

# 2. Recursive inventory (can be large)
find "$HOME" -maxdepth 3 -printf '%M %5s %TY-%Tm-%Td %TH:%TM %p\n' | sort > "$LOGDIR/find_home_$STAMP.log"
printf '  • Recursive inventory captured -> %s\n' "$LOGDIR/find_home_$STAMP.log"

# 3. Top disk consumers
(du -ah "$HOME" 2>/dev/null | sort -rh | head -50) > "$LOGDIR/top50_sizes_$STAMP.log"
printf '  • Top disk usage written -> %s\n' "$LOGDIR/top50_sizes_$STAMP.log"

# 4. Hidden file summary
find "$HOME" -maxdepth 1 -type f -name '.*' -printf '%f\n' | sort > "$LOGDIR/hidden_files_$STAMP.log"
printf '  • Hidden files listed -> %s\n' "$LOGDIR/hidden_files_$STAMP.log"

# Optional destructive cleanup
if [[ "${1:-}" == "--nuke" ]]; then
  printf '⚠️  Nuke mode enabled: removing home files except truth scripts and cleanup logs\n'
  find "$HOME" -maxdepth 1 -type f \
    ! -name '.livhana_absolute_truth.sh' \
    ! -name '.bashrc' \
    ! -name '.profile' \
    ! -name '.bash_history' \
    ! -name '.zshrc' \
    ! -name '.*.json' \
    ! -name '.*.yaml' \
    ! -name '.*.yml' \
    ! -name '.*.env' \
    ! -name '.*.key' \
    ! -name '.*.pem' \
    ! -name '.gitconfig' \
    ! -name '.ssh' \
    ! -name '.ssh_config' \
    ! -name '.cloudshell*' \
    ! -name 'livhana_cleanup*' \
    -delete
  printf '  • Completed nuke sweep of loose files.\n'
fi

printf '✅ Cleanup scan finished. Review logs in %s.\n' "$LOGDIR"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
