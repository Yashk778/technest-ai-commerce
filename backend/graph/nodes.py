from .state import AgentState
from ..config import llm, razorpay_client
from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from ..tools.catalog import search_category, load_products
from langgraph.types import interrupt
import os
import sqlite3
from pathlib import Path
from ..audit import init_db



# Schemas


class intent_Schema(BaseModel):
    category: str = Field(
        description="The main product category that the user wants"
    )

    budget: Optional[float] = Field(
        default=None,
        description="The Budget in INR if User specifies one"
    )

    requirements: dict = Field(
        default_factory=dict,
        description="Other product requirements mentioned by the user"
    )


class RankingSchema(BaseModel):
    selected_product_id: str = Field(
        description="The id for the best product for user's requirements"
    )

    explanation: str = Field(
        description="A short explanation why the selected product is the best product"
    )


class UpsellSchema(BaseModel):
    recommended_product_id: Optional[str] = Field(
        default=None,
        description="The ID of the most useful complementary product, or null if no suitable add-on exists"
    )

    explanation: str = Field(
        description="A short explanation of why this product is useful with the selected product"
    )


# LLMs


struc_llm = llm.with_structured_output(intent_Schema)
rank_llm = llm.with_structured_output(RankingSchema)
upsell_llm = llm.with_structured_output(UpsellSchema)


# Prompts


intent_prompt = ChatPromptTemplate.from_template("""
    You are an AI Buyer.

    Understand the user's request and extract the relevant shopping information.

    User request:
    {user_input}
""")


rank_prompt = ChatPromptTemplate.from_template("""
You are an AI shopping assistant.

Choose the best product from the candidate products based on
the user's requirements.

User requirements:
{requirements}

Candidate products:
{candidate_products}

Consider relevant specifications such as RAM, processor,
battery, display, storage, and price.

Choose only from the candidate products.
""")


upsell_prompt = ChatPromptTemplate.from_template(
    """You are an AI shopping assistant.

Recommend the most useful complementary product for the selected product.

Selected product:
{selected_product}

Available complementary products:
{available_products}

Only recommend a product if it is genuinely useful with the selected product.
Do not recommend the selected product itself.
Do not invent products.
If there is no suitable complementary product, return null.

Explain briefly why the recommended product is useful.
"""
)


# First node

def understand_intent(state: AgentState):
    user_input = state["user_input"]

    prompt = intent_prompt.format(
        user_input=user_input
    )

    result = struc_llm.invoke(prompt)

    intent = result.model_dump()

    # Normalize the category extracted by the LLM
    # into one of the exact categories used by products.json.

    category = intent.get("category", "").strip().lower()

    category_aliases = {


        # LAPTOP
 

        "laptop": "laptop",
        "laptops": "laptop",
        "lap": "laptop",
        "notebook": "laptop",
        "notebooks": "laptop",
        "notebook computer": "laptop",
        "notebook computers": "laptop",
        "portable computer": "laptop",
        "portable computers": "laptop",


        # HEADPHONES
     

        "headphone": "headphones",
        "headphones": "headphones",
        "headset": "headphones",
        "headsets": "headphones",
        "earphone": "headphones",
        "earphones": "headphones",
        "earbud": "headphones",
        "earbuds": "headphones",
        "ear bud": "headphones",
        "ear buds": "headphones",
        "wireless headphones": "headphones",
        "wireless headphone": "headphones",
        "bluetooth headphones": "headphones",
        "bluetooth headphone": "headphones",


        # KEYBOARD
        

        "keyboard": "keyboard",
        "keyboards": "keyboard",
        "key board": "keyboard",
        "key boards": "keyboard",
        "computer keyboard": "keyboard",
        "computer keyboards": "keyboard",

        # MOUSE
     
        "mouse": "mouse",
        "mice": "mouse",
        "mouses": "mouse",
        "computer mouse": "mouse",
        "computer mice": "mouse",
        "wireless mouse": "mouse",
        "wireless mice": "mouse",

  
        # MONITOR
        

        "monitor": "monitor",
        "monitors": "monitor",
        "display": "monitor",
        "displays": "monitor",
        "screen": "monitor",
        "screens": "monitor",
        "computer monitor": "monitor",
        "computer monitors": "monitor",
        "computer screen": "monitor",
        "computer screens": "monitor",
        "desktop monitor": "monitor",
        "desktop monitors": "monitor",

        # SMARTPHONE


        "smartphone": "smartphone",
        "smartphones": "smartphone",
        "phone": "smartphone",
        "phones": "smartphone",
        "mobile": "smartphone",
        "mobiles": "smartphone",
        "mobile phone": "smartphone",
        "mobile phones": "smartphone",
        "cell phone": "smartphone",
        "cell phones": "smartphone",
        "cellphone": "smartphone",
        "cellphones": "smartphone",
        "smart mobile": "smartphone",
        "smart mobiles": "smartphone",
        "mobile device": "smartphone",
        "mobile devices": "smartphone",
    }

    intent["category"] = category_aliases.get(
        category,
        category
    )

    state["user_intent"] = intent

    return state


# Second node


def search_catalog(state: AgentState):

    intent = state["user_intent"]

    results = search_category.invoke({
        "intent": intent
    })

    state["candidate_products"] = results

    return state



# Third node


