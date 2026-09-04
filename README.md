# TechNest — AI Buyer & Agentic Commerce

TechNest is an AI-powered commerce platform that demonstrates how an AI Buyer Agent can understand natural-language shopping intent, search and rank products, optimize a basket, recommend complementary products, and execute a controlled payment workflow through Razorpay with explicit human approval.

The project is designed as a practical demonstration of AI-driven and agentic commerce, combining LLM reasoning, structured product data, human-in-the-loop controls, payment infrastructure, merchant intelligence, and transaction auditability.

---

## 🚀 Live Demo

**Live Application:**

https://technest-ai-commerce.onrender.com

**GitHub Repository:**

https://github.com/Yashk778/technest-ai-commerce

TechNest is deployed as a working end-to-end application.

- Frontend: Render
- Backend: AWS EC2
- Reverse Proxy: Nginx
- HTTPS: Let's Encrypt
- Backend Hostname: DuckDNS
- Payments: Razorpay Test Mode
- Database: SQLite

---

## 🚀 Overview

Traditional e-commerce generally requires the user to manually search, compare, select, add products to a cart, and proceed through checkout.

TechNest explores a different approach:

The user describes what they want in natural language, and an AI Buyer handles the product discovery and purchase-planning process.

For example:

> I need a coding laptop under ₹70,000 with 16GB RAM and good battery.

The AI Buyer can:

1. Understand the user's requirements
2. Search the TechNest product catalog
3. Filter products against the user's constraints
4. Analyze and rank relevant products
5. Recommend complementary products
6. Optimize the purchase basket
7. Respect the user's hard budget
8. Present the proposed purchase plan
9. Wait for explicit human approval
10. Create a Razorpay order
11. Open Razorpay Checkout
12. Wait for the external payment result
13. Verify the payment signature
14. Handle payment success or failure
15. Record the transaction and agent activity

The core principle is:

**The AI can reason and prepare a purchase, but it does not autonomously spend money without explicit human approval.**

---

## ✨ Key Features

### 🤖 AI Buyer Agent

- Natural-language shopping requests
- User requirement understanding
- Product discovery
- Product filtering
- Product comparison
- Product ranking
- Budget-aware recommendations
- Complementary product recommendations
- Upselling and cross-selling
- Automated basket construction
- Purchase-plan generation
- No-match handling

### 💰 Budget-Bounded Basket Optimization

The AI Buyer respects hard budget constraints while constructing the basket.

If the selected product consumes almost the entire budget, the system does not add an unaffordable complementary product.

For example:

```text
User budget: ₹35,000

Selected product:
TechNest Phone Pro
₹34,999

Remaining budget:
₹1

Result:
No add-on

Final total:
₹34,999
```

This prevents AI upselling from violating the user's stated budget.

---

### 🧑‍💻 Human-in-the-Loop Approval

The agent pauses before the purchase process proceeds.

The user can:

- Review the recommended product
- Review the basket
- Review the total amount
- Reject the purchase
- Approve the purchase
- Continue to Razorpay Checkout

This establishes a clear boundary between AI decision-making and financial execution.

The workflow is:

```text
AI Recommendation
        ↓
Purchase Plan
        ↓
Human Approval
   ┌────┴────┐
 Reject    Approve
   ↓          ↓
  END     Razorpay
```

If the user rejects the purchase:

```text
PURCHASE CANCELLED

Purchase rejected.

No payment was created and nothing was charged.
```

---

### 💳 Razorpay Integration

TechNest integrates Razorpay in Test Mode to demonstrate a complete payment workflow.

The integration covers:

- Razorpay order creation
- Checkout preparation
- Razorpay Checkout
- External payment handling
- Payment response handling
- Payment signature verification
- Payment success handling
- Payment failure handling

No real-money transactions are intended.

---

### 📊 Merchant Dashboard

The merchant interface provides visibility into:

- Total transactions
- Successful payments
- Failed payments
- Revenue
- Average Order Value
- Top products
- Top categories
- AI upsells
- Growth recommendations
- Agent activity
- Audit trail

