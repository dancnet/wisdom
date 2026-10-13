import { useState, useEffect } from "react";
import { Folder, Plus, ChevronRight } from "lucide-react";
import { getFolders, createFolder } from "./api";

export default function Folders({ onSelectFolder }) {
    const [folders, setFolders] = useState([]);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    // Load folders when component mounts
    useEffect(() => {
        getFolders()
            .then(setFolders)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Create a new folder
    async function handleSubmit(e) {
        e.preventDefault();

        if (!name.trim()) return;

        setCreating(true);
        setError("");

        try {
            await createFolder(name.trim());
            setName("");
            setFolders(await getFolders());
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div
            className="w3-content w3-padding"
            style={{
                maxWidth: 1000,
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <main style={{ flex: 1 }}>
                <h2>Folders</h2>

                {loading && <p>Loading folders...</p>}

                {error && (
                    <p className="w3-text-red">{error}</p>
                )}

                {!loading && folders.length === 0 && (
                    <p className="w3-text-grey">
                        No folders yet. Create one below!
                    </p>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                        gap: 16
                    }}
                >
                    {folders.map(folder => (
                        <button
                            key={folder.id}
                            type="button"
                            className="w3-button w3-white w3-card w3-round-large"
                            onClick={() => onSelectFolder(folder)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: 20,
                                textAlign: "left",
                                width: "100%"
                            }}
                        >
                            <Folder size={28} />

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        overflowWrap: "anywhere"
                                    }}
                                >
                                    {folder.name}
                                </div>

                                <small className="w3-text-grey">
                                    {folder.note_count}{" "}
                                    {folder.note_count === 1
                                        ? "note"
                                        : "notes"}
                                </small>
                            </div>

                            <ChevronRight size={20} />
                        </button>
                    ))}
                </div>
            </main>

            <form
                onSubmit={handleSubmit}
                className="w3-padding-16"
            >
                <h4>Add folder</h4>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap"
                    }}
                >
                    <input
                        className="w3-input w3-border w3-round"
                        type="text"
                        placeholder="Folder name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ flex: "1 1 200px", width: "auto" }}
                        required
                    />

                    <button
                        className="w3-button w3-orange w3-text-dark-grey w3-round"
                        type="submit"
                        disabled={creating}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <Plus size={20} />
                        {creating ? "Adding..." : "Add"}
                    </button>
                </div>
            </form>
        </div>
    );
}