def Rank_products(state: AgentState):

    candidates = state["candidate_products"]


    # IMPORTANT:
    # If catalog search returned nothing, do NOT call the
    # ranking LLM with an empty product list.


    if not candidates:

        state["selected_product"] = None

        state["ranking_explanation"] = (
            "No suitable product was found in the TechNest "
            "catalog for your requirements and budget."
        )

        return state

    requirements = state["user_intent"].get(
        "requirements",
        {}
    )

    prompt = rank_prompt.format(
        requirements=requirements,
        candidate_products=candidates
    )

    result = rank_llm.invoke(prompt)

    selected = None

    for product in candidates:

        if product["id"] == result.selected_product_id:
            selected = product
            break

    state["selected_product"] = selected

    state["ranking_explanation"] = result.explanation

    return state



# Fourth node


def upsell_crosssell_products(state: AgentState):

    selected_product = state.get("selected_product")

    intent = state.get(
        "user_intent",
        {}
    )

    # No main product found.
    # Skip the upsell LLM completely.

    if not selected_product:

        state["recommended_products"] = []

        state["upsell_explanation"] = (
            "No suitable product was found in the TechNest "
            "catalog for your requirements and budget."
        )

        return state

    products = load_products()

    # User's budget is a hard constraint for the complete basket
    budget = intent.get("budget")

    # Calculate remaining budget after main product
    if budget is not None:

        remaining_budget = (
            budget - selected_product["price"]
        )

    else:

        remaining_budget = None

    # If main product already uses entire budget,
    # do not recommend an add-on.
    if (
        remaining_budget is not None
        and remaining_budget <= 0
    ):

        state["recommended_products"] = []

        state["upsell_explanation"] = (
            "No add-on was recommended because the selected "
            "product already uses the available budget."
        )

        return state


    # Only consider products that fit within remaining budget


    available_products = []

    for product in products:

        if product["id"] == selected_product["id"]:
            continue

        if (
            remaining_budget is not None
            and product["price"] > remaining_budget
        ):
            continue

        available_products.append(product)

    # No affordable complementary product
    if not available_products:

        state["recommended_products"] = []

        state["upsell_explanation"] = (
            "No suitable add-on fits within the remaining budget."
        )

        return state

    # Only now call the upsell LLM


    prompt = upsell_prompt.format(
        selected_product=selected_product,
        available_products=available_products
    )

    result = upsell_llm.invoke(prompt)

    recommended = None

    for product in available_products:

        if product["id"] == result.recommended_product_id:

            recommended = product
            break

    state["recommended_products"] = []

    if recommended:

        state["recommended_products"].append(
            recommended
        )

        state["upsell_explanation"] = (
            result.explanation
        )

    else:

        state["upsell_explanation"] = (
            "No suitable complementary product was recommended."
        )

    return state



# Fifth node

def Build_basket(state: AgentState):

    selected_product = state["selected_product"]

    recommended_products = state["recommended_products"]

    cart = []

    cart.append(selected_product)

    for product in recommended_products:

        cart.append(product)

    total = 0

    for product in cart:

        total = total + product["price"]

    state["cart"] = cart

    state["total_amnt"] = total

    return state



# Sixth node


def hitlnode(state: AgentState):

    decision = interrupt({
        "type": "approval",
        "reason": "The purchase plan is ready",
        "question": "Do you approve this purchase",
        "Instruction": "Reply with approve or rejected"
    })

    state["approval"] = decision

    return state


# Seventh node


def create_razorpay_order(state: AgentState):

    amount = int(
        state["total_amnt"] * 100
    )

    order = razorpay_client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": "buyer_reciept_001"
    })

    state["razorpay_order_id"] = order["id"]

    return state


# Eighth node


def prepare_checkout(state: AgentState):

    state["razorpay_key_id"] = os.getenv(
        "RAZORPAY_KEY_ID"
    )

    state["checkout_amount"] = int(
        state["total_amnt"] * 100
    )

    return state


# Ninth node

def payment_wait_node(state: AgentState):

    payment_data = interrupt({
        "type": "payment",
        "message": "Waiting for Razorpay payment confirmation."
    })

    if payment_data.get("payment_status") == "failed":

        state["payment_status"] = "failed"

        state["razorpay_payment_id"] = (
            payment_data.get("razorpay_payment_id", "")
        )

        state["razorpay_order_id"] = (
            payment_data.get(
                "razorpay_order_id",
                state.get("razorpay_order_id", "")
            )
        )

        return state

    state["razorpay_payment_id"] = (
        payment_data["razorpay_payment_id"]
    )

    state["razorpay_order_id"] = (
        payment_data["razorpay_order_id"]
    )

    state["razorpay_signature"] = (
        payment_data["razorpay_signature"]
    )

    return state


# Tenth node

def verify_payment(state: AgentState):

    if state.get("payment_status") == "failed":
        return state

    try:

        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": state["razorpay_order_id"],
            "razorpay_payment_id": state["razorpay_payment_id"],
            "razorpay_signature": state["razorpay_signature"]
        })

        state["payment_status"] = "success"

    except Exception:

        state["payment_status"] = "failed"

    return state


# Eleventh node


def handle_failure(state: AgentState):

    state["payment_status"] = "failed"

    return state


# Twelfth node


def audit_transaction(state: AgentState):

    init_db()

    db_file = (
        Path(__file__).resolve().parents[1]
        / "data"
        / "commerce.db"
    )

    connection = sqlite3.connect(db_file)

    connection.execute("""
    INSERT INTO audit_logs(
        user_request,
        selected_product,
        recommended_products,
        total_amnt,
        approval,
        razorpay_order_id,
        payment_status
    )
    VALUES(?,?,?,?,?,?,?)
    """, (
        state["user_input"],
        str(state["selected_product"]),
        str(state["recommended_products"]),
        state["total_amnt"],
        state["approval"],
        state.get("razorpay_order_id", ""),
        state.get("payment_status", "")
    ))

    connection.commit()

    connection.close()

    return state