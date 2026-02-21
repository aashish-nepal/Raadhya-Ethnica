import { Shield, Truck, RotateCcw, Award } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
    { icon: Shield, title: "Secure Payment", description: "100% encrypted transactions" },
    { icon: Truck, title: "Free Shipping", description: "On all orders above $150" },
    { icon: RotateCcw, title: "Easy Returns", description: "Hassle-free 7-day returns" },
    { icon: Award, title: "100% Authentic", description: "Handpicked, quality assured" },
];

export default function TrustBadges() {
    return (
        <section className="py-0">
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white">
                <div className="container-custom py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
                        {badges.map((badge, index) => {
                            const Icon = badge.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex flex-col items-center text-center px-8 py-4"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center mb-3 group-hover:bg-primary-600/30 transition-colors">
                                        <Icon size={22} className="text-primary-300" />
                                    </div>
                                    <h3 className="font-semibold text-white text-sm mb-1">{badge.title}</h3>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{badge.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
