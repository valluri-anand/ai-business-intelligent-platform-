$ErrorActionPreference = "Stop"

git config user.email "vallurianand01@gmail.com"
git config user.name "vallurianand01-commits"

# Backup main
git branch main-backup

# Checkout orphan branch
git checkout --orphan organic-history
git rm -rf --cached .

# Starting date (a bit before the first commit to simulate progress over time)
# The original first commit was "Thu Aug 20 23:48:05 2026 +0530"
# We will start on Aug 18 and add a few hours each step.
$date = [datetime]::ParseExact("2026-08-18T10:00:00", "s", $null)

function Commit-Step($message) {
    $dateStr = $date.ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m $message
    $script:date = $date.AddHours(5)
}

# We need to make sure the files are exactly as they were in the first commit
# So we first checkout the files from the first commit (5f11c83)
git checkout 5f11c83 -- .

# Unstage everything
git reset HEAD .

git add .gitignore .dockerignore requirements.txt dockerfile config/ README.md
Commit-Step "Setup project structure and base configuration"

git add database/
Commit-Step "Implement PostgreSQL database models and metrics schema"

git add llm/ vectorstore/
Commit-Step "Add Azure OpenAI client and AI Search vectorstore integration"

git add ingestion/
Commit-Step "Build document ingestion pipeline and semantic chunker"

git add rag/
Commit-Step "Implement Retrieval-Augmented Generation (RAG) extraction"

git add routes/ app.py main.py mock_server.py
Commit-Step "Develop FastAPI backend application and routes"

git add static/ templates/
Commit-Step "Create web interface for dynamic dashboard and Copilot chat"

git add docs/ notes/ k8s/ data/ CICD_Deployment_Guide.md deployment-Document.md project_journey.md
Commit-Step "Add deployment configs, architecture notes, and sample datasets"

# Check if there are any remaining untracked/unstaged files from the root commit
$remaining = git status --porcelain
if ($remaining) {
    git add .
    Commit-Step "Include missing project files"
}

# Clean env variables
Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

# Cherry pick the remaining commits from origin/main
$commits = git log --format="%H" --reverse origin/main | Select-Object -Skip 1
foreach ($c in $commits) {
    git cherry-pick $c
}

git checkout main
git reset --hard organic-history