The dashboard demonstrates how AI-driven commerce activity can also provide useful merchant-side intelligence.

---

### 🧾 Agent Audit Trail

Important events throughout the AI Buyer workflow are recorded for inspection.

Examples include:

- User request
- Selected product
- Recommended products
- Basket amount
- Human approval
- Razorpay order creation
- Payment status
- Transaction completion
- Payment failure

This creates an auditable record of the commerce workflow.

---

### ❌ No-Match Handling

TechNest also handles situations where no suitable product exists in the catalog.

For example:

> Find phone under ₹2 lakh

If no product satisfies the user's category and budget requirements, the system stops the purchase workflow instead of continuing into basket construction or payment.

The user receives:

```text
NO MATCH FOUND

We couldn't find a suitable product.

No product in the TechNest catalog matches
your requirements and budget.
```

This prevents unnecessary processing and ensures the system never attempts to purchase an undefined product.

---

## 🧠 AI Buyer Workflow

The TechNest AI Buyer follows a stateful LangGraph workflow:

```text
User Shopping Request
        ↓
Understand User Intent
        ↓
Search Catalog
        ↓
Analyze & Rank Products
        ↓
Product Found?
   ┌────┴────┐
  No        Yes
   ↓          ↓
  END    Upsell / Cross-sell
              ↓
        Build Basket
              ↓
       Purchase Plan
              ↓
       Human Approval
        ┌─────┴─────┐
     Reject       Approve
        ↓             ↓
       END       Create Razorpay Order
                        ↓
                 Prepare Checkout
                        ↓
                 Payment Wait
                        ↓
                Razorpay Checkout
                        ↓
                 External Payment
                        ↓
                Verify Payment
                  ┌─────┴─────┐
               Success      Failure
                  ↓             ↓
            Audit / END    Handle Failure
                                ↓
                           Audit / END
```

The workflow maintains state across these stages and supports interruption and resumption for human approval and external payment.

---

## 🏗️ System Architecture

The application is divided into a React frontend, FastAPI backend, LangGraph agent workflow, product catalog, Razorpay integration, database, and merchant intelligence layer.

```text
User
 ↓
React + Vite Frontend
 ↓
FastAPI Backend
 ↓
LangGraph AI Buyer
 ↓
LLM Reasoning
 ↓
Structured Product Catalog
 ↓
Product Filtering
 ↓
Product Ranking
 ↓
Cross-sell / Upsell
 ↓
Basket Construction
 ↓
Human Approval Gate
 ↓
Razorpay Order
 ↓
Razorpay Checkout
 ↓
Payment Verification
 ↓
Transaction / Audit Data
 ↓
Merchant Dashboard
```

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
- Audit Transaction

The workflow maintains state across these stages and supports controlled execution paths.

The payment stage can pause while the external Razorpay Checkout process takes place and then continue after payment information is returned.

This keeps the AI workflow separate from the external financial transaction while still allowing the two systems to work together.

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
- Uvicorn

### AI / Agent Framework

- LangGraph
- LangChain
- Groq
- LLM-based reasoning
- Stateful agent workflows
- Human-in-the-loop approval
- Interrupt/resume workflow
- AI product ranking
- AI cross-sell recommendations

### Payments

- Razorpay SDK
- Razorpay Test Mode

### Data

- JSON product catalog
- SQLite database
- Structured transaction and audit data

### Development & Deployment

- Git
- GitHub
- AWS EC2
- Nginx
- Let's Encrypt
- DuckDNS
- Render

---

## 📁 Project Structure

```text
AI Growth and Agentic Commerce/
│
├── README.md
├── .gitignore
├── requirements.txt
├── .env
│
├── backend/
│   ├── api.py
│   ├── audit.py
│   ├── config.py
│   │
│   ├── data/
│   │   ├── products.json
│   │   ├── products/
│   │   └── commerce.db
│   │
│   ├── graph/
│   │   ├── __init__.py
│   │   ├── state.py
│   │   ├── nodes.py
│   │   └── graph.py
│   │
│   └── tools/
│       ├── __init__.py
│       └── catalog.py
│
└── frontend/
    ├── public/
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
```

