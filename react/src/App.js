import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import Sidebar from './components/Sidebar.js';
import Product from './components/Product.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ShoppingList from './components/ShoppingList';
import ReactPaginate from 'react-paginate';

const App = () => {

  // Product Search
  const [searchTerm, setSearchTerm] = useState('');

  // Filters and additional
  const [activeStore, setActiveStore] = useState(null);
  const [promotionFilter, setPromotionFilter] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Products
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(30);
  const [sorting, setSorting] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  // User related
  const [user, setUser] = useState(null);
  const [loginStatusChanged, setLoginStatusChanged] = useState(false);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, searchTerm, activeStore, activeCategory, promotionFilter, sorting, pagination]);
  
  const fetchProducts = async () => {
    if (loading) return; // Prevent fetch if already loading
    setLoading(true);
    try {
      const baseQuery = `page=${currentPage}&limit=${pagination}`;
      const storeQuery = activeStore ? `&store=${activeStore}` : '';
      const categoryQuery = activeCategory ? `&category=${activeCategory}` : '';
      const searchQuery = searchTerm ? `&search=${searchTerm}` : '';
      const promotionQuery = promotionFilter ? `&promotion=${promotionFilter}` : '';
      const sortQuery = sorting ? `&sort=${sorting}` : '';
      const url = `http://localhost:5000/api/products?${baseQuery}${storeQuery}${categoryQuery}${searchQuery}${promotionQuery}${sortQuery}`;

      const response = await fetch(url);
      const data = await response.json();

      setAllProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedShoppingList = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    try {
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      const response = await axios.get(`http://localhost:5000/api/shoppingList/getShoppingList?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Merge the saved shopping list with the current selectedProducts state without duplicates
      setSelectedProducts(prevSelectedProducts => {
        const savedProducts = response.data;
        // Create a new map of products to easily check for existing items
        const productMap = new Map();
        // Fill the map with the saved products
        savedProducts.forEach(product => productMap.set(product._id, product));
        // Update the map with the current selected products if they don't exist already
        prevSelectedProducts.forEach(product => {
          if (!productMap.has(product._id)) {
            productMap.set(product._id, product);
          }
        });
        // Convert the map back into an array
        return Array.from(productMap.values());
      });
    } catch (error) {
      console.error('Error fetching saved shopping list:', error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const { data } = response;
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setLoginStatusChanged(!loginStatusChanged);
      // Fetch the user's saved shopping list
      fetchSavedShoppingList();
    } catch (error) {
      throw new Error('Invalid username or password.')
    }
  };

  const handleRegister = async (username, password) => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password });
      // Automatic login after successful registration
      await handleLogin(username, password);
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || error.message);
      // Handle registration error, similar to login
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    clearShoppingList();
    setLoginStatusChanged(!loginStatusChanged); 
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    setActiveCategory(null);
  };

  const toggleStoreFilter = (store) => {
    setPromotionFilter(null);
    setCurrentPage(1);
    setActiveStore(prev => prev === store ? null : store);
  };

  const toggleCategory = (category) => {
    setActiveCategory(prev => prev === category ? null : category);
    setCurrentPage(1);
  };

  const togglePromotionFilter = (store) => {
    setActiveStore(null);
    setPromotionFilter(promotionFilter === store ? null : store);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveStore(null);
    setActiveCategory(null);
    setPromotionFilter(null);
    setCurrentPage(1);
  }

  const changeAdditionalFilters = (filters) => {
    let sortingField = null;
    
    switch (filters[1]) {
      // No filter, default order from database
      case 0: {
        sortingField = ''
        break;
      }
      case 1: {
        sortingField = 'price_asc'
        break;
      }
      case 2: {
        sortingField = 'price_desc'
        break;
      }
      case 3: {
        sortingField = 'name_asc'
        break;
      }
      case 4: {
        sortingField = 'name_desc'
        break;
      }
    }

    setSorting(sortingField);
    setPagination(filters[0]);
    setCurrentPage(1);
  }

  const filteredProducts = allProducts.filter((product) => {
    // If there's a search term, it selects products which include the said term
    //Otherwise, selects all products
    const searchCondition =
      searchTerm === '' ||
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If there's a store/category/promotion filter, select only products that matches the filter
    const storeCondition = activeStore ? product.store === activeStore : true;
    const categoryCondition = activeCategory ? product.category === activeCategory : true;
    const promotionCondition = !promotionFilter || (product.promotion !== null && product.store === promotionFilter);

    return searchCondition && storeCondition && categoryCondition && promotionCondition;
  });

  const toggleProductInList = (productToToggle) => {
    setSelectedProducts((prevSelectedProducts) => {
      const isProductSelected = prevSelectedProducts.some(product => product._id === productToToggle._id);
      if (isProductSelected) {
        return prevSelectedProducts.filter(product => product._id !== productToToggle._id);
      } else {
        return [...prevSelectedProducts, productToToggle];
      }
    });
  };

  const isProductSelected = (product) => {
    return selectedProducts.some(selectedProduct => selectedProduct._id === product._id);
  };

  const clearShoppingList = () => {
    setSelectedProducts([]); // Clear the selectedProducts state
  };

  const UpdateQuantity = (productToUpdate, newQuantity) => {
    setSelectedProducts((currentProducts) =>
      currentProducts.map((product) =>
        product._id === productToUpdate._id ? { ...product, quantity: newQuantity } : product
      )
    );
  };

  return (
    <Router>
      <div className="main-layout">
        <Navbar
          onSearch={handleSearch}
          onLogin={handleLogin}
          onRegister={handleRegister}
          user={user}
          onLogout={handleLogout}
          clearShoppingList={clearShoppingList}

        />
        <div className="content-area">
          <Sidebar
            resetFilters={resetFilters}
            activeStore={activeStore}
            toggleStoreFilter={toggleStoreFilter}
            setPromotion={togglePromotionFilter}
            promotionFilter={promotionFilter}
            activeCategory={activeCategory}
            toggleCategory={toggleCategory}
            changeAdditionalFilters={changeAdditionalFilters}

          />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className='product-container-area'>
                    <div className="product-display-area">
                      {loading && allProducts.length === 0 ? (
                        <p>Loading products...</p>
                      ) : filteredProducts.length === 0 ? (
                        <p>No products found.</p>
                      ) : (
                        filteredProducts.map((product, index) => (
                          <Product
                            key={index}
                            product={product}
                            onToggleProductInList={toggleProductInList}
                            isProductSelected={() => isProductSelected(product)}
                          />))
                      )}
                    </div>
                    {/* Loader Element */}
                    {
                      loading &&
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      {loading && <p>Loading more products...</p>}
                    </div>
                    }
                    <ReactPaginate
                      previousLabel="Previous"
                      nextLabel="Next"
                      breakLabel="..."
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      pageCount={totalPages}
                      pageRangeDisplayed={4}
                      marginPagesDisplayed={2}
                      containerClassName="pagination justify-content-center"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      activeClassName="active"
                      eslint-disable-next-line no-unused-vars
                      hrefBuilder={(page, pageCount, selected) =>
                        page >= 1 && page <= pageCount ? `/page/${page}` : '#'
                      }
                      hrefAllControls
                      forcePage={currentPage - 1}
                      onClick={(clickEvent) => {
                        if (clickEvent.nextSelectedPage === undefined)
                          return false;
                        setCurrentPage(clickEvent.nextSelectedPage + 1);
                      }}
                    />
                  </div>
                </>
              }
            />

            <Route
              path="/shopping-list"
              element={
                <ShoppingList
                  activeStores={activeStore}
                  selectedProducts={selectedProducts}
                  onRemoveProduct={toggleProductInList}
                  ClearShoppingList={clearShoppingList}
                  UpdateQuantity={UpdateQuantity}
                  setSelectedProducts={setSelectedProducts}
                  user={user} // Pass the user prop to ShoppingList
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
