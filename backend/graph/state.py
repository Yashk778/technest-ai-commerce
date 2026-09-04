from langgraph.graph import StateGraph,START,END
from typing import TypedDict
from dotenv import load_dotenv


load_dotenv()


class AgentState(TypedDict):
    user_input : str
    user_intent:dict
    candidate_products:list
    selected_product:dict
    recommended_products: list
    total_amnt:float
    cart:list
    ranking_explanation:str
    upsell_explanation: str
    approval:str
    razorpay_order_id:str
    razorpay_key_id:str
    checkout_amount:str
    razorpay_payment_id:str
    razorpay_signature:str
    payment_status:str