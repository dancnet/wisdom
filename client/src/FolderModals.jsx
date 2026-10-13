import { useEffect, useMemo, useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import {
    renameFolder,
    deleteFolder,
    getQuestionsByFolder,
    getQuestionsByNote
} from "./api";


// Shared modal wrapper
export function Modal({ title, onClose, children }) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="w3-modal"
            style={{
                display: "block",
                paddingTop: "5dvh",
                paddingBottom: "5dvh"
            }}
            onMouseDown={e => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="w3-modal-content w3-card-4 w3-round-large"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={{
                    width: "min(92vw, 720px)",
                    maxHeight: "90dvh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <div
                    className="w3-padding"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12
                    }}
                >
                    <h3 style={{ margin: 0 }}>{title}</h3>

                    <button
                        className="w3-button w3-round"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div
                    className="w3-padding"
                    style={{
                        overflowY: "auto",
                        minHeight: 0
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}


// Shared previous / next navigation
function Navigation({ index, total, onPrevious, onNext }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 20
            }}
        >
            <button
                className="w3-button w3-light-grey w3-round"
                onClick={onPrevious}
                disabled={total < 2}
                aria-label="Previous"
            >
                <ChevronLeft size={22} />
            </button>

            <span className="w3-text-grey">
                {total ? index + 1 : 0} / {total}
            </span>

            <button
                className="w3-button w3-light-grey w3-round"
                onClick={onNext}
                disabled={total < 2}
                aria-label="Next"
            >
                <ChevronRight size={22} />
            </button>
        </div>
    );
}


// Reusable full note display
function NoteContent({ note }) {
    return (
        <div
            style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                lineHeight: 1.6
            }}
        >
            {note || "(Empty note)"}
        </div>
    );
}


// ==================== RENAME FOLDER ====================

export function RenameFolderModal({ folder, onClose, onRenamed }) {
    const [name, setName] = useState(folder.name);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim() || saving) return;

        setSaving(true);
        setError("");

        try {
            const updated = await renameFolder(folder.id, name.trim());
            onRenamed(updated);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title="Rename folder" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input
                    className="w3-input w3-border w3-round"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    aria-label="Folder name"
                    required
                    autoFocus
                />

                {error && <p className="w3-text-red">{error}</p>}

                <div className="w3-margin-top">
                    <button
                        className="w3-button w3-orange w3-round"
                        disabled={saving || !name.trim()}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}


// ==================== DELETE FOLDER ====================

export function DeleteFolderModal({ folder, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        if (deleting) return;

        setDeleting(true);
        setError("");

        try {
            await deleteFolder(folder.id);
            onDeleted();
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    }

    const close = () => {
        if (!deleting) onClose();
    };

    return (
        <Modal title="Delete folder" onClose={close}>
            <p>
                Are you sure you want to delete
                {" "}<strong>{folder.name}</strong>?
            </p>

            <p className="w3-text-red">
                All notes and their questions will also be deleted.
            </p>

            {error && <p className="w3-text-red">{error}</p>}

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap"
                }}
            >
                <button
                    className="w3-button w3-light-grey w3-round"
                    onClick={close}
                    disabled={deleting}
                >
                    Cancel
                </button>

                <button
                    className="w3-button w3-red w3-round"
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    {deleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        </Modal>
    );
}


// ==================== RANDOM NOTES ====================

// Fisher-Yates shuffle
function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function RandomNoteModal({ notes, onClose }) {
    const shuffled = useMemo(() => shuffle(notes), [notes]);
    const [index, setIndex] = useState(0);

    const current = shuffled[index];

    function previous() {
        setIndex(i => (i - 1 + shuffled.length) % shuffled.length);
    }

    function next() {
        setIndex(i => (i + 1) % shuffled.length);
    }

    return (
        <Modal title="Random notes" onClose={onClose}>
            {current ? (
                <>
                    <NoteContent note={current.note} />

                    <Navigation
                        index={index}
                        total={shuffled.length}
                        onPrevious={previous}
                        onNext={next}
                    />
                </>
            ) : (
                <p>No notes in this folder.</p>
            )}
        </Modal>
    );
}


// ==================== QUIZ ====================

export function QuizModal({ folderId, noteId, notes, onClose }) {
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [showNote, setShowNote] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const request = noteId !== undefined
            ? getQuestionsByNote(noteId)
            : getQuestionsByFolder(folderId);

        request
            .then(data => {
                if (active) setQuestions(data);
            })
            .catch(err => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [folderId, noteId]);

    const current = questions[index];

    const relatedNote = current
        ? notes.find(note => note.id === current.note_id)
        : null;

    function previous() {
        setIndex(i => (i - 1 + questions.length) % questions.length);
        setShowNote(false);
    }

    function next() {
        setIndex(i => (i + 1) % questions.length);
        setShowNote(false);
    }

    return (
        <Modal title="Quiz" onClose={onClose}>
            {loading && <p>Loading questions...</p>}

            {error && <p className="w3-text-red">{error}</p>}

            {!loading && !error && !current && (
                <p>No questions in this folder yet.</p>
            )}

            {current && (
                <>
                    <div
                        style={{
                            fontSize: "1.2em",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere"
                        }}
                    >
                        {current.question}
                    </div>

                    <div className="w3-margin-top">
                        <button
                            className="w3-button w3-orange w3-round"
                            onClick={() => setShowNote(value => !value)}
                        >
                            {showNote ? "Hide note" : "Show note"}
                        </button>
                    </div>

                    {showNote && (
                        <div
                            className="w3-panel w3-light-grey w3-round"
                            style={{ padding: 16 }}
                        >
                            <NoteContent
                                note={
                                    relatedNote
                                        ? relatedNote.note
                                        : "Related note not found."
                                }
                            />
                        </div>
                    )}

                    <Navigation
                        index={index}
                        total={questions.length}
                        onPrevious={previous}
                        onNext={next}
                    />
                </>
            )}
        </Modal>
    );
}