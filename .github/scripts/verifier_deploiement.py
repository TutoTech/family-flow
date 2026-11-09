#!/usr/bin/env python3
"""Vérifie que la version déployée en ligne sur stop-repeat.tutotech.org correspond au commit attendu.

Agent-Ready Error Contract :
  what: Dernière réponse HTTP reçue ou cause du timeout
  fix: Commande de diagnostic (logs Coolify ou statut du conteneur)
  recovery: Vérifier les logs Coolify ou relancer image.yml
  code: ERR_DEPLOY_VERIFY_TIMEOUT / ERR_DEPLOY_VERIFY_MISMATCH
  context: URL, timeout, commit attendu vs reçu

Usage: verifier_deploiement.py <commit_sha> [--url <endpoint>] [--timeout <secondes>]
"""
import argparse
import json
import sys
import time
import urllib.error
import urllib.request

DEFAULT_URL = "https://stop-repeat.tutotech.org/version.json"
DEFAULT_TIMEOUT = 300  # 5 minutes


def verifier(url: str, commit_attendu: str, timeout_sec: int) -> bool:
    debut = time.time()
    derniere_reponse = None
    dernier_code = None

    print(f"Vérification du déploiement en ligne...")
    print(f"  Endpoint : {url}")
    print(f"  Commit attendu : {commit_attendu}")
    print(f"  Timeout : {timeout_sec}s")

    tentative = 1
    while time.time() - debut < timeout_sec:
        cache_buster_url = f"{url}?_t={int(time.time() * 1000)}"
        req = urllib.request.Request(
            cache_buster_url,
            headers={
                "User-Agent": "GitHub-Actions-Verifier/1.0",
                "Cache-Control": "no-cache",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                dernier_code = resp.status
                contenu = resp.read().decode("utf-8")
                derniere_reponse = contenu
                try:
                    data = json.loads(contenu)
                    version_en_ligne = data.get("version", "").strip()
                    if version_en_ligne == commit_attendu:
                        temps_ecoule = int(time.time() - debut)
                        print(f"✓ Déploiement vérifié avec succès en {temps_ecoule}s (commit: {version_en_ligne})")
                        return True
                    else:
                        print(f"  [#{tentative}] Version en ligne : {version_en_ligne or 'inconnue'} (attendu: {commit_attendu[:7]})")
                except json.JSONDecodeError:
                    print(f"  [#{tentative}] Réponse reçue non-JSON (longueur: {len(contenu)} octets)")
        except urllib.error.HTTPError as exc:
            dernier_code = exc.code
            print(f"  [#{tentative}] Code HTTP transitoire : {exc.code} (attente de bascule du conteneur)")
        except (urllib.error.URLError, TimeoutError) as exc:
            print(f"  [#{tentative}] Erreur réseau transitoire : {exc}")

        tentative += 1
        time.sleep(15)

    # Échec après expiration du timeout
    temps_total = int(time.time() - debut)
    print("\n::error::[CAP6:verifier:fix_and_recovery] Échec de la vérification du déploiement en ligne", file=sys.stderr)
    print(f"what: Au bout de {temps_total}s, {url} n'a pas retourné le commit attendu {commit_attendu}", file=sys.stderr)
    print(f"code: ERR_DEPLOY_VERIFY_TIMEOUT", file=sys.stderr)
    print(f"context: Dernier code HTTP={dernier_code}, Dernière réponse={derniere_reponse!r}", file=sys.stderr)
    print("recovery: 1. Vérifier si Coolify a bien reçu le webhook et téléchargé l'image GHCR.", file=sys.stderr)
    print("          2. Vérifier les logs Traefik et les logs du conteneur Stop-Repeat sur la VM.", file=sys.stderr)
    print("          3. Relancer image.yml si le conteneur n'a pas pu démarrer.", file=sys.stderr)
    print(f"fix: coolify app logs --app stop-repeat || curl -k {url}", file=sys.stderr)
    return False


def main(argv):
    parser = argparse.ArgumentParser(description="Vérification en ligne du déploiement")
    parser.add_argument("commit", help="Commit SHA attendu (40 caractères)")
    parser.add_argument("--url", default=DEFAULT_URL, help=f"URL du fichier version.json (défaut: {DEFAULT_URL})")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help=f"Timeout en secondes (défaut: {DEFAULT_TIMEOUT})")
    args = parser.parse_args(argv[1:])

    succes = verifier(args.url, args.commit, args.timeout)
    return 0 if succes else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
