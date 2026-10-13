import { Router } from 'express';
import db from './db.js';

const router = Router();

// GET /api/folders
router.get("/folders", (req, res) => {
    const folders = db.prepare(`
        SELECT
            f.id,
            f.name,
            COUNT(n.id) AS note_count,
            MAX(n.modified_at) AS last_modified
        FROM folders f
        LEFT JOIN notes n ON n.folder_id = f.id
        GROUP BY f.id
        ORDER BY last_modified DESC
    `).all();

    res.json(folders);
});

// POST /api/folders
router.post("/folders", (req, res) => {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Invalid folder name" });
    }

    const folderName = name.trim();

    const result = db.prepare(`
        INSERT INTO folders (name)
        VALUES (?)
    `).run(folderName);

    res.status(201).json({
        id: Number(result.lastInsertRowid),
        name: folderName
    });
});

// PUT /api/folders/:id
router.put("/folders/:id", (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid folder ID" });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Invalid folder name" });
    }

    const folderName = name.trim();

    const result = db.prepare(`
        UPDATE folders
        SET name = ?
        WHERE id = ?
    `).run(folderName, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Folder not found" });
    }

    res.json({ id, name: folderName });
});

// DELETE /api/folders/:id
router.delete("/folders/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid folder ID" });
    }

    const result = db.prepare(`
        DELETE FROM folders
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Folder not found" });
    }

    res.status(204).end();
});

// GET /api/notes?folder_id=123
router.get("/notes", (req, res) => {
    const folder_id = Number(req.query.folder_id);

    if (!Number.isSafeInteger(folder_id) || folder_id <= 0) {
        return res.status(400).json({
            error: "Valid folder_id query parameter is required"
        });
    }

    const notes = db.prepare(`
        SELECT id, note, folder_id, modified_at
        FROM notes
        WHERE folder_id = ?
        ORDER BY modified_at DESC
    `).all(folder_id);

    res.json(notes);
});

// POST /api/notes
router.post("/notes", (req, res) => {
    const { note, folder_id } = req.body ?? {};

    if (typeof note !== "string" ||
        !Number.isSafeInteger(folder_id) || folder_id <= 0) {
        return res.status(400).json({ error: "Invalid note or folder_id" });
    }

    const folder = db.prepare(`
        SELECT id FROM folders WHERE id = ?
    `).get(folder_id);

    if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
    }

    const result = db.prepare(`
        INSERT INTO notes (note, folder_id)
        VALUES (?, ?)
    `).run(note, folder_id);

    const newNote = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newNote);
});

// PUT /api/notes/:id
router.put("/notes/:id", (req, res) => {
    const id = Number(req.params.id);
    const { note, folder_id } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid note ID" });
    }

    // Check which fields were provided
    const fields = [];
    const values = [];

    if (note !== undefined) {
        if (typeof note !== "string") {
            return res.status(400).json({ error: "Invalid note" });
        }

        fields.push("note = ?");
        values.push(note);
    }

    if (folder_id !== undefined) {
        if (!Number.isSafeInteger(folder_id) || folder_id <= 0) {
            return res.status(400).json({ error: "Invalid folder_id" });
        }

        const folder = db.prepare(`
            SELECT id FROM folders WHERE id = ?
        `).get(folder_id);

        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        fields.push("folder_id = ?");
        values.push(folder_id);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            error: "Provide at least note or folder_id"
        });
    }

    values.push(id);

    const result = db.prepare(`
        UPDATE notes
        SET ${fields.join(", ")}
        WHERE id = ?
    `).run(...values);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Note not found" });
    }

    const updatedNote = db.prepare(`
        SELECT * FROM notes WHERE id = ?
    `).get(id);

    res.json(updatedNote);
});

// DELETE /api/notes/:id
router.delete("/notes/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid note ID" });
    }

    const result = db.prepare(`
        DELETE FROM notes WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Note not found" });
    }

    res.status(204).end();
});

// GET /api/questions?note_id=1 OR ?folder_id=1
router.get("/questions", (req, res) => {
    const { note_id, folder_id } = req.query;

    if ((note_id === undefined) === (folder_id === undefined)) {
        return res.status(400).json({
            error: "Provide either note_id or folder_id, but not both"
        });
    }

    const id = Number(note_id ?? folder_id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    let questions;

    if (note_id !== undefined) {
        questions = db.prepare(`
            SELECT id, question, note_id
            FROM questions
            WHERE note_id = ?
            ORDER BY id DESC
        `).all(id);
    } else {
        questions = db.prepare(`
            SELECT q.id, q.question, q.note_id
            FROM questions q
            JOIN notes n ON q.note_id = n.id
            WHERE n.folder_id = ?
            ORDER BY RANDOM()
        `).all(id);
    }

    res.json(questions);
});


// POST /api/questions
router.post("/questions", (req, res) => {
    const { question, note_id } = req.body ?? {};

    if (typeof question !== "string" ||
        !Number.isSafeInteger(note_id) || note_id <= 0) {
        return res.status(400).json({
            error: "Invalid question or note_id"
        });
    }

    const note = db.prepare(`
        SELECT id FROM notes WHERE id = ?
    `).get(note_id);

    if (!note) {
        return res.status(404).json({ error: "Note not found" });
    }

    const result = db.prepare(`
        INSERT INTO questions (question, note_id)
        VALUES (?, ?)
    `).run(question, note_id);

    const newQuestion = db.prepare(`
        SELECT * FROM questions WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newQuestion);
});


// PUT /api/questions/:id
router.put("/questions/:id", (req, res) => {
    const id = Number(req.params.id);
    const { question } = req.body ?? {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid question ID" });
    }

    if (typeof question !== "string") {
        return res.status(400).json({ error: "Invalid question" });
    }

    const result = db.prepare(`
        UPDATE questions
        SET question = ?
        WHERE id = ?
    `).run(question, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Question not found" });
    }

    const updatedQuestion = db.prepare(`
        SELECT * FROM questions WHERE id = ?
    `).get(id);

    res.json(updatedQuestion);
});


// DELETE /api/questions/:id
router.delete("/questions/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid question ID" });
    }

    const result = db.prepare(`
        DELETE FROM questions WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Question not found" });
    }

    res.status(204).end();
});

export default router;