---

## ⚙️ Local Development

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Yashk778/technest-ai-commerce.git
cd technest-ai-commerce
```

### 2. Create a Python Virtual Environment

```bash
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

On Linux/macOS:

```bash
source .venv/bin/activate
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Example configuration:

```env
GROQ_API_KEY=your_groq_api_key

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_secret

FRONTEND_URL=http://localhost:5173
```

Never commit the real `.env` file or API keys to GitHub.

The repository `.gitignore` excludes environment secrets and local-only files.

### 5. Start the Backend

From the project root:

```bash
uvicorn backend.api:app --reload
```

The local backend runs at:

```text
http://127.0.0.1:8000
```

### 6. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

---

## 💳 Payment Flow

TechNest uses Razorpay Test Mode.

The payment lifecycle is:

```text
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
Server-side Signature Verification
   ↓
Success or Failure
   ↓
Transaction / Audit
```

The payment step is intentionally separated from AI reasoning.

The AI can recommend products and prepare a purchase plan, but the financial action requires explicit human approval.

---

## 🔐 Safety & Control

TechNest demonstrates several principles for controlled agentic commerce.

### Human Approval

The AI must reach a human approval gate before creating a Razorpay order.

### Payment Verification

Payment information is verified server-side using Razorpay's payment signature verification mechanism.

### Test Mode

Razorpay is configured for Test Mode rather than real-money transactions.

### Budget Enforcement

The AI considers the user's stated budget while constructing and optimizing the basket.

Hard budget constraints are enforced before complementary products are added.

### No-Match Protection

If no suitable product exists, the workflow stops instead of attempting to construct or purchase an invalid basket.

### Explicit Workflow States

The agent follows clearly defined workflow stages rather than performing an uncontrolled sequence of actions.

### Auditability

Important commerce events are recorded for inspection.

### Separation of Responsibilities

The AI recommendation process is separated from financial execution.

---

## 📦 Product Catalog

TechNest uses a fictional merchant catalog containing 14 products across multiple technology categories.

The catalog is structured so that the AI Buyer can reason over product information.

Product information can include:

- Product ID
- Product name
- Category
- Brand
- Price
- Description
- Specifications
- Compatibility information
- Product image

The catalog is intentionally controlled and AI-readable so the project can demonstrate product discovery, ranking, recommendation, and basket construction.

---

## 🛒 AI Recommendations

The AI Buyer can recommend complementary products based on the user's main purchase.

For example:

```text
Main Product
     ↓
Compatible Accessory
     ↓
Peripheral
     ↓
Storage / Upgrade
```

Recommendations are generated according to the user's requirements and available budget.

The system prevents recommendations from causing a hard budget constraint to be exceeded.

---

## 🛍️ Regular Cart

TechNest also supports a conventional storefront cart.

The regular cart follows a separate commerce flow:

```text
Add to Cart
    ↓
Cart
    ↓
Create Razorpay Order
    ↓
Razorpay Checkout
    ↓
Payment
    ↓
Payment Verification
    ↓
Success
    ↓
Clear Cart
    ↓
Return to Store
```

This allows traditional e-commerce purchasing and AI-assisted purchasing to coexist within the same merchant environment.

---

## 📊 Merchant Dashboard

TechNest includes a merchant-facing dashboard that provides visibility into commerce activity.

The dashboard displays:

- Total Transactions
- Successful Payments
- Failed Payments
- Revenue
- Average Order Value
- Top Product
- Top Category
- AI Upsells
- AI Growth Recommendation
- Audit Trail

The dashboard connects buyer-side activity with merchant-side intelligence.

---

## 📈 Merchant Growth Intelligence

The Merchant Dashboard includes an AI-oriented growth recommendation based on observed transaction data.

The goal is to help a merchant understand:

```text
AI Buyer Demand
       ↓
Transaction Data
       ↓
Product / Category Patterns
       ↓
