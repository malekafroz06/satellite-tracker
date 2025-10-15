import { useState, useEffect, useRef } from 'react';
import { Card, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { satelliteAPI } from '../services/api';

const LiveTracking = ({ refreshTrigger }) => {
  const [positionsData, setPositionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchPositions();
    
    intervalRef.current = setInterval(() => {
      fetchPositions();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshTrigger]);

  const fetchPositions = async () => {
    try {
      const response = await satelliteAPI.getPositions();
      console.log('API Response:', response.data); // Debug log
      setPositionsData(response.data);
      setLastUpdate(new Date());
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching positions:', err); // Debug log
      setError('Failed to load satellite positions');
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatCoordinate = (value, decimals = 4) => {
    return value?.toFixed(decimals) || 'N/A';
  };

  const satelliteNames = Object.keys(positionsData);
  console.log('Satellite Names:', satelliteNames); // Debug log
  console.log('Positions Data:', positionsData); // Debug log

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading satellite positions...</p>
      </div>
    );
  }

  if (satelliteNames.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>No Satellites Selected</Alert.Heading>
        <p>Please select satellites from the "Select Satellite" tab to start tracking.</p>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Live Satellite Tracking ({satelliteNames.length} satellites)</h4>
        <div>
          <Badge bg="success" className="me-2">
            Live
          </Badge>
          {lastUpdate && (
            <small className="text-muted">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </small>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        {satelliteNames.map((satelliteName) => (
          <div key={satelliteName} className="col-lg-6 col-md-12 mb-4">
            <Card>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  🛰️ {satelliteName}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>TIMESTAMP</th>
                        <th>LATITUDE</th>
                        <th>LONGITUDE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionsData[satelliteName]?.length > 0 ? (
                        positionsData[satelliteName].map((position, idx) => (
                          <tr key={`${satelliteName}-${idx}`}>
                            <td className="text-nowrap">
                              {formatTimestamp(position.timestamp)}
                            </td>
                            <td>{formatCoordinate(position.latitude)}°</td>
                            <td>{formatCoordinate(position.longitude)}°</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-4">
                            Waiting for data... (Updates every minute)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              {positionsData[satelliteName]?.length > 0 && (
                <Card.Footer className="text-muted">
                  <small>
                    Showing {positionsData[satelliteName].length} recent positions
                  </small>
                </Card.Footer>
              )}
            </Card>
          </div>
        ))}
      </div>

      <Alert variant="info" className="mt-3">
        ℹ️ Data automatically refreshes every 60 seconds
      </Alert>
    </div>
  );
};

export default LiveTracking;