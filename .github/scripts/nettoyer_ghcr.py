#!/usr/bin/env python3
"""Supprime de GHCR les vieilles images de production, en gardant les 30 plus récentes.

Règles de rétention :
  1. Seules les versions étiquetées comptent : les N plus récentes (défaut: 30) restent.
  2. L'image désignée par la branche `production` reste toujours sanctuarisée, quel que soit son âge.
  3. Une version sans étiquette ne part que si elle a été poussée à plus de 10 min de toute image gardée
     et depuis plus d'une heure.
  4. Moins de 30 images étiquetées, ou paquet absent : rien n'est supprimé.

Usage : nettoyer_ghcr.py [--essai|--dry-run] [--keep <N>]
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone

PROPRIETAIRE = "TutoTech"
DEPOT = "TutoTech/family-flow"
PAQUET = "family-flow"
DEFAULT_GARDER = 30
MARGE = timedelta(minutes=10)
RECENT = timedelta(hours=1)
_IMAGE = re.compile(r"ghcr\.io/tutotech/family-flow:([0-9a-f]{40})")


def _t(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def _etiquettes(version):
    return (version.get("metadata") or {}).get("container", {}).get("tags") or []


def a_supprimer(versions, protege, maintenant, garder=DEFAULT_GARDER):
    """Identifiants des versions à supprimer. Fonction pure : toute la règle est ici."""
    etiquetees = sorted(
        (v for v in versions if _etiquettes(v)), key=lambda v: _t(v["created_at"]), reverse=True
    )
    if len(etiquetees) <= garder:
        return []
    gardees = etiquetees[:garder] + [v for v in etiquetees[garder:] if protege and protege in _etiquettes(v)]
    dates_gardees = [_t(v["created_at"]) for v in gardees]
    ids_gardes = {v["id"] for v in gardees}
    supprimer = [v["id"] for v in etiquetees if v["id"] not in ids_gardes]
    for v in versions:
        if _etiquettes(v):
            continue
        quand = _t(v["created_at"])
        if maintenant - quand < RECENT:
            continue
        if all(abs(quand - g) > MARGE for g in dates_gardees):
            supprimer.append(v["id"])
    return supprimer


def image_de_production(compose):
    """Commit de l'image désignée par le compose de `production`, ou None."""
    trouvees = _IMAGE.findall(compose)
    return trouvees[0] if len(trouvees) == 1 else None


def _api(*args):
    try:
        sortie = subprocess.run(["gh", "api", *args], capture_output=True, text=True, check=True)
        return json.loads(sortie.stdout) if sortie.stdout.strip() else None
    except subprocess.CalledProcessError as exc:
        if "404" in exc.stderr:
            return None
        raise


def _versions():
    versions, page = [], 1
    while True:
        lot = _api(f"orgs/{PROPRIETAIRE}/packages/container/{PAQUET}/versions?per_page=100&page={page}")
        if not lot:
            return versions
        versions += lot
        page += 1


def main(argv):
    parser = argparse.ArgumentParser(description="Nettoyage et rétention des images GHCR")
    parser.add_argument("--essai", "--dry-run", dest="essai", action="store_true", help="Mode simulation")
    parser.add_argument(
        "--keep",
        type=int,
        default=int(os.environ.get("KEEP_IMAGES", DEFAULT_GARDER)),
        help="Nombre d'images étiquetées récentes à conserver (défaut: 30)",
    )
    args = parser.parse_args(argv[1:])

    # Lecture de l'image active sur production
    fichier = _api(f"repos/{DEPOT}/contents/docker-compose.yml?ref=production")
    protege = None
    if fichier and "content" in fichier:
        try:
            protege = image_de_production(base64.b64decode(fichier["content"]).decode("utf-8"))
        except Exception:
            protege = None

    try:
        versions = _versions()
    except Exception as exc:
        print(f"::warning::Impossible de lister les versions du paquet {PAQUET} : {exc}")
        return 0

    if not versions:
        print(f"Aucune version trouvée pour le conteneur {PAQUET}.")
        return 0

    ids = a_supprimer(versions, protege, datetime.now(timezone.utc), garder=args.keep)
    prot_str = protege[:7] if protege else "aucune"
    print(f"{len(versions)} versions, image en production {prot_str}, {len(ids)} à supprimer (seuil de rétention: {args.keep})")

    for vid in ids:
        if args.essai:
            print(f"  (essai) supprimerait {vid}")
        else:
            try:
                subprocess.run(
                    ["gh", "api", "-X", "DELETE", f"orgs/{PROPRIETAIRE}/packages/container/{PAQUET}/versions/{vid}"],
                    check=True,
                    capture_output=True,
                )
                print(f"  supprimée {vid}")
            except subprocess.CalledProcessError as exc:
                print(f"::warning::Échec de suppression de la version {vid}: {exc.stderr.strip()}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
