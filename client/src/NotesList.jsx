import { ChevronRight, FileText } from "lucide-react";

export default function NotesList({ notes, onSelectNote }) {
    if (notes.length === 0) {
        return (
            <p className="w3-text-grey">
                No notes in this folder yet.
            </p>
        );
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                gap: 16
            }}
        >
            {notes.map(note => {
                const text = note.note.trim().replace(/\s+/g, " ");
                const preview = text.length > 140
                    ? text.slice(0, 140) + "..."
                    : text || "(Empty note)";

                return (
                    <button
                        key={note.id}
                        className="w3-button w3-white w3-card w3-round-large"
                        onClick={() => onSelectNote(note)}
                        style={{
                            padding: 20,
                            textAlign: "left",
                            width: "100%",
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start"
                        }}
                    >
                        <FileText size={22} style={{ flexShrink: 0 }} />

                        <span
                            style={{
                                flex: 1,
                                minWidth: 0,
                                overflowWrap: "anywhere",
                                whiteSpace: "normal"
                            }}
                        >
                            {preview}
                        </span>

                        <ChevronRight
                            size={18}
                            style={{ flexShrink: 0 }}
                        />
                    </button>
                );
            })}
        </div>
    );
}