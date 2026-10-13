import { useState } from "react";
import {
    ArrowLeft,
    Trash2,
    CircleHelp,
    FileText,
    ListChecks,
    Save
} from "lucide-react";

import { updateNote, deleteNote } from "./api";
import { Modal, QuizModal } from "./FolderModals";
import QuestionsTab from "./QuestionsTab";


// Delete confirmation
function DeleteNoteModal({ note, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete() {
        if (deleting) return;

        setDeleting(true);
        setError("");

        try {
            await deleteNote(note.id);
            onDeleted();
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    }

    return (
        <Modal
            title="Delete note"
            onClose={() => {
                if (!deleting) onClose();
            }}
        >
            <p>Are you sure you want to delete this note?</p>

            <p className="w3-text-red">
                All questions associated with this note
                will also be deleted.
            </p>

            {error && <p className="w3-text-red">{error}</p>}

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    className="w3-button w3-light-grey w3-round"
                    onClick={onClose}
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


// Main note view
export default function NoteView({
    note,
    onBack,
    onNoteUpdated,
    onNoteDeleted
}) {
    const [tab, setTab] = useState("note");
    const [text, setText] = useState(note.note);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);

    async function handleSave() {
        if (saving) return;

        setSaving(true);
        setError("");
        setSaved(false);

        try {
            const updated = await updateNote(note.id, {
                note: text
            });

            onNoteUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="w3-content w3-padding"
            style={{ maxWidth: 1100 }}
        >
            {/* Top bar */}
            <div class="w3-bar w3-orange w3-card w3-text-dark-grey w3-round">
                <button
                    className="w3-bar-item w3-button w3-mobile w3-lucid-btn"
                    onClick={onBack}
                    title="Back to folder"
                    aria-label="Back to folder"
                >
                    <ArrowLeft size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-lucid-btn w3-right"
                    onClick={() => setModal("quiz")}
                >
                    <CircleHelp size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-lucid-btn w3-right"
                    onClick={() => setModal("delete")}
                    title="Delete note"
                    aria-label="Delete note"
                >
                    <Trash2 size={24} />
                </button>
                
            </div>

            {/* W3.CSS grid tabs */}
            <div
                className="w3-row w3-margin-top"
                role="tablist"
                aria-label="Note sections"
            >
                <button
                    type="button"
                    className={`w3-col s6 w3-button w3-bottombar ${
                        tab === "note"
                            ? "w3-border-orange w3-text-orange"
                            : "w3-border-light-grey"
                    }`}
                    onClick={() => setTab("note")}
                    role="tab"
                    aria-selected={tab === "note"}
                    id="note-tab"
                    aria-controls="note-panel"
                >
                    <FileText
                        size={18}
                        style={{ verticalAlign: "middle" }}
                    />
                    {" "}Note
                </button>

                <button
                    type="button"
                    className={`w3-col s6 w3-button w3-bottombar ${
                        tab === "questions"
                            ? "w3-border-orange w3-text-orange"
                            : "w3-border-light-grey"
                    }`}
                    onClick={() => setTab("questions")}
                    role="tab"
                    aria-selected={tab === "questions"}
                    id="questions-tab"
                    aria-controls="questions-panel"
                >
                    <ListChecks
                        size={18}
                        style={{ verticalAlign: "middle" }}
                    />
                    {" "}Questions
                </button>
            </div>

            {/* Note editor */}
            <section
                id="note-panel"
                role="tabpanel"
                aria-labelledby="note-tab"
                hidden={tab !== "note"}
                className="w3-padding-16"
            >
                <textarea
                    className="w3-input w3-border w3-round"
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        setSaved(false);
                    }}
                    placeholder="Write your note here..."
                    aria-label="Note content"
                    style={{
                        width: "100%",
                        minHeight: "55dvh",
                        resize: "vertical",
                        lineHeight: 1.6
                    }}
                />

                {error && (
                    <p className="w3-text-red">{error}</p>
                )}

                <div
                    className="w3-margin-top"
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 12
                    }}
                >
                    {saved && (
                        <span className="w3-text-green">
                            Saved!
                        </span>
                    )}

                    <button
                        className="w3-button w3-orange w3-round"
                        onClick={handleSave}
                        disabled={saving || text === note.note}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </section>

            {/* Questions */}
            {tab === "questions" && (
                <section
                    id="questions-panel"
                    role="tabpanel"
                    aria-labelledby="questions-tab"
                >
                    <QuestionsTab noteId={note.id} />
                </section>
            )}

            {/* Modals */}
            {modal === "delete" && (
                <DeleteNoteModal
                    note={note}
                    onClose={() => setModal(null)}
                    onDeleted={onNoteDeleted}
                />
            )}

            {modal === "quiz" && (
                <QuizModal
                    noteId={note.id}
                    notes={[note]}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}