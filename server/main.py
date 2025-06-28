# ======================================================================================
# |||  Welcome to FastAPI - A Quick Introduction for Beginners                      |||
# ======================================================================================
#
# What is FastAPI?
# ----------------
# FastAPI is a modern, high-performance web framework for building APIs (Application
# Programming Interfaces) with Python. Think of it as the bridge between your frontend
# (the React app) and your backend logic.
#
# Why is it so popular?
# 1.  Fast Execution: It's built on top of two other libraries, Starlette (for the web
#     parts) and Pydantic (for the data parts), which make it one of the fastest
#     Python frameworks available, on par with NodeJS and Go.
# 2.  Fast to Code: It's designed to be incredibly intuitive. You can build powerful
#     APIs with very little code.
# 3.  Automatic Docs: FastAPI automatically generates interactive API documentation
#     for you. Once your server is running, you can go to `/docs` in your browser
#     to see a full, testable interface for all your API endpoints. This is a huge
#     time-saver.
# 4.  Type Hints and Validation: It uses standard Python type hints (like `app: FastAPI`
#     or `def root() -> dict:`). FastAPI uses these hints to automatically validate
#     incoming data, so you get fewer bugs. If a request sends the wrong data type,
#     FastAPI sends back a clear error message automatically.
#
# Core Concept: Path Operations
# -----------------------------
# In FastAPI, you create "path operations" to handle requests. A path is the part of
# the URL that comes after the main domain (e.g., `/` or `/users/1`). An operation is
# the HTTP method used (e.g., GET, POST, PUT, DELETE).
#
# You define them in Python using "decorators" like `@app.get("/")` or `@app.post("/items")`.
# A decorator is just a way to add functionality to a standard Python function.
#
# ======================================================================================

# Import necessary modules and classes from libraries.
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn  # The server that runs our FastAPI application.
from apps.calculator.route import router as calculator_router # Importing our calculator routes
from constants import SERVER_URL, PORT, ENV # Importing configuration variables

# The `lifespan` context manager is the modern way in FastAPI to handle logic that
# needs to run exactly once when the application starts up, and once when it shuts down.
# - Code before the `yield` statement runs on startup. This is a great place to
#   initialize resources like database connections, AI models, etc.
# - Code after the `yield` statement runs on shutdown, which is useful for cleanup.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Logic Here ---
    print("Server is starting up...")
    yield # The application runs while the 'yield' is active.
    # --- Shutdown Logic Here ---
    print("Server is shutting down...")

# This line creates the main FastAPI application instance.
# The `app` object is the central point of your entire API. You will use it to
# define all your routes and configurations.
# We pass our `lifespan` function to it so FastAPI knows what to run on startup/shutdown.
app = FastAPI(lifespan=lifespan)


# --- Middleware Configuration ---
# Middleware is code that runs for EVERY request before it hits your specific path
# operation (like `@app.get("/")`) and for EVERY response before it's sent back.
# Here, we are adding CORS (Cross-Origin Resource Sharing) middleware.
#
# Why is CORS needed?
# For security reasons, web browsers block requests from a frontend running on one
# "origin" (e.g., http://localhost:5174) to a backend running on a different origin
# (e.g., http://localhost:8000). This middleware tells the browser that it's okay for
# our frontend to talk to our backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # This allows all origins. For production, you should
                          # restrict this to your actual frontend's domain for security.
                          # e.g., ["https://your-domain.com"]
    allow_credentials=True, # Allows cookies to be sent with requests.
    allow_methods=["*"],    # Allows all HTTP methods (GET, POST, etc.).
    allow_headers=["*"],    # Allows all request headers.
)


# --- Path Operation Decorator ---
# This is how you define an API endpoint.
# `@app.get('/')` means: "When a client sends an HTTP GET request to the root URL ('/'),
# execute the function defined right below this line."
@app.get('/')
async def root():
    # This is the "path operation function". FastAPI will automatically convert the
    # dictionary it returns into a JSON response.
    # The `async` keyword makes this an asynchronous function, which is good practice
    # in FastAPI for non-blocking I/O operations, though not strictly required here.
    return {"message": "Server is running"}

# --- Including a Router ---
# As your application grows, you don't want to put all your routes in this one file.
# FastAPI allows you to group related routes into an "APIRouter" in other files.
# `app.include_router` tells our main app to include all the routes defined in the
# `calculator_router` object that we imported from `apps/calculator/route.py`.
#
# - `prefix="/calculate"`: This prepends `/calculate` to all routes from that router.
#   So, if a route is defined as `/` in the router, it will be accessible at `/calculate/`.
# - `tags=["calculate"]`: This is for the automatic documentation. It groups all of
#   these routes under a "calculate" heading at `/docs`, making it easy to navigate.
app.include_router(calculator_router, prefix="/calculate", tags=["calculate"])


# --- Running the Server for Development ---
# This is a standard Python construct. The code inside this `if` block will only run
# when you execute this file directly (e.g., `python main.py`). It will NOT run if
# this file is imported by another script (which is how a production server runs it).
# This makes it a perfect place to put development-only startup code.
if __name__ == "__main__":
    # `uvicorn.run()` starts the web server.
    # - `"main:app"`: A string telling uvicorn "in the file named `main`.py, find the
    #   FastAPI instance named `app` and run it".
    # - `host` and `port`: The address and port to run on, loaded from your constants.
    # - `reload=(ENV == "dev")`: This is a developer's best friend. It tells uvicorn to
    #   watch for file changes and automatically restart the server when you save a file.
    #   This is only enabled if your ENV constant is set to "dev".
    uvicorn.run("main:app", host=SERVER_URL, port=int(PORT), reload=(ENV == "dev"))