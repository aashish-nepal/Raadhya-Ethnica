import { Shield, Truck, RotateCcw, Award } from "lucide-react";

export default function TrustBadges() {
    const badges = [
        {
            icon: Shield,
            title: "Secure Payment",
            description: "100% secure transactions",
        },
        {
            icon: Truck,
            title: "Free Shipping",
            description: "On orders above $150",
        },
        {
            icon: RotateCcw,
            title: "Easy Returns",
            description: "7-day return policy",
        },
        {
            icon: Award,
            title: "100% Authentic",
            description: "Guaranteed quality",
        },
    ];

    return (
        <section className="py-12 bg-white border-y border-neutral-200">
            <div className="container-custom">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {badges.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                    <Icon size={28} />
                                </div>
                                <h3 className="font-semibold text-neutral-900 mb-1">
                                    {badge.title}
                                </h3>
                                <p className="text-sm text-neutral-600">
                                    {badge.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
