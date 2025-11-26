# Automated Daily Sync and Test Runner Setup

This guide explains how to set up automated daily synchronization with the `17.0` branch and automatic test execution.

## Overview

The `sync-and-test.sh` script will:
1. Fetch latest changes from `origin/17.0`
2. Check if there are new commits compared to your local `e2e-test-automation` branch
3. If new commits exist, merge `origin/17.0` into `e2e-test-automation`
4. Run `npm test -- --project=chromium --workers=1` if there were new commits

## Manual Execution

You can run the script manually at any time:

```bash
npm run sync-and-test
```

Or directly:

```bash
bash scripts/sync-and-test.sh
```

## Setting Up Cron Job (Daily at 6 PM)

### Step 1: Get the full path to the script

First, navigate to your repository and get the absolute path:

```bash
cd /opt/openspp-modules
REPO_PATH=$(pwd)
echo "$REPO_PATH/scripts/sync-and-test.sh"
```

### Step 2: Edit your crontab

```bash
crontab -e
```

### Step 3: Add the cron job

Add this line to run the script every day at 6:00 PM:

```cron
0 18 * * * cd /opt/openspp-modules && /bin/bash scripts/sync-and-test.sh
```

**Cron format explanation:**
```
0 18 * * *
│ │  │ │ │
│ │  │ │ └── Day of week (0-7, where 0 and 7 are Sunday)
│ │  │ └──── Month (1-12)
│ │  └────── Day of month (1-31)
│ └───────── Hour (0-23) - 18 = 6 PM
└─────────── Minute (0-59) - 0 = top of the hour
```

### Step 4: Verify cron job is set

```bash
crontab -l
```

You should see your cron job listed.

### Step 5: Test the cron job (optional)

To test if the cron job will run correctly, you can manually execute it:

```bash
/bin/bash /opt/openspp-modules/scripts/sync-and-test.sh
```

## Log Files

Log files are stored in `~/.openspp-e2e-sync/` directory. Each run creates a timestamped log file:
- `sync-YYYYMMDD-HHMMSS.log`

To view the latest log:

```bash
ls -lt ~/.openspp-e2e-sync/ | head -5
```

To view a specific log:

```bash
cat ~/.openspp-e2e-sync/sync-20240101-180000.log
```

## Important Notes

1. **Git Authentication**: Make sure your git credentials are configured (SSH keys or credential helper) so the script can fetch from the remote repository.

2. **Branch Existence**: The script will automatically create the `e2e-test-automation` branch if it doesn't exist, based on `origin/17.0`.

3. **Merge Conflicts**: If there are merge conflicts, the script will log an error and exit. You'll need to resolve conflicts manually.

4. **Test Failures**: If tests fail, the script will log the error and exit with a non-zero status code. Check the log file for details.

5. **Cron Environment**: Cron runs with a minimal environment. If you need specific environment variables (like PATH), you can set them in the crontab entry:
   ```cron
   0 18 * * * PATH=/usr/local/bin:/usr/bin:/bin && cd /opt/openspp-modules && /bin/bash scripts/sync-and-test.sh
   ```

## Troubleshooting

### Script not running
- Check if cron service is running: `sudo service cron status`
- Check cron logs: `grep CRON /var/log/syslog` (Linux) or check system logs
- Verify the script path is correct and executable: `ls -l scripts/sync-and-test.sh`

### Permission issues
- Ensure the script is executable: `chmod +x scripts/sync-and-test.sh`
- Check git permissions for fetching from remote

### Git fetch fails
- Verify remote is configured: `git remote -v`
- Check SSH keys or credentials: `ssh -T git@github.com` (if using SSH)

### Tests not running
- Verify `package.json` exists in the repository root
- Ensure `npm` and `node` are in the PATH for cron
- Check that Playwright browsers are installed: `npx playwright install chromium`

