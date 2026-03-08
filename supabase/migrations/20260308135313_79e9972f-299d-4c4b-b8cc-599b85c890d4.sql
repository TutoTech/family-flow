
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
    (NEW.id, '👊', 'Frapper / violence', 'Tout acte de violence physique envers un membre de la famille', 20, 2.00);

  -- Seed example rewards
  INSERT INTO public.rewards (family_id, icon, title, description, cost_points) VALUES
    (NEW.id, '🎮', '30 min de jeu vidéo', 'Temps de jeu supplémentaire sur console ou tablette', 15),
    (NEW.id, '🍕', 'Choisir le repas', 'Choisir le menu du dîner pour toute la famille', 20),
    (NEW.id, '🎬', 'Soirée cinéma', 'Regarder un film au choix en famille', 30),
    (NEW.id, '🛍️', 'Sortie shopping', 'Sortie shopping avec un budget de 10€', 50),
    (NEW.id, '⏰', 'Coucher tardif', 'Se coucher 30 minutes plus tard que d''habitude', 10),
    (NEW.id, '🍦', 'Glace ou dessert spécial', 'Un dessert ou une glace au choix', 12);

  RETURN NEW;
END;
$function$;
