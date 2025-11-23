#  CustomizeChat AI - Customizable Chatbot Platform

A full-stack, customizable chatbot application built with Django REST Framework backend and React frontend. Create and personalize your AI chatbot experience with ease!

### Demo

![chatbot](https://github.com/user-attachments/assets/1a69296b-4af3-4b10-9e11-af079e970474)


##  Tech Stack

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **AI Integration**: Google Generative AI
- **Containerization**: Docker & Docker Compose
- **Package Management**: Poetry
- **API Documentation**: Swagger/OpenAPI
- **Database**: PostgreSQL (default) / SQLite (development)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Styling**: CSS3 + MUI Theming

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose (for containerized deployment)
- Google Generative AI API key

### Backend Setup


1. **Environment Configuration**
```bash
cp .env.example .env

```

2. **Database Setup**
```bash
python manage.py makemigration
python manage.py migrate
python manage.py createsuperuser
```


### Backend with Docker

```bash
cd backend
docker-compose up --build
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../chatbot-frontend
```

2. **Install dependencies**
```bash
npm install
```


4. **Run Frontend (Development)**
```bash
npm run dev
```



## API Endpoints

### Sessions
- `GET /api/sessions/` - List all chat sessions
- `POST /api/sessions/` - Create new chat session
- `GET /api/sessions/{id}/` - Get session details
- `DELETE /api/sessions/{id}/` - Delete session
- `POST /api/sessions/{id}/send_message/` - Send message to session


## Chatbot Customization

The chatbot can be customized through:

1. **Personality Settings** - Adjust tone and response style
2. **Knowledge Base** - Add custom training data
3. **Response Templates** - Pre-defined answer formats
4. **Behavior Rules** - Custom interaction patterns



##  API Documentation

Once the backend is running, access interactive API docs at:
- **Swagger UI**: http://localhost:8000/api/swagger/
- **ReDoc**: http://localhost:8000/api/redoc/
`


