# 📊 Annie - Journal Analytics Assistant

> **The Executive Copilot for Journal Operations.** 
> Empowering decision-makers with real-time voice insights, dynamic data visualizations, and automated SQL generation.

---

## 🌟 Overview

**Annie** is a premium, full-stack executive copilot designed to bridge the gap between complex journal data and actionable insights. Built for **Taylor & Francis**, it leverages advanced LLMs and real-time speech processing to translate plain English (or spoken) questions into optimized SQL queries, providing instant narrative summaries and professional visualizations.

### ✨ Key Features

*   **🎙️ Real-Time Voice Integration**: Speak naturally and watch as Annie transcribes your words instantly into the chat input using high-performance Web Speech processing.
*   **🗣️ Natural Language to SQL**: Ask complex questions like *"Which journals in Medicine had an acceptance rate above 60% in 2024?"* and get precise data answers.
*   **📈 Intelligent Visualizations**: Automatically renders the most appropriate chart (Bar, Line, Area, or Pie) based on the structure of the retrieved results.
*   **📝 Narrative Summaries**: Every query is accompanied by a professional, AI-generated executive summary that highlights key takeaways.
*   **🔐 Secure Authentication**: Integrated with Firebase for secure Email and Google authentication.
*   **👤 Profile Customization**: Personalized user settings with local persistence for names, roles, and preferences.
*   **🎨 Premium UI/UX**: A sleek, modern interface inspired by Claude, designed for clarity, speed, and executive use.

---

## 🛠️ Technical Stack

### **Frontend**
*   **Framework**: [React](https://reactjs.org/) (Vite)
*   **Authentication**: [Firebase Auth](https://firebase.google.com/)
*   **Real-time STT**: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)

### **Backend**
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
*   **LLM Engine**: [Groq Cloud](https://groq.com/) (Llama-3.3-70b-versatile & Whisper-large-v3)
*   **Database**: [SQLite](https://www.sqlite.org/) (Automated synthetic data generation)
*   **Data Processing**: [Pandas](https://pandas.pydata.org/)

---

## 🚀 Getting Started

### 📋 Prerequisites
*   **Python**: 3.10 or higher
*   **Node.js**: 18.0 or higher
*   **API Key**: A [Groq API Key](https://console.groq.com/keys)

### 🔧 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/journal-ai-assistant.git
cd journal-ai-assistant
```

#### 2. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

For the best experience, run both services simultaneously:

### **Terminal 1: Backend**
```bash
cd backend
source .venv/bin/activate
uvicorn app:app --reload
```
*API will be available at `http://localhost:8000`*

### **Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
*Web App will be available at `http://localhost:5173`*

---

## 📂 Project Architecture

```text
journal-ai-assistant/
├── backend/
│   ├── app.py              # Main API entry point & routes
│   ├── utils/
│   │   ├── sql_generator.py # Groq LLM integration & prompt engineering
│   │   ├── db_manager.py    # SQLite connection & synthetic data logic
│   │   ├── chart_generator.py # Automatic visualization selection
│   │   └── summarizer.py    # Narrative insight generation
│   └── database/           # SQLite database & data source
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (Composer, ChatThread, Sidebar)
│   │   ├── pages/          # Auth, Assistant, and Profile layouts
│   │   ├── hooks/          # Custom hooks (Voice, Conversations)
│   │   ├── services/       # API client logic
│   │   └── utils/          # Auth storage and Firebase config
│   └── tailwind.config.js  # Theme and design tokens
└── .gitignore              # Project exclusions
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

Developed with ❤️ for Journal Operations Excellence.
