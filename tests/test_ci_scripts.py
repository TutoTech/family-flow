#!/usr/bin/env python3
"""Tests unitaires pour les scripts d'automatisation CI/CD (.github/scripts/).
Exécutable directement sans dépendance externe : python3 -m unittest tests/test_ci_scripts.py
"""
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ajouter .github/scripts au PYTHONPATH
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / ".github" / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import compose_production
import deja_teste
import nettoyer_ghcr


class TestComposeProduction(unittest.TestCase):
    def setUp(self):
        self.valid_compose = """services:
  app:
    image: ghcr.io/tutotech/family-flow:main
    restart: unless-stopped
"""
        self.valid_commit = "a" * 40

    def test_remplacement_nominal(self):
        result = compose_production.pour_production(self.valid_compose, self.valid_commit)
        self.assertIn(f"image: ghcr.io/tutotech/family-flow:{self.valid_commit}", result)
        self.assertNotIn(":main", result)

    def test_refus_commit_invalide(self):
        with self.assertRaises(compose_production.Refus):
            compose_production.pour_production(self.valid_compose, "invalid-sha")
        with self.assertRaises(compose_production.Refus):
            compose_production.pour_production(self.valid_compose, "a" * 39)

    def test_refus_build_directive(self):
        compose_with_build = """services:
  app:
    build: .
    image: ghcr.io/tutotech/family-flow:main
"""
        with self.assertRaises(compose_production.Refus):
            compose_production.pour_production(compose_with_build, self.valid_commit)

    def test_refus_absence_ou_multiples_images(self):
        # Absence
        with self.assertRaises(compose_production.Refus):
            compose_production.pour_production("services:\n  app:\n    image: nginx:latest\n", self.valid_commit)
        # Multiple
        double_compose = self.valid_compose + "  other:\n    image: ghcr.io/tutotech/family-flow:main\n"
        with self.assertRaises(compose_production.Refus):
            compose_production.pour_production(double_compose, self.valid_commit)


class TestNettoyerGHCR(unittest.TestCase):
    def test_retention_moins_de_30_images(self):
        maintenant = datetime.now(timezone.utc)
        versions = [
            {
                "id": i,
                "created_at": (maintenant - timedelta(days=i)).isoformat(),
                "metadata": {"container": {"tags": [f"commit-{i}"]}},
            }
            for i in range(15)
        ]
        # Moins de 30 images : aucune suppression
        a_del = nettoyer_ghcr.a_supprimer(versions, protege="commit-0", maintenant=maintenant, garder=30)
        self.assertEqual(a_del, [])

    def test_retention_plus_de_30_images_avec_sanctuarisation(self):
        maintenant = datetime.now(timezone.utc)
        # 35 versions
        versions = [
            {
                "id": i,
                "created_at": (maintenant - timedelta(days=i)).isoformat(),
                "metadata": {"container": {"tags": [f"commit-{i}"]}},
            }
            for i in range(35)
        ]
        # La version 34 (la plus ancienne) est celle active en production
        a_del = nettoyer_ghcr.a_supprimer(versions, protege="commit-34", maintenant=maintenant, garder=30)
        # Doit supprimer 4 versions au lieu de 5, car la version 34 est protégée
        self.assertEqual(len(a_del), 4)
        self.assertNotIn(34, a_del)
        # Les versions 30, 31, 32, 33 doivent être supprimées
        for vid in [30, 31, 32, 33]:
            self.assertIn(vid, a_del)


class TestDejaTeste(unittest.TestCase):
    def test_decide_commit_precedent_inconnu(self):
        sauter, raison = deja_teste.decide("ci", "", [], [], [])
        self.assertFalse(sauter)
        self.assertIn("inconnu", raison)

    def test_decide_aucune_pr(self):
        sauter, raison = deja_teste.decide("ci", "b" * 40, [], [], [])
        self.assertFalse(sauter)
        self.assertIn("PR fusionnée", raison)

    def test_decide_pr_valide_et_main_stable(self):
        t0 = datetime(2026, 11, 1, 12, 0, 0, tzinfo=timezone.utc)
        prs = [{"number": 42, "merged_at": (t0 + timedelta(minutes=10)).isoformat(), "base": {"ref": "main"}}]
        pr_runs = [
            {
                "name": "ci",
                "event": "pull_request",
                "conclusion": "success",
                "created_at": (t0 + timedelta(minutes=5)).isoformat(),
            }
        ]
        before_runs = [
            {
                "event": "push",
                "created_at": (t0 - timedelta(hours=1)).isoformat(),
            }
        ]
        sauter, raison = deja_teste.decide("ci", "b" * 40, prs, pr_runs, before_runs)
        self.assertTrue(sauter)
        self.assertIn("PR #42", raison)


if __name__ == "__main__":
    unittest.main()
