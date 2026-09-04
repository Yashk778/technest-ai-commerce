# TechNest — AI Buyer & Agentic Commerce

TechNest is an AI-powered commerce platform that demonstrates how an AI Buyer Agent can understand natural-language shopping intent, search and rank products, optimize a basket, recommend complementary products, and execute a payment workflow through Razorpay with explicit human approval.

The project is designed as a practical demonstration of AI-driven and agentic commerce, combining LLM reasoning, structured product data, human-in-the-loop controls, payment infrastructure, and merchant intelligence.

---

## 🚀 Overview

Traditional e-commerce generally requires the user to manually search, compare, select, add products to a cart, and proceed through checkout.

TechNest explores a different approach:

The user describes what they want in natural language, and an AI Buyer handles the product discovery and purchase-planning process.

For example:

> I need a gaming setup under ₹1,00,000 with a powerful GPU and enough storage.

The AI Buyer can:

1. Understand the user's requirements
2. Search the TechNest product catalog
3. Analyze and rank relevant products
4. Recommend complementary products
5. Build and optimize a purchase basket
6. Respect the user's budget
7. Present the proposed purchase plan
8. Wait for explicit human approval
9. Create a Razorpay order
10. Open Razorpay Checkout
11. Wait for the external payment result
12. Verify the payment signature
13. Handle payment success or failure
14. Record the transaction and agent activity

The core principle is:

**The AI can reason and prepare a purchase, but it does not autonomously spend money without explicit human approval.**

---

## ✨ Key Features

### 🤖 AI Buyer Agent

- Natural-language shopping requests
- User requirement understanding
- Product discovery
- Product comparison
- Product ranking
- Budget-aware recommendations
- Complementary product recommendations
- Upselling and cross-selling
- Automated basket construction
- Purchase-plan generation

### 🧑‍💻 Human-in-the-Loop Approval

The agent pauses before the purchase process proceeds.

The user can:

- Review the recommended products
- Review the basket
- Review the total amount
- Reject the purchase
- Approve the purchase
- Continue to Razorpay Checkout

This establishes a clear boundary between AI decision-making and financial execution.

### 💳 Razorpay Integration

TechNest integrates Razorpay in Test Mode to demonstrate a complete payment workflow.

The integration covers:

- Razorpay order creation
- Checkout preparation
- Razorpay Checkout
- Payment response handling
- Payment signature verification
- Payment success handling
- Payment failure handling

No real-money transactions are intended.

### 📊 Merchant Dashboard

The merchant interface provides visibility into:

- Transactions
- Revenue
- Average Order Value
- Top products
- Product categories
- AI upsells
- Growth recommendations
- Agent activity
- Audit trail

### 🧾 Agent Audit Trail

Important events throughout the AI Buyer workflow can be recorded for inspection.

Examples include:

- User request
- Intent understanding
- Catalog search
- Product ranking
- Recommendation generation
- Basket construction
- Human approval
- Razorpay order creation
- Payment verification
- Transaction completion
- Payment failure

---

## 🧠 AI Buyer Workflow

The TechNest AI Buyer follows a stateful workflow:

User Shopping Request  
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
Human Approval  
↓  
Approve → Create Razorpay Order  
↓  
Prepare Checkout  
↓  
Razorpay Checkout  
↓  
External Payment  
↓  
Verify Payment  
↓  
Success → Record Transaction  
↓  
Failure → Handle Failure  
↓  
Audit Trail  
↓  
End

If the user rejects the proposed purchase:

User Shopping Request  
↓  
AI Buyer Workflow  
↓  
Build Purchase Plan  
↓  
Human Approval  
↓  
Reject  
↓  
Audit  
↓  
End

---

## 🏗️ System Architecture

The application is divided into a React frontend, FastAPI backend, LangGraph agent workflow, product catalog, payment integration, and merchant intelligence layer.

User  
↓  
React + Vite Frontend  
↓  
FastAPI Backend  
↓  
LangGraph AI Buyer  
↓  
AI / LLM Reasoning  
↓  
Product Catalog  
↓  
Product Ranking & Recommendations  
↓  
Basket Construction  
↓  
Human Approval Gate  
↓  
Razorpay Integration  
↓  
Payment Verification  
↓  
Transaction & Audit Data  
↓  
Merchant Dashboard

---

## 🔄 LangGraph Workflow

LangGraph is used to orchestrate the AI Buyer as a stateful graph rather than a single LLM request.

The major stages include:

