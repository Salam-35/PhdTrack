# PhD Tracker Pro 🎓

A comprehensive web application for organizing and tracking PhD program applications. Built with Next.js, Supabase, and designed as a Progressive Web App (PWA) for mobile use.

## ✨ Features

### 📚 Application Management
- Track multiple PhD applications with detailed information
- Monitor application status and progress
- Set deadlines and receive notifications
- Manage requirements and documents per application

### 👨‍🏫 Professor Database
- Comprehensive professor profiles with research areas
- Track contact history and communication status
- Research fit scoring system
- Academic metrics (h-index, citations)

### 📄 Document Management
- Upload and organize application documents
- Version control for essays and statements
- Word count tracking and limits
- Deadline management

### 📅 Timeline & Deadlines
- Visual timeline of all important dates
- Categorized events (deadlines, meetings, tasks)
- Priority-based organization
- Smart notifications

### 💰 Financial Planning
- Track application fees and costs
- Funding opportunity management
- Budget planning tools

### 📊 Analytics Dashboard
- Application progress visualization
- Success rate tracking
- Deadline proximity alerts
- Performance metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/phd-tracker-pro.git
   cd phd-tracker-pro
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your credentials
   - Run the SQL script from `scripts/create-tables.sql` in the SQL Editor

4. **Configure environment variables**
   Create a `.env.local` file:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🌐 Deployment

### GitHub Pages (Free)
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `username.github.io/repo-name`

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

## 📱 Mobile App (PWA)

### Android Installation
1. Open the web app in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"
3. The app will install like a native Android app
4. Enjoy offline functionality and native app experience!

### iOS Installation
1. Open the web app in Safari
2. Tap the Share button and select "Add to Home Screen"
3. The app will appear on your home screen

## 🗄️ Database Schema

The app uses the following main tables:
- `universities` - PhD program applications
- `professors` - Professor contact database
- `documents` - Application documents and files
- `timeline_events` - Deadlines and important dates

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.ts` to customize the sky blue color scheme:
\`\`\`javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
    // ... more shades
  }
}
\`\`\`

### Adding Features
The app is built with a modular component structure. Add new features by:
1. Creating components in `/components`
2. Adding database operations in `/lib/supabase.ts`
3. Updating the navigation in `/app/page.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@phdtrackerpro.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/phd-tracker-pro/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/phd-tracker-pro/discussions)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Happy PhD hunting! 🎓✨**
