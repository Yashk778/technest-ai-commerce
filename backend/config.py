from langchain_groq import ChatGroq
from dotenv import load_dotenv
import razorpay
import os 
load_dotenv()

llm = ChatGroq(
    model = 'openai/gpt-oss-20b'
)


razorpay_client = razorpay.Client(
     auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET")
    )
)
