from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from .tools.catalog import load_products
from .config import razorpay_client
from langgraph.types import Command
from .graph.graph import workflow
import os
from fastapi.staticfiles import StaticFiles
import json
import asyncio
from fastapi.responses import StreamingResponse


app = FastAPI(title="TechNest AI Buyer API")


NODE_LABELS = {
    "understand_intent": "Understanding your requirements",
    "search_catalog": "Searching the TechNest catalog",
    "Rank_products": "Comparing available products",
    "upsell_crosssell_products": "Optimizing your basket",
    "Build_basket": "Building your purchase plan",
}



PRODUCTS_DIR = os.path.join(
    os.path.dirname(__file__),
    "data",
    "products"
)

app.mount(
    "/products",
    StaticFiles(directory=PRODUCTS_DIR),
    name="products"
)

@app.get("/api/products")
def get_products():
    return load_products()
# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "TechNest AI Buyer API is running"
    }


@app.post("/api/buy")
def buy(request: dict):
    user_input = request.get("user_input", "")

    initial_state = {
        "user_input": user_input
    }

    # Create a unique session for this purchase
    thread_id = str(uuid4())

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    result = workflow.invoke(
        initial_state,
        config=config
    )

    return {
        "thread_id": thread_id,
        "result": result
    }


@app.post("/api/buy/stream")
async def buy_stream(request: dict):

    user_input = request.get("user_input", "")

    if not user_input:
        return {
            "error": "user_input is required"
        }

    thread_id = str(uuid4())

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    async def event_generator():

        try:

            async for event in workflow.astream_events(
                {"user_input": user_input},
                config=config,
                version="v2"
            ):

                event_type = event.get("event")
                node_name = event.get("name")

                # Node started
                if (
                    event_type == "on_chain_start"
                    and node_name in NODE_LABELS
                ):

                    payload = {
                        "type": "stage_start",
                        "node": node_name,
                        "label": NODE_LABELS[node_name]
                    }

                    yield f"data: {json.dumps(payload)}\n\n"

                # Node finished
                elif (
                    event_type == "on_chain_end"
                    and node_name in NODE_LABELS
                ):

                    payload = {
                        "type": "stage_end",
                        "node": node_name,
                        "label": NODE_LABELS[node_name]
                    }

                    yield f"data: {json.dumps(payload)}\n\n"

                await asyncio.sleep(0)

            # Get current graph state
            final_state = workflow.get_state(config)

            payload = {
                "type": "done",
                "thread_id": thread_id,
                "result": final_state.values
            }

            yield f"data: {json.dumps(payload)}\n\n"

        except Exception as error:

            payload = {
                "type": "error",
                "message": str(error)
            }

            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/api/approval")
def approval(request: dict):

    thread_id = request.get("thread_id")
    decision = request.get("decision")
    submitted_cart = request.get("cart")

    if not thread_id:
        return {
            "error": "thread_id is required"
        }

    if decision not in ["approved", "rejected"]:
        return {
            "error": "decision must be approved or rejected"
        }

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    try:

        # Get the current paused LangGraph state
        current_state = workflow.get_state(config).values

        # -----------------------------------
        # REJECTION
        # -----------------------------------

        if decision == "rejected":

            result = workflow.invoke(
                Command(resume=decision),
                config=config
            )

            return {
                "thread_id": thread_id,
                "result": result
            }

        # -----------------------------------
        # APPROVAL
        # -----------------------------------

        if not submitted_cart or not isinstance(
            submitted_cart,
            list
        ):
            return {
                "error": "Cart is required for approval"
            }

        selected_product = current_state.get(
            "selected_product"
        )

        recommended_products = current_state.get(
            "recommended_products",
            []
        )

        # -----------------------------------
        # ALLOWED PRODUCTS
        # -----------------------------------

        allowed_products = []

        if selected_product:
            allowed_products.append(
                selected_product
            )

        allowed_products.extend(
            recommended_products
        )

        allowed_ids = {
            product["id"]
            for product in allowed_products
        }

        submitted_ids = [
            product.get("id")
            for product in submitted_cart
        ]

        # -----------------------------------
        # VALIDATE CART
        # -----------------------------------

        if any(
            product_id not in allowed_ids
            for product_id in submitted_ids
        ):
            return {
                "error": "Invalid product in basket"
            }

        # Main AI-selected product must remain
        if not selected_product:
            return {
                "error": "Selected product is missing"
            }

        selected_id = selected_product["id"]

        if selected_id not in submitted_ids:
            return {
                "error": "The main selected product cannot be removed"
            }

        # -----------------------------------
        # REBUILD CART USING SERVER DATA
        # -----------------------------------

        verified_cart = []

        for product_id in submitted_ids:

            for product in allowed_products:

                if product["id"] == product_id:

                    verified_cart.append(product)

                    break

        # -----------------------------------
        # CALCULATE TOTAL ON SERVER
        # -----------------------------------

        total_amount = sum(
            product["price"]
            for product in verified_cart
        )

        # -----------------------------------
        # UPDATE LANGGRAPH STATE
        # -----------------------------------

        workflow.update_state(
            config,
            {
                "cart": verified_cart,
                "total_amnt": total_amount
            }
        )

        # -----------------------------------
        # RESUME APPROVAL
        # -----------------------------------

        result = workflow.invoke(
            Command(resume=decision),
            config=config
        )

        return {
            "thread_id": thread_id,
            "result": result
        }

    except Exception as error:

        print(
            "Approval processing failed:",
            error
        )

        return {
            "error": "Unable to process approval"
        }

