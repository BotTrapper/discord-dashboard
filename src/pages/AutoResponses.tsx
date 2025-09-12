import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type AutoResponse } from '../lib/api';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CreateAutoResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    trigger: string;
    response: string;
    isEmbed: boolean;
    embedTitle?: string;
    embedDescription?: string;
    embedColor?: string;
  }) => void;
}

function CreateAutoResponseModal({ isOpen, onClose, onSubmit }: CreateAutoResponseModalProps) {
  const [formData, setFormData] = useState({
    trigger: '',
    response: '',
    isEmbed: false,
    embedTitle: '',
    embedDescription: '',
    embedColor: '#5865F2',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      embedColor: formData.isEmbed ? formData.embedColor : undefined,
    });
    onClose();
    setFormData({
      trigger: '',
      response: '',
      isEmbed: false,
      embedTitle: '',
      embedDescription: '',
      embedColor: '#5865F2',
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  Create Auto Response
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trigger Word/Phrase
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.trigger}
                      onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="hello"
                    />
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="isEmbed"
                        checked={formData.isEmbed}
                        onChange={(e) => setFormData({ ...formData, isEmbed: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isEmbed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Create as Embed
                      </label>
                    </div>
                  </div>

                  {formData.isEmbed ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Embed Title
                        </label>
                        <input
                          type="text"
                          value={formData.embedTitle}
                          onChange={(e) => setFormData({ ...formData, embedTitle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Auto Response"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Embed Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.embedDescription}
                          onChange={(e) => setFormData({ ...formData, embedDescription: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Response message..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Embed Color
                        </label>
                        <input
                          type="color"
                          value={formData.embedColor}
                          onChange={(e) => setFormData({ ...formData, embedColor: e.target.value })}
                          className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Response Message
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formData.response}
                        onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Hello! How can I help you today?"
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Create Response
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function AutoResponses() {
  const { guildId } = useParams<{ guildId: string }>();
  const [responses, setResponses] = useState<AutoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (guildId) {
      loadAutoResponses();
    }
  }, [guildId]);

  const loadAutoResponses = async () => {
    try {
      setLoading(true);
      const responseData = await api.getAutoResponses(guildId!);
      setResponses(responseData);
    } catch (err) {
      console.error('Error loading auto responses:', err);
      setError('Failed to load auto responses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutoResponse = async (data: any) => {
    try {
      await api.createAutoResponse({
        ...data,
        guildId: guildId!,
        embedColor: data.embedColor ? parseInt(data.embedColor.replace('#', ''), 16) : undefined,
      });
      await loadAutoResponses();
    } catch (err) {
      console.error('Error creating auto response:', err);
      alert('Failed to create auto response');
    }
  };

  const handleDeleteAutoResponse = async (trigger: string) => {
    if (!confirm(`Are you sure you want to delete the auto response for "${trigger}"?`)) {
      return;
    }

    try {
      await api.deleteAutoResponse(guildId!, trigger);
      await loadAutoResponses();
    } catch (err) {
      console.error('Error deleting auto response:', err);
      alert('Failed to delete auto response');
    }
  };

  const filteredResponses = responses.filter(response =>
    response.trigger_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.response_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24"></div>
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
            Auto Responses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage automatic responses to keywords and phrases
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={loadAutoResponses}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Response
          </button>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search auto responses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Auto Responses List */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <XMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Auto Responses
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadAutoResponses}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Auto Responses Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm
              ? 'No auto responses match your search criteria.'
              : 'Create your first auto response to get started.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Auto Response
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredResponses.map((response) => (
            <div
              key={response.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {response.is_embed ? (
                      <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                    ) : (
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">
                      {response.trigger_word}
                    </span>
                    {response.is_embed && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-2 py-1 rounded">
                        Embed
                      </span>
                    )}
                  </div>

                  {response.is_embed ? (
                    <div className="border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-r-lg">
                      {response.embed_title && (
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {response.embed_title}
                        </h4>
                      )}
                      <p className="text-gray-700 dark:text-gray-300">
                        {response.embed_description || response.response_text}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      {response.response_text}
                    </p>
                  )}

                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Created: {new Date(response.created_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAutoResponse(response.trigger_word)}
                  className="ml-4 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateAutoResponseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAutoResponse}
      />
    </div>
  );
}