Merchant Growth Recommendation
```

For example, if demand becomes concentrated in a particular category, the dashboard can recommend focusing on that category and highlighting relevant complementary products.

This demonstrates how agentic commerce can provide value not only to buyers but also to merchants.

---

## 🧾 Agent Audit Trail

The system records important events throughout the agent workflow.

Examples include:

- User request
- Selected product
- Recommended products
- Basket amount
- Approval decision
- Razorpay order ID
- Payment status

A typical successful transaction follows:

```text
User Request
     ↓
AI Recommendation
     ↓
Basket
     ↓
Human Approval
     ↓
Razorpay Order
     ↓
Payment
     ↓
Signature Verification
     ↓
Audit Record
```

This provides traceability across the AI decision and payment lifecycle.

---

## 🌐 Production Deployment

TechNest is currently deployed using a split frontend/backend architecture.

```text
                         INTERNET
                            │
                            ▼
                  Render Frontend
       https://technest-ai-commerce.onrender.com
                            │
                            │ HTTPS
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
                   FastAPI :8000
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
         LangGraph                    Razorpay
              │
              ▼
            SQLite
```

### Frontend — Render

The React/Vite frontend is deployed as a Render static site.

Responsibilities include:

- Storefront
- AI Buyer interface
- Cart
- Merchant Dashboard
- Razorpay Checkout UI

### Backend — AWS EC2

The FastAPI backend runs on an AWS EC2 instance.

Responsibilities include:

- FastAPI API
- LangGraph workflow
- AI calls
- Product catalog access
- Razorpay integration
- Payment verification
- Audit logging

The backend runs as a systemd service so it continues running independently of an SSH session.

### Nginx

Nginx acts as the reverse proxy in front of FastAPI.

It handles incoming HTTPS requests and forwards them to the FastAPI application running on port `8000`.

### HTTPS

The backend uses HTTPS through a Let's Encrypt certificate.

DuckDNS provides the free hostname used for the backend endpoint.

### Database

SQLite is currently used for the deployed hackathon/reference implementation.

The SQLite database stores the application's commerce audit data.

---

## 🧠 Why LangGraph?

LangGraph is used because the TechNest workflow is not simply a single LLM request.

The AI Buyer needs to:

- Maintain state across multiple stages
- Pass information between workflow nodes
- Filter and rank products
- Build a purchase basket
- Pause for human approval
- Resume after approval
- Pause for external payment
- Resume after payment information is returned
- Handle payment success and failure branches
- Keep the workflow inspectable
- Maintain controlled execution boundaries

A stateful graph-based architecture is therefore a natural fit for this agentic commerce workflow.

---

## 🎯 Demo Scenarios

### Scenario 1 — AI Buyer Purchase

Example:

```text
Find me a coding laptop under ₹70,000 with 16GB RAM
```

Demonstrate:

- Intent understanding
- Catalog search
- Product ranking
- Product reasoning
- Basket construction
- Human approval
- Razorpay Checkout
- Payment verification

---

### Scenario 2 — Budget-Safe Recommendation

Example:

```text
Find me a 5G smartphone under ₹35,000 with 12GB RAM
```

The AI can select:

```text
TechNest Phone Pro
₹34,999
```

Because only ₹1 remains in the budget, no additional product is added.

This demonstrates that AI recommendations remain bounded by the user's hard budget.

---

### Scenario 3 — No Product Match

Example:

```text
Find a phone under ₹2 lakh
```

If the catalog contains no suitable product matching the requested category and constraints, the workflow terminates without attempting payment.

The interface displays a clear no-match result.

---

### Scenario 4 — Human Rejection

The user reviews the AI-generated basket and rejects it.

The workflow ends without creating a payment order.

This demonstrates the human-in-the-loop safety boundary.

---

### Scenario 5 — Merchant Dashboard

After a successful transaction, open the Merchant Dashboard and demonstrate:

- Transaction count
- Revenue
- Average Order Value
- Top Product
- Top Category
- AI Upsells
- Growth Recommendation
- Audit Trail

---

## 🧪 Testing Status

The following flows have been tested successfully:

### Storefront

- Product catalog loading
- 14 product images
- Product information
- Add to Cart

### AI Buyer

- Intent extraction
- Catalog search
- Product filtering
- Product ranking
- Budget-aware basket construction
- Cross-sell / upsell
- Purchase plan
- Human approval
- Human rejection
- No-product handling

### Payments

- Razorpay order creation
- Razorpay Checkout
- Test payment
- Payment response handling
- Server-side signature verification
- Successful payment
- Payment failure handling

### Merchant

- Transaction recording
- Revenue data
- Product/category metrics
- AI upsell data
- Growth recommendation
- Audit trail

### Deployment

- Render frontend
- AWS EC2 backend
- Nginx reverse proxy
- HTTPS
- Live API communication
- Live end-to-end AI Buyer payment flow

---

## 🛡️ Agentic Commerce Design Principles

TechNest is built around four principles for AI-driven financial actions:

### 1. Explainable

The AI provides reasoning for product selection and basket recommendations.

### 2. Bounded

Hard constraints such as the user's budget are enforced.

### 3. Gated

Human approval is required before financial execution.

### 4. Auditable

Important commerce and agent events are recorded.

Together:

```text
Explainable
     +
