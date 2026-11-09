#!/usr/bin/env python3
"""Écrit le docker-compose.yml de la branche `production` : celui de main, image épinglée sur un commit.

Pourquoi : Coolify construisait initialement l'image sur le serveur (build:), ce qui risquait
de saturer la mémoire de la VM (8 Go, swap déjà utilisé). L'image est désormais fabriquée
par GitHub Actions (.github/workflows/image.yml) et Coolify suit la branche `production`,
dont le compose désigne l'image exacte du commit à déployer : le serveur ne fait plus que
la télécharger.

Le compose de main porte `image: ghcr.io/tutotech/family-flow:main` ; ce script remplace
`:main` par le commit SHA.
Il REFUSE :
  - un compose contenant « build: » (reconstruction serveur interdite) ;
  - un compose sans l'image attendue ou avec des occurrences multiples ;
  - un commit qui n'est pas un SHA complet de 40 caractères hexadécimaux.

Usage : compose_production.py <commit de 40 caractères> [fichier] (défaut : docker-compose.yml)
"""
import re
import sys

IMAGE = "ghcr.io/tutotech/family-flow"
_LIGNE_MAIN = re.compile(rf"^([ \t]+image:[ \t]*){re.escape(IMAGE)}:main[ \t]*$", re.M)
_COMMIT = re.compile(r"^[0-9a-f]{40}$")
_BUILD = re.compile(r"^[ \t]+build[ \t]*:", re.M)


class Refus(ValueError):
    """Le compose ou le commit ne permet pas de déployer sans construire sur le serveur."""


def pour_production(compose: str, commit: str) -> str:
    if not _COMMIT.match(commit):
        raise Refus(
            f"ERR_COMPOSE_COMMIT_INVALID: commit invalide (40 caractères hexadécimaux attendus) : {commit!r}\n"
            "Fix: fournir un SHA complet de 40 caractères (ex: git rev-parse HEAD)"
        )
    if _BUILD.search(compose):
        raise Refus(
            "ERR_COMPOSE_BUILD_FORBIDDEN: le compose contient « build: » (construction sur le serveur interdite)\n"
            "Fix: supprimer la directive build: du docker-compose.yml pour utiliser l'image préconstruite GHCR"
        )
    trouvees = _LIGNE_MAIN.findall(compose)
    if len(trouvees) != 1:
        raise Refus(
            f"ERR_COMPOSE_IMAGE_LINE: ligne « image: {IMAGE}:main » trouvée {len(trouvees)} fois (1 attendue)\n"
            f"Fix: vérifier que docker-compose.yml contient exactement une ligne 'image: {IMAGE}:main'"
        )
    return _LIGNE_MAIN.sub(lambda m: f"{m.group(1)}{IMAGE}:{commit}", compose)


def main(argv):
    if len(argv) not in (2, 3):
        print(
            "ERR_USAGE: usage : compose_production.py <commit de 40 caractères> [fichier]\n"
            "Fix: exécuter avec l'argument du commit SHA 40 caractères",
            file=sys.stderr,
        )
        return 2
    commit = argv[1]
    chemin = argv[2] if len(argv) == 3 else "docker-compose.yml"
    try:
        with open(chemin, encoding="utf-8") as f:
            compose = f.read()
    except Exception as exc:
        print(f"ERR_READ_FILE: impossible de lire {chemin}: {exc}", file=sys.stderr)
        return 1

    try:
        nouveau = pour_production(compose, commit)
    except Refus as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1

    try:
        with open(chemin, "w", encoding="utf-8") as f:
            f.write(nouveau)
    except Exception as exc:
        print(f"ERR_WRITE_FILE: impossible d'écrire {chemin}: {exc}", file=sys.stderr)
        return 1

    print(f"{chemin} : image {IMAGE}:{commit}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
