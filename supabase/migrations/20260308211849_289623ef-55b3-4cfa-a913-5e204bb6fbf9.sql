
-- Update handle_new_family to add more example rules and rewards
CREATE OR REPLACE FUNCTION public.handle_new_family()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create family settings
  INSERT INTO public.family_settings (family_id) VALUES (NEW.id);

  -- Seed example house rules
  INSERT INTO public.house_rules (family_id, icon, label, description, points_penalty, wallet_penalty) VALUES
    (NEW.id, '📱', 'Écran sans permission', 'Utiliser un écran sans avoir demandé la permission', 5, 0.50),
    (NEW.id, '🗣️', 'Crier ou insulter', 'Hausser le ton, crier ou utiliser des mots blessants', 10, 1.00),
    (NEW.id, '🚪', 'Claquer les portes', 'Claquer une porte de colère', 3, 0),
    (NEW.id, '🧹', 'Refuser une tâche', 'Refuser de faire une tâche assignée', 8, 0.50),
    (NEW.id, '🤥', 'Mentir', 'Dire un mensonge avéré', 15, 1.00),
    (NEW.id, '👊', 'Frapper / violence', 'Tout acte de violence physique envers un membre de la famille', 20, 2.00),
    (NEW.id, '😤', 'Crise de colère', 'Piquer une grosse colère ou faire un caprice', 8, 0.50),
    (NEW.id, '🔊', 'Bruit excessif', 'Faire trop de bruit à la maison (musique forte, cris...)', 3, 0),
    (NEW.id, '🍬', 'Grignotage interdit', 'Manger des sucreries ou grignoter sans autorisation', 4, 0.25),
    (NEW.id, '⏰', 'Retard le matin', 'Ne pas être prêt à l''heure pour l''école', 5, 0),
    (NEW.id, '🗑️', 'Ne pas ranger', 'Laisser traîner ses affaires dans les espaces communs', 4, 0.25),
    (NEW.id, '📺', 'Dépasser le temps d''écran', 'Continuer à regarder un écran au-delà du temps autorisé', 6, 0.50);

  -- Seed example rewards
  INSERT INTO public.rewards (family_id, icon, title, description, cost_points) VALUES
    (NEW.id, '🎮', '30 min de jeu vidéo', 'Temps de jeu supplémentaire sur console ou tablette', 15),
    (NEW.id, '🍕', 'Choisir le repas', 'Choisir le menu du dîner pour toute la famille', 20),
    (NEW.id, '🎬', 'Soirée cinéma', 'Regarder un film au choix en famille', 30),
    (NEW.id, '🛍️', 'Sortie shopping', 'Sortie shopping avec un budget de 10€', 50),
    (NEW.id, '⏰', 'Coucher tardif', 'Se coucher 30 minutes plus tard que d''habitude', 10),
    (NEW.id, '🍦', 'Glace ou dessert spécial', 'Un dessert ou une glace au choix', 12),
    (NEW.id, '🎧', 'Musique au casque', 'Écouter de la musique au casque pendant 1h', 8),
    (NEW.id, '🎨', 'Activité créative', 'Séance de peinture, dessin ou loisirs créatifs', 15),
    (NEW.id, '🏊', 'Sortie piscine', 'Aller à la piscine le week-end', 40),
    (NEW.id, '🎂', 'Inviter un ami', 'Inviter un ami à la maison pour jouer ou goûter', 25),
    (NEW.id, '🚲', 'Balade à vélo', 'Sortie vélo en famille ou avec un ami', 20),
    (NEW.id, '📱', '15 min de téléphone', 'Temps supplémentaire sur le téléphone', 10),
    (NEW.id, '🎪', 'Sortie au parc', 'Sortie au parc d''attractions ou parc de jeux', 60),
    (NEW.id, '👑', 'Roi/Reine du jour', 'Choisir les activités de la journée', 35);

  RETURN NEW;
END;
$function$;

-- Update handle_seed_example_tasks to add more task templates
CREATE OR REPLACE FUNCTION public.handle_seed_example_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _parent_id uuid;
  _family_id uuid;
BEGIN
  IF NEW.family_id IS NOT NULL AND (OLD.family_id IS NULL OR OLD.family_id != NEW.family_id) THEN
    IF NOT has_role(NEW.user_id, 'child') THEN
      RETURN NEW;
    END IF;

    _family_id := NEW.family_id;

    IF EXISTS (SELECT 1 FROM public.task_templates WHERE family_id = _family_id LIMIT 1) THEN
      RETURN NEW;
    END IF;

    SELECT p.user_id INTO _parent_id
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.family_id = _family_id AND ur.role = 'parent'
    LIMIT 1;

    IF _parent_id IS NULL THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.task_templates (family_id, created_by_user_id, assigned_to_user_id, title, description, icon, due_time, points_reward, recurrence_type, requires_photo) VALUES
      (_family_id, _parent_id, NEW.user_id, 'Faire son lit', 'Bien tirer la couette et replacer les oreillers', '🛏️', '08:00', 3, 'weekdays', false),
      (_family_id, _parent_id, NEW.user_id, 'Ranger sa chambre', 'Ranger les jouets, les vêtements et organiser le bureau', '🧹', '19:00', 5, 'daily', true),
      (_family_id, _parent_id, NEW.user_id, 'Brosser les dents', 'Se brosser les dents après le petit-déjeuner', '🦷', '08:30', 2, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Mettre la table', 'Mettre les couverts et les assiettes pour le dîner', '🍽️', '19:00', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Faire ses devoirs', 'Terminer les devoirs du jour avant l''heure du dîner', '📚', '18:00', 5, 'weekdays', true),
      (_family_id, _parent_id, NEW.user_id, 'Préparer son cartable', 'Vérifier le cahier de texte et préparer les affaires pour le lendemain', '🎒', '20:00', 2, 'weekdays', false),
      (_family_id, _parent_id, NEW.user_id, 'Débarrasser la table', 'Débarrasser son assiette et aider à ranger après le repas', '🍽️', '20:00', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Sortir les poubelles', 'Sortir le sac poubelle et mettre un nouveau sac', '🗑️', '19:30', 4, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Nourrir l''animal', 'Donner à manger et à boire à l''animal de compagnie', '🐾', '07:30', 3, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Lire 20 minutes', 'Lire un livre ou une BD pendant au moins 20 minutes', '📖', '20:30', 4, 'daily', false),
      (_family_id, _parent_id, NEW.user_id, 'Plier son linge', 'Plier et ranger ses vêtements propres', '👕', '18:30', 4, 'weekends', true),
      (_family_id, _parent_id, NEW.user_id, 'Passer l''aspirateur', 'Aspirer sa chambre ou une pièce de la maison', '🧹', '17:00', 5, 'weekends', true);
  END IF;
  RETURN NEW;
END;
$function$;
