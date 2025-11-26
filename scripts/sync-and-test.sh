#!/bin/bash

# Script to sync e2e-test-automation branch with penn-e2e and run tests
# This script fetches latest changes from origin/penn-e2e, merges if there are new commits,
# and runs the e2e tests automatically.

set -e  # Exit on error

# Configuration
BRANCH_NAME="e2e-test-automation"
SOURCE_BRANCH="penn-e2e"
REMOTE="origin"
LOG_DIR="$HOME/.openspp-e2e-sync"
LOG_FILE="$LOG_DIR/sync-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to log success
log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to log info
log_info() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1${NC}" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Starting sync and test automation"
log "=========================================="

# Get the repository root directory
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT" || exit 1

log_info "Repository root: $REPO_ROOT"
log_info "Current branch: $(git branch --show-current)"

# Fetch latest changes from remote
log_info "Fetching latest changes from $REMOTE..."
if ! git fetch "$REMOTE" >> "$LOG_FILE" 2>&1; then
    log_error "Failed to fetch from $REMOTE"
    exit 1
fi

# Get current branch (might not be e2e-test-automation)
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

# Check if e2e-test-automation branch exists locally
if ! git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    log_info "Branch $BRANCH_NAME doesn't exist locally, creating it..."
    git checkout -b "$BRANCH_NAME" "$REMOTE/$SOURCE_BRANCH" 2>&1 | tee -a "$LOG_FILE"
    if [ $? -ne 0 ]; then
        log_error "Failed to create branch $BRANCH_NAME"
        exit 1
    fi
fi

# Switch to e2e-test-automation branch
log_info "Switching to $BRANCH_NAME branch..."
git checkout "$BRANCH_NAME" 2>&1 | tee -a "$LOG_FILE"
if [ $? -ne 0 ]; then
    log_error "Failed to checkout $BRANCH_NAME branch"
    exit 1
fi

# Get the commit hash of current branch
CURRENT_COMMIT=$(git rev-parse HEAD)
log_info "Current commit on $BRANCH_NAME: $CURRENT_COMMIT"

# Get the commit hash of origin/$SOURCE_BRANCH
REMOTE_COMMIT=$(git rev-parse "$REMOTE/$SOURCE_BRANCH")
log_info "Latest commit on $REMOTE/$SOURCE_BRANCH: $REMOTE_COMMIT"

# Check if there are new commits
if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    log_success "No new commits from $REMOTE/$SOURCE_BRANCH. Branch is up to date."
    log "=========================================="
    log "Sync completed - no action needed"
    log "=========================================="
    exit 0
fi

# Check if current branch is ahead, behind, or has diverged
COMMITS_BEHIND=$(git rev-list --count HEAD.."$REMOTE/$SOURCE_BRANCH" 2>/dev/null || echo "0")
COMMITS_AHEAD=$(git rev-list --count "$REMOTE/$SOURCE_BRANCH"..HEAD 2>/dev/null || echo "0")

log_info "Commits behind $REMOTE/$SOURCE_BRANCH: $COMMITS_BEHIND"
log_info "Commits ahead of $REMOTE/$SOURCE_BRANCH: $COMMITS_AHEAD"

if [ "$COMMITS_BEHIND" -gt 0 ]; then
    log_info "New commits detected. Merging $REMOTE/$SOURCE_BRANCH into $BRANCH_NAME..."
    
    # Merge origin/$SOURCE_BRANCH into current branch
    if ! git merge "$REMOTE/$SOURCE_BRANCH" --no-edit -m "Auto-merge: Sync with $SOURCE_BRANCH $(date +%Y-%m-%d)" >> "$LOG_FILE" 2>&1; then
        log_error "Merge failed. There may be conflicts. Please resolve manually."
        log_error "Current status:"
        git status >> "$LOG_FILE" 2>&1
        exit 1
    fi
    
    log_success "Successfully merged $REMOTE/$SOURCE_BRANCH into $BRANCH_NAME"
    
    # Run tests if we're in the repo root and package.json exists
    if [ -f "package.json" ]; then
        log_info "New commits detected. Running e2e tests..."
        log_info "Command: npm test -- --project=chromium --workers=1"
        
        # Run tests and capture output
        if npm test -- --project=chromium --workers=1 >> "$LOG_FILE" 2>&1; then
            log_success "Tests completed successfully"
        else
            log_error "Tests failed. Check the log file for details: $LOG_FILE"
            exit 1
        fi
    else
        log_error "package.json not found. Cannot run tests."
        exit 1
    fi
else
    log_success "No new commits to merge. Branch is up to date or ahead."
fi

log "=========================================="
log "Sync and test completed successfully"
log "=========================================="
log "Log file: $LOG_FILE"

