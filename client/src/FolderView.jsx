import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Dices,
    CircleHelp,
    FilePlus2
} from "lucide-react";

import { getNotes, createNote } from "./api";
import NotesList from "./NotesList";

import {
    RenameFolderModal,
    DeleteFolderModal,
    RandomNoteModal,
    QuizModal
} from "./FolderModals";

export default function FolderView({
    folder,
    onBack,
    onSelectNote,
    onFolderRenamed,
    onFolderDeleted
}) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null);
    const [creatingNote, setCreatingNote] = useState(false);

    // Load notes belonging to this folder
    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        getNotes(folder.id)
            .then(data => {
                if (active) setNotes(data);
            })
            .catch(err => {
                if (active) setError(err.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [folder.id]);

    async function handleCreateNote() {
        if (creatingNote) return;

        setCreatingNote(true);
        setError("");

        try {
            const note = await createNote("", folder.id);

            // Immediately open the new note
            onSelectNote(note);
        } catch (err) {
            setError(err.message);
            setCreatingNote(false);
        }
    }

    return (
        <div
            className="w3-content w3-padding"
            style={{ maxWidth: 1100 }}
        >

            {/* Top toolbar */}
            <div class="w3-bar w3-orange w3-card w3-text-dark-grey w3-round">
                <button
                    className="w3-bar-item w3-button w3-mobile w3-lucid-btn"
                    onClick={onBack}
                    aria-label="Back to folders"
                    title="Back to folders"
                >
                    <ArrowLeft size={24} />
                </button>

                <span class="w3-bar-item w3-mobile">{folder.name}</span>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-right w3-lucid-btn"
                    onClick={() => setModal("quiz")}
                    disabled={loading}
                    title="Quiz"
                >
                    <CircleHelp size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-right w3-lucid-btn"
                    onClick={() => setModal("random")}
                    disabled={loading}
                    title="Random notes"
                    aria-label="Random notes"
                >
                    <Dices size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-right w3-lucid-btn"
                    onClick={() => setModal("delete")}
                    title="Delete folder"
                    aria-label="Delete folder"
                >
                    <Trash2 size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-right w3-lucid-btn"
                    onClick={() => setModal("rename")}
                    title="Rename folder"
                    aria-label="Rename folder"
                >
                    <Pencil size={24} />
                </button>

                <button
                    className="w3-bar-item w3-button w3-mobile w3-right w3-lucid-btn"
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    title="New note"
                >
                    <FilePlus2 size={24} />
                </button>
            </div>

            {/* Notes */}
            <main className="w3-padding-16">
                <h3>Notes</h3>

                {loading && <p>Loading notes...</p>}

                {error && (
                    <p className="w3-text-red">{error}</p>
                )}

                {!loading && !error && (
                    <NotesList
                        notes={notes}
                        onSelectNote={onSelectNote}
                    />
                )}
            </main>

            {/* Modals */}
            {modal === "rename" && (
                <RenameFolderModal
                    folder={folder}
                    onClose={() => setModal(null)}
                    onRenamed={onFolderRenamed}
                />
            )}

            {modal === "delete" && (
                <DeleteFolderModal
                    folder={folder}
                    onClose={() => setModal(null)}
                    onDeleted={onFolderDeleted}
                />
            )}

            {modal === "random" && (
                <RandomNoteModal
                    notes={notes}
                    onClose={() => setModal(null)}
                />
            )}

            {modal === "quiz" && (
                <QuizModal
                    folderId={folder.id}
                    notes={notes}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}