- Understand User Intent
- Search Catalog
- Analyze & Rank Products
- Upsell / Cross-sell
- Build Basket
- Human Approval
- Create Razorpay Order
- Prepare Checkout
- Payment Wait
- Verify Payment
- Handle Payment Failure
- Audit

The workflow maintains state across these stages and supports a human approval boundary before financial execution.

The payment stage can pause while the external Razorpay Checkout process takes place and then continue after the payment result is returned.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- LangGraph
- LangChain
- Groq
- Razorpay SDK

### AI / Agent Framework

- LangGraph stateful workflows
- LLM-based reasoning
- Structured agent state
- Human-in-the-loop approval
- Interrupt/resume workflow
- AI product ranking
- AI cross-sell recommendations

### Data

- JSON product catalog
- SQLite for local development
- PostgreSQL for production persistence

### Development & Deployment

- Git
- GitHub
- Railway
- Render
- PostgreSQL

---

## 📁 Project Structure

AI Growth and Agentic Commerce/
│
├── README.md
├── .gitignore
├── requirements.txt
├── .env.example
│
├── backend/
│   ├── api.py
│   ├── audit.py
│   ├── config.py
│   │
│   ├── data/
│   │   ├── products.json
│   │   └── products/
│   │
│   ├── graph/
│   │   ├── __init__.py
│   │   ├── state.py
│   │   ├── nodes.py
│   │   └── graph.py
│   │
│   └── tools/
│       └── catalog.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Hero.jsx
    │   │   ├── CategorySection.jsx
    │   │   ├── Cart.jsx
    │   │   └── Merchant.jsx
    │   │
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    │
    ├── package.json
    ├── vite.config.js
    └── index.html

---

## ⚙️ Local Development

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js
- npm
- Git

### 1. Clone the Repository

Clone the GitHub repository and move into the project directory.

    git clone https://github.com/Yashk778/technest-ai-commerce.git
    cd technest-ai-commerce

### 2. Create a Python Virtual Environment

    python -m venv .venv

On Windows, activate it with:

    .venv\Scripts\activate

### 3. Install Backend Dependencies

    pip install -r requirements.txt

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Example configuration:

    LANGCHAIN_API_KEY=your_langchain_key
    LANGCHAIN_TRACING_V2=true
    LANGCHAIN_PROJECT=technest

    GROQ_API_KEY=your_groq_key

    RAZORPAY_KEY_ID=your_razorpay_test_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_test_secret

    DATABASE_URL=your_postgresql_database_url

Never commit the real `.env` file or API keys to GitHub.

The repository `.gitignore` excludes environment secrets and local-only files.

### 5. Start the Backend

From the project root:

    uvicorn backend.api:app --reload

The local backend runs at:

    http://127.0.0.1:8000

### 6. Start the Frontend

Open another terminal and move into the frontend directory:

    cd frontend

Install dependencies:

    npm install

Start the Vite development server:

    npm run dev

The frontend runs at:

    http://localhost:5173

---

## 💳 Payment Flow

TechNest uses Razorpay Test Mode.

The payment lifecycle is:

AI Buyer  
↓  
Human Approval  
↓  
Create Razorpay Order  
↓  
Prepare Checkout  
↓  
Razorpay Checkout  
↓  
External Payment  
↓  
Payment Response  
↓  
Signature Verification  
↓  
Success or Failure  
↓  
Transaction / Audit

The payment step is intentionally separated from AI reasoning.

The AI can recommend products and prepare a purchase plan, but the financial action requires explicit human approval.

---

## 🔐 Safety & Control

TechNest demonstrates several important principles for controlled agentic commerce.

### Human Approval

The AI must reach a human approval gate before the purchase process proceeds.

### Payment Verification

Payment information is verified server-side using Razorpay's signature verification mechanism.

### Test Mode

Razorpay is configured for Test Mode rather than real-money transactions.

### Budget Awareness

The AI considers the user's stated budget while constructing and optimizing the basket.

### Explicit Workflow States

The agent follows clearly defined workflow stages rather than performing an uncontrolled sequence of actions.

### Auditability

Important agent and commerce events can be recorded for inspection.

### Separation of Responsibilities

The AI recommendation process is separated from financial execution.

---

## 📦 Product Catalog

TechNest uses a fictional merchant catalog containing products across multiple categories.

The catalog is structured so that the AI Buyer can reason over product information.

Product information can include:

- Product name
- Category
- Price
- Description
- Specifications
- Product image
- Compatibility information
- Product identifiers

The catalog is intentionally controlled and AI-readable so the project can demonstrate product discovery, ranking, and recommendation workflows.

---

## 🛒 AI Recommendations

The AI Buyer can recommend complementary products based on the user's main purchase.

