import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata = {
    title: "About Us",
    description: "Learn about Raadhya Ethnica - Your destination for premium women's kurtas",
};

export default function AboutPage() {
    return (
        <>
            
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
                    <div className="container-custom text-center">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                            About Raadhya Ethnica
                        </h1>
                        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                            Bringing you the finest collection of premium women's kurtas, blending traditional elegance with modern style.
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-16">
                    <div className="container-custom max-w-4xl">
                        <h2 className="text-3xl font-display font-bold mb-6 text-center">Our Story</h2>
                        <div className="prose prose-lg max-w-none text-neutral-600">
                            <p className="mb-4">
                                Founded with a passion for ethnic fashion, Raadhya Ethnica has been serving women across India with beautiful, high-quality kurtas that celebrate our rich cultural heritage while embracing contemporary design.
                            </p>
                            <p className="mb-4">
                                We believe that every woman deserves to feel confident and beautiful in what she wears. That's why we carefully curate our collection to offer a diverse range of styles, from casual everyday wear to elegant festive pieces.
                            </p>
                            <p>
                                Our commitment to quality, authenticity, and customer satisfaction has made us a trusted name in women's ethnic fashion.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 bg-neutral-50">
                    <div className="container-custom">
                        <h2 className="text-3xl font-display font-bold mb-12 text-center">Our Values</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-5xl mb-4">✨</div>
                                <h3 className="text-xl font-semibold mb-3">Quality First</h3>
                                <p className="text-neutral-600">
                                    We source only the finest fabrics and ensure meticulous craftsmanship in every piece.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl mb-4">🤝</div>
                                <h3 className="text-xl font-semibold mb-3">Customer Satisfaction</h3>
                                <p className="text-neutral-600">
                                    Your happiness is our priority. We go above and beyond to ensure a delightful shopping experience.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="text-5xl mb-4">🌱</div>
                                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                                <p className="text-neutral-600">
                                    We're committed to ethical practices and sustainable fashion that respects our planet.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16">
                    <div className="container-custom">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <p className="text-4xl font-bold text-primary-600 mb-2">500+</p>
                                <p className="text-neutral-600">Unique Designs</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-primary-600 mb-2">10K+</p>
                                <p className="text-neutral-600">Happy Customers</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-primary-600 mb-2">4.8★</p>
                                <p className="text-neutral-600">Average Rating</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-primary-600 mb-2">100%</p>
                                <p className="text-neutral-600">Authentic Products</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            <WhatsAppButton />
        </>
    );
}
