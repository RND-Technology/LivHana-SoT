# LivHana Raffle System - Frontend Integration Examples

Complete React components and frontend integration examples for the Blue Dream $250K Quarterly Raffle.

---

## Table of Contents

1. [Complete Raffle Page Component](#complete-raffle-page-component)
2. [Ticket Purchase Modal](#ticket-purchase-modal)
3. [My Tickets Dashboard](#my-tickets-dashboard)
4. [Admin Dashboard](#admin-dashboard)
5. [Drawing Results Page](#drawing-results-page)
6. [Styling Examples](#styling-examples)

---

## Complete Raffle Page Component

```jsx
// components/RafflePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import RaffleProgress from './RaffleProgress';
import TicketPurchaseModal from './TicketPurchaseModal';
import CountdownTimer from './CountdownTimer';
import './RafflePage.css';

const RafflePage = ({ raffleId }) => {
  const { user, token } = useAuth();
  const [raffle, setRaffle] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaffleData();
    if (user) {
      fetchMyTickets();
    }
  }, [raffleId, user]);

  const fetchRaffleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}`
      );
      setRaffle(response.data.raffle);
      setError(null);
    } catch (err) {
      setError('Failed to load raffle details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}/tickets/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMyTickets(response.data.tickets);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    fetchRaffleData();
    fetchMyTickets();
  };

  if (loading) {
    return (
      <div className="raffle-loading">
        <div className="spinner"></div>
        <p>Loading raffle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="raffle-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchRaffleData}>Try Again</button>
      </div>
    );
  }

  if (!raffle) return null;

  const canPurchase = ['active', 'sold_out'].includes(raffle.status) &&
                      raffle.ticketsRemaining > 0;

  return (
    <div className="raffle-page">
      {/* Hero Section */}
      <section className="raffle-hero">
        <div className="raffle-hero-content">
          <h1>{raffle.name}</h1>
          <p className="raffle-prize">{raffle.prize}</p>
          <p className="raffle-description">{raffle.description}</p>

          {raffle.status === 'drawn' && raffle.winner && (
            <div className="winner-announcement">
              <h2>Winner Announced!</h2>
              <p>Ticket #{raffle.winner.ticketNumber}</p>
            </div>
          )}

          {canPurchase && (
            <button
              className="btn-primary btn-large"
              onClick={() => setShowPurchaseModal(true)}
              disabled={!user}
            >
              {user ? 'Buy Tickets Now' : 'Login to Purchase'}
            </button>
          )}
        </div>
      </section>

      {/* Progress Section */}
      <section className="raffle-progress-section">
        <div className="container">
          <RaffleProgress raffleId={raffleId} />

          {raffle.status === 'active' && (
            <CountdownTimer
              targetDate={raffle.drawDate}
              label="Drawing in:"
            />
          )}
        </div>
      </section>

      {/* Details Section */}
      <section className="raffle-details">
        <div className="container">
          <div className="details-grid">
            <div className="detail-card">
              <h3>How It Works</h3>
              <ol>
                <li>Purchase raffle tickets ($50 each)</li>
                <li>Gold members receive 5 bonus entries</li>
                <li>Winner drawn on {new Date(raffle.drawDate).toLocaleDateString()}</li>
                <li>Cryptographically secure random selection</li>
                <li>Winner notified via email</li>
              </ol>
            </div>

            <div className="detail-card">
              <h3>Raffle Information</h3>
              <ul className="raffle-info-list">
                <li>
                  <strong>Ticket Price:</strong> ${raffle.ticketPrice}
                </li>
                <li>
                  <strong>Total Tickets:</strong> {raffle.maxTickets.toLocaleString()}
                </li>
                <li>
                  <strong>Tickets Sold:</strong> {raffle.ticketsSold.toLocaleString()}
                </li>
                <li>
                  <strong>Remaining:</strong> {raffle.ticketsRemaining.toLocaleString()}
                </li>
                <li>
                  <strong>Draw Date:</strong> {new Date(raffle.drawDate).toLocaleString()}
                </li>
                <li>
                  <strong>Status:</strong> <span className={`status-badge status-${raffle.status}`}>
                    {raffle.status.toUpperCase()}
                  </span>
                </li>
              </ul>
            </div>

            <div className="detail-card">
              <h3>Gold Member Benefits</h3>
              <ul>
                <li>5 bonus entries per raffle</li>
                <li>30% discount on all products</li>
                <li>VIP event invitations</li>
                <li>Early access to new raffles</li>
              </ul>
              {user?.membership !== 'GOLD' && (
                <button className="btn-secondary">
                  Upgrade to Gold
                </button>
              )}
            </div>

            <div className="detail-card">
              <h3>Compliance</h3>
              <ul>
                <li>Must be 21+ to participate</li>
                <li>Texas gambling law compliant</li>
                <li>Cryptographically secure drawing</li>
                <li>Complete audit trail</li>
                <li>Identity verification for prize claim</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* My Tickets Section */}
      {user && myTickets.length > 0 && (
        <section className="my-tickets-section">
          <div className="container">
            <h2>My Tickets</h2>
            <div className="ticket-stats">
              <div className="stat">
                <strong>{myTickets.length}</strong>
                <span>Total Tickets</span>
              </div>
              <div className="stat">
                <strong>{myTickets.filter(t => !t.isBonusEntry).length}</strong>
                <span>Purchased</span>
              </div>
              <div className="stat">
                <strong>{myTickets.filter(t => t.isBonusEntry).length}</strong>
                <span>Bonus</span>
              </div>
            </div>

            <div className="ticket-numbers">
              <h3>Your Ticket Numbers:</h3>
              <div className="ticket-grid">
                {myTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`ticket-number ${ticket.isBonusEntry ? 'bonus' : ''} ${ticket.isWinner ? 'winner' : ''}`}
                  >
                    {ticket.ticketNumber}
                    {ticket.isBonusEntry && <span className="bonus-badge">BONUS</span>}
                    {ticket.isWinner && <span className="winner-badge">WINNER!</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <TicketPurchaseModal
          raffle={raffle}
          user={user}
          token={token}
          onSuccess={handlePurchaseSuccess}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default RafflePage;
```

---

## Ticket Purchase Modal

```jsx
// components/TicketPurchaseModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './TicketPurchaseModal.css';

const TicketPurchaseModal = ({ raffle, user, token, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [numTickets, setNumTickets] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [ageVerificationRequired, setAgeVerificationRequired] = useState(false);

  const isGoldMember = user?.membership === 'GOLD';
  const bonusEntries = isGoldMember ? 5 : 0;
  const totalTickets = numTickets + bonusEntries;
  const totalCost = numTickets * raffle.ticketPrice;

  const handlePurchase = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);
    setAgeVerificationRequired(false);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Purchase tickets
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffle.id}/purchase`,
        {
          customerId: user.id,
          customerEmail: user.email,
          customerName: user.name,
          numTickets,
          paymentMethod: {
            type: 'credit_card',
            token: paymentMethod.id
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Success!
      const { transaction, tickets } = response.data;

      // Show success message
      alert(`Success! You purchased ${transaction.numTickets} tickets.
Your ticket numbers: ${tickets.map(t => t.ticketNumber).join(', ')}
${transaction.bonusEntries > 0 ? `\n\nGold Member Bonus: ${transaction.bonusEntries} extra entries!` : ''}`);

      onSuccess();
    } catch (err) {
      console.error('Purchase failed:', err);

      if (err.response?.data?.requiresAgeVerification) {
        setAgeVerificationRequired(true);
        setError('Age verification required. You must be 21+ to purchase raffle tickets.');
      } else {
        setError(err.response?.data?.error || 'Purchase failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2>Purchase Raffle Tickets</h2>

        <div className="raffle-summary">
          <h3>{raffle.name}</h3>
          <p className="prize">{raffle.prize}</p>
        </div>

        <form onSubmit={handlePurchase}>
          <div className="form-group">
            <label>Number of Tickets</label>
            <div className="ticket-selector">
              <button
                type="button"
                onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                disabled={numTickets <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={numTickets}
                onChange={(e) => setNumTickets(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              />
              <button
                type="button"
                onClick={() => setNumTickets(Math.min(100, numTickets + 1))}
                disabled={numTickets >= 100}
              >
                +
              </button>
            </div>
            <small>Limit: 1-100 tickets per purchase</small>
          </div>

          {isGoldMember && (
            <div className="gold-bonus-alert">
              <strong>Gold Member Bonus!</strong>
              <p>You'll receive {bonusEntries} bonus entries with this purchase.</p>
            </div>
          )}

          <div className="purchase-summary">
            <div className="summary-row">
              <span>Tickets ({numTickets} × ${raffle.ticketPrice})</span>
              <strong>${totalCost.toFixed(2)}</strong>
            </div>
            {bonusEntries > 0 && (
              <div className="summary-row bonus">
                <span>Bonus Entries</span>
                <strong>+{bonusEntries} FREE</strong>
              </div>
            )}
            <div className="summary-row total">
              <span>Total Entries</span>
              <strong>{totalTickets} tickets</strong>
            </div>
            <div className="summary-row total">
              <span>Total Cost</span>
              <strong>${totalCost.toFixed(2)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label>Payment Information</label>
            <div className="card-element-container">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              {ageVerificationRequired && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => window.location.href = '/age-verification'}
                >
                  Verify Age Now
                </button>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={processing || !stripe}
            >
              {processing ? 'Processing...' : `Pay $${totalCost.toFixed(2)}`}
            </button>
          </div>
        </form>

        <div className="purchase-disclaimer">
          <small>
            By purchasing tickets, you confirm that you are 21+ years old and agree to our
            <a href="/terms"> Terms & Conditions</a>.
            All sales are final. Drawing conducted with cryptographically secure randomness.
          </small>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchaseModal;
```

---

## My Tickets Dashboard

```jsx
// components/MyTicketsDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import './MyTicketsDashboard.css';

const MyTicketsDashboard = () => {
  const { user, token } = useAuth();
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaffles();
  }, []);

  useEffect(() => {
    if (selectedRaffle) {
      fetchTickets(selectedRaffle);
    }
  }, [selectedRaffle]);

  const fetchRaffles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles`
      );
      const activeRaffles = response.data.raffles;
      setRaffles(activeRaffles);
      if (activeRaffles.length > 0) {
        setSelectedRaffle(activeRaffles[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch raffles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async (raffleId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}/tickets/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTickets(response.data.tickets);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setTickets([]);
    }
  };

  if (loading) {
    return <div className="loading">Loading your tickets...</div>;
  }

  const currentRaffle = raffles.find(r => r.id === selectedRaffle);
  const paidTickets = tickets.filter(t => !t.isBonusEntry);
  const bonusTickets = tickets.filter(t => t.isBonusEntry);

  return (
    <div className="my-tickets-dashboard">
      <header className="dashboard-header">
        <h1>My Raffle Tickets</h1>
        <p>View all your raffle entries and track your chances to win!</p>
      </header>

      {raffles.length === 0 ? (
        <div className="no-raffles">
          <p>No active raffles at this time.</p>
          <button onClick={() => window.location.href = '/raffles'}>
            Browse Raffles
          </button>
        </div>
      ) : (
        <>
          <div className="raffle-selector">
            <label>Select Raffle:</label>
            <select
              value={selectedRaffle}
              onChange={(e) => setSelectedRaffle(e.target.value)}
            >
              {raffles.map(raffle => (
                <option key={raffle.id} value={raffle.id}>
                  {raffle.name}
                </option>
              ))}
            </select>
          </div>

          {currentRaffle && (
            <div className="raffle-info-card">
              <h2>{currentRaffle.name}</h2>
              <p className="prize">{currentRaffle.prize}</p>
              <div className="raffle-meta">
                <span>Draw Date: {new Date(currentRaffle.drawDate).toLocaleDateString()}</span>
                <span className={`status-badge status-${currentRaffle.status}`}>
                  {currentRaffle.status.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {tickets.length === 0 ? (
            <div className="no-tickets">
              <p>You don't have any tickets for this raffle yet.</p>
              <button
                onClick={() => window.location.href = `/raffles/${selectedRaffle}`}
              >
                Buy Tickets
              </button>
            </div>
          ) : (
            <>
              <div className="tickets-summary">
                <div className="summary-card">
                  <strong>{tickets.length}</strong>
                  <span>Total Entries</span>
                </div>
                <div className="summary-card">
                  <strong>{paidTickets.length}</strong>
                  <span>Purchased</span>
                </div>
                <div className="summary-card bonus">
                  <strong>{bonusTickets.length}</strong>
                  <span>Bonus</span>
                </div>
                <div className="summary-card">
                  <strong>
                    {currentRaffle ? ((tickets.length / currentRaffle.maxTickets) * 100).toFixed(3) : 0}%
                  </strong>
                  <span>Win Probability</span>
                </div>
              </div>

              <div className="tickets-section">
                <h3>Your Ticket Numbers</h3>

                {paidTickets.length > 0 && (
                  <div className="ticket-group">
                    <h4>Purchased Tickets ({paidTickets.length})</h4>
                    <div className="ticket-grid">
                      {paidTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          className={`ticket-number ${ticket.isWinner ? 'winner' : ''} ${ticket.isRunnerUp ? 'runner-up' : ''}`}
                        >
                          <span className="number">{ticket.ticketNumber}</span>
                          {ticket.isWinner && <span className="badge winner-badge">WINNER!</span>}
                          {ticket.isRunnerUp && <span className="badge runner-up-badge">Runner-Up #{ticket.runnerUpRank}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bonusTickets.length > 0 && (
                  <div className="ticket-group bonus-group">
                    <h4>Bonus Entries ({bonusTickets.length})</h4>
                    <div className="ticket-grid">
                      {bonusTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          className={`ticket-number bonus ${ticket.isWinner ? 'winner' : ''} ${ticket.isRunnerUp ? 'runner-up' : ''}`}
                        >
                          <span className="number">{ticket.ticketNumber}</span>
                          <span className="badge bonus-badge">BONUS</span>
                          {ticket.isWinner && <span className="badge winner-badge">WINNER!</span>}
                          {ticket.isRunnerUp && <span className="badge runner-up-badge">Runner-Up #{ticket.runnerUpRank}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="purchase-info">
                <p>
                  <strong>Total Spent:</strong> ${(paidTickets.length * (currentRaffle?.ticketPrice || 0)).toFixed(2)}
                </p>
                <p>
                  <strong>First Purchase:</strong> {new Date(paidTickets[0]?.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyTicketsDashboard;
```

---

## Admin Dashboard

```jsx
// components/admin/RaffleAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './RaffleAdminDashboard.css';

const RaffleAdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [raffles, setRaffles] = useState([]);
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, rafflesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/raffles/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/raffles`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data.stats);
      setRaffles(rafflesRes.data.raffles);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConductDrawing = async (raffleId) => {
    if (!window.confirm('Are you sure you want to conduct the drawing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}/draw`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { drawing } = response.data;

      alert(`Drawing Complete!
Winner: ${drawing.winner.customerName}
Ticket #${drawing.winner.ticketNumber}

Runner-Ups:
${drawing.runnerUps.map(r => `#${r.rank}: ${r.customerName} (Ticket #${r.ticketNumber})`).join('\n')}

Audit Hash: ${drawing.auditTrail.auditHash.substring(0, 16)}...`);

      fetchDashboardData();
    } catch (err) {
      alert('Drawing failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelRaffle = async (raffleId) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    if (!window.confirm('This will refund all ticket purchases. Continue?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}/cancel`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason }
        }
      );

      alert(`Raffle cancelled successfully.
Refunds processed: ${response.data.refunds.successful}/${response.data.refunds.total}`);

      fetchDashboardData();
    } catch (err) {
      alert('Cancellation failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="raffle-admin-dashboard">
      <header className="dashboard-header">
        <h1>Raffle Admin Dashboard</h1>
      </header>

      {/* Stats Overview */}
      {stats && (
        <section className="stats-overview">
          <div className="stat-card">
            <h3>Total Raffles</h3>
            <div className="stat-value">{stats.totalRaffles}</div>
          </div>
          <div className="stat-card">
            <h3>Active Raffles</h3>
            <div className="stat-value">{stats.activeRaffles}</div>
          </div>
          <div className="stat-card highlight">
            <h3>Total Revenue</h3>
            <div className="stat-value">${parseFloat(stats.totalRevenue).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Tickets Sold</h3>
            <div className="stat-value">{stats.totalTicketsSold.toLocaleString()}</div>
          </div>
        </section>
      )}

      {/* Raffles List */}
      <section className="raffles-section">
        <div className="section-header">
          <h2>Manage Raffles</h2>
          <button className="btn-primary" onClick={() => window.location.href = '/admin/raffles/new'}>
            Create New Raffle
          </button>
        </div>

        <div className="raffles-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
                <th>Draw Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map(raffle => (
                <tr key={raffle.id}>
                  <td>
                    <strong>{raffle.name}</strong>
                    <br />
                    <small>{raffle.prize}</small>
                  </td>
                  <td>
                    <span className={`status-badge status-${raffle.status}`}>
                      {raffle.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {raffle.ticketsSold} / {raffle.maxTickets}
                    <br />
                    <small>{((raffle.ticketsSold / raffle.maxTickets) * 100).toFixed(1)}%</small>
                  </td>
                  <td>${raffle.totalRevenue.toLocaleString()}</td>
                  <td>{new Date(raffle.drawDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => window.location.href = `/admin/raffles/${raffle.id}`}
                      >
                        View
                      </button>
                      {(raffle.status === 'active' || raffle.status === 'sold_out') && (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleConductDrawing(raffle.id)}
                        >
                          Conduct Drawing
                        </button>
                      )}
                      {raffle.status !== 'drawn' && raffle.status !== 'completed' && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleCancelRaffle(raffle.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Revenue by Status */}
      {stats && stats.byStatus && (
        <section className="revenue-breakdown">
          <h2>Revenue by Status</h2>
          <div className="breakdown-grid">
            {stats.byStatus.map(item => (
              <div key={item.status} className="breakdown-card">
                <h3 className={`status-${item.status}`}>{item.status.toUpperCase()}</h3>
                <div className="breakdown-stat">
                  <span>Count:</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="breakdown-stat">
                  <span>Revenue:</span>
                  <strong>${parseFloat(item.revenue).toLocaleString()}</strong>
                </div>
                <div className="breakdown-stat">
                  <span>Tickets:</span>
                  <strong>{item.ticketsSold.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default RaffleAdminDashboard;
```

---

## Drawing Results Page

```jsx
// components/DrawingResults.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import './DrawingResults.css';

const DrawingResults = ({ raffleId }) => {
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchRaffleResults();
  }, [raffleId]);

  const fetchRaffleResults = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/raffles/${raffleId}`
      );
      setRaffle(response.data.raffle);
      if (response.data.raffle.status === 'drawn') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 10000);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (!raffle || raffle.status !== 'drawn') {
    return <div className="no-results">Drawing has not been conducted yet.</div>;
  }

  return (
    <div className="drawing-results">
      {showConfetti && <Confetti />}

      <header className="results-header">
        <h1>{raffle.name}</h1>
        <p className="subtitle">Drawing Results</p>
      </header>

      <section className="winner-announcement">
        <div className="winner-card">
          <div className="trophy-icon">🏆</div>
          <h2>Grand Prize Winner</h2>
          <div className="prize-amount">{raffle.prize}</div>
          <div className="winning-ticket">
            <span className="label">Winning Ticket:</span>
            <span className="ticket-number">#{raffle.winner.ticketNumber}</span>
          </div>
          <p className="draw-date">
            Drawn on {new Date(raffle.draw_timestamp).toLocaleString()}
          </p>
        </div>
      </section>

      {raffle.runnerUps && raffle.runnerUps.length > 0 && (
        <section className="runner-ups">
          <h2>Runner-Ups</h2>
          <div className="runner-ups-grid">
            {raffle.runnerUps.map((runnerUp, index) => (
              <div key={index} className="runner-up-card">
                <div className="rank">#{runnerUp.rank}</div>
                <div className="ticket-info">
                  <strong>Ticket #{runnerUp.ticketNumber}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="drawing-info">
        <h2>Drawing Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Total Tickets Sold:</strong>
            <span>{raffle.ticketsSold.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <strong>Total Revenue:</strong>
            <span>${raffle.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <strong>Drawing Method:</strong>
            <span>Cryptographically Secure Random Selection</span>
          </div>
          <div className="info-item">
            <strong>Verification:</strong>
            <span>Audit trail available upon request</span>
          </div>
        </div>
      </section>

      <section className="next-raffle">
        <h2>Next Raffle Coming Soon!</h2>
        <p>Stay tuned for our next quarterly raffle announcement.</p>
        <button onClick={() => window.location.href = '/raffles'}>
          View Current Raffles
        </button>
      </section>
    </div>
  );
};

export default DrawingResults;
```

---

## Styling Examples

```css
/* RafflePage.css */
.raffle-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.raffle-hero {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.raffle-hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.raffle-prize {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffd700;
  margin: 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.btn-primary {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.ticket-number {
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  transition: all 0.3s;
}

.ticket-number.bonus {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fff9e6, #ffffff);
}

.ticket-number.winner {
  border-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-active {
  background: #4caf50;
  color: white;
}

.status-sold_out {
  background: #ff9800;
  color: white;
}

.status-drawn {
  background: #2196f3;
  color: white;
}

.status-completed {
  background: #9c27b0;
  color: white;
}

.status-cancelled {
  background: #f44336;
  color: white;
}
```

These complete frontend examples provide a production-ready raffle system interface with all necessary components for customer and admin interactions.

<!-- Last verified: 2025-10-02 -->
