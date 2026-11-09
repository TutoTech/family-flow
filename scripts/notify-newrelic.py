#!/usr/bin/env python3
"""
Relais de télémétrie GitLab CI/CD vers New Relic pour Stop-Repeat (family-flow).
Exécuté à l'étape finale (.post) du pipeline GitLab pour agréger
les résultats des scans de sécurité et les envoyer à New Relic.
"""

import os
import sys
import glob
import json
import urllib.request


def main():
    ingest_key = os.environ.get("NEW_RELIC_INGEST_KEY")
    if not ingest_key:
        print("ℹ️ Variable NEW_RELIC_INGEST_KEY absente, saut de la télémétrie.")
        return 0

    account_id = os.environ.get("NEW_RELIC_ACCOUNT_ID", "6845288")
    project_path = os.environ.get("CI_PROJECT_PATH", "tutotech.org/family-flow")
    pipeline_id = int(os.environ.get("CI_PIPELINE_ID", "0"))
    pipeline_url = os.environ.get("CI_PIPELINE_URL", "")
    branch = os.environ.get("CI_COMMIT_REF_NAME", "main")
    commit_sha = os.environ.get("CI_COMMIT_SHORT_SHA", "")
    source = os.environ.get("CI_PIPELINE_SOURCE", "push")

    # Recherche de tous les rapports de sécurité générés par les jobs précédents
    report_patterns = [
        "**/gl-*-report.json",
        "gl-*-report.json",
    ]
    report_files = []
    for pat in report_patterns:
        report_files.extend(glob.glob(pat, recursive=True))
    report_files = sorted(list(set(report_files)))

    crit_count = 0
    high_count = 0
    med_count = 0
    low_count = 0

    print(f"📄 Analyse de {len(report_files)} rapport(s) de sécurité trouvés...")
    for rf in report_files:
        try:
            with open(rf, "r", encoding="utf-8") as f:
                data = json.load(f)
                vulns = data.get("vulnerabilities", [])
                for v in vulns:
                    sev = str(v.get("severity", "")).lower()
                    if sev == "critical":
                        crit_count += 1
                    elif sev == "high":
                        high_count += 1
                    elif sev == "medium":
                        med_count += 1
                    elif sev == "low":
                        low_count += 1
        except Exception as err:
            print(f"⚠️ Erreur lors de la lecture de {rf} : {err}")

    # Statuts des différents scanners
    sast_ok = any("sast" in r for r in report_files) or os.path.exists("gl-sast-report.json")
    secret_ok = any("secret" in r for r in report_files) or os.path.exists("gl-secret-detection-report.json")
    container_ok = any("container" in r for r in report_files) or os.path.exists("gl-container-scanning-report.json")
    dep_ok = any("dependency" in r for r in report_files) or bool(glob.glob("**/gl-sbom-*.cdx.json", recursive=True))
    dast_ok = any("dast" in r for r in report_files) or (source not in ["schedule", "web"])

    event_payload = [{
        "eventType": "GitLabSecurityScan",
        "project": project_path,
        "pipelineId": pipeline_id,
        "pipelineUrl": pipeline_url,
        "branch": branch,
        "commitSha": commit_sha,
        "source": source,
        "status": "success",
        "criticalVulns": crit_count,
        "highVulns": high_count,
        "mediumVulns": med_count,
        "lowVulns": low_count,
        "sastPassed": 1 if sast_ok else 0,
        "secretDetectionPassed": 1 if secret_ok else 0,
        "dependencyScanningPassed": 1 if dep_ok else 0,
        "containerScanningPassed": 1 if container_ok else 0,
        "dastPassed": 1 if dast_ok else 0,
    }]

    endpoint = f"https://insights-collector.eu01.nr-data.net/v1/accounts/{account_id}/events"
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(event_payload).encode("utf-8"),
        headers={
            "Api-Key": ingest_key,
            "Content-Type": "application/json",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status in (200, 202):
                print(f"✅ Télémétrie envoyée à New Relic avec succès (HTTP {resp.status}).")
            else:
                print(f"⚠️ Code inattendu de New Relic : HTTP {resp.status}")
    except Exception as err:
        print(f"❌ Erreur lors de l'envoi de la télémétrie New Relic : {err}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
