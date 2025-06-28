from pydantic import BaseModel

class image_schema(BaseModel):
    img : str
    dict_of_vars : dict