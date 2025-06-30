import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Sun,
  Scissors,
  Heart,
  PawPrint,
  Thermometer,
} from "lucide-react";

export const metadata = {
  title: "Plant Care Guide - The House Plant Store",
  description:
    "Comprehensive plant care guides and tips to help your plants thrive. Learn about watering, lighting, fertilizing, and more.",
};

export default function PlantCarePage() {
  const careGuides = [
    {
      icon: Droplets,
      title: "Watering Guide",
      description: "Master the art of watering your plants",
      tips: [
        "Check soil moisture with your finger before watering",
        "Water thoroughly until water drains from the bottom",
        "Use room temperature water to avoid shocking roots",
        "Most plants prefer deep, infrequent watering",
      ],
      color: "text-blue-600",
    },
    {
      icon: Sun,
      title: "Light Requirements",
      description: "Understanding your plants' lighting needs",
      tips: [
        "South-facing windows provide the brightest light",
        "East and west windows offer moderate, indirect light",
        "North-facing windows provide low light conditions",
        "Rotate plants weekly for even growth",
      ],
      color: "text-yellow-600",
    },
    {
      icon: Scissors,
      title: "Pruning & Maintenance",
      description: "Keep your plants healthy and shaped",
      tips: [
        "Remove dead, yellowing, or damaged leaves promptly",
        "Pinch growing tips to encourage bushier growth",
        "Clean leaves regularly with a damp cloth",
        "Use clean, sharp tools to prevent disease spread",
      ],
      color: "text-green-600",
    },
    {
      icon: Heart,
      title: "Fertilizing",
      description: "Nourish your plants for optimal growth",
      tips: [
        "Fertilize during growing season (spring/summer)",
        "Use diluted liquid fertilizer every 2-4 weeks",
        "Reduce or stop fertilizing in fall/winter",
        "Look for balanced N-P-K fertilizers for most plants",
      ],
      color: "text-purple-600",
    },
    {
      icon: Thermometer,
      title: "Temperature & Humidity",
      description: "Create the perfect environment",
      tips: [
        "Most houseplants prefer 18-24°C temperatures",
        "Avoid placing plants near heating/cooling vents",
        "Increase humidity with pebble trays or humidifiers",
        "Group plants together to create a humid microclimate",
      ],
      color: "text-orange-600",
    },
    {
      icon: PawPrint,
      title: "Pet Safety",
      description: "Keep your furry friends safe",
      tips: [
        "Research plant toxicity before bringing plants home",
        "Place toxic plants out of pets' reach",
        "Consider pet-safe alternatives for households with pets",
        "Contact a vet immediately if ingestion occurs",
      ],
      color: "text-red-600",
    },
  ];

  const plantTypes = [
    {
      name: "Low Light Plants",
      plants: ["Snake Plant", "ZZ Plant", "Pothos", "Peace Lily"],
      care: "Perfect for offices and darker rooms. Water when soil is dry.",
    },
    {
      name: "Bright Light Plants",
      plants: [
        "Fiddle Leaf Fig",
        "Rubber Plant",
        "Monstera",
        "Bird of Paradise",
      ],
      care: "Need bright, indirect light. Rotate regularly for even growth.",
    },
    {
      name: "Succulents",
      plants: ["Aloe Vera", "Jade Plant", "Echeveria", "String of Pearls"],
      care: "Drought-tolerant. Water deeply but infrequently. Need bright light.",
    },
    {
      name: "Flowering Plants",
      plants: ["African Violet", "Orchids", "Begonias", "Cyclamen"],
      care: "Need consistent moisture and humidity. Deadhead spent blooms.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Plant Care Guide</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know to keep your plants happy and
                healthy. From beginners to experienced plant parents, we've got
                you covered.
              </p>
            </div>

            {/* Care Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {careGuides.map((guide) => (
                <Card key={guide.title} className="h-full card-hover">
                  <CardHeader className="text-center">
                    <div
                      className={`mx-auto p-3 rounded-full bg-muted mb-4 w-fit`}
                    >
                      <guide.icon className={`h-8 w-8 ${guide.color}`} />
                    </div>
                    <CardTitle className="text-xl">{guide.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {guide.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {guide.tips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Plant Types */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Care by Plant Type</CardTitle>
                <p className="text-muted-foreground">
                  Different plants have different needs. Here's what you need to
                  know about popular plant categories.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plantTypes.map((type) => (
                    <div key={type.name} className="p-6 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-3">
                        {type.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {type.plants.map((plant) => (
                          <Badge
                            key={plant}
                            variant="outline"
                            className="text-xs"
                          >
                            {plant}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.care}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Problems */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Common Plant Problems & Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-yellow-700">
                        🟡 Yellow Leaves
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Causes:</strong> Overwatering, underwatering,
                        natural aging, nutrient deficiency
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Check soil moisture, adjust
                        watering schedule, remove yellow leaves
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-amber-700">
                        🟤 Brown Leaf Tips
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Causes:</strong> Low humidity, fluoride in
                        water, over-fertilizing
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Increase humidity, use
                        filtered water, reduce fertilizer
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">
                        🟢 Drooping/Wilting
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Causes:</strong> Underwatering, overwatering,
                        root rot, transplant shock
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Check soil and roots, adjust
                        watering, ensure proper drainage
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-red-700">
                        🔴 Pest Problems
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Common pests:</strong> Spider mites, aphids,
                        scale insects, fungus gnats
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Isolate plant, use
                        insecticidal soap, neem oil, or systemic treatment
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-purple-700">
                        🟣 Stunted Growth
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Causes:</strong> Insufficient light, poor
                        nutrition, root bound, wrong pot size
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Provide more light, fertilize
                        during growing season, repot if needed
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-blue-700">
                        🔵 Leggy Growth
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Causes:</strong> Insufficient light, plant
                        stretching toward light source
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Solution:</strong> Move to brighter location,
                        prune back leggy growth, rotate regularly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
