# TechNest — AI Buyer & Agentic Commerce

## AI Growth & Agentic Commerce — Razorpay Buildathon

TechNest is a reference implementation of AI-powered agentic commerce built around a simple idea:

> Let an AI buyer agent understand a user's shopping intent, search a merchant catalog, recommend the best product, optimize complementary purchases within a budget, and prepare the transaction — while keeping every money action explainable, bounded, and explicitly gated by the human.

The project demonstrates a complete AI-commerce workflow using LangGraph, FastAPI, React, SQLite, and Razorpay Test Mode.

The AI does not autonomously charge the customer. It can reason about products and prepare a purchase plan, but the actual purchase is protected by a human approval gate before a Razorpay order is created.

---

# Live Demo

### Customer Storefront

https://technest-ai-commerce.onrender.com

### Backend API

https://technest-ai.duckdns.org

The frontend is deployed on Render, while the FastAPI/LangGraph backend runs on AWS EC2 behind Nginx + HTTPS.

Razorpay is used in Test Mode, so no real money is charged.

---

# Overview

TechNest combines a traditional e-commerce storefront with an AI Buyer Agent.

A user can type a natural-language shopping request such as:

```text
Find me a laptop under ₹70,000 with 16GB RAM
```

or:

```text
I need a phone under ₹40,000 with at least 8GB RAM,
256GB storage, a good camera and strong battery life.
```

The AI agent then:

1. Understands the user's shopping intent.
2. Normalizes natural product-category variations.
3. Searches the merchant catalog.
4. Applies hard constraints such as category and budget.
5. Ranks matching products according to the user's preferences.
6. Identifies useful complementary products.
7. Builds a purchase plan.
8. Explains the recommendation and total amount.
9. Waits for explicit human approval.
10. Creates a Razorpay Test Mode order.
11. Opens Razorpay Checkout.
12. Waits for the external payment result.
13. Verifies successful Razorpay payments.
14. Handles failed payments gracefully.
15. Records the transaction in an audit trail.
16. Surfaces transaction and growth insights in the merchant dashboard.

The goal is not simply to build an AI shopping chatbot.

The goal is to demonstrate a bounded, explainable and human-controlled agentic commerce workflow.

---

# Key Features

## 1. AI Buyer Agent

The AI Buyer Agent converts natural-language shopping requests into structured intent.

Example:

```text
User:
Find me a laptop under ₹70,000 with 16GB RAM
```

The agent extracts information such as:

```text
Category: laptop
Budget: ₹70,000
Requirements:
- 16GB RAM
```

The structured intent is then passed through the LangGraph workflow.

---

## 2. Natural-Language Category Normalization

Users do not always use the exact category names stored in the merchant catalog.

TechNest therefore normalizes common variations before catalog search.

Examples:

```text
lap       → laptop
laptops   → laptop
headset   → headphones
earbuds   → headphones
mice      → mouse
keyboards → keyboard
screen    → monitor
display   → monitor
phone     → smartphone
mobile    → smartphone
```

Supported canonical categories:

```text
laptop
headphones
keyboard
mouse
monitor
smartphone
```

---

## 3. Budget-Bounded Product Search

The catalog search stage applies hard constraints before products are passed to the ranking stage.

The catalog tool checks:

- Requested category
- Maximum budget

Products outside the requested category or above the user's budget are excluded.

This keeps the AI's recommendations bounded by the user's explicit financial constraint.

---

## 4. AI Product Ranking

After catalog filtering, the AI analyzes the remaining products against the user's preferences.

The ranking stage considers the user's requirements and produces:

- Selected product
- Product reasoning
- Recommendation explanation

This separates hard constraints from preference-based reasoning.

Example:

```text
Hard constraint:
Laptop must cost ≤ ₹70,000

Preference:
User wants 16GB RAM
```

---

## 5. AI Upsell / Cross-Sell

After selecting the primary product, the agent can identify complementary products from the merchant catalog.

Examples:

```text
Laptop
+
Mouse
+
Keyboard
```

or:

```text
Smartphone
+
Headphones
```

The recommendations remain bounded by the user's original budget and purchase intent.

The goal is not uncontrolled upselling.

The goal is to demonstrate AI-assisted basket optimization.

---

## 6. Human-in-the-Loop Approval

