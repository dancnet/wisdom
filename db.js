import Database from 'better-sqlite3';
import path from 'node:path';
const __dirname = import.meta.dirname;

const db = new Database(path.join(__dirname, 'data/knowledge.db'));

db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        note TEXT NOT NULL,
        folder_id INTEGER NOT NULL,
        modified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY,
        question TEXT NOT NULL,
        note_id INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS update_note_date
    AFTER UPDATE OF note, folder_id ON notes
    FOR EACH ROW
    BEGIN
        UPDATE notes
        SET modified_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
`);

export default db;