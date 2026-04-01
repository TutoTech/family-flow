

## Diagnostic

J'ai identifié les problèmes suivants :

### 1. Erreur de build — `get_child_login_email` non reconnue par TypeScript

La fonction SQL `get_child_login_email` a été créée via une migration externe (`20260319070326_child_login_helper.sql`), mais le fichier `types.ts` auto-généré ne la contient pas. Le code dans `LoginForm.tsx` l'appelle via `supabase.rpc("get_child_login_email", ...)`, ce qui provoque une erreur TypeScript car cette fonction n'est pas dans le type `Functions`.

**Erreurs exactes :**
- Ligne 66 : `"get_child_login_email"` n'est pas assignable aux fonctions connues
- Ligne 81 : le type de retour n'est pas reconnu comme `string`

### 2. Migrations externes non synchronisées

Plusieurs migrations ont été créées en dehors de Lovable (noms lisibles comme `add_overdue_penalty_to_task_templates`, `child_login_helper`, etc.). Elles ont été appliquées à la base de données mais le fichier `types.ts` n'a pas été régénéré pour refléter les nouvelles fonctions et tables.

### 3. Edge Functions — Pas de problème détecté

Les 10 edge functions dans le code source fonctionnent normalement (logs montrent des réponses 200). Si tu as créé des edge functions supplémentaires via d'autres outils mais sans ajouter leur code dans `supabase/functions/`, elles ne seront pas visibles dans Lovable. **Lovable ne montre que les fonctions dont le code source est présent dans le projet.**

---

## Plan de correction

### Étape 1 : Corriger l'erreur de build dans `LoginForm.tsx`
Ajouter un cast TypeScript pour contourner le fait que `types.ts` ne connaît pas encore `get_child_login_email` :
```typescript
const { data: resolvedEmail, error: rpcError } = await (supabase.rpc as any)(
  "get_child_login_email",
  { _child_name: childName.trim(), _invite_code: familyCode.trim() }
);
```
Et caster `resolvedEmail` en `string` à la ligne 81.

### Étape 2 : Régénérer les types
Exécuter une migration vide (commentaire SQL) pour forcer la régénération du fichier `types.ts`, ce qui devrait inclure `get_child_login_email` et toutes les autres fonctions/tables ajoutées par les migrations externes.

---

## Questions avant de procéder

- **Edge functions manquantes** : Si tu as créé des edge functions via d'autres IA, il faudrait retrouver leur code source et les ajouter dans `supabase/functions/`. Sans le code, Lovable ne peut pas les déployer. As-tu le code quelque part (GitHub, fichiers locaux) ?
- Souhaites-tu que je procède avec les corrections ci-dessus ?

