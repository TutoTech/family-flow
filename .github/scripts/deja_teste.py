#!/usr/bin/env python3
"""Dit si un push sur main peut sauter un workflow déjà exécuté sur sa PR.

Pourquoi : chaque fusion de PR relance les tests sur main, consommant des minutes
GitHub Actions pour un contenu souvent identique à celui que la PR venait de valider.
Ce script vérifie avec certitude si le commit poussé sur main provient d'une PR dont
les tests ont réussi sur la même tête et sans que main n'ait bougé entre-temps.

RÈGLE D'INGÉNIERIE : strictement réservé au workflow `ci.yml`. Formellement interdit
dans `image.yml` qui doit impérativement déployer chaque fusion sur main.
"""
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta

BRANCHE = "main"
MARGE = timedelta(minutes=2)
ZERO = "0" * 40


def _t(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def decide(workflow, before, prs, pr_runs, before_runs):
    """Renvoie (sauter, raison). Fonction pure : toute incertitude donne False."""
    if not before or before == ZERO:
        return False, "commit précédent de main inconnu"

    fusionnees = [
        p for p in prs
        if p.get("merged_at") and (p.get("base") or {}).get("ref") == BRANCHE
    ]
    if len(fusionnees) != 1:
        return False, (
            f"{len(fusionnees)} PR fusionnée(s) associée(s) au commit : "
            "push direct ou cas ambigu"
        )

    runs = sorted(
        (r for r in pr_runs
         if r.get("name") == workflow and r.get("event") == "pull_request"),
        key=lambda r: r["created_at"],
    )
    if not runs:
        return False, f"aucun passage de {workflow} sur la tête de la PR"
    if runs[-1].get("conclusion") != "success":
        return False, f"le dernier passage de {workflow} sur la PR n'est pas vert"

    teste_a = _t(next(r for r in runs if r.get("conclusion") == "success")["created_at"])

    anciens = [r for r in before_runs if r.get("event") == "push"]
    if not anciens:
        return False, "impossible de dater le commit précédent de main"
    pointe_depuis = min(_t(r["created_at"]) for r in anciens)
    if pointe_depuis + MARGE > teste_a:
        return False, (
            "main a bougé depuis le passage de la PR : le contenu fusionné "
            "n'est pas celui qui a été testé"
        )

    return True, (
        f"PR #{fusionnees[0].get('number')} : {workflow} vert sur sa tête, et main "
        "n'a pas bougé depuis ce passage"
    )


def _api(chemin):
    sortie = subprocess.run(
        ["gh", "api", chemin], capture_output=True, text=True, check=True
    )
    return json.loads(sortie.stdout)


def collecter(repo, sha, before):
    prs = _api(f"repos/{repo}/commits/{sha}/pulls")
    fusionnees = [p for p in prs if p.get("merged_at")]
    pr_runs = []
    if len(fusionnees) == 1:
        tete = fusionnees[0]["head"]["sha"]
        pr_runs = _api(
            f"repos/{repo}/actions/runs?event=pull_request&head_sha={tete}&per_page=100"
        ).get("workflow_runs", [])
    before_runs = []
    if before and before != ZERO:
        before_runs = _api(
            f"repos/{repo}/actions/runs?event=push&head_sha={before}&per_page=100"
        ).get("workflow_runs", [])
    return prs, pr_runs, before_runs


def main(argv):
    if len(argv) < 2:
        print("Usage: deja_teste.py <workflow_name>", file=sys.stderr)
        return 2
    workflow = argv[1]
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    sha = os.environ.get("GITHUB_SHA", "")
    before = os.environ.get("BEFORE_SHA", "")
    try:
        prs, pr_runs, before_runs = collecter(repo, sha, before)
        sauter, raison = decide(workflow, before, prs, pr_runs, before_runs)
    except Exception as exc:
        sauter, raison = False, f"erreur pendant la vérification ({type(exc).__name__}) : on exécute"

    print(f"sauter={sauter} — {raison}")
    sortie = os.environ.get("GITHUB_OUTPUT")
    if sortie:
        with open(sortie, "a", encoding="utf-8") as f:
            f.write(f"skip={'true' if sauter else 'false'}\n")
    resume = os.environ.get("GITHUB_STEP_SUMMARY")
    if resume:
        with open(resume, "a", encoding="utf-8") as f:
            f.write(f"### Faut-il relancer `{workflow}` ?\n\n"
                    f"{'**Non, sauté**' if sauter else '**Oui, exécuté**'} — {raison}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
