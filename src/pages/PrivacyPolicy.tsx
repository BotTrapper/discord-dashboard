import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy (Datenschutzerklärung)
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            <strong>Zuletzt aktualisiert:</strong> 18.09.2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                1. Verantwortlicher
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Verantwortlich für die Datenverarbeitung ist:
                <br />
                <strong>BotTrapper</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>
                  <strong>E-Mail:</strong> support@bottrapper.me
                </li>
                <li>
                  <strong>Discord:</strong> Support über den offiziellen
                  BotTrapper Discord-Server
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                2. Erhobene Daten
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Der Bot kann folgende Daten verarbeiten:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Discord-Benutzer-IDs und Server-IDs</li>
                <li>
                  Nachrichteninhalte, falls sie für Ticketfunktionen gespeichert
                  werden
                </li>
                <li>Zeitstempel von Interaktionen</li>
                <li>Log-Daten zur Fehlerbehebung</li>
                <li>
                  Audit-Informationen (z. B. wer ein Ticket erstellt oder
                  geschlossen hat)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                3. Zweck der Verarbeitung
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Die Daten werden verarbeitet, um:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Die Ticket- und Bot-Funktionen bereitzustellen</li>
                <li>Missbrauch zu verhindern und den Dienst zu schützen</li>
                <li>Fehler zu analysieren und die Stabilität zu verbessern</li>
                <li>Moderationsmaßnahmen nachvollziehbar zu dokumentieren</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                4. Speicherung und Löschung
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Ticket-Inhalte:</strong> werden{" "}
                  <strong>60 Tage</strong> nach Schließen des Tickets
                  automatisch gelöscht
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Fehler- und Debug-Logs:</strong> werden nach{" "}
                  <strong>21 Tagen</strong> automatisch gelöscht
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Moderationsdaten (z. B. Bans, Mutes):</strong> werden
                  nur so lange gespeichert, wie die Maßnahme aktiv ist, danach
                  gelöscht
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Audit-Logs:</strong> werden nach{" "}
                  <strong>90 Tagen</strong> automatisch gelöscht
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Statistische Daten:</strong> werden nur anonymisiert
                  dauerhaft gespeichert, sodass keine Rückschlüsse auf einzelne
                  Nutzer möglich sind
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Temporäre Caches (z. B. Discord-Nutzernamen):</strong>{" "}
                  werden innerhalb weniger Stunden automatisch verworfen
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                5. Weitergabe an Dritte
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Daten werden nicht an Dritte weitergegeben, außer wenn dies
                gesetzlich vorgeschrieben ist oder technisch notwendig (z. B.
                Hosting-Provider).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                6. Rechtsgrundlage
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Rechtsgrundlage der Verarbeitung ist:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>
                  <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Erfüllung eines
                  Vertrags)
                </li>
                <li>
                  <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes
                  Interesse an einem sicheren und funktionierenden Service)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                7. Rechte der Nutzer
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Du hast jederzeit das Recht auf:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>
                  <strong>Auskunft</strong> über gespeicherte Daten
                </li>
                <li>
                  <strong>Berichtigung</strong> oder <strong>Löschung</strong>{" "}
                  deiner Daten
                </li>
                <li>
                  <strong>Einschränkung</strong> der Verarbeitung
                </li>
                <li>
                  <strong>Widerspruch</strong> gegen die Verarbeitung
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Anfragen kannst du an die oben genannte Kontaktadresse richten.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                8. Änderungen der Datenschutzerklärung
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Diese Datenschutzerklärung kann angepasst werden, um sie an neue
                rechtliche Anforderungen oder Änderungen am Bot anzupassen.
                <br />
                Änderungen werden mindestens{" "}
                <strong>7 Tage vor Inkrafttreten</strong> angekündigt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                9. Abschaltung des Dienstes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Sollte der Dienst eingestellt werden, werden alle gespeicherten
                Daten spätestens mit der Abschaltung gelöscht.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
