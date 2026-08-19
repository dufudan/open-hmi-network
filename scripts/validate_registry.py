#!/usr/bin/env python3
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
REG = ROOT / "data" / "registry"

REQUIRED_CONTRIBUTOR = {"id", "name", "headline", "skills", "available_for_projects"}
REQUIRED_CONTRIBUTION = {"id", "title", "type", "contributor_id", "summary", "publication_model", "access", "source", "available_for_projects"}
ALLOWED_MODELS = {"open-source", "open-reference", "partner-solution", "contributor-demo"}
ALLOWED_ACCESS = {"open-source", "public", "registration", "request", "restricted"}
ALLOWED_SOURCE = {"official", "open-hmi", "community"}

errors = []

def load(path):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: {exc}")
        return None

index = load(REG / "index.json") or {}
contributors = {}
contributions = {}

for rel in index.get("contributors", []):
    path = REG / rel
    if not path.exists():
        errors.append(f"Missing contributor file: {rel}")
        continue
    data = load(path)
    if not data:
        continue
    missing = REQUIRED_CONTRIBUTOR - set(data)
    if missing:
        errors.append(f"{rel}: missing {sorted(missing)}")
    cid = data.get("id")
    if cid in contributors:
        errors.append(f"Duplicate contributor id: {cid}")
    contributors[cid] = data

for rel in index.get("contributions", []):
    path = REG / rel
    if not path.exists():
        errors.append(f"Missing contribution file: {rel}")
        continue
    data = load(path)
    if not data:
        continue
    missing = REQUIRED_CONTRIBUTION - set(data)
    if missing:
        errors.append(f"{rel}: missing {sorted(missing)}")
    item_id = data.get("id")
    if item_id in contributions:
        errors.append(f"Duplicate contribution id: {item_id}")
    contributions[item_id] = data
    if data.get("publication_model") not in ALLOWED_MODELS:
        errors.append(f"{rel}: invalid publication_model {data.get('publication_model')!r}")
    if data.get("access") not in ALLOWED_ACCESS:
        errors.append(f"{rel}: invalid access {data.get('access')!r}")
    if data.get("source") not in ALLOWED_SOURCE:
        errors.append(f"{rel}: invalid source {data.get('source')!r}")

for item_id, item in contributions.items():
    if item.get("contributor_id") not in contributors:
        errors.append(f"{item_id}: unknown contributor_id {item.get('contributor_id')!r}")

if errors:
    print("Registry validation failed:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"Registry OK: {len(contributors)} contributors, {len(contributions)} contributions")
