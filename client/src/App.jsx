import { useState } from "react";
import Folders from "./Folders";
import FolderView from "./FolderView";
import NoteView from "./NoteView";

export default function App() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);

    // Individual note
    if (selectedNote) {
        return (
            <NoteView
                key={selectedNote.id}
                note={selectedNote}
                onBack={() => setSelectedNote(null)}
                onNoteUpdated={setSelectedNote}
                onNoteDeleted={() => setSelectedNote(null)}
            />
        );
    }

    // Folder view
    if (selectedFolder) {
        return (
            <FolderView
                folder={selectedFolder}
                onBack={() => setSelectedFolder(null)}
                onSelectNote={setSelectedNote}
                onFolderRenamed={updated => {
                    setSelectedFolder(previous => ({
                        ...previous,
                        name: updated.name
                    }));
                }}
                onFolderDeleted={() => setSelectedFolder(null)}
            />
        );
    }

    // Home screen
    return <Folders onSelectFolder={setSelectedFolder} />;
}