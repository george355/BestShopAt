import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../css/Authentication.css';
import { useNavigate } from 'react-router-dom';
import ReactPasswordChecklist from 'react-password-checklist';

const Authentication = ({ onLogin, onRegister, onClose, showModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isRegistrationFormValid, setIsRegistrationFormValid] = useState(false);

  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
    
  const [formErrors, setFormErrors] = useState({
    username: false,
    password: false,
    confirmPassword: false
  });

  const isUsernameValid = (value) => {
    const validCharsRegex = /^[a-zA-Z0-9_.-]+$/;
    if (value !== '' && !validCharsRegex.test(value)){
      setError("Username contains invalid characters.")
      return false; 
    }
    else {
      setError('');
      return true; 
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username" ) {
      isUsernameValid(value);
    }

    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: false}));
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // On submit, check if there's any error in the form
    const errors = {}
    if (!userDetails.username.trim()) {
      errors.username = true;
    }

    if (!userDetails.password.trim()) {
      errors.password = true;
    }

    //Ensure that for login, confirm password doesn't play a role in checking the validity of the login form
    if (!isLogin){
      if (!userDetails.confirmPassword.trim()) {
        errors.confirmPassword = true;
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (isLogin) {
        try {
          await onLogin(userDetails.username, userDetails.password);
          onClose();
          navigate('/'); // Navigate to the home page which will re-render the component
          setError(null);
        } catch (loginError) {
          setError('You have entered an invalid username or password.');
        }
      } else {
        if (isRegistrationFormValid && isUsernameValid(userDetails.username)) {
          try {
            await onRegister(userDetails.username, userDetails.password);
            await onLogin(userDetails.username, userDetails.password);
            onClose();
            navigate('/'); // Navigate to the home page which will re-render the component
          } catch (registerError) {
            setError('Username already exists.');
          }
        }
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUserDetails({ username: '', password: '', confirmPassword: '' });
  };


  return (
    <Modal show={showModal} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isLogin ? 'Login' : 'Register'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              name="username"
              value={userDetails.username}
              onChange={handleChange}
              className={formErrors.username ? 'empty' : ''}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              name="password"
              value={userDetails.password}
              onChange={handleChange}
              className={formErrors.password ? 'empty' : ''}
            />
          </Form.Group>

          {!isLogin && (
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={userDetails.confirmPassword}
                onChange={handleChange}
                className={formErrors.confirmPassword ? 'empty' : ''}
              />
            </Form.Group>
          )}

          {!isLogin &&
            <ReactPasswordChecklist
              rules={["minLength", "letter", "number", "match"]}
              minLength={8}
              value={userDetails.password}
              valueAgain={userDetails.confirmPassword}
              onChange={(isValid) => { setIsRegistrationFormValid(isValid) }}
              className={formErrors.name ? 'empty' : ''}
            />}

          <Button variant="primary" type="submit" className="me-2">
            {isLogin ? 'Login' : 'Register'}
          </Button>

          <Button variant="link" onClick={toggleForm}>
            {isLogin ? 'Register Now' : 'Back to Login'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Authentication;
