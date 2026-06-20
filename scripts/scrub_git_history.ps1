# PowerShell helper to scrub the exposed ngrok token from git history
# Usage: run in repo root as Administrator (this rewrites git history!)

$tokenFile = "scripts\replacements.txt"
if (-not (Test-Path .git)) {
    Write-Error "No .git directory found. Run this from the repository root."
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH. Install Git for Windows and re-run."
    exit 1
}

# Ensure git-filter-repo is installed
$filterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue
if (-not $filterRepo) {
    Write-Output "Installing git-filter-repo via pip..."
    py -3 -m pip install --user git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install git-filter-repo. Install it manually and re-run this script."
        exit 1
    }
}

Write-Output "This script will rewrite your repository history to replace the token with [REDACTED_NGROK_TOKEN]."
$confirm = Read-Host "Proceed and force-push rewritten history? Type YES to continue"
if ($confirm -ne 'YES') {
    Write-Output "Aborted by user."
    exit 0
}

# Run git-filter-repo with the replacements file
py -3 -m git_filter_repo --replace-text $tokenFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "git-filter-repo failed. See output above for details."
    exit 1
}

Write-Output "History rewritten. You must now force-push all branches and tags to overwrite remote history."
Write-Output "Example: git push --force --all && git push --force --tags"
