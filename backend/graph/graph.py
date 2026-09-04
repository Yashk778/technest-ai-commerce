from langgraph.graph import StateGraph,START,END
from typing import TypedDict
from .state import AgentState
from .nodes import understand_intent,search_catalog,Rank_products,upsell_crosssell_products,Build_basket,hitlnode,create_razorpay_order,prepare_checkout,payment_wait_node,verify_payment,handle_failure,audit_transaction
from dotenv import load_dotenv
from langgraph.checkpoint.memory import InMemorySaver



load_dotenv()


graph = StateGraph(AgentState)

# Add nodes
graph.add_node('understand_intent',understand_intent)
graph.add_node('search_catalog',search_catalog)
graph.add_node('Rank_products',Rank_products)
graph.add_node('upsell_crosssell_products',upsell_crosssell_products)
graph.add_node('Build_basket',Build_basket)
graph.add_node('hitlnode',hitlnode)
graph.add_node('create_razorpay_order',create_razorpay_order)
graph.add_node('prepare_checkout',prepare_checkout)
graph.add_node('payment_wait_node',payment_wait_node)
graph.add_node('verify_payment',verify_payment)
graph.add_node('handle_failure',handle_failure)
graph.add_node('audit_transaction',audit_transaction)






# Add egdes 
graph.add_edge(START,'understand_intent')
graph.add_edge('understand_intent','search_catalog')
graph.add_edge('search_catalog','Rank_products')


def product_router(state:AgentState):
    if state.get('selected_product'):
        return 'product_found'
    else:
        return 'no_product'


graph.add_conditional_edges(
    'Rank_products',
    product_router,
    {
        'product_found':'upsell_crosssell_products',
        'no_product':END
    }
)

graph.add_edge('upsell_crosssell_products','Build_basket')
graph.add_edge('Build_basket','hitlnode')

# Approval router

def approval_router(state:AgentState):
    if state['approval'] == 'approved':
        return 'approved'
    else:
        return 'rejected'

# Payment status router

def payment_status_router(state: AgentState):
    if state['payment_status'] == 'success':
        return 'success'
    else:
        return 'failed'
    
    

graph.add_conditional_edges('hitlnode',approval_router,
    {
    "approved":'create_razorpay_order',
    "rejected":END
})
graph.add_edge('create_razorpay_order', 'prepare_checkout')
graph.add_edge('prepare_checkout','payment_wait_node')
graph.add_edge('payment_wait_node','verify_payment',)
graph.add_conditional_edges(
    'verify_payment',
    payment_status_router,
    {
        'success': 'audit_transaction',
        'failed': 'handle_failure'
    }
)

graph.add_edge('handle_failure','audit_transaction')

graph.add_edge('audit_transaction',END)

#save pasued state for hitl 

checkpointer = InMemorySaver()


# compile graph
workflow  = graph.compile(checkpointer=checkpointer)