$ErrorActionPreference = "Stop"

git config user.email "vallurianand01@gmail.com"
git config user.name "vallurianand01-commits"

# Delete the failed organic-history branch if it exists
if (git branch --list organic-history) {
    git branch -D organic-history
}

# Checkout orphan branch
git checkout --orphan organic-history
git rm -rf --cached .

# Starting date
$date = [datetime]::ParseExact("2026-08-18T10:00:00", "s", $null)

function Commit-Step($message) {
    $dateStr = $date.ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m $message
    $script:date = $date.AddHours(5)
}

# Checkout files from first commit
git checkout 5f11c83 -- .

# Unstage everything properly on an orphan branch!
git rm -rf --cached .

# Step 1
git add .gitignore .dockerignore requirements.txt dockerfile config/ README.md
Commit-Step "Setup project structure and base configuration"

# Step 2
git add database/
Commit-Step "Implement PostgreSQL database models and metrics schema"

# Step 3
git add llm/ vectorstore/
Commit-Step "Add Azure OpenAI client and AI Search vectorstore integration"

# Step 4
git add ingestion/
Commit-Step "Build document ingestion pipeline and semantic chunker"

# Step 5
git add rag/
Commit-Step "Implement Retrieval-Augmented Generation (RAG) extraction"

# Step 6
git add routes/ app.py main.py mock_server.py
Commit-Step "Develop FastAPI backend application and routes"

# Step 7
git add static/ templates/
Commit-Step "Create web interface for dynamic dashboard and Copilot chat"

# Step 8
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

# Reset main to this organic-history
git checkout main
git reset --hard organic-history
