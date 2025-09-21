# Code Snippet Vault

A modern web application for developers to store, organize, and search useful code snippets with syntax highlighting and tagging features.

## 🚀 Features

- **Create & Manage Snippets**: Store code snippets with titles, descriptions, and tags
- **Syntax Highlighting**: Beautiful code highlighting for 20+ programming languages
- **Search & Filter**: Full-text search with language and tag filtering
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **CRUD Operations**: Create, read, update, and delete snippets
- **REST API**: Well-documented API for snippet management


## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Prism.js** - Syntax highlighting
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Joi** - Data validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd code-snippet-vault
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/code-snippet-vault

# Start the development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Database Setup

If using local MongoDB:
```bash
# Start MongoDB service
mongod

# The application will automatically create the database and collections
```

If using MongoDB Atlas:
- Create a cluster on [MongoDB Atlas](https://cloud.mongodb.com/)
- Get your connection string
- Update the `MONGODB_URI` in your `.env` file

## 📁 Project Structure

```
code-snippet-vault/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── App.jsx            # Main app component
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Development

### Backend Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📡 API Endpoints

### Snippets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snippets` | Get all snippets (with filtering) |
| GET | `/api/snippets/:id` | Get snippet by ID |
| POST | `/api/snippets` | Create new snippet |
| PUT | `/api/snippets/:id` | Update snippet |
| DELETE | `/api/snippets/:id` | Delete snippet |
| GET | `/api/snippets/stats/summary` | Get statistics |

### Query Parameters for GET /api/snippets

- `search` - Search in title and description
- `language` - Filter by programming language
- `tags` - Filter by tags (comma-separated)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 50)
- `sortBy` - Sort field (createdAt, updatedAt, title, language)
- `sortOrder` - Sort order (asc, desc)

### Example Requests

```bash
# Get all JavaScript snippets
GET /api/snippets?language=javascript

# Search for "async" snippets
GET /api/snippets?search=async

# Get snippets with "utility" tag
GET /api/snippets?tags=utility

# Combined filtering
GET /api/snippets?language=python&tags=utility,helper&sortBy=title&sortOrder=asc
```

## 🎨 Features in Detail

### Syntax Highlighting
- Supports 20+ programming languages
- Uses Prism.js with a modern dark theme
- Automatic language detection
- Line numbers for detailed view

### Search & Filtering
- Full-text search across titles and descriptions
- Filter by programming language
- Filter by tags (multiple tags supported)
- Sort by date, title, or language
- Pagination for large collections

### Responsive Design
- Mobile-first approach
- Clean, modern interface
- Tailwind CSS for consistent styling
- Accessible design patterns

## 🔒 Security Features

- Input validation with Joi
- Rate limiting
- HELMET security headers
- CORS configuration
- XSS protection
- Data sanitization

## 🚀 Deployment

### Backend Deployment

1. Set up a MongoDB database (Atlas recommended)
2. Deploy to your preferred platform (Heroku, Railway, DigitalOcean)
3. Set environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-connection-string
   PORT=5000
   ```

### Frontend Deployment

1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your preferred platform (Netlify, Vercel, etc.)
3. Set environment variables:
   ```
   VITE_API_URL=your-backend-api-url
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Deployment

### Deploy to Vercel (Recommended)

This application is optimized for Vercel deployment with serverless functions.

**Quick Deploy:**
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NODE_ENV` - `production`
   - `FRONTEND_URL` - Your Vercel app URL
4. Deploy!

📖 **Detailed instructions**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deploy to Other Platforms

- **Netlify**: Use the same Vercel configuration
- **Railway**: Deploy with Docker using the included docker-compose.yml
- **Heroku**: Deploy frontend and backend separately

## �🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Public/private snippet sharing
- [ ] GitHub Gist integration
- [ ] Dark/light mode toggle
- [ ] Export to various formats (Markdown, JSON)
- [ ] Code snippet collections/folders
- [ ] Collaborative features
- [ ] Advanced search with regex support
- [ ] Code snippet versioning
- [ ] Browser extension

## 🐛 Known Issues

- None at the moment! Please report any issues you find.

## 📞 Support

If you have any questions or need help, please:
1. Check the existing issues
2. Create a new issue with a detailed description
3. Include steps to reproduce any bugs

---

**Happy Coding!** 🎉