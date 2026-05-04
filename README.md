# 📊 Journal Analytics Assistant

> **The Executive Copilot for Journal Operations.** 
> Empowering decision-makers with natural language insights, dynamic data visualizations, and automated SQL generation.

---

## 🌟 Overview

The **Journal Analytics Assistant** is a full-stack executive copilot designed to bridge the gap between complex journal data and actionable insights. Built with a modern **React + FastAPI** architecture, it leverages Large Language Models (LLMs) to translate plain English questions into optimized SQL queries, providing instant narrative summaries and beautiful visualizations.

### ✨ Key Features

*   **🗣️ Natural Language to SQL**: Ask complex questions like *"What's our revenue trend for the last 6 months?"* and watch as the assistant generates and executes the precise SQL query.
*   **📈 Intelligent Visualizations**: Automatically renders the most appropriate chart (Bar, Line, Area, or Pie) based on the structure of the retrieved data.
*   **📝 Narrative Summaries**: Every query is accompanied by a professional, AI-generated executive summary that highlights key takeaways.
*   **🔍 Data Transparency**: Full visibility into the generated SQL, execution timings, and row counts for complete trust and auditability.
*   **💾 Local Session History**: All conversations are persisted locally, allowing you to pick up exactly where you left off.
*   **📥 Professional Data Export**: One-click export of any result set to CSV for further analysis in Excel or other tools.
*   **🎨 Premium UI/UX**: A sleek, Claude-inspired interface designed for clarity, speed, and executive use.

---

## 🛠️ Technical Stack

### **Frontend**
*   **Framework**: [React](https://reactjs.org/) (Vite)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)

### **Backend**
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
*   **LLM Engine**: [Groq Cloud](https://groq.com/) (Llama-3-70b-versatile)
*   **Database**: [SQLite](https://www.sqlite.org/) (Synthetic journal data)
*   **Security**: Read-only SQL execution and validation.

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
│   │   ├── db_manager.py    # SQLite connection & security validation
│   │   ├── chart_generator.py # Logic for automatic visualization selection
│   │   └── summarizer.py    # Narrative insight generation logic
│   └── database/           # SQLite database storage
├── frontend/
│   ├── src/
│   │   ├── components/     # Atomic UI components (Composer, ChatThread, etc.)
│   │   ├── pages/          # Main application layouts
│   │   ├── hooks/          # Custom React hooks (Persistence, API state)
│   │   └── assets/         # Static assets & brand logos
│   └── tailwind.config.js  # Custom theme & design tokens
└── .gitignore              # Production-ready git exclusions
```

---

## 🔒 Security & Performance

*   **SQL Safety**: The application uses a strict regex-based validation layer to ensure only `SELECT` statements are executed.
*   **Optimized Queries**: Prompts are engineered to generate performant SQL that leverages existing indexes.
*   **Lightweight Storage**: SQLite provides a zero-config, portable database experience perfect for internal analytics.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs or feature requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ for Journal Operations Excellence.
