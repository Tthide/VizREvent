# VizREvent

**VizREvent** is a Visualization Recommendation system designed for analyzing football (soccer) event sequences. It aims to simplify the understanding of complex match events by suggesting relevant visual representations using [Draco](https://github.com/cmudig/draco2), a formal model for visualization design.

---

## 📈 Data Sources

This project utilizes rich football datasets from the [StatsBomb Open Data repository](https://github.com/statsbomb/open-data). These datasets include detailed event-level data for matches, such as passes, shots, dribbles, and more.

To explore the full scope of available data and documentation, visit the [StatsBomb Free Data Hub](https://statsbomb.com/what-we-do/hub/free-data/).

---

## 🏗️ Project Structure

This repository contains both the **frontend** and **backend** of the system.

```
root/
├── vizrevent/           # Frontend (React)
├── vizreventServer/     # Backend (Python Flask / FastAPI / etc.)
└── README.md
└── other config files
```

---

## ✨ Getting Started

Follow these steps to run the application locally:

### 🔹 Frontend (React)

1. Navigate to the frontend directory:

   ```bash
   cd vizrevent
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. To run the development server:

   ```bash
   npm run dev
   ```

4. To build for production:

   ```bash
   npm run build
   ```

---

### 🔸 Backend (Python)

1. Navigate to the backend directory:

   ```bash
   cd vizreventServer
   ```

2. (Optional) Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:

   ```bash
   python run.py
   ```

---

## 💡 Notes

* Both **the frontend and backend must be running simultaneously** for the application to function correctly. The frontend fetches data and sends requests to the backend server.
* The frontend may expect the backend to be available at a specific port (e.g., `http://localhost:5000`). You can configure this if needed.
* If you're deploying, remember to handle CORS and environment variables appropriately.
* The server used in the current GitHub Pages deployment is no longer supported, so the live demo may have limited or non-functional features.


