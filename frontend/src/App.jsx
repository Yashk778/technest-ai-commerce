import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CategorySection from './components/CategorySection'
import Cart from './components/Cart'
import Merchant from './components/Merchant'
function App() {
  const [currentView, setCurrentView] = useState('store')
  const [cart, setCart] = useState([])

  return (
    <div className="app">

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartCount={cart.length}
      />

      {currentView === 'store' && (
        <CategorySection
          cart={cart}
          setCart={setCart}
        />
      )}

      {currentView === 'ai-buyer' && (
        <Hero />
      )}

      {currentView === 'cart' && (
        <Cart
          cart={cart}
          setCart={setCart}
          setCurrentView={setCurrentView}
        />
      )}

      {currentView === 'merchant' && (
  <Merchant />
)}

    </div>
  )
}

export default App