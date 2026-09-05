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

Traditional e-commerce generally requires the user to manually search, compare, select products, add them to a cart, and proceed through checkout.

TechNest explores a different approach:

The user describes what they want in natural language, and an AI Buyer handles the product discovery and purchase-planning process.

For example:

> I need a coding laptop under ₹70,000 with 16GB RAM and good battery.

The AI Buyer can:

1. Understand the user's requirements
2. Normalize natural-language product categories
3. Search the TechNest product catalog
4. Filter products against hard constraints
5. Analyze and rank relevant products
6. Recommend complementary products
7. Optimize the purchase basket
8. Respect the user's hard budget
9. Present the proposed purchase plan
10. Wait for explicit human approval
11. Create a Razorpay order
12. Open Razorpay Checkout
13. Wait for the external payment result
14. Verify successful payment signatures
15. Handle payment success or failure
16. Record the transaction and agent activity

The core principle is:

**The AI can reason and prepare a purchase, but it does not autonomously spend money without explicit human approval.**

---

# ✨ Key Features

## 🤖 AI Buyer Agent

TechNest provides an AI Buyer capable of handling natural-language shopping requests.

Features include:

- Natural-language shopping requests
- User requirement understanding
- Product category normalization
- Product discovery
- Hard constraint filtering
- Product comparison
- Product ranking
- Budget-aware recommendations
- Complementary product recommendations
- Upselling and cross-selling
- Automated basket construction
- Purchase-plan generation
- No-match handling

### Natural-Language Category Handling

Users do not have to use the exact category name stored in the catalog.

The intent layer normalizes common natural variations into the catalog's canonical categories.

For example:

| User Input | Normalized Category |
|---|---|
| `laptop` / `laptops` | `laptop` |
| `lap` | `laptop` |
| `notebook` | `laptop` |
| `headphone` / `headphones` | `headphones` |
| `headset` / `headsets` | `headphones` |
| `earphone` / `earphones` | `headphones` |
| `earbuds` | `headphones` |
| `keyboard` / `keyboards` | `keyboard` |
| `mouse` | `mouse` |
| `mice` | `mouse` |
| `monitor` / `monitors` | `monitor` |
| `screen` / `screens` | `monitor` |
| `display` / `displays` | `monitor` |
| `phone` / `phones` | `smartphone` |
| `mobile` / `mobiles` | `smartphone` |
| `cell phone` | `smartphone` |

This allows users to interact naturally while the catalog search remains strict and controlled.

The architecture is:

```text
Natural-Language User Request
             ↓
       Intent Extraction
             ↓
      Category Normalization
             ↓
      Canonical Catalog Category
             ↓
       Strict Catalog Search