Before any money-related action happens, the workflow stops and asks for explicit user approval.

The AI presents:

- Selected product
- Recommended complementary products
- Individual prices
- Total amount
- Reasoning

The user can then:

```text
Approve
```

or:

```text
Reject
```

Only after approval does the workflow proceed toward Razorpay order creation.

This is implemented using LangGraph's interrupt-based human-in-the-loop workflow.

---

## 7. Razorpay Integration

TechNest integrates Razorpay Test Mode into the AI commerce workflow.

After approval:

```text
AI Recommendation
        ↓
Human Approval
        ↓
Create Razorpay Order
        ↓
Prepare Checkout
        ↓
Razorpay Checkout
        ↓
Payment Result
        ↓
Verify / Handle Failure
```

Successful payments are verified using the Razorpay payment signature before the transaction is treated as successful.

No real money is charged during the demonstration.

---

## 8. Payment Failure Handling

Payment failure is treated as a first-class workflow outcome.

If the user selects a failed payment option in Razorpay Test Mode:

```text
Razorpay Payment Failed
        ↓
Frontend captures failure event
        ↓
Backend receives failure
        ↓
LangGraph workflow resumes
        ↓
Failure is handled
        ↓
Audit trail is updated
        ↓
Merchant Dashboard shows:
Payment: failed
```

The customer receives a clear failure state instead of being left in an unfinished workflow.

Example:

```text
PAYMENT FAILED

We couldn't complete your payment.

Your payment was not completed and your TechNest order was not confirmed.
The failed transaction has been recorded in the audit trail.
```

---

## 9. No-Match Handling

The system handles cases where no product satisfies the user's requirements and budget.

Instead of sending an empty product list through the ranking model, the workflow detects the condition early.

Example:

```text
NO MATCH FOUND

We couldn't find a suitable product.

No product in the TechNest catalog matches your requirements and budget.

[Try another search]
```

---

## 10. Merchant Dashboard

TechNest includes a merchant-facing dashboard showing commerce activity generated by the AI buyer workflow.

The dashboard provides:

- Total transactions
- Revenue
- Average Order Value
- Top products
- Top categories
- AI upsells
- Growth recommendation
- Transaction audit trail

The dashboard also distinguishes successful and failed payment outcomes.

Example:

```text
Request:
Find me a smartphone under ₹40,000 with at least 8GB RAM,
256GB storage, a good camera, and strong battery life.

Amount:
₹34,999

Approval:
approved

Payment:
failed
```

---

# AI Buyer Workflow

```text
START
  ↓
Understand User Intent
  ↓
Search Catalog
  ↓
Analyze & Rank Products
  ↓
Upsell / Cross-sell
  ↓
Build Basket / Purchase Plan
  ↓
HUMAN GATE
  ├── REJECT → Audit → END
  │
  └── APPROVE
        ↓
      Create Razorpay Order
        ↓
      Prepare Checkout
        ↓
      Wait for Payment
        ↓
      Razorpay Checkout
        ↓
      Verify Payment
        ├── SUCCESS → Audit → END
        │
        └── FAILURE → Handle Failure → Audit → END
```

---

# System Architecture

```text
                         INTERNET
                             │
                             ▼
              ┌──────────────────────────┐
              │     Render Frontend      │
              │      React + Vite        │
              └────────────┬─────────────┘
                           │ HTTPS
                           ▼
              ┌──────────────────────────┐
              │        DuckDNS           │
              │ technest-ai.duckdns.org  │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │        AWS EC2           │
              │                          │
              │        Nginx :443        │
              │           │              │
              │           ▼              │
              │    FastAPI :8000         │
              │           │              │
              │           ▼              │
              │      LangGraph           │
              │           │              │
              │           ▼              │
              │      Razorpay API        │
              │                          │
              │      SQLite Audit DB     │
              └──────────────────────────┘
```

---

# LangGraph Workflow

The agent is organized as a stateful LangGraph workflow.

## Main Nodes

### `understand_intent`

Converts the user's natural-language request into structured shopping intent and normalizes the category.

### `search_catalog`

Searches the merchant catalog using hard constraints:

```text
category
budget
```

### `Rank_products`

Analyzes matching products and selects the best product. If no products are available, the node exits gracefully.

### `upsell_crosssell_products`

