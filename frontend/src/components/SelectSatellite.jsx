import { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { satelliteAPI } from '../services/api';

const SelectSatellite = ({ onSatelliteSelected, refreshTrigger }) => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellites, setSelectedSatellites] = useState([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSatellites();
    fetchSelectedSatellites();
  }, [refreshTrigger]);

  const fetchSatellites = async () => {
    try {
      const response = await satelliteAPI.getAll();
      setSatellites(response.data);
    } catch (err) {
      setError('Failed to load satellites');
    }
  };

  const fetchSelectedSatellites = async () => {
    try {
      const response = await satelliteAPI.getSelections();
      setSelectedSatellites(response.data);
    } catch (err) {
      console.error('Failed to load selections:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSatelliteId) {
      setError('Please select a satellite');
      return;
    }

    setLoading(true);

    try {
      await satelliteAPI.selectSatellite(selectedSatelliteId);
      setSuccess('Satellite tracking started successfully!');
      setSelectedSatelliteId('');
      await fetchSelectedSatellites();
      onSatelliteSelected();
    } catch (err) {
      setError(err.response?.data?.satellite?.[0] || 
               err.response?.data?.non_field_errors?.[0] ||
               'Failed to select satellite');
    } finally {
      setLoading(false);
    }
  };

  const handleDeselect = async (selectionId) => {
    try {
      await satelliteAPI.deselectSatellite(selectionId);
      await fetchSelectedSatellites();
      setSuccess('Satellite tracking stopped');
      onSatelliteSelected();
    } catch (err) {
      setError('Failed to stop tracking');
    }
  };

  const getAvailableSatellites = () => {
    const selectedIds = selectedSatellites.map(sel => sel.satellite);
    return satellites.filter(sat => !selectedIds.includes(sat.id));
  };

  const isDisabled = (satelliteId) => {
    return selectedSatellites.some(sel => sel.satellite === satelliteId);
  };

  return (
    <div className="row">
      <div className="col-md-6">
        <Card>
          <Card.Header>
            <h5 className="mb-0">Select Satellite to Track</h5>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Available Satellites</Form.Label>
                <Form.Select
                  value={selectedSatelliteId}
                  onChange={(e) => setSelectedSatelliteId(e.target.value)}
                  disabled={selectedSatellites.length >= 2}
                >
                  <option value="">-- Select a satellite --</option>
                  {satellites.map((sat) => (
                    <option 
                      key={sat.id} 
                      value={sat.id}
                      disabled={isDisabled(sat.id)}
                    >
                      {sat.name} {isDisabled(sat.id) ? '(Currently Tracking)' : ''}
                    </option>
                  ))}
                </Form.Select>
                {selectedSatellites.length >= 2 && (
                  <Form.Text className="text-danger">
                    Maximum 2 satellites can be tracked. Please stop tracking one first.
                  </Form.Text>
                )}
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || selectedSatellites.length >= 2 || !selectedSatelliteId}
                className="w-100"
              >
                {loading ? 'Starting Tracking...' : 'Start Tracking'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <div className="col-md-6">
        <Card>
          <Card.Header>
            <h5 className="mb-0">Currently Tracking</h5>
          </Card.Header>
          <Card.Body>
            {selectedSatellites.length === 0 ? (
              <p className="text-muted text-center py-4">No satellites selected yet</p>
            ) : (
              <ListGroup>
                {selectedSatellites.map((sel) => (
                  <ListGroup.Item 
                    key={sel.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{sel.satellite_name}</strong>
                      <br />
                      <small className="text-muted">
                        Started: {new Date(sel.selected_at).toLocaleString()}
                      </small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeselect(sel.id)}
                    >
                      Stop
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            <div className="mt-3 text-center">
              <Badge bg="info">
                {selectedSatellites.length} / 2 satellites selected
              </Badge>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SelectSatellite;