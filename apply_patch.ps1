param(
    [string]$RepoPath = "..\open-hmi-network"
)

$ErrorActionPreference = "Stop"
$RepoPath = (Resolve-Path $RepoPath).Path
$PatchRoot = $PSScriptRoot

function Read-Utf8([string]$Path) {
    return [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
}
function Write-Utf8([string]$Path, [string]$Text) {
    [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

$required = @(
    "projects.html",
    "sitemap.xml",
    "data\registry\contributors\janos-marta.json",
    "data\registry\index.json"
)
foreach ($rel in $required) {
    if (-not (Test-Path (Join-Path $RepoPath $rel))) {
        throw "Missing expected repo file: $rel"
    }
}

# Copy new binary/video assets and detail/registry files
New-Item -ItemType Directory -Force -Path (Join-Path $RepoPath "demos") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $RepoPath "assets\videos") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $RepoPath "assets\images") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $RepoPath "data\registry\contributions") | Out-Null

Copy-Item -Force (Join-Path $PatchRoot "demos\janos-ai-robot-gesture-demo.html") (Join-Path $RepoPath "demos\janos-ai-robot-gesture-demo.html")
Copy-Item -Force (Join-Path $PatchRoot "assets\videos\janos-ai-robot-gesture-demo.mp4") (Join-Path $RepoPath "assets\videos\janos-ai-robot-gesture-demo.mp4")
Copy-Item -Force (Join-Path $PatchRoot "assets\images\janos-ai-robot-gesture-demo-poster.jpg") (Join-Path $RepoPath "assets\images\janos-ai-robot-gesture-demo-poster.jpg")
Copy-Item -Force (Join-Path $PatchRoot "data\registry\contributions\janos-ai-robot-gesture-demo.json") (Join-Path $RepoPath "data\registry\contributions\janos-ai-robot-gesture-demo.json")

# Add demo card
$projectsPath = Join-Path $RepoPath "projects.html"
$projects = Read-Utf8 $projectsPath
if ($projects -notmatch 'id="janos-ai-robot-gesture"') {
    $existingStart = $projects.IndexOf('id="janos-touch-ui"')
    if ($existingStart -lt 0) { throw "Could not find existing János OrbitMenu card in projects.html" }
    $articleEnd = $projects.IndexOf("</article>", $existingStart)
    if ($articleEnd -lt 0) { throw "Could not find end of OrbitMenu card" }
    $insertPos = $articleEnd + "</article>".Length
    $card = @'
<article class="demo-case contributor-demo-case" id="janos-ai-robot-gesture">
        <div class="demo-video-wrap has-video">
          <video class="demo-video" controls playsinline preload="none"
                 poster="assets/images/janos-ai-robot-gesture-demo-poster.jpg"
                 data-demo-video aria-label="AI Robot Gesture System demo by János Márta">
            <source src="assets/videos/janos-ai-robot-gesture-demo.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="demo-case-copy">
          <div class="project-top"><span class="project-kicker">Contributor Demo · János Márta</span><span class="project-id">AI interaction experiment</span></div>
          <h2>AI Robot Gesture System</h2>
          <p>An embedded HMI experiment where a robot moves through listening, thinking and speaking states, each with its own gesture. State transitions are controlled directly on the display through draggable nodes.</p>
          <div class="tag-row"><span class="tag blue">Robot HMI</span><span class="tag cyan">State Interaction</span><span class="tag">Draggable Nodes</span></div>
          <div class="demo-facts"><span>Listening · Thinking · Speaking</span><span>Gesture per state</span><span>Touch-controlled transitions</span></div>
          <div class="demo-inline-actions"><a class="card-link" href="demos/janos-ai-robot-gesture-demo.html">View Demo Details →</a><a class="card-link muted-link" href="submit-project.html?contributor=J%C3%A1nos%20M%C3%A1rta&amp;reference=AI%20Robot%20Gesture%20System">Discuss a Similar Project →</a></div>
        </div>
      </article>
'@
    $projects = $projects.Substring(0, $insertPos) + "`r`n`r`n" + $card + $projects.Substring($insertPos)
    Write-Utf8 $projectsPath $projects
}

# Update contributor profile
$janosPath = Join-Path $RepoPath "data\registry\contributors\janos-marta.json"
$janos = Get-Content $janosPath -Raw -Encoding UTF8 | ConvertFrom-Json
$janos.headline = "Embedded UI / LVGL contributor · OrbitMenu · AI Robot Gesture System"
$janos.bio = "Contributor behind OrbitMenu and the AI Robot Gesture System, exploring reusable embedded UI controls, touch interaction and state-driven HMI concepts on ArtInChip hardware."
$skills = @($janos.skills)
foreach ($skill in @("Robot HMI","State-driven UI","AI Interaction")) {
    if ($skills -notcontains $skill) { $skills += $skill }
}
$janos.skills = $skills
$janos | ConvertTo-Json -Depth 10 | Set-Content $janosPath -Encoding UTF8

# Update registry index
$indexPath = Join-Path $RepoPath "data\registry\index.json"
$idx = Get-Content $indexPath -Raw -Encoding UTF8 | ConvertFrom-Json
$idx.version = "0.6.4"
$contrib = "contributions/janos-ai-robot-gesture-demo.json"
$contribs = @($idx.contributions)
if ($contribs -notcontains $contrib) { $contribs += $contrib }
$idx.contributions = $contribs
$idx | ConvertTo-Json -Depth 10 | Set-Content $indexPath -Encoding UTF8

# Update sitemap
$sitemapPath = Join-Path $RepoPath "sitemap.xml"
$sitemap = Read-Utf8 $sitemapPath
if ($sitemap -notmatch "janos-ai-robot-gesture-demo.html") {
    $entry = @'
  <url>
    <loc>https://openhmi.network/demos/janos-ai-robot-gesture-demo.html</loc>
    <lastmod>2026-09-21</lastmod>
  </url>
'@
    $sitemap = $sitemap.Replace("</urlset>", $entry + "</urlset>")
    Write-Utf8 $sitemapPath $sitemap
}

Write-Host ""
Write-Host "Patch applied, including local MP4 and poster." -ForegroundColor Green
Write-Host "Next: git diff; git add -A; git commit; git push origin main"