Identifies complementary products that may improve the user's purchase and is guarded against the no-product case.

### `Build_purchase_plan`

Creates the proposed basket and total amount shown to the user.

### Human Approval Gate

The workflow pauses using LangGraph's interrupt mechanism. The user must explicitly approve the purchase.

### `create_razorpay_order`

Creates a Razorpay Test Mode order after approval.

### `payment_wait_node`

Pauses the workflow while the external Razorpay Checkout process completes. The workflow can resume with either a successful or failed payment state.

### `verify_payment`

For successful payments, the Razorpay signature is verified. Failed payment states are passed to the failure-handling path.

### `handle_failure`

Handles unsuccessful payment outcomes without treating the transaction as successful.

### `audit_transaction`

Records the final transaction outcome, including information such as:

```text
User request
Selected product
Basket
Amount
Approval status
Payment status
Razorpay order information
Timestamp
```

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Python
- FastAPI
- LangChain
- LangGraph

## AI

- Structured LLM output
- Intent extraction
- Product ranking
- Recommendation reasoning

## Payments

- Razorpay Test Mode
- Razorpay Checkout
- Razorpay order creation
- Razorpay payment signature verification

## Database

- SQLite

## Deployment

- AWS EC2
- Nginx
- Let's Encrypt
- DuckDNS
- Render
- GitHub

---

# Project Structure

```text
AI Growth and Agentic Commerce/
│
├── README.md
├── backend/
│   ├── api.py
│   ├── audit.py
│   ├── config.py
│   ├── __init__.py
│   ├── data/
│   │   ├── products.json
│   │   ├── products/
│   │   └── commerce.db
│   ├── graph/
│   │   ├── __init__.py
│   │   ├── state.py
│   │   ├── nodes.py
│   │   └── graph.py
│   └── tools/
│       └── catalog.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── Merchant.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .env
├── .gitignore
├── requirements.txt
└── exp.py
```

---

# Local Development

## 1. Clone the repository

```bash
git clone https://github.com/Yashk778/technest-ai-commerce.git
cd technest-ai-commerce
```

## 2. Create a Python virtual environment

### Windows

```powershell
python -m venv .venv
.venv\Scriptsctivate
```

### Linux / EC2

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure environment variables

Create a `.env` file in the project root:

```env
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
FRONTEND_URL=http://localhost:5173
```

Do not commit `.env` to GitHub.

## 5. Start the FastAPI backend

```bash
uvicorn backend.api:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

## 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

For local development:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart Vite after changing environment variables.

---

# Payment Flow

```text
User Shopping Request
        ↓
AI understands intent
        ↓
Catalog search
        ↓
Product ranking
        ↓
Cross-sell
        ↓
Purchase plan
        ↓
Human approval
        ↓
Razorpay order creation
        ↓
Razorpay Checkout
        ↓
Payment result
        ↓
 ┌───────────────┬────────────────┐
 │               │                │
 ▼               ▼                │
SUCCESS        FAILURE             │
 │               │                │
 ▼               ▼                │
Verify         Handle              │
Signature      Failure             │
 │               │                │
 └───────┬───────┘                │
         ▼                        │
      Audit Trail                 │
         ▼                        │
        END                       │
```

---

# Successful Payment

For a successful payment:

1. Razorpay Checkout returns payment information.
2. The backend resumes the LangGraph workflow.
3. Razorpay signature verification is performed.
4. The payment is marked successful.
5. The transaction is written to the audit trail.
6. The customer sees the order confirmation state.
7. The merchant dashboard reflects the successful transaction.

Example:

```text
PAYMENT VERIFIED

Order confirmed.

