# Underdog Lazer - React Website

A modern, responsive website for laser engraving services built with React, Vite, and cutting-edge web technologies. Features a dark theme, interactive gallery, contact form, and optimized performance.

![Website Preview](https://via.placeholder.com/800x400/121212/32CD32?text=Underdog+Lazer+Website)

## ✨ Features

- **Modern React Architecture** - Built with React 19 and React Router DOM 7
- **Lightning Fast** - Powered by Vite for instant development and optimized builds
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Dark Theme** - Professional dark UI with lime green accent colors
- **Interactive Gallery** - 20+ categorized images with lightbox modal and filtering
- **Accessibility First** - WCAG compliant with ARIA labels and keyboard navigation
- **Contact Form** - Validated form with Netlify integration ready
- **Performance Optimized** - Lazy loading, code splitting, and optimized assets
- **SEO Ready** - Semantic HTML, meta tags, and social media optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Modern web browser
- Git (optional but recommended)

### Installation

1. **Clone or download** the project:
   ```bash
   git clone <repository-url>
   cd TestWeb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:** Visit `http://localhost:5173`

## 📜 Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build production-ready static files
npm run preview  # Preview production build locally
npm run lint     # Check code quality with ESLint
```

## 🏗️ Project Structure

```
TestWeb/
├── public/                 # Static assets
│   ├── img/               # Images and media files
│   │   ├── gallery/       # Gallery images organized by category
│   │   ├── hero-background.mp4  # Hero video
│   │   └── team-*.jpg     # Team member photos
│   └── vite.svg
├── src/                   # Source code
│   ├── components/        # Reusable React components
│   │   └── Header.jsx     # Navigation header
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page with hero and services
│   │   ├── About.jsx      # Company info and team
│   │   ├── Gallery.jsx    # Portfolio with filtering
│   │   └── Contact.jsx    # Contact form and info
│   ├── styles/            # Stylesheets
│   │   └── global.css     # Main stylesheet with CSS variables
│   ├── App.jsx            # Main app component with routing
│   └── main.jsx           # React app entry point
├── docs/                  # Documentation
│   ├── BRANDING.md        # Branding customization guide
│   └── CONTENT.md         # Content update instructions
├── netlify.toml           # Netlify deployment config
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🎨 Customization

### Quick Branding Updates
- **Colors:** Edit CSS variables in `src/styles/global.css`
- **Logo:** Update `src/components/Header.jsx`
- **Content:** Modify page components in `src/pages/`
- **Images:** Replace files in `public/img/`

### Detailed Guides
- 📖 [Branding Guide](docs/BRANDING.md) - Colors, fonts, logos, and styling
- 📝 [Content Guide](docs/CONTENT.md) - Text updates and gallery management

## 🚀 Deployment

The project is ready for deployment on modern hosting platforms:

### Netlify (Recommended)
1. Connect your repository to Netlify
2. Build settings are automatically configured via `netlify.toml`
3. Deploy with one click

### Vercel
1. Connect your repository to Vercel
2. Configuration is handled by `vercel.json`
3. Deploy automatically

### Manual Deployment
```bash
npm run build        # Creates 'dist' folder
# Upload 'dist' folder contents to your web host
```

### Environment Setup
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 20+

## 🛠️ Technical Stack

- **Framework:** React 19.1.0
- **Build Tool:** Vite 7.0.0
- **Routing:** React Router DOM 7.6.2
- **Styling:** CSS Custom Properties (CSS Variables)
- **Typography:** Inter Font Family
- **Icons:** Unicode Emojis
- **Form Handling:** Native HTML5 + JavaScript
- **Code Quality:** ESLint with React rules

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Focus indicators
- Alt text for all images

## 📊 Performance Features

- **Code Splitting** - React.lazy and Suspense for optimal loading
- **Lazy Loading** - Images load only when visible
- **Optimized Assets** - Compressed images and efficient formats
- **Minimal Dependencies** - Lightweight bundle size
- **Service Worker Ready** - PWA capabilities available

## 🔧 Development

### Code Quality
- ESLint configuration with React-specific rules
- Consistent code formatting
- Component-based architecture
- Modern JavaScript (ES6+)

### Testing Locally
```bash
npm run dev          # Development with hot reload
npm run build        # Test production build
npm run preview      # Preview built site
```

## 📋 Content Management

### Gallery Updates
1. Add images to `public/img/gallery/`
2. Update gallery data in `src/pages/Gallery.jsx`
3. Organize by categories: corporate, apparel, promotional, gifts

### Text Content
- **Home Page:** `src/pages/Home.jsx`
- **About Page:** `src/pages/About.jsx`
- **Contact Info:** `src/pages/Contact.jsx`

## 🐛 Troubleshooting

### Common Issues
- **Images not loading:** Check file paths and ensure images are in `public/img/`
- **Build errors:** Check console for syntax errors in JavaScript files
- **Routing issues:** Ensure hosting platform supports SPA redirects
- **Style issues:** Verify CSS syntax and custom property names

### Getting Help
1. Check browser developer console for errors
2. Review the documentation in the `docs/` folder
3. Ensure all dependencies are installed correctly

## 📄 License

This project is created for [Company Name]. Modify and use according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using modern web technologies**

For questions or support, please refer to the documentation in the `docs/` folder or check the issues section.