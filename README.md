# Lead-And-Outreach-AI-Agent

An intelligent AI-powered lead management and outreach platform that helps businesses identify, qualify, and engage with prospects through personalized automated outreach campaigns.

## 🎯 Overview

Lead-And-Outreach-AI-Agent is a full-stack application designed to streamline the lead generation and outreach process using artificial intelligence. The platform helps sales teams and businesses:

- **Upload and manage leads** from various sources
- **Define ICP (Ideal Customer Profile) settings** for better lead qualification
- **Generate personalized emails** using AI
- **Track email campaigns** and responses
- **View detailed lead information** with engagement history

## 🏗️ Architecture

The project is built with a modern full-stack architecture:

### **Frontend** (55.8% JavaScript)
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### **Backend** (34.8% Python)
- **Flask** - Lightweight Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **CrewAI** - Multi-agent AI orchestration
- **LangChain** - LLM integration framework
- **OpenAI** - AI language model API

### **Additional Languages**
- TypeScript (7.2%) - Type safety in frontend
- CSS (2.1%) - Styling
- HTML (0.1%) - Markup

## 🚀 Features

- **Authentication System** - User registration and login with JWT tokens
- **Lead Management** - Upload, store, and organize leads
- **ICP Configuration** - Define ideal customer profiles for targeting
- **AI-Powered Email Generation** - Automatically create personalized outreach emails
- **Email Preview** - Review generated emails before sending
- **Email History** - Track all sent emails and responses
- **Dashboard** - Central hub for campaign overview
- **Lead Details** - Comprehensive view of individual lead information

## 📋 Project Structure

```
Lead-And-Outreach-AI-Agent/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── landingPage/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── uploadLeads/
│   │   │   ├── icpSettings/
│   │   │   ├── leadDetail/
│   │   │   ├── emailPreview/
│   │   │   ├── emailHistory/
│   │   │   └── leads/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── authRoutes.py
│   │   ├── leadRoutes.py
│   │   ├── icpRoutes.py
│   │   └── asyncRoutes.py
│   ├── config/
│   │   └── db.py
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🛠️ Tech Stack

### Frontend Dependencies
- `react@^19.2.6` - UI framework
- `react-dom@^19.2.6` - React DOM rendering
- `lucide-react@^1.16.0` - Icon components
- `tailwindcss@^4.3.0` - CSS framework
- `vite@^8.0.12` - Build tool

### Backend Dependencies
- `Flask>=2.0.0` - Web framework
- `flask-cors>=3.0.10` - CORS support
- `pymongo>=4.0.0` - MongoDB driver
- `bcrypt>=4.0.0` - Password hashing
- `PyJWT>=2.0.0` - JWT authentication
- `crewai>=0.28.0` - AI agent framework
- `langchain>=0.1.0` - LLM framework
- `langchain-openai>=0.1.0` - OpenAI integration
- `requests>=2.31.0` - HTTP library
- `openpyxl>=3.1.0` - Excel file handling
- `pydantic>=2.0.0` - Data validation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file with your configuration:
```bash
cp .env.example .env
```

5. Update `.env` with your values:
```env
MONGO_URI=mongodb://localhost:27017/ai_leads
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
FLASK_DEBUG=1
MONGO_DB_NAME=ai_leads
```

6. Run the backend server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables (Backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/ai_leads` |
| `JWT_SECRET` | Secret key for JWT tokens | `change-this-secret` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | - |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000` |
| `FLASK_DEBUG` | Enable Flask debug mode | `1` |
| `PORT` | Flask server port | `5000` |
| `MONGO_DB_NAME` | MongoDB database name | `ai_leads` |

## 📖 Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend

- `python app.py` - Run development server
- Database is automatically initialized on startup

## 🔐 API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Lead Routes (`/lead`)
- `GET /lead/list` - Get all leads
- `POST /lead/upload` - Upload new leads
- `GET /lead/<id>` - Get lead details
- `PUT /lead/<id>` - Update lead information
- `DELETE /lead/<id>` - Delete a lead

### ICP Routes (`/icp`)
- `GET /icp/settings` - Get ICP settings
- `POST /icp/settings` - Create/update ICP settings
- `GET /icp/qualify` - Qualify leads against ICP

### Async Routes (`/async`)
- `POST /async/generate-email` - Generate personalized email
- `GET /async/job/<id>` - Check async job status

### Health Check
- `GET /health` - Server health status

## 🖥️ Frontend Pages

- **Landing Page** (`/`) - Welcome and introduction
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - New user registration
- **Dashboard** (`/dashboard`) - Main dashboard overview
- **Upload Leads** (`/upload-leads`) - Import leads from file
- **ICP Settings** (`/icp-settings`) - Configure ideal customer profile
- **Leads** (`/leads`) - View all leads list
- **Lead Detail** (`/lead-detail`) - View individual lead details
- **Email Preview** (`/email-preview`) - Preview generated emails
- **Email History** (`/email-history`) - View sent emails and responses

## 🤖 AI Capabilities

The platform leverages AI through:

- **CrewAI** - Multi-agent orchestration for complex lead analysis tasks
- **LangChain** - Framework for building LLM-powered applications
- **OpenAI GPT** - Advanced language model for email generation and lead qualification

## 🔄 Workflow

1. **User Registration** - Create an account via signup page
2. **Define ICP** - Configure ideal customer profile settings
3. **Upload Leads** - Import leads from Excel or CSV files
4. **Lead Review** - View and analyze lead information
5. **Email Generation** - Use AI to generate personalized outreach emails
6. **Email Preview** - Review emails before distribution
7. **Campaign Tracking** - Monitor sent emails and track responses

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/orignlkartik1/Lead-And-Outreach-AI-Agent.git
cd Lead-And-Outreach-AI-Agent
```

2. Set up backend (see Backend Setup above)
3. Set up frontend (see Frontend Setup above)
4. Open `http://localhost:5173` in your browser
5. Sign up and start using the platform!

## 📝 Development

### Code Quality

- **Linting** - ESLint for JavaScript/React
- **Type Safety** - TypeScript for frontend development
- **Code Style** - Tailwind CSS for consistent styling

### Running Tests

```bash
# Frontend
npm run lint

# Backend
pytest tests/
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in `.env`
- Verify CORS_ORIGINS includes your frontend URL

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist .vite`

### OpenAI API Errors
- Verify API key is set in `.env`
- Check API key has sufficient credits
- Ensure OpenAI service is accessible

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**orignlkartik1**

- GitHub: [@orignlkartik1](https://github.com/orignlkartik1)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [CrewAI Documentation](https://docs.crewai.com)
- [LangChain Documentation](https://python.langchain.com)

---

**Made with ❤️ by orignlkartik1**
