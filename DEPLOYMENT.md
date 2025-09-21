# 🚀 Vercel Deployment Guide

This guide will help you deploy your Code Snippet Vault application to Vercel for free hosting.

## 📋 Prerequisites

- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ GitHub account (recommended for easy deployment)
- ✅ MongoDB Atlas database (already configured)

## 🔧 Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

## 🌐 Step 2: Create Vercel Account & Deploy

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Login"
   - **Recommended**: Use GitHub for authentication

2. **Import your project**:
   - Click "New Project" on your Vercel dashboard
   - Select "Import Git Repository"
   - Choose your `code-snippet-vault` repository
   - Click "Import"

3. **Configure project settings**:
   - **Project Name**: Choose a name (e.g., `my-snippet-vault`)
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/dist`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

## ⚙️ Step 3: Configure Environment Variables

1. **Go to your Vercel project dashboard**
2. **Click "Settings" tab**
3. **Click "Environment Variables"**
4. **Add these variables**:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://martinsmifff:ydEFUOTlYc3cZMwm@main-cluster.9qzv0u0.mongodb.net/code-snippet-vault?retryWrites=true&w=majority` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |
   | `FRONTEND_URL` | `https://your-project-name.vercel.app` | Production, Preview |

   > 📝 **Note**: Replace `your-project-name` with your actual Vercel project URL

## 🔄 Step 4: Redeploy with Environment Variables

1. **Go to "Deployments" tab**
2. **Click the three dots (⋯) on the latest deployment**
3. **Click "Redeploy"**
4. **Check "Use existing Build Cache"** 
5. **Click "Redeploy"**

## ✅ Step 5: Test Your Deployment

1. **Visit your app**: `https://your-project-name.vercel.app`
2. **Test these features**:
   - ✅ Create a new snippet
   - ✅ Search functionality
   - ✅ Filter by language/tags
   - ✅ Edit existing snippets
   - ✅ Delete snippets
   - ✅ View syntax highlighting

## 🌟 Step 6: Custom Domain (Optional)

1. **Go to "Settings" → "Domains"**
2. **Add your custom domain**
3. **Update DNS records** as instructed by Vercel
4. **Update `FRONTEND_URL` environment variable** to your custom domain

## 🔧 Troubleshooting

### API Not Working
- ✅ Check environment variables are set correctly
- ✅ Verify MongoDB connection string is valid
- ✅ Check Vercel function logs in the dashboard

### Build Failures
- ✅ Ensure `npm run vercel-build` works locally
- ✅ Check Node.js version compatibility
- ✅ Verify all dependencies are in package.json

### MongoDB Connection Issues
- ✅ Verify MongoDB Atlas whitelist includes `0.0.0.0/0`
- ✅ Test connection string locally first
- ✅ Check MongoDB Atlas cluster is running

## 📊 Monitoring & Analytics

1. **Vercel Analytics**: Automatically included
2. **Function Logs**: Available in Vercel dashboard
3. **Performance Metrics**: Real-time in dashboard

## 🚀 Auto-Deployment

Your app will automatically redeploy when you:
- ✅ Push changes to your main branch
- ✅ Merge pull requests
- ✅ Update environment variables

## 💰 Vercel Free Tier Limits

- ✅ **Bandwidth**: 100GB/month
- ✅ **Function Executions**: 100GB-hours/month
- ✅ **Function Duration**: 10 seconds max
- ✅ **Build Time**: 6 hours/month
- ✅ **Projects**: Unlimited

---

## 🎉 Congratulations!

Your Code Snippet Vault is now live on Vercel! 

**Your app URL**: `https://your-project-name.vercel.app`

### Next Steps:
- 📱 Test on mobile devices
- 🔐 Consider adding authentication
- 📊 Monitor usage in Vercel dashboard
- 🌟 Share with friends and colleagues!

---

**Need help?** 
- 📚 [Vercel Documentation](https://vercel.com/docs)
- 💬 [Vercel Discord Community](https://vercel.com/discord)
- 🐛 [GitHub Issues](https://github.com/vercel/vercel/issues)