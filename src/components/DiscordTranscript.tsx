import React from 'react';

interface TranscriptMessage {
  id: string;
  timestamp: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
    displayName: string;
  };
  content: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    proxyUrl: string;
    size: number;
    contentType: string;
    width?: number;
    height?: number;
  }>;
  embeds: Array<{
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    timestamp?: string;
    footer?: { text: string; iconURL?: string };
    image?: { url: string; width?: number; height?: number };
    thumbnail?: { url: string; width?: number; height?: number };
    author?: { name: string; url?: string; iconURL?: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }>;
  reactions: Array<{
    emoji: {
      name: string;
      id?: string;
      animated?: boolean;
    };
    count: number;
  }>;
  edited: string | null;
  pinned: boolean;
  type: number;
}

interface TranscriptData {
  header: {
    channelName: string;
    channelId: string;
    guildName: string;
    generated: string;
    totalMessages: number;
  };
  messages: TranscriptMessage[];
}

interface DiscordTranscriptProps {
  transcriptJson: string;
}

const DiscordTranscript: React.FC<DiscordTranscriptProps> = ({ transcriptJson }) => {
  let transcriptData: TranscriptData;

  try {
    transcriptData = JSON.parse(transcriptJson);
  } catch (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
        <p className="text-red-700 dark:text-red-300">Fehler beim Laden des Transcripts</p>
      </div>
    );
  }

  const getAvatarUrl = (author: TranscriptMessage['author']) => {
    if (author.avatar) {
      return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.webp?size=40`;
    }
    // Default Discord avatar based on discriminator
    const defaultAvatarId = parseInt(author.discriminator) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (date.toDateString() === today.toDateString()) {
      return `Heute um ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Gestern um ${timeStr}`;
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ` um ${timeStr}`;
    }
  };

  const renderEmbed = (embed: TranscriptMessage['embeds'][0], index: number) => {
    const borderColor = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#202225';

    return (
      <div key={index} className="max-w-lg mt-2">
        <div
          className="border-l-4 bg-gray-50 dark:bg-gray-800/50 rounded-r p-4"
          style={{ borderLeftColor: borderColor }}
        >
          {/* Embed Author */}
          {embed.author && (
            <div className="flex items-center mb-2">
              {embed.author.iconURL && (
                <img
                  src={embed.author.iconURL}
                  alt=""
                  className="w-5 h-5 rounded-full mr-2"
                />
              )}
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {embed.author.name}
              </span>
            </div>
          )}

          {/* Embed Title */}
          {embed.title && (
            <div className="mb-2">
              {embed.url ? (
                <a
                  href={embed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  {embed.title}
                </a>
              ) : (
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {embed.title}
                </h3>
              )}
            </div>
          )}

          {/* Embed Description */}
          {embed.description && (
            <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {embed.description}
            </div>
          )}

          {/* Embed Fields */}
          {embed.fields && embed.fields.length > 0 && (
            <div className="grid gap-2 mb-3">
              {embed.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className={field.inline ? "inline-block mr-4" : "block"}>
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
                    {field.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Embed Thumbnail */}
          {embed.thumbnail && (
            <div className="float-right ml-4 mb-2">
              <img
                src={embed.thumbnail.url}
                alt=""
                className="max-w-20 max-h-20 rounded"
              />
            </div>
          )}

          {/* Embed Image */}
          {embed.image && (
            <div className="mt-3">
              <img
                src={embed.image.url}
                alt=""
                className="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(embed.image!.url, '_blank')}
              />
            </div>
          )}

          {/* Embed Footer */}
          {(embed.footer || embed.timestamp) && (
            <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
              {embed.footer?.iconURL && (
                <img
                  src={embed.footer.iconURL}
                  alt=""
                  className="w-4 h-4 rounded-full mr-2"
                />
              )}
              {embed.footer?.text && <span>{embed.footer.text}</span>}
              {embed.footer?.text && embed.timestamp && <span className="mx-1">•</span>}
              {embed.timestamp && (
                <span>{formatTimestamp(embed.timestamp)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAttachment = (attachment: TranscriptMessage['attachments'][0], index: number) => {
    const isImage = attachment.contentType?.startsWith('image/');
    const isVideo = attachment.contentType?.startsWith('video/');

    return (
      <div key={index} className="mt-2">
        {isImage ? (
          <div className="relative inline-block">
            <img
              src={attachment.proxyUrl || attachment.url}
              alt={attachment.name}
              className="max-w-md max-h-80 rounded cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(attachment.url, '_blank')}
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {attachment.name}
            </div>
          </div>
        ) : isVideo ? (
          <video
            controls
            className="max-w-md max-h-80 rounded"
            src={attachment.url}
          >
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              {attachment.name}
            </a>
          </video>
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {attachment.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(attachment.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </a>
        )}
      </div>
    );
  };

  if (transcriptData.messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Keine Nachrichten im Transcript gefunden
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      {/* Header */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-gray-500 rounded mr-3 flex items-center justify-center">
            <span className="text-white text-sm font-bold">#</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {transcriptData.header.channelName}
          </h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>{transcriptData.header.guildName}</p>
          <p>{transcriptData.header.totalMessages} Nachrichten • Generiert: {formatTimestamp(transcriptData.header.generated)}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {transcriptData.messages.map((message, index) => (
          <div key={message.id} className="group hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded p-2 transition-colors">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={getAvatarUrl(message.author)}
                  alt={message.author.displayName}
                  className="w-10 h-10 rounded-full"
                />
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Author and Timestamp */}
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {message.author.displayName}
                  </span>
                  {message.author.bot && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      BOT
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.edited && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      (bearbeitet)
                    </span>
                  )}
                  {message.pinned && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      📌
                    </span>
                  )}
                </div>

                {/* Message Text */}
                {message.content && (
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                )}

                {/* Attachments */}
                {message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map(renderAttachment)}
                  </div>
                )}

                {/* Embeds */}
                {message.embeds.length > 0 && (
                  <div className="space-y-2">
                    {message.embeds.map(renderEmbed)}
                  </div>
                )}

                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction, reactionIndex) => (
                      <div key={reactionIndex} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1">
                        <span className="text-sm mr-1">
                          {reaction.emoji.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {reaction.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscordTranscript;
