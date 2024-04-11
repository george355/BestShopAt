import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Form, FormControl, Button, Container, Dropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import Authentication from './Authentication';
import '../css/Navbar.css';

const NavBar = ({ onSearch, onLogin, onRegister, user, onLogout, clearShoppingList }) => {
  const [showAuthentication, setShowAuthentication] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleShowAuthentication = () => setShowAuthentication(true);
  const handleCloseAuthentication = () => setShowAuthentication(false);

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleLogout = () => {
    onLogout();
    clearShoppingList(); // This function clears the shopping list state
    navigate('/');
  };


  return (
    <Navbar bg="light" expand="lg" className="py-2" style={{ position: 'sticky', top: 0, zIndex: 1020 }}>
      <Container fluid>
        <Link to="/" className="navbar-brand me-auto">
          <Navbar.Brand>BestShopAt</Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <div className="search-form-container">
            <Form className="search-form" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Search for products..."
                className="me-2"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-success" type="submit">Search</Button>
              {searchTerm && <Button variant="outline-danger" onClick={clearSearch}>Clear</Button>}
            </Form>
          </div>

          <Nav className="ms-auto nav-buttons">
            <Link to="/shopping-list" className="nav-link "><FaShoppingCart /> Shopping List</Link>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="success" id="dropdown-basic" className="d-flex align-items-center">
                  <FaUserCircle /><span className="ms-2">{user.username}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Log Out</Dropdown.Item> {}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button variant="success " className="d-flex align-items-center" onClick={handleShowAuthentication}>
                <FaUserCircle /><span className="ms-2">Log In / Register</span>
              </Button>
            )
            }
          </Nav>
          {showAuthentication && 
            <Authentication
              onLogin={onLogin}
              onRegister={onRegister}
              onClose={handleCloseAuthentication}
              showModal={showAuthentication}
              className="auth-modal"
            />
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>

  );
};

export default NavBar;
