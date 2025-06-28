# This file defines the data "schemas" for your API using Pydantic.
#
# What are Schemas?
# -----------------
# A schema is a formal definition of the structure of your data. In the context of an API,
# it defines the shape and data types of the JSON that your API expects in requests and
# sends back in responses.
#
# Why use Pydantic?
# -----------------
# Pydantic is a powerful data validation library that FastAPI is built upon. By defining
# your schemas as Pydantic models (which are just Python classes that inherit from `BaseModel`),
# you get several amazing benefits for free:
#
# 1.  Data Validation: Pydantic automatically validates incoming data. If a request sends a
#     JSON payload that doesn't match your schema (e.g., a missing field, or a string
#     instead of a number), FastAPI will automatically reject it with a clear error message.
# 2.  Data Serialization: It automatically converts your Python objects into the correct
#     JSON format for responses.
# 3.  Type Safety & Autocompletion: Because your schemas are just Python classes, your code
#     editor will provide excellent autocompletion and type-checking, reducing bugs.
# 4.  Automatic API Documentation: FastAPI uses these Pydantic models to generate the
#     rich, interactive API documentation you see at `/docs`.

from pydantic import BaseModel

# --- Request Schemas ---
# These models define the expected structure of data coming IN to your API.

class ImagePayload(BaseModel):
    """
    This schema defines the structure for the payload that the frontend will send
    to the `/calculate` endpoint.
    """
    # This field will contain the drawing from the canvas, encoded as a Base64 string.
    # The `str` type hint tells Pydantic to expect a string here.
    data: str

    # This field will contain a dictionary of any variables that might have been
    # previously defined (e.g., x=5).
    # The `dict` type hint tells Pydantic to expect a JSON object (a dictionary).
    dict_of_vars: dict

class image_schema(BaseModel):
    img : str
    dict_of_vars : dict