Bounded
     +
Gated
     +
Auditable
     =
Controlled Agentic Commerce
```

---

## 🔮 Future Improvements

Potential future improvements include:

- Persistent LangGraph checkpointing
- Managed PostgreSQL for larger-scale production deployment
- More advanced product retrieval
- Vector-based catalog search
- Inventory-aware recommendations
- Real-time inventory validation
- Merchant-configurable AI policies
- Better separation between AI Buyer and regular-cart analytics
- Explicit transaction source/channel fields
- Production payment webhooks
- Authentication and authorization
- Advanced fraud and risk controls
- Improved observability and monitoring
- More advanced merchant analytics
- Agent evaluation and performance monitoring
- Multi-merchant catalog support
- Personalized buyer profiles
- More sophisticated basket optimization

---

## 📌 Current Project Status

TechNest is a working deployed AI-commerce reference implementation.

| Feature | Status |
|---|---|
| Storefront | ✅ |
| 14-product catalog | ✅ |
| Generated product images | ✅ |
| AI Buyer | ✅ |
| Intent extraction | ✅ |
| Catalog search | ✅ |
| Product filtering | ✅ |
| Product ranking | ✅ |
| Budget-safe upselling | ✅ |
| Purchase plan | ✅ |
| Human approval | ✅ |
| Rejection flow | ✅ |
| No-match handling | ✅ |
| Razorpay test order | ✅ |
| Razorpay Checkout | ✅ |
| Payment verification | ✅ |
| Payment failure handling | ✅ |
| Audit trail | ✅ |
| Merchant dashboard | ✅ |
| Growth recommendation | ✅ |
| Regular cart | ✅ |
| Live deployment | ✅ |
| End-to-end live payment test | ✅ |

---

## 🏆 Buildathon Track

TechNest was built for the **Razorpay AI Growth and Agentic Commerce** track.

The project focuses on the intersection of:

- AI Buyers
- Agentic commerce
- Merchant growth
- Human-in-the-loop systems
- Payment infrastructure
- AI recommendations
- Workflow orchestration
- Transaction safety
- Auditability

The project demonstrates how an AI agent can move beyond product recommendations and participate in a controlled commerce workflow while keeping the human in control of financial execution.

---

## 📌 Project Positioning

TechNest is **not a real e-commerce company**.

It is:

> **A fictional merchant/reference implementation used to demonstrate agentic commerce with Razorpay.**

The product catalog is fictional and the product images are original AI-generated renders.

The purpose of the project is to demonstrate the architecture, workflow, safety controls, and merchant intelligence involved in AI-assisted commerce.

---

## 🔗 Links

**Live Demo**

https://technest-ai-commerce.onrender.com

**GitHub Repository**

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

An AI-powered commerce workflow demonstrating how an AI Buyer can understand intent, discover and rank products, optimize a budget-aware basket, request human approval, and execute a controlled Razorpay payment workflow with verification and auditability.