@app.post("/api/payment/verify")
def payment_verify(request: dict):

    thread_id = request.get("thread_id")

    if not thread_id:
        return {
            "error": "thread_id is required"
        }

    payment_data = {
        "razorpay_payment_id": request.get("razorpay_payment_id"),
        "razorpay_order_id": request.get("razorpay_order_id"),
        "razorpay_signature": request.get("razorpay_signature")
    }

    # Check that all Razorpay values were received
    if not all(payment_data.values()):
        return {
            "error": "Incomplete Razorpay payment data"
        }

    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    # Resume the paused payment_wait_node
    result = workflow.invoke(
        Command(resume=payment_data),
        config=config
    )

    return {
        "thread_id": thread_id,
        "result": result
    }

@app.get("/api/merchant/dashboard")
def merchant_dashboard():

    import sqlite3
    import ast
    from pathlib import Path

    db_file = Path(__file__).resolve().parent / "data" / "commerce.db"

    connection = sqlite3.connect(db_file)
    connection.row_factory = sqlite3.Row

    rows = connection.execute("""
        SELECT *
        FROM audit_logs
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    transactions = [dict(row) for row in rows]

    successful = [
        row for row in transactions
        if row["payment_status"] == "success"
    ]

    failed = [
        row for row in transactions
        if row["payment_status"] == "failed"
    ]

    revenue = sum(
        row["total_amnt"] or 0
        for row in successful
    )

    average_order_value = (
        revenue / len(successful)
        if successful
        else 0
    )

    # Analyze products purchased through AI Buyer
    product_counts = {}
    category_counts = {}
    upsell_count = 0

    for row in successful:

        try:
            selected_product = ast.literal_eval(
                row["selected_product"]
            )

            product_name = selected_product.get(
                "name",
                "Unknown Product"
            )

            category = selected_product.get(
                "category",
                "Unknown"
            )

            product_counts[product_name] = (
                product_counts.get(product_name, 0) + 1
            )

            category_counts[category] = (
                category_counts.get(category, 0) + 1
            )

        except Exception:
            pass

        try:
            recommended = ast.literal_eval(
                row["recommended_products"]
            )

            if recommended:
                upsell_count += 1

        except Exception:
            pass

    top_product = (
        max(product_counts, key=product_counts.get)
        if product_counts
        else "No data yet"
    )

    top_category = (
        max(category_counts, key=category_counts.get)
        if category_counts
        else "No data yet"
    )

    return {
        "total_transactions": len(transactions),
        "successful_transactions": len(successful),
        "failed_transactions": len(failed),
        "revenue": revenue,
        "average_order_value": average_order_value,
        "top_product": top_product,
        "top_category": top_category,
        "upsell_count": upsell_count,
        "transactions": transactions
    }

@app.post("/api/cart/order")
def create_cart_order(request: dict):

    cart = request.get("cart", [])

    if not cart:
        return {"error": "Cart is empty"}

    total_amount = 0

    for product in cart:
        if "price" not in product:
            return {"error": "Invalid product data"}

        total_amount += product["price"]

    amount_in_paise = int(total_amount * 100)

    order = razorpay_client.order.create({
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": "cart_receipt_001"
    })

    return {
        "order_id": order["id"],
        "key_id": os.getenv("RAZORPAY_KEY_ID"),
        "amount": amount_in_paise,
        "currency": "INR"
    }

@app.post("/api/cart/payment/verify")
def verify_cart_payment(request: dict):

    import sqlite3
    from pathlib import Path

    payment_data = {
        "razorpay_order_id": request.get("razorpay_order_id"),
        "razorpay_payment_id": request.get("razorpay_payment_id"),
        "razorpay_signature": request.get("razorpay_signature")
    }

    cart = request.get("cart", [])
    total_amount = request.get("total_amount", 0)

    if not all(payment_data.values()):
        return {
            "error": "Incomplete Razorpay payment data"
        }

    if not cart:
        return {
            "error": "Cart data is missing"
        }

    try:

        # Verify Razorpay payment signature
        razorpay_client.utility.verify_payment_signature(
            payment_data
        )

        # Payment is successfully verified
        payment_status = "success"

        # Save transaction to audit database
        db_file = (
            Path(__file__).resolve().parent
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
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Regular Cart Purchase",
            str(cart[0]),
            str(cart[1:]),
            total_amount,
            "not_required",
            payment_data["razorpay_order_id"],
            payment_status
        ))

        connection.commit()
        connection.close()

        return {
            "status": "success",
            "message": "Payment verified and transaction recorded."
        }

    except Exception as error:

        print("Cart payment verification failed:", error)

        return {
            "status": "failed",
            "message": "Payment verification failed."
        }

    