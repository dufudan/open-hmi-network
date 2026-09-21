# Corrected patch — János AI Robot Gesture System

Version: **v0.8.1-DEMO2-v2**

This corrected package includes the actual video file.

## Included media
- `assets/videos/janos-ai-robot-gesture-demo.mp4` — 29.2 MB
- `assets/images/janos-ai-robot-gesture-demo-poster.jpg` — poster extracted from the demo

The website now plays the MP4 from the OpenHMI repository. It no longer depends on the Google Drive iframe.

## Apply
```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\apply_patch.ps1 -RepoPath "C:\Users\DavidDuFuDan-SH\open-hmi-network"
cd "C:\Users\DavidDuFuDan-SH\open-hmi-network"
git diff
git status
git add -A
git commit -m "Add János AI robot gesture HMI demo with video"
git push origin main
```

## Commit title
`Add János AI robot gesture HMI demo with video`

## Commit description
`Add János Márta's AI Robot Gesture System as a second contributor demo, including the original MP4 and a local poster image. The demo shows listening, thinking and speaking states, gesture-based state feedback, and draggable on-screen transition nodes. Update the HMI demos page, contributor registry/profile and sitemap while keeping the existing OrbitMenu demo.`

## Expected new files
- `assets/videos/janos-ai-robot-gesture-demo.mp4`
- `assets/images/janos-ai-robot-gesture-demo-poster.jpg`
- `demos/janos-ai-robot-gesture-demo.html`
- `data/registry/contributions/janos-ai-robot-gesture-demo.json`

## Expected modified files
- `projects.html`
- `data/registry/contributors/janos-marta.json`
- `data/registry/index.json`
- `sitemap.xml`
