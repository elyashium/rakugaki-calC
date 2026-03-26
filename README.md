# Rakugaki Calculator

## Abstract
Rakugaki Calculator is an intelligent, full-stack web application designed to recognize, interpret, and solve handwritten mathematical expressions and graphical word problems. The project bridges human-computer interaction by utilizing an interactive frontend drawing canvas and an asynchronous backend powered by state-of-the-art multimodal Large Language Models (LLMs) to perform complex mathematical reasoning and optical character recognition (OCR) simultaneously.

## System Architecture
The application relies on a decoupled client-server architecture to ensure scalability and maintainability.

*   **Frontend (Client)**: Built with React and structured via the Vite build tool. It acts as the interactive interface where users draw equations on a digital canvas.
*   **Backend (Server)**: A high-performance Python application built utilizing the FastAPI framework. It handles incoming image payloads, processes them mathematically, and interfaces with the external Artificial Intelligence provider.
*   **AI Engine**: Integrated with the Groq API utilizing the `meta-llama/llama-4-scout-17b-16e-instruct` multimodal vision model. This model provides ultra-low latency inference to examine the visual input and return structured, calculated JSON objects.

## How the Application Works

The data flow from a user's drawing to the final calculated answer involves sequential processing steps:

1.  **User Interaction**: The user sketches mathematical equations, variable assignments, or graphical math scenarios onto the React-based canvas.
2.  **Data Extraction**: The frontend extracts the drawing as a raw image data URL and transmits the payload to the backend via a RESTful HTTP POST request. This payload includes any active mathematical variables the user has predefined.
3.  **Image Processing**: 
    *   The FastAPI backend receives the base64 string and decodes it into a Python Image Library (PIL) object.
    *   Because transparent alpha channels (RGBA) are inherent to the canvas but unsupported by standard JPEG encoding algorithms, the backend composites the drawing onto a solid white background mapping. The result is converted to a flattened RGB format.
4.  **AI Inference & Prompt Engineering**: The sanitized JPEG is base64-encoded and dispatched to the Groq Vision model along with a strict instructional prompt. The LLM is programmed to adhere to PEMDAS arithmetic rules, handle variable assignments (e.g., x=4), solve variable systems, and interpret literal graphical scenarios.
5.  **Data Transformation**: The model responds with natural language embedded with structured data. The backend passes this response through a multi-tiered parsing engine utilizing Python's Abstract Syntax Trees (AST) and Regular Expressions (Regex). This algorithm isolates and secures the raw JSON dictionaries.
6.  **Result Rendering**: The FastAPI server issues a 200 OK response containing the structured data, instructing the React frontend to update its state and display the final calculated answer and detected expression on the user's screen.

---

## Local Development Setup

To run this application locally on your machine, you must configure both the frontend and backend servers. 

### Prerequisites
*   Node.js (v18 or newer)
*   Python (v3.9 or newer)
*   A valid Groq API Key

### 1. Backend Server Configuration
The backend requires a Python virtual environment to manage its dependencies securely.

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   source .venv/Scripts/activate
   
   # Linux/macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install the required Python packages into the isolated environment:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables by ensuring the `.env` file exists in the `server` directory. It must contain your Groq API key:
   ```env
   ENV=dev
   SERVER_URL=0.0.0.0
   PORT=8000
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```
5. Start the FastAPI uvicorn server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend will be live at `http://localhost:8000`. You can test the endpoints at the auto-generated documentation via `http://localhost:8000/docs`.

### 2. Frontend Client Configuration
The frontend uses the Node Package Manager to assemble its UI dependencies.

1. Open a new terminal session and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the application dependencies:
   ```bash
   npm install
   ```
3. Verify the frontend environment variables. Ensure the `.env.development` file points to your local backend server:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The interactive application will be accessible via your browser at `http://localhost:5173`.

---

## Deployment Automation (CI/CD)

The application includes a workflow configuration for deployment.

### Automated Docker Registry
The repository includes a GitHub Actions configuration `.github/workflows/ci.yml`. On every successful merge or push to the `master` branch, the workflow triggers the following automated sequence:
1. Provisions an Ubuntu computing environment.
2. Checks out the repository source code.
3. Authenticates with your Docker Hub account securely utilizing Repository Secrets (`DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`).
4. Compiles the optimized `Dockerfile` for the frontend client (served behind an NGINX proxy layer) and the `Dockerfile` for the backend FastAPI server.
5. Pushes the immutable, versioned production containers directly to the container registry.

### Serverless Hosting Consideration
Because the system is fully containerized and the web tiers are strictly decoupled, the architecture supports rapid deployment on modern zero-configuration Platforms as a Service (PaaS). The frontend static assets can be directly distributed globally on Edge networks like Vercel or Netlify, while the backend APIs operate efficiently in serverless environments such as Render or AWS ECS. 
