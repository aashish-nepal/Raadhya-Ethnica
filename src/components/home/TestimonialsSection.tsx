import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
    {
        name: "Priya Sharma",
        location: "Mumbai, India",
        rating: 5,
        text: "Absolutely stunning quality! The fabric is so soft and the embroidery is exquisite. I wore this to a wedding and received so many compliments. Will definitely order again!",
        initials: "PS",
        product: "Festive Silk Kurta",
        color: "from-rose-400 to-pink-500",
    },
    {
        name: "Ananya Patel",
        location: "Delhi, India",
        rating: 5,
        text: "Raadhya Ethnica never disappoints. The fit is perfect and the delivery was super fast. The packaging was so elegant too — felt like opening a gift!",
        initials: "AP",
        product: "Designer Cotton Kurta",
        color: "from-violet-400 to-purple-500",
    },
    {
        name: "Meera Nair",
        location: "Bangalore, India",
        rating: 5,
        text: "I've been shopping here for 2 years and every single order has been perfect. The customer service is amazing and the kurtas are genuinely premium quality.",
        initials: "MN",
        product: "Office Wear Collection",
        color: "from-amber-400 to-orange-500",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-neutral-50">
            <div className="container-custom">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <p className="text-xs text-primary-600 font-semibold uppercase tracking-[0.2em] mb-3">What Our Customers Say</p>
                    <h2 className="section-title mb-4">Loved by Thousands</h2>
                    <div className="flex items-center justify-center gap-1 mt-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={18} className="fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-2 text-sm font-semibold text-neutral-700">4.8 / 5</span>
                        <span className="text-sm text-neutral-400 ml-1">from 10,000+ reviews</span>
                    </div>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-7 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow duration-300 flex flex-col"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>

                            {/* Product tag */}
                            <div className="inline-flex items-center mb-5">
                                <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-medium">
                                    {t.product}
                                </span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-5 border-t border-neutral-100">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-neutral-900">{t.name}</p>
                                    <p className="text-xs text-neutral-400">{t.location}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
