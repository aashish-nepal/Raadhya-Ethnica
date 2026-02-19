import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with Raadhya Ethnica. We're here to help!",
};

export default function ContactPage() {
    return (
        <>
            
            <div className="min-h-screen bg-neutral-50 py-12">
                <div className="container-custom max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        {/* Contact Cards */}
                        <div className="bg-white rounded-xl p-6 shadow-soft text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <Phone size={28} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Phone</h3>
                            <p className="text-neutral-600">+91 98765 43210</p>
                            <p className="text-sm text-neutral-500 mt-1">Mon-Sat, 10AM-7PM</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-soft text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <Mail size={28} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Email</h3>
                            <p className="text-neutral-600">hello@raadhyaethnica.com</p>
                            <p className="text-sm text-neutral-500 mt-1">We'll reply within 24 hours</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-soft text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                                <MapPin size={28} />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Address</h3>
                            <p className="text-neutral-600">123 Fashion Street</p>
                            <p className="text-sm text-neutral-500 mt-1">Mumbai, Maharashtra 400001</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-xl p-8 shadow-soft max-w-3xl mx-auto">
                        <h2 className="text-2xl font-display font-bold mb-6">Send us a Message</h2>

                        <form className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Your Name" required />
                                <Input label="Your Email" type="email" required />
                            </div>

                            <Input label="Phone Number" type="tel" />
                            <Input label="Subject" required />

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Tell us how we can help you..."
                                />
                            </div>

                            <Button size="lg" type="submit">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>
            
            <WhatsAppButton />
        </>
    );
}
