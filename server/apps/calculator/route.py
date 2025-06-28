# This file defines the API routes (or "endpoints") specifically for the calculator functionality.
# Using a dedicated router helps to keep the codebase organized and modular. Instead of
# defining all routes in the main `main.py` file, we can group related routes here.

# `APIRouter` is a class from FastAPI that allows you to create a "mini" FastAPI application.
# You can define routes on it, and then include this router in your main `app` instance.
from fastapi import APIRouter
import base64
from io import BytesIO
from apps.calculator.utils import analyze_image
from schema import ImageData, ImagePayload
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
@router.post("/", response_model=dict)
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
    # The `payload` argument now contains the validated data from the request body.
    # You can access its fields like a normal Python object.
    image_data_url = payload.data
    variables = payload.dict_of_vars

    # --- Placeholder for your Core Logic ---
    # This is where you would:
    # 1. Decode the `image_data_url` (it's a Base64 string) into an image.
    # 2. Pass the image to your machine learning model (e.g., Gemini) to recognize
    #    the handwritten expression.
    # 3. Take the recognized expression string and safely evaluate it.
    # 4. Handle any variables passed in `payload.dict_of_vars`.
    #
    # For now, we are just returning a mock response.
    print(f"Received image data URL (first 50 chars): {image_data_url[:50]}...")
    print(f"Received variables: {variables}")

    return {
        "expression": "2 + 2 (from image)",
        "result": "4",
        "assign": False
    }

@router.post('')
async def run(data: ImageData):
    image_data = base64.b64decode(data.image.split(",")[1])  # Assumes data:image/png;base64,<data>
    image_bytes = BytesIO(image_data)
    image = Image.open(image_bytes)
    responses = analyze_image(image, dict_of_vars=data.dict_of_vars)
    data = []
    for response in responses:
        data.append(response)
    print('response in route: ', response)
    return {"message": "Image processed", "data": data, "status": "success"}