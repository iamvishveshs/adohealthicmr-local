# PowerShell script to initialize and link this project to GitHub
# Run this script after Git is installed

Write-Host "Setting up Git repository..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or run: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository if not already initialized
if (Test-Path .git) {
    Write-Host "Git repository already initialized" -ForegroundColor Yellow
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
}

# Add all files
Write-Host "Adding files to staging area..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Creating initial commit..." -ForegroundColor Cyan
    git commit -m "Initial commit"
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

# Check current branch
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "Setting default branch to 'main'..." -ForegroundColor Cyan
    git branch -M main
}

Write-Host "`nRepository setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "2. Do NOT initialize it with README, .gitignore, or license" -ForegroundColor White
Write-Host "3. Run the following commands (replace YOUR_USERNAME with your GitHub username):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/adohealthicmr.git" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