Razorpay signature verified.
```

---

# Failed Payment

For a failed payment:

1. Razorpay Checkout emits the payment failure event.
2. The frontend sends the failure information to the backend.
3. The backend resumes the LangGraph workflow with a failed payment state.
4. The workflow routes to `handle_failure`.
5. The failed transaction is written to the audit trail.
6. The merchant dashboard shows the failed payment.
7. The customer sees a clear failure message.

The system does not incorrectly treat a failed payment as a successful order.

---

# Safety & Control

The project follows the principle:

> **Every money action should be explainable, bounded and gated.**

## Explainable

The AI presents:

- Why a product was selected
- What products are being purchased
- Individual prices
- Total amount
- Recommendation reasoning

## Bounded

The system applies explicit constraints such as:

- Product category
- User budget
- Merchant catalog availability

The AI cannot invent products that are not present in the merchant catalog.

## Gated

A human approval step occurs before the Razorpay order is created.

The AI can prepare the transaction.

The human decides whether the transaction should proceed.

---

# Product Catalog

TechNest uses a controlled catalog containing 14 fictional products.

## Laptops

| ID | Product | Price |
|---|---|---:|
| LAP001 | TechNest ProBook 14 | ₹54,999 |
| LAP002 | TechNest LiteBook 15 | ₹44,999 |
| LAP003 | TechNest UltraBook X | ₹69,999 |

## Headphones

| ID | Product | Price |
|---|---|---:|
| HP001 | TechNest SoundMax Pro | ₹2,999 |
| HP002 | TechNest BassLite | ₹1,499 |

## Keyboards

| ID | Product | Price |
|---|---|---:|
| KB001 | TechNest Mechanical K1 | ₹2,499 |
| KB002 | TechNest Compact K2 | ₹1,799 |

## Mice

| ID | Product | Price |
|---|---|---:|
| MS001 | TechNest Precision M1 | ₹1,299 |
| MS002 | TechNest Basic M2 | ₹699 |

## Monitors

| ID | Product | Price |
|---|---|---:|
| MON001 | TechNest Vision 24 | ₹11,999 |
| MON002 | TechNest Vision 27 | ₹17,999 |

## Smartphones

| ID | Product | Price |
|---|---|---:|
| PH001 | TechNest Phone X1 | ₹24,999 |
| PH002 | TechNest Phone Pro | ₹34,999 |
| PH003 | TechNest Phone Lite | ₹16,999 |

---

# AI Recommendations

The recommendation system is designed around:

```text
Hard Constraints
        +
User Preferences
        ↓
Product Ranking
        ↓
Purchase Recommendation
```

For example:

```text
Find me a smartphone under ₹40,000
with at least 8GB RAM and 256GB storage.
```

The system first enforces budget and category constraints through catalog search.

The ranking stage then evaluates available products against the user's requirements.

The recommendation is presented to the user before any purchase action occurs.

---

# Regular Cart

TechNest also contains a traditional storefront experience alongside the AI Buyer.

Users can browse products by category and interact with the normal shopping cart.

The regular storefront provides:

- Product browsing
- Category sections
- Product cards
- Add to cart
- Cart management
- Checkout interaction

This demonstrates both:

```text
Traditional E-commerce
```

and:

```text
Agentic Commerce
```

within the same merchant experience.

---

# Merchant Dashboard

The merchant dashboard provides a separate view of commerce activity.

It is designed around the question:

> What is happening to the merchant's business as AI starts participating in shopping?

The dashboard can surface:

### Transactions

Track customer requests and their resulting transaction states.

### Revenue

Calculate revenue from successful transactions.

### Average Order Value

Calculate average order value from completed purchases.

### Top Products

Identify products appearing most frequently in completed transactions.

### Top Categories

Identify which merchant categories are generating activity.

### AI Upsells

Surface products introduced through the AI cross-sell process.

### Payment Outcomes

Separate:

```text
successful
failed
```

transactions.

---

# Merchant Growth Intelligence

TechNest includes a growth-oriented recommendation layer for the merchant dashboard.

The goal is to move beyond simply displaying transaction numbers.

The dashboard can use observed commerce activity to surface recommendations such as:

- Which products are performing well
- Which categories have demand
- Which complementary products are frequently recommended
- Where additional inventory or promotion may be useful
- How AI-assisted shopping can affect basket value

This represents the AI Growth side of the buildathon alongside the Agentic Commerce workflow.

---

# Agent Audit Trail

The audit trail is one of the core parts of TechNest.

Every important commerce transition should be traceable.

A transaction can contain:

```text
User Request
      ↓
Intent
      ↓
Selected Product
      ↓
Recommended Basket
      ↓
Total Amount
      ↓
Human Approval
      ↓
Razorpay Order
      ↓
Payment Status
      ↓
