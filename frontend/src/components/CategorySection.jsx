import { useEffect, useState } from 'react'

function CategorySection({ cart, setCart }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/products`
        )

        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        const data = await response.json()

        setProducts(data)

      } catch (err) {
        console.error(err)
        setError('Unable to load products.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = (product) => {
    const alreadyInCart = cart.some(
      (item) => item.id === product.id
    )

    if (alreadyInCart) {
      return
    }

    setCart([
      ...cart,
      product
    ])
  }

  return (
    <main className="storefront">

      <section className="store-hero">

        <p className="store-eyebrow">
          TECHNEST
        </p>

        <h1>
          Technology, made smarter.
        </h1>

        <p className="store-tagline">
          Quality tech for work, play, and everything in between.
        </p>

      </section>


      <section className="store-products">

        <div className="store-products-header">

          <div>

            <p className="section-label">
              SHOP TECHNEST
            </p>

            <h2>
              All Products
            </h2>

          </div>

          <div className="product-count">
            {products.length} products
          </div>

        </div>


        {loading && (
          <div className="store-message">
            Loading products...
          </div>
        )}


        {error && (
          <div className="store-message error-message">
            {error}
          </div>
        )}


        {!loading && !error && (

          <div className="store-product-grid">

            {products.map((product) => {

              const isInCart = cart.some(
                (item) => item.id === product.id
              )

              return (
                <article
                  className="store-card"
                  key={product.id}
                >

                  <div className="store-card-image">

                    <div className="category-badge">
                      {product.category}
                    </div>
<img
  src={`${API_BASE}${product.image}`}
  alt={product.name}
/>

                  </div>


                  <div className="store-card-content">

                    <p className="store-card-brand">
                      {product.brand}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="store-card-description">
                      {product.description}
                    </p>


                    <div className="store-card-specs">

                      {Object.entries(product.specs)
                        .slice(0, 3)
                        .map(([key, value]) => (

                          <span key={key}>
                            {key.replace('_', ' ')}: {value}
                          </span>

                        ))}

                    </div>


                    <div className="store-card-footer">

                      <strong className="store-card-price">
                        ₹
                        {product.price.toLocaleString('en-IN')}
                      </strong>


                      <button
                        className={
                          isInCart
                            ? 'add-cart-button added'
                            : 'add-cart-button'
                        }
                        onClick={() => addToCart(product)}
                        disabled={isInCart}
                      >
                        {isInCart
                          ? 'Added'
                          : 'Add to Cart'}
                      </button>

                    </div>

                  </div>

                </article>
              )
            })}

          </div>

        )}

      </section>

    </main>
  )
}

export default CategorySection