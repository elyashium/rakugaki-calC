# Rakugaki Calc - FastAPI Backend

This directory contains the Python backend for the Rakugaki Calc application, built using the **FastAPI** framework. This server is responsible for receiving drawings from the frontend, processing them to recognize handwritten mathematical expressions, and returning the calculated results.

---

## Table of Contents

1.  [Project Structure](#project-structure)
2.  [Setup and Installation](#setup-and-installation)
3.  [Running the Server](#running-the-server)
4.  [API Endpoints](#api-endpoints)
5.  [Key Concepts Explained](#key-concepts-explained)

---

### Project Structure

The backend code is organized to be modular and scalable. Here's a breakdown of the key files and directories:

```
server/
├── venv/                 # A directory holding the Python virtual environment.
├── apps/                 # A package containing the different "apps" or modules of our API.
│   └── calculator/       # The module for all calculator-related logic.
│       ├── __init__.py   # Makes the `calculator` folder a Python package.
│       └── route.py      # Defines the API routes (endpoints) for the calculator.
├── .env                  # Stores environment variables like secrets or configuration.
├── constants.py          # Defines global constants and loads environment variables.
├── main.py               # The main entry point for the FastAPI application.
├── requirements.txt      # Lists all the Python packages required for this project.
└── schema.py             # Defines the Pydantic data models (schemas) for request/response validation.
```

---

### Setup and Installation

To get the backend running locally, you need to set up a Python virtual environment and install the required dependencies.

**Step 1: Create and Activate the Virtual Environment**

A virtual environment is a self-contained directory that holds a specific Python interpreter and its own set of installed packages. This is crucial for keeping project dependencies isolated.

```bash
# Navigate to the server directory
cd server

# Create the virtual environment using Python's built-in `venv` module
# (You only need to do this once)
py -m venv venv

# Activate the virtual environment. You must do this every time you open a new terminal.
# On Windows (Git Bash or PowerShell):
source venv/Scripts/activate
```

You'll know the environment is active when you see `(venv)` at the beginning of your terminal prompt.

**Step 2: Install Dependencies**

All the necessary Python packages are listed in `requirements.txt`.

```bash
# Make sure your virtual environment is active
# Install all required packages using pip
pip install -r requirements.txt
```

---

### Running the Server

With the setup complete, you can run the server in development mode.

```bash
# Make sure you are in the /server directory and your venv is active
py main.py
```

The server will start up, and because it's in development mode (`reload=True`), it will automatically restart whenever you save a change in any of the Python files.

You can access the server at `http://localhost:8000`.

---

### API Endpoints

FastAPI automatically generates interactive documentation for your API. Once the server is running, open your browser and go to one of these URLs:

-   **Swagger UI (Recommended):** [http://localhost:8000/docs](http://localhost:8000/docs)
-   **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

You'll be able to see all available endpoints, their request formats, and even test them directly from your browser.

-   `GET /`: A simple health-check endpoint to confirm the server is running.
-   `POST /calculate/`: The main endpoint that receives the image data from the frontend for processing.

---

### Key Concepts Explained

-   **FastAPI:** A high-performance web framework for building APIs. It's known for its speed, automatic data validation, and interactive documentation.
-   **Uvicorn:** The lightning-fast ASGI (Asynchronous Server Gateway Interface) server that actually runs your FastAPI application.
-   **Pydantic:** A data validation library that FastAPI uses under the hood. You define the "shape" of your data in `schema.py`, and Pydantic ensures all incoming and outgoing data matches that shape. This drastically reduces bugs.
-   **CORS (Cross-Origin Resource Sharing):** A security mechanism that browsers use. Since your frontend and backend run on different "origins" (ports), the backend needs to tell the browser that it's okay to accept requests from the frontend. This is handled by the `CORSMiddleware` in `main.py`. 