Final Outcome
```

This makes the agent's actions easier to inspect and explain.

The audit trail is also used by the merchant dashboard.

---

# Production Deployment

TechNest uses a split frontend/backend architecture.

## Frontend

The React frontend is deployed on Render.

Production:

```text
https://technest-ai-commerce.onrender.com
```

Render is connected to the GitHub repository and builds from the `main` branch.

Configuration:

```text
Root Directory:
frontend

Build Command:
npm install && npm run build

Publish Directory:
dist
```

## Backend

The backend runs on AWS EC2.

FastAPI runs internally on:

```text
127.0.0.1:8000
```

The application is managed by systemd.

## Nginx

Nginx acts as the reverse proxy:

```text
HTTPS :443
   ↓
Nginx
   ↓
FastAPI :8000
```

## HTTPS

Let's Encrypt provides the HTTPS certificate.

Production hostname:

```text
technest-ai.duckdns.org
```

DuckDNS points the hostname to the EC2 Elastic IP.

## Production Architecture

```text
Render
  │
  │ HTTPS
  ▼
React Frontend
  │
  │ HTTPS API Requests
  ▼
technest-ai.duckdns.org
  │
  ▼
AWS EC2
  │
  ▼
Nginx
  │
  ▼
FastAPI
  │
  ├── LangGraph
  ├── AI Model
  ├── Razorpay
  └── SQLite
```

---

# Why LangGraph?

LangGraph is used because the workflow is not a simple request-response chatbot.

The agent needs:

- Stateful execution
- Multiple reasoning stages
- Conditional routing
- Human approval
- External payment waiting
- Failure handling
- Resumable execution
- Auditable transitions

The workflow can therefore be represented explicitly:

```text
Intent
  ↓
Search
  ↓
Rank
  ↓
Cross-sell
  ↓
Purchase Plan
  ↓
Human Approval
  ↓
Payment
  ↓
Verification
  ↓
Audit
```

This makes the commerce workflow easier to control than an unconstrained autonomous agent.

---

# Demo Scenarios

## Scenario 1 — Successful AI Purchase

```text
Find me a laptop under ₹70,000 with 16GB RAM
```

Expected flow:

```text
Intent extracted
      ↓
Laptop catalog searched
      ↓
Matching products ranked
      ↓
Recommendation generated
      ↓
Purchase plan shown
      ↓
User approves
      ↓
Razorpay Checkout
      ↓
Successful Test Mode payment
      ↓
Signature verified
      ↓
Order confirmed
      ↓
Audit recorded
```

## Scenario 2 — Payment Failure

```text
Find me a smartphone under ₹40,000
with at least 8GB RAM, 256GB storage,
a good camera, and strong battery life.
```

Expected flow:

```text
Intent extracted
      ↓
Product selected
      ↓
Purchase plan generated
      ↓
User approves
      ↓
Razorpay Checkout
      ↓
Payment fails
      ↓
Failure event captured
      ↓
LangGraph resumes
      ↓
Failure handled
      ↓
Audit recorded
      ↓
Merchant dashboard:
Payment: failed
```

## Scenario 3 — No Product Match

```text
Find me a laptop under ₹10,000
```

Expected flow:

```text
Catalog search
      ↓
No matching products
      ↓
Ranking skipped
      ↓
