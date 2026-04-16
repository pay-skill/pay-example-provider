import Database from "better-sqlite3";

export type QuoteRow = {
  id: number;
  text: string;
  author: string;
  category: string;
};

/** Initialize SQLite database with quotes table and seed data. */
export function initDb(path = ":memory:"): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general'
    )
  `);

  // Seed if empty
  const count = db.prepare("SELECT COUNT(*) as n FROM quotes").get() as {
    n: number;
  };
  if (count.n === 0) {
    seed(db);
  }

  return db;
}

function seed(db: Database.Database): void {
  const insert = db.prepare(
    "INSERT INTO quotes (text, author, category) VALUES (?, ?, ?)",
  );

  const quotes: [string, string, string][] = [
    // Free tier (general)
    [
      "The best way to predict the future is to invent it.",
      "Alan Kay",
      "general",
    ],
    [
      "Talk is cheap. Show me the code.",
      "Linus Torvalds",
      "general",
    ],
    [
      "Any sufficiently advanced technology is indistinguishable from magic.",
      "Arthur C. Clarke",
      "general",
    ],
    [
      "Simplicity is the ultimate sophistication.",
      "Leonardo da Vinci",
      "general",
    ],
    [
      "First, solve the problem. Then, write the code.",
      "John Johnson",
      "general",
    ],

    // Premium tier (technology)
    [
      "The computer was born to solve problems that did not exist before.",
      "Bill Gates",
      "technology",
    ],
    [
      "Software is a great combination between artistry and engineering.",
      "Bill Gates",
      "technology",
    ],
    [
      "The art of programming is the art of organizing complexity.",
      "Edsger W. Dijkstra",
      "technology",
    ],
    [
      "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
      "Bill Gates",
      "technology",
    ],
    [
      "Before software can be reusable it first has to be usable.",
      "Ralph Johnson",
      "technology",
    ],

    // Premium tier (business)
    [
      "Revenue is vanity, profit is sanity, but cash is king.",
      "Unknown",
      "business",
    ],
    [
      "The value of an idea lies in the using of it.",
      "Thomas Edison",
      "business",
    ],
    [
      "In the middle of difficulty lies opportunity.",
      "Albert Einstein",
      "business",
    ],
    [
      "Price is what you pay. Value is what you get.",
      "Warren Buffett",
      "business",
    ],
    [
      "The secret of business is to know something that nobody else knows.",
      "Aristotle Onassis",
      "business",
    ],
  ];

  const tx = db.transaction(() => {
    for (const q of quotes) {
      insert.run(...q);
    }
  });
  tx();
}
