import Link from "next/link";
import categories from "@/data/categories.json";
import { ArrowRight } from "lucide-react";

export default function CategoryGrid() {
    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        Explore our diverse collection of kurtas for every occasion
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group"
                        >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-soft hover:shadow-medium transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl">👗</span>
                                </div>

                                {/* Product Count Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                                    {category.productCount}+
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-neutral-500 line-clamp-2">
                                    {category.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
                    >
                        View All Products
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