For example:

Main Product  
├── Compatible Accessory  
├── Storage / Upgrade  
├── Peripheral  
└── Other Complementary Product

These recommendations are intended to improve basket completeness while considering the user's requirements and budget.

---

## 📊 Merchant Dashboard

TechNest also includes a merchant-facing dashboard.

The dashboard demonstrates how merchant-side intelligence can be generated from agentic commerce activity.

It can surface:

- Transaction activity
- Revenue
- Average Order Value
- Top-performing products
- Category performance
- AI upsell opportunities
- Growth recommendations
- Purchase activity
- Agent audit history

This gives the merchant visibility into both commerce performance and AI-driven purchasing behavior.

---

## 🧾 Agent Audit Trail

The system records important events throughout the agent workflow.

Examples include:

- User request received
- User intent understood
- Catalog searched
- Products ranked
- Recommendations generated
- Basket created
- Human approval requested
- Purchase approved
- Purchase rejected
- Razorpay order created
- Checkout prepared
- Payment verified
- Payment failed
- Transaction completed

The audit trail makes the agent's commerce workflow easier to inspect and understand.

---

## 🌐 Deployment Architecture

The intended deployment architecture is:

GitHub  
├── Railway Backend  
│   ├── FastAPI  
│   ├── LangGraph  
│   ├── Groq  
│   ├── Razorpay  
│   └── PostgreSQL  
│  
└── Render Frontend  
    └── React + Vite

### Backend — Railway

The FastAPI backend is intended to run on Railway.

Responsibilities include:

- FastAPI API
- LangGraph workflow
- AI calls
- Razorpay integration
- Product catalog access
- Audit logging
- Production database connection

### Database — PostgreSQL

PostgreSQL is intended for production persistence.

It can be used for persistent application data and LangGraph workflow state.

### Frontend — Render

The React/Vite frontend is deployed separately on Render.

The frontend communicates with the deployed FastAPI backend through the configured API URL.

---

## 🧠 Why LangGraph?

LangGraph is used because the TechNest workflow is not simply a single LLM request.

The AI Buyer needs to:

- Maintain state across multiple stages
- Pass information between workflow nodes
- Pause for human approval
- Resume after external events
- Handle different execution paths
- Handle payment success and failure branches
- Keep the workflow inspectable
- Maintain controlled execution boundaries

A stateful graph-based agent architecture is therefore a natural fit for the project.

---

## 🎯 Project Goals

TechNest was built to demonstrate the intersection of:

- Generative AI
- AI agents
- Agentic commerce
- Human-in-the-loop systems
- E-commerce
- Payment infrastructure
- AI recommendations
- Merchant analytics
- Workflow orchestration
- Transaction auditability

The central question behind the project is:

> What happens when an AI moves beyond recommending products and starts preparing an actual purchase?

TechNest demonstrates that workflow while maintaining a clear human control point before financial execution.

---

## 🔮 Future Improvements

Potential future improvements include:

- Persistent LangGraph checkpoints using PostgreSQL
- More advanced product ranking
- Personalized buyer profiles
- Inventory-aware recommendations
- Real-time inventory validation
- Multi-merchant catalogs
- Agent performance analytics
- More advanced merchant growth recommendations
- Automated merchant growth experiments
- Production-grade authentication
- Production-grade authorization
- Advanced fraud and risk controls
- Better observability and monitoring
- More comprehensive transaction analytics
- Improved agent evaluation
- More sophisticated basket optimization

---

## 📌 Current Project Status

The project currently includes:

- AI Buyer workflow
- Product catalog
- Product recommendations
- Basket construction
- Human approval flow
- LangGraph workflow orchestration
- Razorpay Test Mode integration
- Payment verification
- Payment failure handling
- Merchant dashboard
- Audit trail
- React frontend
- FastAPI backend
- GitHub repository

The local development version is functional and ready for deployment work.

---

## 🔗 Repository

GitHub Repository:

https://github.com/Yashk778/technest-ai-commerce

---

## 📜 Disclaimer

TechNest is a demonstration and educational project.

The product catalog is fictional.

Razorpay is used in Test Mode for development and demonstration purposes.

No real-money transactions are intended through this project.

The project should not be considered a production-ready financial or commerce system without additional security, authentication, authorization, infrastructure, monitoring, compliance, and operational controls.

---

## 👨‍💻 TechNest

**TechNest — AI Buyer & Agentic Commerce**

An AI-powered commerce workflow demonstrating how an AI Buyer can understand intent, discover products, optimize a basket, request human approval, and prepare a controlled payment workflow.