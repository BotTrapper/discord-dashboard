import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService, type Ticket } from '../lib/api';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface TicketCardProps {
  ticket: Ticket;
  onClose: (ticketId: number) => void;
  onDelete: (ticketId: number) => void;
}

function TicketCard({ ticket, onClose, onDelete }: TicketCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'closed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <TicketIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {getStatusIcon(ticket.status)}
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ticket #{ticket.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by {ticket.username}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none z-10">
                <div className="py-1">
                  {ticket.status === 'open' && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onClose(ticket.id)}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-3 text-green-500" />
                          Close Ticket
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onDelete(ticket.id)}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 w-full text-left`}
                      >
                        <TrashIcon className="h-4 w-4 mr-3" />
                        Delete Ticket
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          {ticket.reason}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          Created: {new Date(ticket.created_at).toLocaleDateString()}
        </span>
        {ticket.closed_at && (
          <span>
            Closed: {new Date(ticket.closed_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Tickets() {
  const { guildId } = useParams<{ guildId: string }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (guildId) {
      loadTickets();
    }
  }, [guildId, filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filterParam = filter === 'all' ? undefined : filter;
      const ticketData = await apiService.getTickets(guildId!, filterParam);
      setTickets(ticketData);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId: number) => {
    try {
      await apiService.closeTicket(ticketId);
      await loadTickets(); // Reload tickets
    } catch (err) {
      console.error('Error closing ticket:', err);
      alert('Failed to close ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      await apiService.deleteTicket(ticketId);
      await loadTickets(); // Reload tickets
    } catch (err) {
      console.error('Error deleting ticket:', err);
      alert('Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ticket Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage support tickets for your server
          </p>
        </div>
        <button
          onClick={loadTickets}
          className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <TicketIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{tickets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{openTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Closed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{closedTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'closed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === filterOption
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <XMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Tickets
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadTickets}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Tickets Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'No tickets match your search criteria.'
              : tickets.length === 0
              ? 'No tickets have been created yet.'
              : 'No tickets match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClose={handleCloseTicket}
              onDelete={handleDeleteTicket}
            />
          ))}
        </div>
      )}
    </div>
  );
}
