function Navbar({
  currentView,
  setCurrentView,
  cartCount,
}) {
  return (
    <nav className="navbar">

      <div
        className="brand"
        onClick={() => setCurrentView('store')}
      >
        TechNest
      </div>


      <div className="nav-links">

        <button
          className={
            currentView === 'ai-buyer'
              ? 'nav-button active'
              : 'nav-button'
          }
          onClick={() => setCurrentView('ai-buyer')}
        >
          AI Buyer
        </button>


        <button
  className={
    currentView === 'merchant'
      ? 'nav-button active'
      : 'nav-button'
  }
  onClick={() => setCurrentView('merchant')}
>
  Merchant
</button>


        <button
          className={
            currentView === 'cart'
              ? 'nav-button active'
              : 'nav-button'
          }
          onClick={() => setCurrentView('cart')}
        >
          Cart
          {cartCount > 0 && (
            <span className="cart-count">
              ({cartCount})
            </span>
          )}
        </button>

      </div>

    </nav>
  )
}

export default Navbar