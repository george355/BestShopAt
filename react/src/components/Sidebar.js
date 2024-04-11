import React, { useState, useEffect } from 'react';
import { ListGroup, Accordion, AccordionItem } from 'react-bootstrap';
import '../css/Sidebar.css';
import { useLocation } from 'react-router-dom';

const Sidebar = ({
  resetFilters,
  activeStore,
  toggleStoreFilter,
  setPromotion,
  promotionFilter,
  activeCategory,
  toggleCategory,
  changeAdditionalFilters
}) => {

  const currentRoute = useLocation();
  const isShoppingListPage = currentRoute.pathname === '/shopping-list';

  const stores = ['SuperValu', 'TheOrganicShop', 'DunnesStore'];
  const promotions = ['SuperValu', 'TheOrganicShop', 'DunnesStore'];
  const category = ['bakery', 'fruit vegetables', 'meat poultry', 'wine beer spirits'];
  const additionalNames = ['pagination', 'sort'];
  const additionalPagination = [30, 60, 90];
  const additionalSorting = ['None', 'Price: Low to High', 'Price: High to Low', 'Name: Ascending', 'Name: Descending'];
  const additional = [additionalPagination, additionalSorting]

  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showToggle, setShowToggle] = useState(false);
  const [buttonToggled, setButtonToggled] = useState(false);

  const [pagination, setPagination] = useState(additionalPagination[0]);
  const [sorting, setSorting] = useState('');

  const addStates = [pagination, sorting];
  const addStateFunctions = [setPagination, setSorting];

  useEffect(() => {
    console.log(showToggle)
    console.log(buttonToggled)
    const handleResize = () => {
      if (window.innerWidth > 768) {
        if (showToggle==false)
          setShowToggle(true);
        else
          setShowToggle(false);
        setSidebarOpen(true);
      }
      else {
        setShowToggle(!buttonToggled);
        setSidebarOpen(false);
      }
    };

    handleResize();
    
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [buttonToggled]);


  const toggleSidebar = () => {
    setSidebarOpen(prevIsSidebarOpen => !prevIsSidebarOpen);
    //Set the body to be unscrollable while the sidebar is retracted
    const body = document.body;
    body.classList.toggle('no-scroll');

    //Hide sidebar-button when sidebar is retracted
    if (!buttonToggled) {
      setShowToggle(false);
    } else {
      setShowToggle(true);
    }
    setButtonToggled(!buttonToggled); // Toggle the button state

    if (window.innerWidth <= 768) {
      document.querySelector('div.sidebar').classList.toggle('custom-sidebar-fixer');
      document.querySelector('div.sidebar').classList.toggle('open');
    }
  };

  const handleResetButton = () => {
    resetFilters();
    toggleSidebar();
  }

  const handleChange = (e) => {
    let id = parseInt(e.target.id.split('-')[1]);
    let value = null
    let order = -1
    switch (id) {
      case 0: {
        value = e.target.value;
        break;
      }
      case 1: {
        order = e.target.selectedIndex;
        value = e.target.value;
        break;
      }
    }
    let sendToParent = addStates
    sendToParent[id] = value;
    //Change the state of additional filters
    addStateFunctions[id](value);

    if (order !== -1) {
      sendToParent[1] = order
    }
    handleSorting(sendToParent);
  }

  //Send filters to main component (App)
  const handleSorting = (toSend) => {
    changeAdditionalFilters(toSend)
  }

  return (
    <>
      <div className={`sidebar ${window.innerWidth <= 768 ? '' : 'open'}`}>
        <Accordion defaultActiveKey={["0", "1", "2", "3"]} alwaysOpen>
          {/* Promotions Section */}
          {!isShoppingListPage && < Accordion.Item eventKey="0">
            <Accordion.Header>Promotions</Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {promotions.map((promotion, idx) => (
                  <ListGroup.Item
                    key={`promo-${idx}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {promotion}
                    <div className="sidebar-toggle-button">
                      <input
                        type="checkbox"
                        id={`promo-toggle-${idx}`}
                        className="checkbox"
                        checked={promotionFilter === promotion}
                        onChange={() => setPromotion(promotion)}
                        readOnly
                      />
                      <label htmlFor={`promo-toggle-${idx}`} className="toggle-label"></label>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>}

          {/* Stores Section */}
          {<Accordion.Item eventKey="1">
            <Accordion.Header>Stores</Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {stores.map((store, idx) => (
                  <ListGroup.Item
                    key={`store-${idx}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {store}
                    <div className="sidebar-toggle-button">
                      <input
                        type="checkbox"
                        id={`store-toggle-${idx}`}
                        className="checkbox"
                        checked={activeStore === store}
                        onChange={() => toggleStoreFilter(store)}
                        readOnly
                      />
                      <label htmlFor={`store-toggle-${idx}`} className="toggle-label"></label>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>}

          {/* Categories Section */}
          {!isShoppingListPage && <Accordion.Item eventKey="2">
            <Accordion.Header>Categories</Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {category.map((category, idx) => (
                  <ListGroup.Item
                    key={`category-${idx}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {/* Capitalize the first letter */}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <div className="sidebar-toggle-button">
                      <input
                        type="checkbox"
                        id={`category-toggle-${idx}`}
                        className="checkbox"
                        checked={activeCategory === category}
                        onChange={() => toggleCategory(category)}
                        readOnly
                      />
                      <label htmlFor={`category-toggle-${idx}`} className="toggle-label"></label>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>}

          {!isShoppingListPage && <AccordionItem eventKey="3">
            <Accordion.Header>Additional</Accordion.Header>
            <Accordion.Body>
              <ListGroup>
                {additional.map((add, idx) => (
                  <ListGroup.Item
                    key={`additional-${idx}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {additionalNames[idx].charAt(0).toUpperCase() + additionalNames[idx].slice(1)}
                    <select className="sidebar-select" id={`selectOptions-${idx}`} value={addStates[idx]} onChange={handleChange}>
                      {add.map((option, optIdx) => (
                        <option key={optIdx} value={option}>{option}</option>
                      ))}
                    </select>

                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </AccordionItem>}

          {window.innerWidth <= 768 && <Accordion.Item>
            <div class="sidebar-buttons">
              <button className="reset-button" onClick={handleResetButton}>
                Reset filters
              </button>
              <button className="apply-button" onClick={toggleSidebar}>
                Apply filters
              </button>
            </div>
          </Accordion.Item>}
        </Accordion>
      </div>

      {showToggle && <button className={`sidebar-toggle ${isSidebarOpen ? 'hide' : ''}`} onClick={toggleSidebar}>
        &#9776;
      </button>}
    </>
  );
};

export default Sidebar;