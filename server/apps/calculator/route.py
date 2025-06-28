# This file defines the API routes (or "endpoints") specifically for the calculator functionality.
# Using a dedicated router helps to keep the codebase organized and modular. Instead of
# defining all routes in the main `main.py` file, we can group related routes here.

# `APIRouter` is a class from FastAPI that allows you to create a "mini" FastAPI application.
# You can define routes on it, and then include this router in your main `app` instance.
from fastapi import APIRouter, HTTPException
from schema import ImagePayload # Import the Pydantic model for our request body.
from .utils import analyze # Correctly import the 'analyze' function.
import base64
from io import BytesIO
from PIL import Image

# Create an instance of APIRouter. This `router` object is what we'll use to
# define all the routes for this module.
router = APIRouter()

# --- Path Operation Decorator ---
# This decorator registers the function below it as an API endpoint.
# - `@router.post("/")`: This means this endpoint will respond to HTTP POST requests.
#   The path is `/`. However, because we included this router in `main.py` with a
#   `prefix="/calculate"`, the full URL for this endpoint will be `/calculate/`.
#
# - `response_model=dict`: This tells FastAPI what the shape of the response will be.
#   While we are returning a dictionary here, you could also use a Pydantic model
#   from `schema.py` for stronger validation and better documentation.
@router.post("/", response_model=list)
async def calculate_from_image(payload: ImagePayload):
    """
    This is the main endpoint for the calculator. It receives the drawing of a
    mathematical expression from the frontend, processes it, and returns the result.

    Args:
        payload (ImagePayload): The request body, which must match the structure defined
                                in the `ImagePayload` Pydantic model. FastAPI automatically
                                validates this for us.

    Returns:
        A dictionary containing the recognized expression and the calculated result.
    """
    try:
        # The `payload` argument now contains the validated data from the request body.
        # You can access its fields like a normal Python object.
        image_data_url = payload.data
        variables = payload.dict_of_vars

        # Extract the base64 encoded image data
        if "," in image_data_url:
            header, encoded = image_data_url.split(",", 1)
            image_data = base64.b64decode(encoded)
            image = Image.open(BytesIO(image_data))

            # --- Calling the analyze function ---
            # Now we call the imported 'analyze' function with the processed image and variables.
            analysis_result = analyze(img=image, dict_of_vars=variables)

            print(f"Received image data URL (first 50 chars): {image_data_url[:50]}...")
            print(f"Received variables: {variables}")

            return analysis_result
        else:
            raise HTTPException(status_code=400, detail="Invalid image data format")
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")