import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { authService } from '../lib/auth';
import DiscordTranscript from '../components/DiscordTranscript';

interface TicketStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
}

interface TicketTranscript {
  id: number;
  user_id: string;
  username: string;
  reason: string;
  created_at: string;
  closed_at: string;
}

interface TranscriptDetail {
  id: number;
  user_id: string;
  username: string;
  reason: string;
  transcript: string;
  created_at: string;
  closed_at: string;
}

const Tickets: React.FC = () => {
  const { guildId } = useParams<{ guildId: string }>();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [transcripts, setTranscripts] = useState<TicketTranscript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (guildId) {
      loadData();
    }
  }, [guildId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load ticket statistics using authService.apiRequest
      const [allTicketsResponse, openTicketsResponse, transcriptListResponse] = await Promise.all([
        authService.apiRequest(`/api/tickets/${guildId}`),
        authService.apiRequest(`/api/tickets/${guildId}?status=open`),
        authService.apiRequest(`/api/tickets/${guildId}/transcripts`)
      ]);

      const allTicketsData = await allTicketsResponse.json();
      const openTicketsData = await openTicketsResponse.json();
      const transcriptListData = await transcriptListResponse.json();

      setStats({
        totalTickets: allTicketsData.length,
        openTickets: openTicketsData.length,
        closedTickets: allTicketsData.length - openTicketsData.length
      });

      setTranscripts(transcriptListData);
    } catch (err) {
      console.error('Error loading tickets data:', err);
      setError('Fehler beim Laden der Ticket-Daten');
    } finally {
      setLoading(false);
    }
  };

  const openTranscript = async (ticketId: number) => {
    try {
      const response = await authService.apiRequest(`/api/tickets/${guildId}/transcript/${ticketId}`);
      const transcriptData = await response.json();
      setSelectedTranscript(transcriptData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading transcript:', err);
      setError('Fehler beim Laden des Transcripts');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTranscript(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ticket-Statistiken und Transcript-Übersicht
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Tickets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.totalTickets}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Offene Tickets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.openTickets}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Geschlossene Tickets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.closedTickets}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transcripts Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Ticket Transcripte
            </h3>

            {transcripts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Keine Transcripte verfügbar
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Geschlossene Tickets mit Transcripten werden hier angezeigt.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Benutzer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Grund
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Erstellt
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Geschlossen
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transcripts.map((transcript) => (
                      <tr key={transcript.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{transcript.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {transcript.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                          {transcript.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {formatDate(transcript.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {transcript.closed_at ? formatDate(transcript.closed_at) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openTranscript(transcript.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Transcript anzeigen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Modal */}
        {isModalOpen && selectedTranscript && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Ticket #{selectedTranscript.id} - Transcript
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Benutzer:</span>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTranscript.username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Grund:</span>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTranscript.reason}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Erstellt:</span>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedTranscript.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Geschlossen:</span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedTranscript.closed_at ? formatDate(selectedTranscript.closed_at) : '-'}
                    </p>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <DiscordTranscript transcriptJson={selectedTranscript.transcript || '{}'} />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
