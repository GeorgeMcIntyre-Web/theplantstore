# Git Helper Functions for PowerShell
# Add these to your PowerShell profile for permanent use

# Quick commit and push
function gcp($message) {
    if (-not $message) {
        Write-Host "Usage: gcp 'commit message'" -ForegroundColor Red
        return
    }
    git add .
    git commit -m $message
    git push origin main
}

# Quick commit (no push)
function gc($message) {
    if (-not $message) {
        Write-Host "Usage: gc 'commit message'" -ForegroundColor Red
        return
    }
    git add .
    git commit -m $message
}

# Git status (short)
function gs {
    git status
}

# Git push
function gp {
    git push origin main
}

# Git pull
function gl {
    git pull origin main
}

# Git add all
function ga {
    git add .
}

# Git log (pretty)
function glog {
    git log --oneline --graph --decorate -10
}

# Create new branch and switch to it
function gnb($branchName) {
    if (-not $branchName) {
        Write-Host "Usage: gnb 'branch-name'" -ForegroundColor Red
        return
    }
    git checkout -b $branchName
}

# Switch to branch
function gsw($branchName) {
    if (-not $branchName) {
        Write-Host "Usage: gsw 'branch-name'" -ForegroundColor Red
        return
    }
    git checkout $branchName
}

# Delete branch
function gdb($branchName) {
    if (-not $branchName) {
        Write-Host "Usage: gdb 'branch-name'" -ForegroundColor Red
        return
    }
    git branch -d $branchName
}

# Reset last commit (keep changes)
function greset {
    git reset --soft HEAD~1
}

# Hard reset (lose changes)
function grhard {
    git reset --hard HEAD
}

# Show current branch
function gbr {
    git branch --show-current
}

# Git diff
function gd {
    git diff
}

# Git diff staged
function gds {
    git diff --staged
}

# Undo last commit completely
function gundo {
    git reset --hard HEAD~1
}

# Quick fix commit and push
function gfix($message = "fix") {
    git add .
    git commit -m $message
    git push origin main
}

# Initialize git repo with .gitignore
function ginit {
    git init
    @"
node_modules/
.next/
.env.local
.env
*.log
.DS_Store
dist/
build/
coverage/
.nyc_output/
"@ | Out-File -FilePath .gitignore -Encoding utf8
    git add .
    git commit -m "Initial commit"
}

# Clean git repo (remove node_modules from tracking)
function gclean {
    git rm -r --cached node_modules/ --ignore-unmatch
    git rm -r --cached .next/ --ignore-unmatch
    git rm -r --cached dist/ --ignore-unmatch
    git rm -r --cached build/ --ignore-unmatch
    @"
node_modules/
.next/
.env.local
.env
*.log
.DS_Store
dist/
build/
coverage/
.nyc_output/
"@ | Out-File -FilePath .gitignore -Encoding utf8 -Force
    git add .gitignore
    git commit -m "Update .gitignore and remove large files"
}

# Show help
function ghelp {
    Write-Host @"
Git Helper Commands:
  gcp 'message'  - Add, commit, and push
  gc 'message'   - Add and commit
  gs             - Git status
  gp             - Push to main
  gl             - Pull from main
  ga             - Add all files
  glog           - Pretty git log
  gnb 'name'     - Create new branch
  gsw 'name'     - Switch to branch
  gdb 'name'     - Delete branch
  greset         - Reset last commit (keep changes)
  grhard         - Hard reset (lose changes)
  gbr            - Show current branch
  gd             - Git diff
  gds            - Git diff staged
  gundo          - Undo last commit completely
  gfix 'msg'     - Quick fix commit
  ginit          - Initialize repo with .gitignore
  gclean         - Clean repo (remove node_modules etc)
  ghelp          - Show this help
"@ -ForegroundColor Green
}

# Display available commands when first loaded
Write-Host "Git helpers loaded! Type 'ghelp' to see available commands." -ForegroundColor Cyan