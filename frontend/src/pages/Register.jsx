import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.password2
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container 
      fluid
      className="d-flex justify-content-center align-items-center" 
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000428 0%, #004e92 50%, #000428 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 160px 30px, #ddd, transparent)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          opacity: 0.3,
          pointerEvents: 'none'
        }}
      />
      <Card style={{ width: '400px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', position: 'relative', zIndex: 1 }}>
        <Card.Body className="p-4">
          <Row className="justify-content-center mb-4">
            <Col xs="auto">
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}
              >
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>🛰️</span>
              </div>
            </Col>
          </Row>
          <h2 className="text-center mb-4" style={{ color: '#333', fontWeight: '600' }}>Create Account</h2>
          
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label style={{ color: '#555', fontWeight: '500' }}>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className="rounded-3 border-0 py-3"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label style={{ color: '#555', fontWeight: '500' }}>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-3 border-0 py-3"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label style={{ color: '#555', fontWeight: '500' }}>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="rounded-3 border-0 py-3"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password2">
              <Form.Label style={{ color: '#555', fontWeight: '500' }}>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="password2"
                placeholder="Confirm password"
                value={formData.password2}
                onChange={handleChange}
                required
                className="rounded-3 border-0 py-3"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 rounded-3 py-3 mb-3"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </Form>
          
          <div className="text-center" style={{ color: '#666', fontSize: '14px' }}>
            Already have an account? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Login here</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;