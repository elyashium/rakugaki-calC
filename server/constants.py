# This file is used to define global constants and manage configuration variables.
# Using a dedicated file for constants makes the application easier to configure and maintain,
# as it centralizes all the important configuration values.

# The `dotenv` library is used to load environment variables from a `.env` file.
# This is a best practice for handling sensitive information (like API keys) and
# environment-specific settings (like database URLs or server ports) without
# hard-coding them into your source code.
from dotenv import load_dotenv
import os

# `load_dotenv()` reads the key-value pairs from your `.env` file and adds them
# as environment variables to the running process.
load_dotenv()

# Here, we retrieve the environment variables using `os.getenv()`.
# `os.getenv()` is used to safely get an environment variable. If the variable
# is not set, it will return `None` instead of raising an error.

# The environment the app is running in (e.g., "dev", "prod").
# This is useful for enabling or disabling development-only features, like auto-reloading.
ENV = os.getenv("ENV")

# The URL or IP address the server will listen on.
# "0.0.0.0" is a common choice for development and Docker, as it means the server
# is accessible from any network interface, not just `localhost`.
SERVER_URL = os.getenv("SERVER_URL")

# The port number the server will run on.
PORT = os.getenv("PORT")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")    