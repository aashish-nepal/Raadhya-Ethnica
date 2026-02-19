# Raadhya Ethnica - Premium Women's Kurtas eCommerce

A modern, production-ready eCommerce platform built with Next.js 14, TypeScript, and Tailwind CSS. This project showcases a complete online store for premium women's kurtas with a focus on performance, SEO, and user experience.

## 🌟 Features

### Customer Features
- **Beautiful Homepage** with hero section, category grid, and product carousels
- **Product Catalog** with filtering, sorting, and search
- **Product Detail Pages** with image gallery, size/color selection
- **Shopping Cart** with real-time updates and coupon support
- **Checkout Process** with multiple payment options
- **User Account** with order history and wishlist
- **Responsive Design** optimized for mobile, tablet, and desktop
- **SEO Optimized** with meta tags and schema markup
- **WhatsApp Integration** for customer support

### Technical Features
- **Next.js 14** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **Image Optimization** with next/image
- **SEO** with metadata and structured data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
cd "Raadhya Ethnica"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Homepage
│   │   ├── products/          # Product pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout process
│   │   ├── account/           # User account
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── home/             # Homepage components
│   │   └── product/          # Product components
│   ├── lib/                  # Utility functions
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── data/                 # Sample data (JSON)
├── public/                   # Static files
└── ...config files
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color palette:
```typescript
colors: {
  primary: { ... },
  secondary: { ... },
  // Add your colors
}
```

### Products
Edit `src/data/products.json` to add/modify products.

### Categories
Edit `src/data/categories.json` to manage categories.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# App
NEXT_PUBLIC_APP_NAME="Raadhya Ethnica"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=+919876543210

# Payment (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

### Other Platforms

Build the project:
```bash
npm run build
```

The output will be in the `.next` directory. Follow your hosting provider's instructions for deploying Next.js applications.

## 🎯 SEO Features

- **Meta Tags** on all pages
- **Open Graph** tags for social sharing
- **Schema Markup** for products and organization
- **Sitemap** at `/sitemap.xml`
- **Robots.txt** for search engine crawlers
- **Optimized Images** with next/image

## 🔐 Security

- **HTTPS** recommended for production
- **Environment Variables** for sensitive data
- **Input Validation** on forms
- **XSS Protection** with React
- **CSRF Protection** built-in with Next.js

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For questions or support, contact:
- Email: hello@raadhyaethnica.com
- WhatsApp: +91 98765 43210

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Images from [Unsplash](https://unsplash.com/)

---

Made with ❤️ for premium women's fashion
# Raadhya-Ethnica
