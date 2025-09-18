import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service (Nutzungsbedingungen)
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            <strong>Zuletzt aktualisiert:</strong> 18.09.2025
          </p>

          <div className="prose dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                1. Beschreibung des Dienstes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Dieser Discord-Bot („der Bot") bietet verschiedene Funktionen,
                darunter insbesondere ein Ticketsystem, Moderations- und
                Automatisierungs-Features.
                <br />
                Der Bot wird kostenlos bereitgestellt und kann jederzeit
                verändert oder eingestellt werden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                2. Nutzungsvoraussetzungen
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Durch die Verwendung des Bots erklärst du dich mit diesen
                Nutzungsbedingungen einverstanden.
                <br />
                Du musst den{" "}
                <a
                  href="https://discord.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Discord Terms of Service
                </a>{" "}
                und die{" "}
                <a
                  href="https://discord.com/guidelines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Community Guidelines
                </a>{" "}
                einhalten.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                3. Verbotene Nutzung
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Du darfst den Bot nicht verwenden für:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Spam, Flooding oder automatisierte Angriffe</li>
                <li>Verbreitung illegaler Inhalte oder Schadsoftware</li>
                <li>
                  Aktivitäten, die gegen geltendes Recht oder Discord-Regeln
                  verstoßen
                </li>
                <li>
                  Versuche, den Bot, seine Daten oder Infrastruktur zu
                  manipulieren oder zu hacken
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                4. Haftungsausschluss
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                Der Bot wird <strong>„wie besehen"</strong> bereitgestellt, ohne
                Garantie für:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mb-4">
                <li>Ständige Verfügbarkeit</li>
                <li>Fehlerfreie Funktion</li>
                <li>
                  Vollständigkeit oder Richtigkeit der bereitgestellten
                  Informationen
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Der Betreiber übernimmt keine Haftung für Schäden, die durch die
                Nutzung oder Nichtverfügbarkeit des Bots entstehen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                5. Änderungen der Nutzungsbedingungen
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Die Nutzungsbedingungen können jederzeit angepasst werden.
                <br />
                Änderungen werden mindestens{" "}
                <strong>7 Tage vor Inkrafttreten</strong> angekündigt, z. B.
                über den offiziellen Discord-Server oder einen Bot-Command.
                <br />
                Die weitere Nutzung des Bots nach Inkrafttreten der Änderungen
                gilt als Zustimmung zu den neuen Bedingungen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                6. Abschaltung des Dienstes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Der Betreiber behält sich vor, den Bot oder einzelne Funktionen
                jederzeit mit einer Vorlaufzeit von mindestens{" "}
                <strong>7 Tagen</strong> einzustellen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                7. Geltendes Recht
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Es gilt das Recht des Landes, in dem der Betreiber seinen Sitz
                hat.
                <br />
                Sollten einzelne Bestimmungen dieser Nutzungsbedingungen
                unwirksam sein, bleibt die Gültigkeit der übrigen Bestimmungen
                unberührt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                8. Kontakt
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Bei Fragen, Problemen oder Anfragen kannst du den Betreiber
                kontaktieren:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4 mt-3">
                <li>
                  <strong>E-Mail:</strong> support@bottrapper.me
                </li>
                <li>
                  <strong>Discord:</strong> Support über den offiziellen
                  BotTrapper Discord-Server
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
