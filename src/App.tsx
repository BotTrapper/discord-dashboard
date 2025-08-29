import { useState, useEffect } from 'react';
import { apiService, type Ticket, type AutoResponse, type Webhook, type CommandStat } from './services/api';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [commandStats, setCommandStats] = useState<CommandStat[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isApiConnected, setIsApiConnected] = useState(false);

  // Load data from API
  useEffect(() => {
    loadData();
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    const isConnected = await apiService.checkApiHealth();
    setIsApiConnected(isConnected);
  };

  const loadData = async () => {
    try {
      const [ticketsData, responsesData, webhooksData, statsData] = await Promise.all([
        apiService.getTickets(),
        apiService.getAutoResponses(),
        apiService.getWebhooks(),
        apiService.getCommandStats(7)
      ]);

      setTickets(ticketsData);
      setAutoResponses(responsesData);
      setWebhooks(webhooksData);
      setCommandStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data if API is not available
      setTickets([
        { id: 1, user_id: '123', username: 'User123', reason: 'Bug Report', status: 'open', channel_id: '456', created_at: '2024-01-01', guild_id: '789' },
        { id: 2, user_id: '124', username: 'TestUser', reason: 'Feature Request', status: 'closed', channel_id: '457', created_at: '2024-01-02', guild_id: '789' }
      ]);
      setAutoResponses([
        { id: 1, trigger_word: 'hallo', response_text: 'Hallo! Wie kann ich helfen?', is_embed: false, guild_id: '789', created_at: '2024-01-01' },
        { id: 2, trigger_word: 'help', response_text: 'Hier ist die Hilfe...', is_embed: true, guild_id: '789', created_at: '2024-01-02' }
      ]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 Discord Bot Dashboard</h1>
        <div className="status-indicator">
          <span className={`status-dot ${isApiConnected ? 'connected' : 'disconnected'}`}></span>
          {isApiConnected ? 'API Connected' : 'API Disconnected'}
        </div>
        <nav>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'tickets' ? 'active' : ''}
            onClick={() => setActiveTab('tickets')}
          >
            Tickets
          </button>
          <button 
            className={activeTab === 'autoresponse' ? 'active' : ''}
            onClick={() => setActiveTab('autoresponse')}
          >
            Auto-Response
          </button>
          <button 
            className={activeTab === 'webhooks' ? 'active' : ''}
            onClick={() => setActiveTab('webhooks')}
          >
            Webhooks
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Statistiken
          </button>
          <button 
            className={activeTab === 'embed' ? 'active' : ''}
            onClick={() => setActiveTab('embed')}
          >
            Embed Builder
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>📊 Übersicht</h2>
            <div className="stats">
              <div className="stat-card">
                <h3>Offene Tickets</h3>
                <p>{tickets.filter(t => t.status === 'open').length}</p>
              </div>
              <div className="stat-card">
                <h3>Geschlossene Tickets</h3>
                <p>{tickets.filter(t => t.status === 'closed').length}</p>
              </div>
              <div className="stat-card">
                <h3>Auto-Responses</h3>
                <p>{autoResponses.length}</p>
              </div>
              <div className="stat-card">
                <h3>Webhooks</h3>
                <p>{webhooks.length}</p>
              </div>
              <div className="stat-card">
                <h3>Commands (7 Tage)</h3>
                <p>{commandStats.reduce((sum, stat) => sum + stat.usage_count, 0)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets">
            <h2>🎫 Ticket System</h2>
            <div className="action-buttons">
              <button onClick={loadData}>🔄 Aktualisieren</button>
            </div>
            <div className="ticket-list">
              {tickets.map(ticket => (
                <div key={ticket.id} className={`ticket-item ${ticket.status}`}>
                  <h4>#{ticket.id} - {ticket.username}</h4>
                  <p>{ticket.reason}</p>
                  <div className="ticket-meta">
                    <span className={`status ${ticket.status}`}>{ticket.status}</span>
                    <span className="date">{new Date(ticket.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'autoresponse' && (
          <div className="autoresponse">
            <h2>🤖 Automatische Antworten</h2>
            <div className="action-buttons">
              <button onClick={loadData}>🔄 Aktualisieren</button>
            </div>
            <div className="response-list">
              {autoResponses.map((response) => (
                <div key={response.id} className="response-item">
                  <h4>{response.trigger_word}</h4>
                  <p>{response.response_text}</p>
                  <span className={`type ${response.is_embed ? 'embed' : 'text'}`}>
                    {response.is_embed ? 'Embed' : 'Text'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="webhooks">
            <h2>🔗 Webhooks</h2>
            <div className="action-buttons">
              <button onClick={loadData}>🔄 Aktualisieren</button>
            </div>
            <div className="webhook-list">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="webhook-item">
                  <h4>{webhook.name}</h4>
                  <p>{webhook.url.substring(0, 50)}...</p>
                  <span className="date">{new Date(webhook.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-view">
            <h2>📈 Statistiken</h2>
            <div className="action-buttons">
              <button onClick={loadData}>🔄 Aktualisieren</button>
            </div>
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Top Commands (7 Tage)</h3>
                <div className="command-stats">
                  {commandStats.slice(0, 5).map((stat, index) => (
                    <div key={stat.command_name} className="command-stat">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{stat.command_name}</span>
                      <span className="count">{stat.usage_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="embed-builder">
            <h2>📝 Embed Builder</h2>
            <div className="embed-form">
              <input type="text" placeholder="Titel" />
              <textarea placeholder="Beschreibung"></textarea>
              <input type="color" />
              <button>Embed erstellen</button>
            </div>
            <div className="embed-preview">
              <h3>Vorschau</h3>
              <div className="embed-mock">
                <div className="embed-content">
                  <h4>Beispiel Titel</h4>
                  <p>Beispiel Beschreibung...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
