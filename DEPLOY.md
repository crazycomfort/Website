# Deployment Guide

## Quick Deploy Steps

### 1. Build the Project
First, build your CSS and JavaScript files:
```bash
npm run build
```

This will:
- Compile CSS from `src/styles/main.css` → `dist/styles.css`
- Bundle JavaScript from `src/js/main.js` → `dist/main.js`

### 2. Deploy to Netlify

You have two options:

#### Option A: Netlify CLI (Recommended)
If you have Netlify CLI installed:
```bash
# Install Netlify CLI globally (if not already installed)
npm install -g netlify-cli

# Login to Netlify (first time only)
netlify login

# Deploy to production
netlify deploy --prod
```

#### Option B: Netlify Web Interface
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop your entire project folder onto the Netlify dashboard
3. Or connect your Git repository for automatic deployments

### 3. Verify Deployment
After deployment, Netlify will provide you with a URL like:
- `https://your-site-name.netlify.app`

Visit the URL to verify your changes are live.

## Current Configuration

Your `netlify.toml` is configured to:
- **Build Command**: `npm run build`
- **Publish Directory**: `.` (root directory)
- **Node Version**: 18

## Files Ready for Deployment

All your files are ready:
- ✅ `index.html` - Main website file
- ✅ `dist/styles.css` - Compiled CSS
- ✅ `dist/main.js` - Compiled JavaScript
- ✅ `assets/` - Images and assets
- ✅ `netlify.toml` - Deployment configuration

## Troubleshooting

If `npm` is not found:
1. Make sure Node.js is installed: `node --version`
2. If using Homebrew: `brew install node`
3. Or download from [nodejs.org](https://nodejs.org)

If build fails:
- Check that all dependencies are installed: `npm install`
- Verify Node version matches (18): `node --version`

