import google.generativeai as genai
import ast
import json
import re
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
#since we dont want the model to run everytime, just one intilaistion before 
#the analyse function.
model =genai.GenerativeModel("gemini-1.5-flash")

def analyze(img : Image, dict_of_vars : dict):
    #dumping the dict of vars into a json string for passing into the prompt
    dict_of_vars_json = json.dumps(dict_of_vars)

    prompt=(
         f"You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. "
        f"Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. "
        f"For example: "
        f"Q. 2 + 3 * 4 "
        f"(3 * 4) => 12, 2 + 12 = 14. "
        f"Q. 2 + 3 + 5 * 4 - 8 / 2 "
        f"5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21. "
        f"YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: "
        f"Following are the cases: "
        f"1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {{'expr': 'x', 'result': 2, 'assign': True}} and dict 2 as {{'expr': 'y', 'result': 5, 'assign': True}}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables. "
        f"3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {{'assign': True}}, keeping the variable as 'expr' and the value as 'result' in the original dictionary. RETURN AS A LIST OF DICTS. "
        f"4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept. "
        f"Analyze the equation or expression in this image and return the answer according to the given rules: "
        f"Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc. "
        f"Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: {dict_of_vars_json}. "
        f"DO NOT USE BACKTICKS OR MARKDOWN FORMATTING. "
        f"PROPERLY QUOTE THE KEYS AND VALUES IN THE DICTIONARY FOR EASIER PARSING WITH Python's ast.literal_eval."
    )
    response = model.generate_content([prompt, img])
    print(response.text)
    answers = []
    
    try:
        # First try direct ast.literal_eval
        answers = ast.literal_eval(response.text)
    except Exception as e:
        print(f"Error in direct parsing: {e}")
        
        try:
            # Try to extract JSON from the response
            # Look for JSON pattern in the response
            json_match = re.search(r'\[\s*{.*}\s*\]', response.text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                # Replace single quotes with double quotes for proper JSON
                json_str = json_str.replace("'", '"')
                answers = json.loads(json_str)
                print(f"Extracted JSON: {json_str}")
            else:
                # Try to extract key information directly
                expr_match = re.search(r"expr[\'\"]\s*:\s*[\'\"](.*?)[\'\"]", response.text)
                result_match = re.search(r"result[\'\"]\s*:\s*([\'\"]?.*?[\'\"]?)[,}]", response.text)
                
                if expr_match and result_match:
                    expr = expr_match.group(1)
                    result_str = result_match.group(1).strip('\'"')
                    
                    # Try to convert result to number if possible
                    try:
                        result = int(result_str)
                    except ValueError:
                        try:
                            result = float(result_str)
                        except ValueError:
                            result = result_str
                            
                    answers = [{"expr": expr, "result": result}]
                    print(f"Extracted expression: {expr}, result: {result}")
        except Exception as nested_e:
            print(f"Error in alternative parsing: {nested_e}")
    
    print('returned answer ', answers)
    
    # If we still have no answers, create a default one based on the response text
    if not answers:
        # Try to extract any mathematical expression from the response
        math_expr = re.search(r'(\d+[\+\-\*/]\d+(?:[\+\-\*/]\d+)*)', response.text)
        if math_expr:
            expr = math_expr.group(1)
            try:
                # Safely evaluate the expression
                result = eval(expr, {"__builtins__": {}})
                answers = [{"expr": expr, "result": result}]
            except:
                pass
    
    # Add assign field if missing
    for answer in answers:
        if 'assign' not in answer:
            answer['assign'] = False
            
    return answers