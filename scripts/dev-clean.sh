#!/bin/bash

set -e

function execute_clean_step {
	echo "Executing: $1"
	eval $1 || true 2> /dev/null
}

execute_clean_step "find . -name '.DS_Store' -delete"
execute_clean_step "find . -name '.eslintcache' -delete"
execute_clean_step "find . -name '.cache' -delete"
execute_clean_step "find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +"
execute_clean_step "find . -name '.next' -type d -prune -exec rm -rf '{}' +"
execute_clean_step "find . -name '.expo' -type d -prune -exec rm -rf '{}' +"
execute_clean_step "find . -name 'dist' -type d -prune -exec rm -rf '{}' +"
execute_clean_step "find . -name 'build' -type d -prune -exec rm -rf '{}' +"

echo "🧹 Cleaned up project"
