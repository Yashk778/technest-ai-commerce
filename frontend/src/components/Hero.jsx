import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'


// -----------------------------------
// PRODUCT IMAGE HELPER
// -----------------------------------

const getProductImage = (image) => {

  if (!image) {
    return ''
  }

  // Already an absolute URL
  if (
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image
  }

  // Backend-relative path
  // Example:
  // /products/laptop.png
  if (image.startsWith('/')) {
    return `${API_BASE}${image}`
  }

  // Relative path without leading slash
  return `${API_BASE}/${image}`

}


function Hero() {

  const [userInput, setUserInput] = useState('')

  const [loading, setLoading] = useState(false)

  const [result, setResult] = useState(null)

  const [threadId, setThreadId] = useState(null)

  const [error, setError] = useState('')

  const [paymentStatus, setPaymentStatus] = useState('')

  const [paymentComplete, setPaymentComplete] = useState(false)

  const [activityStages, setActivityStages] = useState([])

  const [purchaseRejected, setPurchaseRejected] = useState(false)


  // -----------------------------------
  // FIND PRODUCT
  // -----------------------------------

  const handleSearch = async () => {

    if (!userInput.trim()) {
      return
    }

    setLoading(true)

    setError('')

    setResult(null)

    setThreadId(null)

    setPaymentStatus('')

    setPaymentComplete(false)

    setPurchaseRejected(false)

    setActivityStages([])


    try {

      const response = await fetch(
        `${API_BASE}/api/buy/stream`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            user_input: userInput,
          }),
        }
      )


      if (!response.ok) {

        throw new Error(
          'Request failed'
        )

      }


      if (!response.body) {

        throw new Error(
          'Streaming response is not available'
        )

      }


      const reader =
        response.body.getReader()

      const decoder =
        new TextDecoder()


      let buffer = ''


      while (true) {

        const {
          done,
          value
        } = await reader.read()


        if (done) {
          break
        }


        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        )


        const events =
          buffer.split('\n\n')


        buffer =
          events.pop() || ''


        for (const event of events) {

          const line =
            event
              .split('\n')
              .find(
                line =>
                  line.startsWith('data: ')
              )


          if (!line) {
            continue
          }


          try {

            const data =
              JSON.parse(
                line.slice(6)
              )


            // -----------------------------------
            // STAGE START
            // -----------------------------------

            if (
              data.type ===
              'stage_start'
            ) {

              setActivityStages(
                prev => {

                  const existing =
                    prev.find(
                      stage =>
                        stage.node ===
                        data.node
                    )


                  if (existing) {
                    return prev
                  }


                  return [
                    ...prev,
                    {
                      node:
                        data.node,

                      label:
                        data.label,

                      status:
                        'active',

                      startTime:
                        performance.now(),

                      duration:
                        null,
                    },
                  ]

                }
              )

            }


            // -----------------------------------
            // STAGE END
            // -----------------------------------

            if (
              data.type ===
              'stage_end'
            ) {

              setActivityStages(
                prev =>
                  prev.map(
                    stage => {

                      if (
                        stage.node !==
                        data.node
                      ) {

                        return stage

                      }


                      const duration =
                        stage.startTime
                          ? (
                              performance.now() -
                              stage.startTime
                            ) / 1000
                          : null


                      return {
                        ...stage,

                        status:
                          'completed',

                        duration:
                          duration,
                      }

                    }
                  )
              )

            }


            // -----------------------------------
            // FINAL RESULT
            // -----------------------------------

            if (
              data.type ===
              'done'
            ) {

              setThreadId(
                data.thread_id
              )


              setResult({
                thread_id:
                  data.thread_id,

                result:
                  data.result,
              })


              setLoading(false)

            }


            // -----------------------------------
            // STREAM ERROR
            // -----------------------------------

            if (
              data.type ===
              'error'
            ) {

              throw new Error(
                data.message ||
                'AI Buyer streaming failed'
              )

            }

          } catch (parseError) {

            console.error(
              'SSE event parsing error:',
              parseError
            )

          }

        }

      }


    } catch (err) {

      console.error(err)


      setError(
        'Unable to connect to the AI Buyer.'
      )

      setLoading(false)

    }

  }


  // -----------------------------------
  // AGENT RESULT
  // -----------------------------------

  const agentResult =
    result?.result

  const noProductFound =
    agentResult &&
    !agentResult.selected_product


  // -----------------------------------
  // CURRENT BASKET
  // -----------------------------------

  const basket =
    agentResult?.cart || []


  // -----------------------------------
  // OPTIONAL ADD-ON
  // -----------------------------------

  const recommendedProduct =
    agentResult?.recommended_products?.length > 0
      ? agentResult.recommended_products[0]
      : null


  const isRecommendedInBasket =
    recommendedProduct
      ? basket.some(
          product =>
            product.id ===
            recommendedProduct.id
        )
      : false


  // -----------------------------------
  // UPDATE LOCAL BASKET
  // -----------------------------------

  const updateBasket = (newCart) => {

    const newTotal =
      newCart.reduce(
        (sum, product) =>
          sum + Number(product.price || 0),
        0
      )


    setResult(
      prev => {

        if (!prev) {
          return prev
        }


        return {
          ...prev,

          result: {
            ...prev.result,

            cart:
              newCart,

            total_amnt:
              newTotal,

          },

        }

      }
    )

  }


  // -----------------------------------
  // REMOVE OPTIONAL PRODUCT
  // -----------------------------------

  const removeFromBasket = (
    productId
  ) => {

    if (!agentResult) {
      return
    }


    const selectedProductId =
      agentResult.selected_product?.id


    // Never allow removal
    // of the main AI-selected product
    if (
      productId ===
      selectedProductId
    ) {
      return
    }


    const newCart =
      basket.filter(
        product =>
          product.id !==
          productId
      )


    updateBasket(newCart)

  }


  // -----------------------------------
  // ADD OPTIONAL PRODUCT BACK
  // -----------------------------------

  const addToBasket = (
    product
  ) => {

    if (!product) {
      return
    }


    const alreadyExists =
      basket.some(
        item =>
          item.id ===
          product.id
      )


    if (alreadyExists) {
      return
    }


    const newCart = [
      ...basket,
      product
    ]


    updateBasket(newCart)

  }


  // -----------------------------------
  // APPROVE / REJECT
  // -----------------------------------

  const handleApproval = async (
    decision
  ) => {

    if (!threadId) {
      return
    }


    setLoading(true)

    setError('')


    if (
      decision ===
      'rejected'
    ) {

      setPaymentStatus(
        'Cancelling purchase...'
      )

    } else {

      setPaymentStatus(
        'Preparing secure checkout...'
      )

    }


    try {

      const response =
        await fetch(
          `${API_BASE}/api/approval`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({

              thread_id:
                threadId,

              decision:
                decision,

              // Send the user's
              // currently edited basket
              cart:
                agentResult?.cart || [],

            }),

          }
        )


      const data =
        await response.json()


      if (
        !response.ok ||
        data.error
      ) {

        throw new Error(
          data.error ||
          'Approval request failed'
        )

      }


      // -----------------------------------
      // REJECTED
      // -----------------------------------

      if (
        decision ===
        'rejected'
      ) {

        setResult(null)

        setPaymentStatus('')

        setPurchaseRejected(
          true
        )

        setLoading(false)

        return

      }


      // -----------------------------------
      // APPROVED
      // -----------------------------------

      setResult(data)


      // -----------------------------------
      // LOAD RAZORPAY CHECKOUT
      // -----------------------------------

      if (!window.Razorpay) {

        const script =
          document.createElement(
            'script'
          )


        script.src =
          'https://checkout.razorpay.com/v1/checkout.js'


        script.onload = () => {

          openRazorpayCheckout(
            data.result
          )

        }


        script.onerror = () => {

          setError(
            'Unable to load Razorpay Checkout.'
          )

          setPaymentStatus('')

          setLoading(false)

        }


        document.body.appendChild(
          script
        )

      } else {

        openRazorpayCheckout(
          data.result
        )

      }


    } catch (err) {

      console.error(err)


      setError(
        err.message ||
        'Unable to process your approval.'
      )

      setPaymentStatus('')

      setLoading(false)

    }

  }


  // -----------------------------------
  // RAZORPAY CHECKOUT
  // -----------------------------------

  const openRazorpayCheckout = (
    paymentData
  ) => {

    if (!paymentData) {

      setError(
        'Payment information is missing.'
      )

      setPaymentStatus('')

      setLoading(false)

      return

    }


    const options = {

      key:
        paymentData.razorpay_key_id,

      amount:
        paymentData.checkout_amount,

      currency:
        'INR',

      name:
        'TechNest',

      description:
        'AI Buyer Purchase',

      order_id:
        paymentData.razorpay_order_id,


      // -----------------------------------
      // PAYMENT SUCCESS
      // -----------------------------------

      handler:
        async function (response) {

          console.log(
            'Razorpay payment response:',
            response
          )


          try {

            setLoading(true)

            setError('')

            setPaymentStatus(
              'Verifying payment securely...'
            )


            const verifyResponse =
              await fetch(
                `${API_BASE}/api/payment/verify`,
                {
                  method: 'POST',

                  headers: {
                    'Content-Type':
                      'application/json',
                  },

                  body:
                    JSON.stringify({

                      thread_id:
                        threadId,

                      razorpay_payment_id:
                        response
                          .razorpay_payment_id,

                      razorpay_order_id:
                        response
                          .razorpay_order_id,

                      razorpay_signature:
                        response
                          .razorpay_signature,

                    }),

                }
              )


            if (
              !verifyResponse.ok
            ) {

              throw new Error(
                'Payment verification request failed'
              )

            }


            const verificationData =
              await verifyResponse.json()


            console.log(
              'Payment verification:',
              verificationData
            )


            // -----------------------------------
            // VERIFIED SUCCESS
            // -----------------------------------

            if (
              verificationData
                .result
                ?.payment_status ===
              'success'
            ) {

              setPaymentComplete(
                true
              )

              setPaymentStatus('')

            } else {

              setPaymentStatus(
                'Payment verification failed.'
              )

            }


          } catch (err) {

            console.error(err)


            setError(
              'Payment completed, but verification failed.'
            )

            setPaymentStatus('')

          } finally {

            setLoading(false)

          }

        },


      // -----------------------------------
      // CHECKOUT CLOSED
      // -----------------------------------

      modal: {

        ondismiss:
          function () {

            setLoading(false)

            setPaymentStatus(
              'Payment window closed.'
            )

          },

      },


      // -----------------------------------
      // CUSTOMER PREFILL
      // -----------------------------------

      prefill: {

        name:
          'TechNest Customer',

        email:
          'test@razorpay.com',

      },


      // -----------------------------------
      // THEME
      // -----------------------------------

      theme: {

        color:
          '#2167d5',

      },

    }


    const razorpay =
      new window.Razorpay(
        options
      )


    razorpay.open()

  }


  // -----------------------------------
  // START NEW SEARCH
  // -----------------------------------

  const startNewSearch = () => {

    setPaymentComplete(false)

    setPurchaseRejected(false)

    setResult(null)

    setThreadId(null)

    setPaymentStatus('')

    setUserInput('')

    setError('')

    setActivityStages([])

  }


  // -----------------------------------
  // RENDER
  // -----------------------------------

  return (

    <main className="ai-buyer-page">


      {/* =================================
          AI BUYER INTRO
          ================================= */}

      {!paymentComplete && (

        <section className="ai-buyer-hero">

          <p className="ai-buyer-label">
            AI-POWERED COMMERCE
          </p>


          <h1>

            Shop smarter.

            <br />

            Let AI do the searching.

          </h1>


          <p className="ai-buyer-description">

            Tell your AI Buyer what you need.
            It understands your requirements,
            finds the right products, builds your
            basket, and helps you buy with confidence.

          </p>


          {/* =================================
              BUYER INPUT
              ================================= */}

          <div className="ai-buyer-input">

            <input

              type="text"

              value={userInput}

              onChange={
                event =>
                  setUserInput(
                    event.target.value
                  )
              }

              onKeyDown={
                event => {

                  if (
                    event.key ===
                      'Enter' &&
                    !loading
                  ) {

                    handleSearch()

                  }

                }
              }

              placeholder="Try: Laptop under ₹70,000 with 16GB RAM..."

              disabled={
                loading
              }

            />


            <button

              onClick={
                handleSearch
              }

              disabled={
                loading ||
                !userInput.trim()
              }

            >

              {loading
                ? 'Thinking...'
                : 'Find my product'}

            </button>

          </div>


          {/* =================================
              AI ACTIVITY
              ================================= */}

          {loading &&
            !agentResult && (

            <div className="ai-activity">

              <div className="ai-activity-header">

                <span className="ai-activity-pulse"></span>

                <div>

                  <strong>
                    AI Buyer is working
                  </strong>

                  <p>
                    Analyzing your request and building the best purchase plan.
                  </p>

                </div>

              </div>


              <div className="ai-activity-stream">

                {activityStages.map(
                  stage => (

                    <div
                      key={
                        stage.node
                      }
                      className={
                        stage.status ===
                        'active'
                          ? 'ai-stream-step active'
                          : 'ai-stream-step completed'
                      }
                    >

                      <div className="ai-stream-indicator">

                        {stage.status ===
                        'active' ? (

                          <span className="ai-spinner"></span>

                        ) : (

                          <span className="ai-stream-complete-dot"></span>

                        )}

                      </div>


                      <div>

                        <strong>
                          {stage.label}
                        </strong>


                        <p>

                          {stage.status ===
                          'active'

                            ? 'Working on this step...'

                            : stage.duration !==
                                null

                              ? `Completed in ${stage.duration.toFixed(2)}s`

                              : 'Completed'}

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}


          {/* =================================
              ERROR
              ================================= */}

          {error && (

            <p className="ai-buyer-error">

              {error}

            </p>

          )}


          {/* =================================
              PAYMENT STATUS
              ================================= */}

          {paymentStatus && (

            <div className="ai-buyer-payment-status">

              {paymentStatus}

            </div>

          )}

        </section>

      )}


      {/* =================================
          AI RESULT
          ================================= */}

      {agentResult &&
        !noProductFound &&
        !paymentComplete &&
        !purchaseRejected && (

        <section className="ai-result">


          {/* =================================
              HEADER
              ================================= */}

          <div className="ai-result-header">

            <div>

              <p className="ai-result-label">
                AI BUYER RECOMMENDATION
              </p>


              <h2>
                Here's what I'd buy.
              </h2>

            </div>


            <div className="ai-session-badge">
              AI analyzed your request
            </div>

          </div>


          {/* =================================
              AI ANALYSIS NOTE
              ================================= */}

          <div className="ai-analysis-note">

            <span className="ai-analysis-line"></span>

            <div>

              <strong>
                Analysis complete
              </strong>

              <p>
                The recommendation below matches your stated requirements and budget.
              </p>

            </div>

          </div>


          {/* =================================
              PRODUCT
              ================================= */}

          {agentResult.selected_product && (

            <div className="ai-product-card">

              <div className="ai-product-image">

                <img

                  src={
                    getProductImage(
                      agentResult
                        .selected_product
                        .image
                    )
                  }

                  alt={
                    agentResult
                      .selected_product
                      .name
                  }

                  onError={
                    event => {

                      console.error(
                        'AI Buyer product image failed to load:',
                        event.currentTarget.src
                      )

                    }
                  }

                />

              </div>


              <div className="ai-product-info">

                <p className="ai-product-brand">

                  {
                    agentResult
                      .selected_product
                      .brand
                  }

                </p>


                <h3>

                  {
                    agentResult
                      .selected_product
                      .name
                  }

                </h3>


                <p className="ai-product-description">

                  {
                    agentResult
                      .selected_product
                      .description
                  }

                </p>


                {/* SPECS */}

                {agentResult
                  .selected_product
                  .specs && (

                  <div className="ai-specs">

                    {Object.entries(
                      agentResult
                        .selected_product
                        .specs
                    ).map(
                      ([key, value]) => (

                        <div
                          className="ai-spec"
                          key={key}
                        >

                          <span>

                            {key.replace(
                              /_/g,
                              ' '
                            )}

                          </span>


                          <strong>

                            {value}

                          </strong>

                        </div>

                      )
                    )}

                  </div>

                )}


                {/* PRICE */}

                <div className="ai-product-price">

                  ₹

                  {Number(
                    agentResult
                      .selected_product
                      .price
                  ).toLocaleString(
                    'en-IN'
                  )}

                </div>

              </div>

            </div>

          )}


          {/* =================================
              WHY PRODUCT
              ================================= */}

          {agentResult.ranking_explanation && (

            <div className="ai-reason-card">

              <p className="ai-result-label">
                WHY THIS PRODUCT?
              </p>


              <p>

                {
                  agentResult
                    .ranking_explanation
                }

              </p>

            </div>

          )}


          {/* =================================
              SMART ADD-ON
              ================================= */}

          {recommendedProduct && (

            <div className="ai-upsell-card">

              <div>

                <p className="ai-result-label">
                  SMART ADD-ON
                </p>


                <h3>

                  {
                    recommendedProduct.name
                  }

                </h3>


                <p>

                  {
                    agentResult
                      .upsell_explanation
                  }

                </p>


                <small>
                  Optional — you can remove this before approval.
                </small>

              </div>


              <div className="ai-upsell-action">

                <strong>

                  ₹

                  {Number(
                    recommendedProduct.price
                  ).toLocaleString(
                    'en-IN'
                  )}

                </strong>


                {isRecommendedInBasket ? (

                  <button
                    type="button"
                    onClick={() =>
                      removeFromBasket(
                        recommendedProduct.id
                      )
                    }
                    disabled={loading}
                  >
                    Remove
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      addToBasket(
                        recommendedProduct
                      )
                    }
                    disabled={loading}
                  >
                    Add to basket
                  </button>

                )}

              </div>

            </div>

          )}


          {/* =================================
              PURCHASE PLAN
              ================================= */}

          <div className="ai-purchase-plan">


            <div className="ai-purchase-plan-header">

              <div>

                <p className="ai-result-label">
                  PURCHASE PLAN
                </p>


                <h3>
                  Review before approval
                </h3>

              </div>


              <div className="ai-plan-status">
                HUMAN APPROVAL REQUIRED
              </div>

            </div>


            {/* =================================
                BASKET ITEMS
                ================================= */}

            <div className="ai-basket">

              <div>

                <p>
                  AI-built basket
                </p>


                <span>

                  {basket.length}

                  {' '}

                  item

                  {basket.length !== 1
                    ? 's'
                    : ''}

                </span>

              </div>


              <div className="ai-basket-total">

                <span>
                  Total
                </span>


                <strong>

                  ₹

                  {Number(
                    agentResult.total_amnt || 0
                  ).toLocaleString(
                    'en-IN'
                  )}

                </strong>

              </div>

            </div>


            {/* =================================
                EDITABLE BASKET
                ================================= */}

            <div className="ai-basket-items">

              {basket.map(
                product => {

                  const isMainProduct =
                    product.id ===
                    agentResult
                      .selected_product
                      ?.id


                  return (

                    <div
                      className="ai-basket-item"
                      key={product.id}
                    >

                      <div className="ai-basket-item-image">

                        <img

                          src={
                            getProductImage(
                              product.image
                            )
                          }

                          alt={
                            product.name
                          }

                          onError={
                            event => {

                              console.error(
                                'AI basket image failed to load:',
                                event.currentTarget.src
                              )

                            }
                          }

                        />

                      </div>


                      <div className="ai-basket-item-info">

                        <span>

                          {isMainProduct
                            ? 'AI SELECTION'
                            : 'OPTIONAL ADD-ON'}

                        </span>


                        <strong>
                          {product.name}
                        </strong>


                        <p>
                          {product.brand}
                        </p>

                      </div>


                      <div className="ai-basket-item-action">

                        <strong>

                          ₹

                          {Number(
                            product.price
                          ).toLocaleString(
                            'en-IN'
                          )}

                        </strong>


                        {!isMainProduct && (

                          <button

                            type="button"

                            onClick={() =>
                              removeFromBasket(
                                product.id
                              )
                            }

                            disabled={
                              loading
                            }

                          >

                            Remove

                          </button>

                        )}

                      </div>

                    </div>

                  )

                }
              )}

            </div>


            {/* =================================
                SAFETY MESSAGE
                ================================= */}

            <div className="ai-safety-message">

              <span>
                ✓
              </span>


              <p>

                Nothing will be charged until you explicitly
                approve this purchase.

              </p>

            </div>


            {/* =================================
                APPROVAL
                ================================= */}

            <div className="ai-approval">

              <button

                className="ai-reject"

                onClick={() =>
                  handleApproval(
                    'rejected'
                  )
                }

                disabled={
                  loading
                }

              >

                Reject

              </button>


              <button

                className="ai-approve"

                onClick={() =>
                  handleApproval(
                    'approved'
                  )
                }

                disabled={
                  loading
                }

              >

                {loading
                  ? 'Processing...'
                  : 'Approve & Continue'}

              </button>

            </div>

          </div>


        </section>

      )}


      {noProductFound &&
        !paymentComplete &&
        !purchaseRejected && (

        <section className="ai-payment-success">

          <p className="ai-result-label">
            NO MATCH FOUND
          </p>


          <h2>
            We couldn't find a suitable product.
          </h2>


          <p>
            No product in the TechNest catalog matches your requirements and budget.
          </p>


          <button
            onClick={
              startNewSearch
            }
          >
            Try another search
          </button>

        </section>

      )}


      {/* =================================
          PURCHASE REJECTED
          ================================= */}

      {purchaseRejected &&
        !paymentComplete && (

        <section className="ai-payment-success">

          <p className="ai-result-label">
            PURCHASE CANCELLED
          </p>


          <h2>
            Purchase rejected.
          </h2>


          <p>
            No payment was created and nothing was charged.
          </p>


          <button
            onClick={
              startNewSearch
            }
          >
            Start a new search
          </button>

        </section>

      )}


      {/* =================================
          PAYMENT SUCCESS
          ================================= */}

      {paymentComplete && (

        <section className="ai-payment-success">

          <p className="ai-result-label">
            ORDER CONFIRMED
          </p>


          <h2>
            Payment successful
          </h2>


          <p>
            Your payment has been verified and your TechNest order is confirmed.
          </p>


          <div className="ai-success-details">

            <div className="ai-success-item">

              <span>
                Payment
              </span>


              <strong>
                Verified
              </strong>

            </div>


            <div className="ai-success-item">

              <span>
                Order
              </span>


              <strong>
                Confirmed
              </strong>

            </div>


            <div className="ai-success-item">

              <span>
                Security
              </span>


              <strong>
                Signature verified
              </strong>

            </div>

          </div>


          <button
            onClick={
              startNewSearch
            }
          >
            Start a new purchase
          </button>

        </section>

      )}

    </main>

  )

}


export default Hero 