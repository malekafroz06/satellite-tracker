import { useState, useEffect } from 'react';
import { Container, Nav, Tab, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SelectSatellite from '../components/SelectSatellite';
import LiveTracking from '../components/LiveTracking';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('select');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSatelliteSelected = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-vh-100" style={{ background: 'transparent' }}>
      <nav className="navbar navbar-dark" style={{ 
        background: 'linear-gradient(135deg, #000428 0%, #004e92 50%, #000428 100%)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        <Container>
          <span className="navbar-brand mb-0 h1" style={{ fontWeight: '600' }}>🛰️ Satellite Tracker</span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3" style={{ fontSize: '16px' }}>Welcome, {user?.username}</span>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handleLogout}
              style={{ 
                borderRadius: '20px', 
                padding: '6px 20px',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Logout
            </Button>
          </div>
        </Container>
      </nav>

      <Container className="py-5">
        <Row className="justify-content-center mb-4">
          <Col xs={12} md={8}>
            <div className="text-center mb-4">
              <h1 style={{ color: '#333', fontWeight: '700', marginBottom: '10px' }}>Dashboard</h1>
              <p style={{ color: '#666', fontSize: '18px' }}>Track satellites in real-time</p>
            </div>
          </Col>
        </Row>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '15px', 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="mb-4" style={{ borderBottom: 'none' }}>
              <Nav.Item>
                <Nav.Link 
                  eventKey="select" 
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '10px 10px 0 0',
                    fontWeight: '500',
                    color: activeTab === 'select' ? '#667eea' : '#666',
                    background: activeTab === 'select' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                  }}
                >
                  📡 Select Satellite
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="tracking" 
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '10px 10px 0 0',
                    fontWeight: '500',
                    color: activeTab === 'tracking' ? '#667eea' : '#666',
                    background: activeTab === 'tracking' ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                  }}
                >
                  🌐 Live Tracking
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="select">
                <SelectSatellite 
                  onSatelliteSelected={handleSatelliteSelected}
                  refreshTrigger={refreshTrigger}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="tracking">
                <LiveTracking refreshTrigger={refreshTrigger} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;