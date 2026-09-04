from langgraph.prebuilt import ToolNode,tools_condition
from langchain_core.tools import tool
import json
from pathlib import Path


#find products.jsons and save path 
Products_File= Path(__file__).resolve().parents[1] / "data" / "products.json"

def load_products():
    with open(Products_File,'r',encoding='utf-8') as file :
        return json.load(file)



@tool
def search_category(intent:dict):
    """
    Search the merchant catalog for products matching the user's
    requested category and maximum budget.

    Returns products that satisfy these hard constraints.
    Preference-based requirements are handled by the ranking stage.
    """
    products = load_products()
    category = intent.get('category','').lower()
    budget  = intent.get('budget')
    requirements = intent.get('requirements',{})

    matches=[]

    for product in products:

        #category filter

        if category and product['category'].lower() != category:
            continue

        #budget filter
        if budget is not None and product['price']>budget:
            continue
        #Add product 
        matches.append(product)
    return matches  




