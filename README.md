# Rakugaki Calculator

This project is a full-stack application that allows you to draw mathematical expressions on a canvas, which are then recognized and solved by a backend service powered by AI.

The application consists of two main parts:
*   **Frontend**: A React application built with Vite that provides the drawing canvas and user interface.
*   **Backend**: A Python FastAPI server that uses Google's Gemini AI to interpret the drawn image and calculate the result.

The entire application is containerized using Docker and includes a CI/CD pipeline with GitHub Actions to automatically build and publish the images to Docker Hub.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **For Local Development:**
    *   [Node.js](https://nodejs.org/) (v18 or newer)
    *   [Python](https://www.python.org/) (v3.9 or newer)
    *   `pip` and `venv` for Python package management.
*   **For Docker Development:**
    *   [Docker](https://www.docker.com/products/docker-desktop/)
    *   [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

---

## Getting Started

There are two ways to run this project: locally for development or with Docker for a production-like environment.

### Method 1: Running with Docker (Recommended)

This is the simplest way to get the application running, as it handles all dependencies and networking automatically. This method uses the pre-built images from Docker Hub that are published by our CI/CD pipeline.

**1. Clone the repository:**
```bash
git clone <your-repository-url>
cd rakugaki-calc
```

**2. Create the backend environment file:**

The backend requires an API key for the Gemini service.

*   Navigate to the `server` directory: `cd server`
*   Create a file named `.env`:
    ```
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```
*   Return to the root directory: `cd ..`

**3. Run with Docker Compose:**

From the root of the project, run the following command:

```bash
docker-compose up
```

Docker Compose will pull the latest `frontend` and `backend` images from Docker Hub, create a network, and start both containers.

Once the containers are running, you can access:
*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Method 2: Running Locally for Development

Follow these steps if you want to run the frontend and backend servers directly on your machine.

**1. Clone the repository:**
```bash
git clone <your-repository-url>
cd rakugaki-calc
```

**2. Set up the Backend (Server):**

*   Navigate to the server directory:
    ```bash
    cd server
    ```
*   Create a Python virtual environment and activate it:
    ```bash
    # For Windows
    python -m venv .venv
    .venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```
*   Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
*   Create a `.env` file and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_google_gemini_api_key_here
    ```
*   Run the backend server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The server will be available at `http://localhost:8000`.

**3. Set up the Frontend (Client):**

*   Open a **new terminal** and navigate to the client directory:
    ```bash
    cd client
    ```
*   Install the required Node.js packages:
    ```bash
    npm install
    ```
*   The frontend needs to know where the backend API is. An environment file for this is already included (`.env.development`), so no changes are needed. It correctly points to `http://localhost:8000`.
*   Run the frontend development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## CI/CD Pipeline

This project uses **GitHub Actions** for its CI/CD pipeline. The workflow is defined in `.github/workflows/ci.yml`.

*   **Trigger:** The pipeline automatically runs on every `push` to the `master` branch.
*   **Jobs:**
    1.  **build-and-push-frontend:** Builds the React application's Docker image and pushes it to Docker Hub as `your-username/rakugaki-calc-client:latest`.
    2.  **build-and-push-backend:** Builds the FastAPI application's Docker image and pushes it to Docker Hub as `your-username/rakugaki-calc-backend:latest`.

You will need to configure `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as secrets in your GitHub repository settings for the pipeline to publish the images successfully. 