NO MATCH FOUND
```

## Scenario 4 — Natural Category Variations

```text
Find me a lap under ₹70,000
```

```text
I need a headset under ₹3,000
```

```text
Show me a screen under ₹20,000
```

```text
I need mice for my setup
```

```text
Find me a phone under ₹40,000
```

These variations are normalized to the merchant's canonical categories.

---

# Testing Status

The major commerce paths have been tested locally and in production.

## Tested

### AI Intent Extraction

Natural-language shopping requests are converted into structured intent.

### Category Normalization

Tested variations include:

```text
lap
headset
mice
screen
phone
```

### Product Search

Budget and category filtering work against the TechNest catalog.

### No-Match Flow

Requests with no suitable catalog product are handled gracefully.

### Human Approval

The workflow pauses before the money action and requires explicit approval.

### Razorpay Checkout

Razorpay Test Mode Checkout opens correctly after approval.

### Successful Payment

Successful Test Mode payments are verified and recorded.

### Failed Payment

Razorpay Test Mode failures are captured, routed through the failure path, and recorded in the merchant audit trail.

### Merchant Dashboard

Transactions and payment outcomes are reflected in the dashboard.

### Production Deployment

The frontend and backend are deployed and communicating through HTTPS.

---

# Agentic Commerce Design Principles

TechNest is designed around several principles.

## 1. Human Control

The AI can recommend and prepare.

The human approves.

## 2. Explicit Financial Boundaries

The user's budget is treated as a hard constraint during catalog search.

## 3. Explainability

The system provides reasoning for product recommendations and exposes transaction information.

## 4. Controlled Catalog

The agent operates on the merchant's actual catalog rather than inventing products.

## 5. Graceful Failure

Failure is treated as an expected state.

The system handles:

```text
No product found
Payment failure
Rejected purchase
```

without leaving the workflow in an undefined state.

## 6. Auditability

Important agent actions and payment outcomes are recorded.

## 7. Resumable Agent Workflow

LangGraph allows the agent to pause and resume around human decisions and external payment events.

---

# Future Improvements

Possible future improvements include:

- Larger product catalogs
- Semantic product search
- More advanced preference extraction
- Inventory-aware recommendations
- Real-time inventory updates
- Personalized recommendations
- Customer profiles
- More sophisticated basket optimization
- Merchant analytics over longer time periods
- Product-level conversion analytics
- Webhook-based payment reconciliation
- Order management
- Refund workflows
- More advanced merchant growth recommendations
- Multi-agent shopping workflows
- Production payment support

These are intentionally separated from the current implementation so the existing system remains bounded and easy to demonstrate.

---

# Current Project Status

TechNest currently provides a working end-to-end demonstration of:

```text
AI Shopping Intent
        ↓
Structured Intent
        ↓
Category Normalization
        ↓
Catalog Search
        ↓
AI Product Ranking
        ↓
AI Cross-sell
        ↓
Purchase Plan
        ↓
Human Approval
        ↓
Razorpay Test Mode
        ↓
Payment Verification
        ↓
Failure Handling
        ↓
Audit Trail
        ↓
Merchant Dashboard
```

The project is deployed and accessible through the production frontend.

The main success and failure payment paths have been tested.

The no-product path has also been implemented and tested.

---

# Buildathon Track

## Razorpay AI Growth & Agentic Commerce

TechNest is positioned around both sides of the challenge.

### Agentic Commerce

The AI buyer agent:

- Understands user intent
- Searches the merchant catalog
- Selects products
- Builds a purchase plan
- Recommends complementary products
- Waits for human approval
- Initiates the payment workflow
- Handles payment outcomes

### AI Growth

The merchant dashboard:

- Tracks AI-assisted transactions
- Shows revenue
- Shows average order value
- Identifies top products
- Identifies top categories
- Tracks AI upsells
- Provides growth-oriented recommendations

---

# Project Positioning

TechNest is intentionally designed as a reference implementation rather than a fully autonomous shopping agent.

The core idea is:

```text
AI reasons
    ↓
AI recommends
    ↓
AI prepares
    ↓
Human approves
    ↓
Payment executes
    ↓
System verifies
    ↓
Everything important is audited
```

This keeps the system practical, demonstrable and aligned with the principle:

> **Every money action should be explainable, bounded and gated.**

---

# Links

### Live Demo

https://technest-ai-commerce.onrender.com

### Backend

https://technest-ai.duckdns.org

### GitHub Repository

https://github.com/Yashk778/technest-ai-commerce

---

# Disclaimer

TechNest is a demonstration/reference implementation created for the Razorpay AI Growth & Agentic Commerce buildathon.

The product catalog is fictional and created for demonstration purposes.

Razorpay is used in Test Mode during the demonstration.

No real customer payments are processed.

---

# Final Summary

TechNest demonstrates how an AI agent can participate in the commerce journey without removing human control.

The system combines:

```text
Natural Language
      +
AI Reasoning
      +
Merchant Catalog
      +
Budget Constraints
      +
Cross-sell Intelligence
      +
Human Approval
      +
Razorpay
      +
Payment Verification
      +
Failure Handling
      +
Auditability
      +
Merchant Growth Intelligence
```

The result is a complete prototype of explainable, bounded and human-gated agentic commerce.

---

## Built for Razorpay AI Growth & Agentic Commerce

**TechNest — AI Buyer & Agentic Commerce**

> AI can recommend the purchase.
> The human decides whether the money moves.
