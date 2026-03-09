import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TestimonialsSection = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      type: "parent",
      name: "testimonials.parent1Name",
      defaultName: "Sophie M.",
      content: "testimonials.parent1Content",
      defaultContent: "Stop Repeat a transformé notre quotidien ! Plus besoin de répéter 10 fois les mêmes choses. Les enfants savent exactement ce qu'ils ont à faire et sont motivés par le système de points. Un vrai soulagement pour toute la famille.",
      initials: "SM"
    },
    {
      type: "child",
      name: "testimonials.child1Name",
      defaultName: "Lucas, 9 ans",
      content: "testimonials.child1Content",
      defaultContent: "J'adore gagner des points ! Maintenant je peux économiser pour m'acheter ce que je veux. Et j'aime bien voir mes badges quand je fais bien mes tâches plusieurs jours de suite.",
      initials: "L"
    },
    {
      type: "parent",
      name: "testimonials.parent2Name",
      defaultName: "Marc D.",
      content: "testimonials.parent2Content",
      defaultContent: "L'application est simple et efficace. Les notifications automatiques nous évitent de jouer les surveillants. Les enfants deviennent vraiment plus autonomes et responsables. Je recommande vivement !",
      initials: "MD"
    },
    {
      type: "child",
      name: "testimonials.child2Name",
      defaultName: "Emma, 11 ans",
      content: "testimonials.child2Content",
      defaultContent: "C'est cool de pouvoir prendre des photos pour prouver que j'ai fait mes tâches. Et mes parents me donnent des récompenses quand j'ai assez de points. C'est beaucoup plus amusant qu'avant !",
      initials: "E"
    },
    {
      type: "parent",
      name: "testimonials.parent3Name",
      defaultName: "Claire B.",
      content: "testimonials.parent3Content",
      defaultContent: "Nous avons 3 enfants et c'était le chaos total avant Stop Repeat. Maintenant, chacun a ses tâches, tout est organisé dans le calendrier familial, et on a enfin retrouvé un peu de sérénité. Merci !",
      initials: "CB"
    },
    {
      type: "child",
      name: "testimonials.child3Name",
      defaultName: "Noah, 7 ans",
      content: "testimonials.child3Content",
      defaultContent: "J'aime bien l'application parce qu'il y a des couleurs et des étoiles. Et quand je fais toutes mes tâches, mes parents sont contents et moi aussi !",
      initials: "N"
    }
  ];

  return (
    <section id="temoignages" className="py-24 px-6 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-body font-semibold text-sm mb-4">
            {t("testimonials.badge", "Témoignages")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
            {t("testimonials.title", "Ils ont adopté Stop Repeat")}
          </h2>
          <p className="text-muted-foreground text-lg font-body max-w-2xl mx-auto">
            {t("testimonials.subtitle", "Parents et enfants partagent leur expérience avec notre application (témoignages fictifs).")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className={testimonial.type === "parent" ? "bg-primary/10" : "bg-secondary/10"}>
                  <AvatarFallback className={testimonial.type === "parent" ? "text-primary font-bold" : "text-secondary font-bold"}>
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    {t(testimonial.name, testimonial.defaultName)}
                  </h3>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-body leading-relaxed">
                {t(testimonial.content, testimonial.defaultContent)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
