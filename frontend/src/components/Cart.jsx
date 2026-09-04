import { useEffect, useState } from 'react'

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


function Cart({ cart, setCart, setCurrentView }) {

  const [paymentLoading, setPaymentLoading] = useState(false)


  // -----------------------------------
  // LOAD RAZORPAY CHECKOUT
  // -----------------------------------

  useEffect(() => {

    const script =
      document.createElement('script')

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js'

    script.async = true

    document.body.appendChild(script)


    return () => {

      document.body.removeChild(script)

    }

  }, [])



  // -----------------------------------
  // CART TOTAL
  // -----------------------------------

  const total = cart.reduce(
    (sum, product) =>
      sum + product.price,
    0
  )



  // -----------------------------------
  // REMOVE PRODUCT
  // -----------------------------------

  const removeFromCart = (
    productId
  ) => {

    setCart(
      cart.filter(
        product =>
          product.id !== productId
      )
    )

  }



  // -----------------------------------
  // CHECKOUT
  // -----------------------------------

  const handleCheckout =
    async () => {

      if (cart.length === 0) {

        alert(
          'Your cart is empty.'
        )

        return

      }


      setPaymentLoading(true)


      try {

        // -----------------------------------
        // CREATE RAZORPAY ORDER
        // -----------------------------------

        const response =
          await fetch(
            `${API_BASE}/api/cart/order`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  cart: cart
                })

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
            'Failed to create order'
          )

        }


        // -----------------------------------
        // CHECK RAZORPAY CHECKOUT
        // -----------------------------------

        if (!window.Razorpay) {

          throw new Error(
            'Razorpay Checkout is still loading. Please try again.'
          )

        }


        // -----------------------------------
        // RAZORPAY OPTIONS
        // -----------------------------------

        const options = {

          key:
            data.key_id,

          amount:
            data.amount,

          currency:
            data.currency,

          name:
            'TechNest',

          description:
            'TechNest Cart Purchase',

          order_id:
            data.order_id,


          // -----------------------------------
          // CUSTOMER PREFILL
          // -----------------------------------

          prefill: {

            name:
              'TechNest Customer',

            email:
              'test@razorpay.com'

          },


          // -----------------------------------
          // PAYMENT SUCCESS
          // -----------------------------------

          handler:
            async function (
              paymentResponse
            ) {

              try {

                // -----------------------------------
                // VERIFY PAYMENT
                // -----------------------------------

                const verificationResponse =
                  await fetch(
                    `${API_BASE}/api/cart/payment/verify`,
                    {
                      method: 'POST',

                      headers: {
                        'Content-Type':
                          'application/json'
                      },

                      body:
                        JSON.stringify({

                          razorpay_order_id:
                            paymentResponse
                              .razorpay_order_id,

                          razorpay_payment_id:
                            paymentResponse
                              .razorpay_payment_id,

                          razorpay_signature:
                            paymentResponse
                              .razorpay_signature,

                          cart:
                            cart,

                          total_amount:
                            total

                        })

                    }
                  )


                const verificationResult =
                  await verificationResponse.json()


                // -----------------------------------
                // VERIFICATION FAILED
                // -----------------------------------

                if (
                  !verificationResponse.ok ||
                  verificationResult.status !==
                    'success'
                ) {

                  throw new Error(
                    verificationResult.message ||
                    'Payment verification failed'
                  )

                }


                // -----------------------------------
                // VERIFIED SUCCESS
                // -----------------------------------

                alert(
                  'Payment verified successfully.'
                )


                // -----------------------------------
                // CLEAR CART
                // -----------------------------------

                setCart([])


                // -----------------------------------
                // RETURN TO STOREFRONT
                // -----------------------------------

                setCurrentView(
                  'store'
                )


              } catch (error) {

                console.error(
                  'Payment verification error:',
                  error
                )


                alert(
                  error.message ||
                  'Payment verification failed.'
                )

              }

            },


          // -----------------------------------
          // CHECKOUT CLOSED
          // -----------------------------------

          modal: {

            ondismiss:
              function () {

                setPaymentLoading(
                  false
                )

              }

          },


          // -----------------------------------
          // THEME
          // -----------------------------------

          theme: {

            color:
              '#172033'

          }

        }


        // -----------------------------------
        // OPEN RAZORPAY
        // -----------------------------------

        const razorpay =
          new window.Razorpay(
            options
          )


        razorpay.open()


        setPaymentLoading(
          false
        )


      } catch (error) {

        console.error(
          'Checkout error:',
          error
        )


        alert(
          error.message ||
          'Unable to start checkout.'
        )


        setPaymentLoading(
          false
        )

      }

    }



  // -----------------------------------
  // RENDER
  // -----------------------------------

  return (

    <main className="cart-page">

      <section className="cart-container">


        {/* =================================
            CART HEADER
            ================================= */}

        <div className="cart-header">

          <p className="section-label">
            TECHNEST CART
          </p>


          <h1>
            Your Cart
          </h1>


          <p>
            Review your selected products before checkout.
          </p>

        </div>



        {/* =================================
            EMPTY CART
            ================================= */}

        {cart.length === 0 ? (

          <div className="empty-cart">

            <h2>
              Your cart is empty.
            </h2>


            <p>
              Browse TechNest products and add something you like.
            </p>


            <button
              onClick={() =>
                setCurrentView(
                  'store'
                )
              }
            >
              Continue Shopping
            </button>

          </div>

        ) : (

          <>


            {/* =================================
                CART ITEMS
                ================================= */}

            <div className="cart-items">

              {cart.map(
                (product) => (

                  <div
                    className="cart-item"
                    key={product.id}
                  >


                    {/* =================================
                        PRODUCT IMAGE
                        ================================= */}

                    <div className="cart-item-image">

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
                              'Cart product image failed to load:',
                              event.currentTarget.src
                            )

                          }
                        }

                      />

                    </div>



                    {/* =================================
                        PRODUCT INFO
                        ================================= */}

                    <div className="cart-item-info">

                      <p className="product-brand">

                        {
                          product.brand
                        }

                      </p>


                      <h3>

                        {
                          product.name
                        }

                      </h3>


                      <p>

                        {
                          product.description
                        }

                      </p>

                    </div>



                    {/* =================================
                        PRICE / REMOVE
                        ================================= */}

                    <div className="cart-item-right">

                      <strong>

                        ₹

                        {product.price.toLocaleString(
                          'en-IN'
                        )}

                      </strong>


                      <button

                        onClick={() =>
                          removeFromCart(
                            product.id
                          )
                        }

                      >

                        Remove

                      </button>

                    </div>


                  </div>

                )
              )}

            </div>



            {/* =================================
                CART SUMMARY
                ================================= */}

            <div className="cart-summary">

              <div>

                <span>

                  {cart.length}

                  {' '}

                  item

                  {cart.length !== 1
                    ? 's'
                    : ''}

                </span>


                <strong>

                  ₹

                  {total.toLocaleString(
                    'en-IN'
                  )}

                </strong>

              </div>


              <button

                onClick={
                  handleCheckout
                }

                disabled={
                  paymentLoading
                }

              >

                {paymentLoading

                  ? 'Preparing Checkout...'

                  : 'Continue to Checkout'}

              </button>

            </div>


          </>

        )}


      </section>

    </main>

  )

}


export default Cart