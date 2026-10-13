import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import {
    getQuestionsByNote,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from "./api";


// One editable question
function QuestionItem({ question, onUpdated, onDeleted }) {
    const [text, setText] = useState(question.question);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    async function handleSave() {
        if (!text.trim() || busy) return;

        setBusy(true);
        setError("");

        try {
            const updated = await updateQuestion(question.id, text);
            onUpdated(updated);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await deleteQuestion(question.id);
            onDeleted(question.id);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <div className="w3-card w3-white w3-round-large w3-padding">
            <textarea
                className="w3-input w3-border w3-round"
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
                aria-label="Question"
                style={{
                    width: "100%",
                    resize: "vertical"
                }}
            />

            {error && <p className="w3-text-red">{error}</p>}

            <div
                className="w3-margin-top"
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap"
                }}
            >
                <button
                    className="w3-button w3-orange w3-round"
                    onClick={handleSave}
                    disabled={
                        busy ||
                        !text.trim() ||
                        text === question.question
                    }
                >
                    <Save size={16} style={{ verticalAlign: "middle" }} />
                    {" "}Save
                </button>

                {!confirmDelete ? (
                    <button
                        className="w3-button w3-light-grey w3-round"
                        onClick={() => setConfirmDelete(true)}
                        disabled={busy}
                    >
                        <Trash2 size={16} style={{ verticalAlign: "middle" }} />
                        {" "}Delete
                    </button>
                ) : (
                    <>
                        <span className="w3-text-red">Delete this question?</span>

                        <button
                            className="w3-button w3-red w3-round"
                            onClick={handleDelete}
                            disabled={busy}
                        >
                            {busy ? "Deleting..." : "Yes"}
                        </button>

                        <button
                            className="w3-button w3-light-grey w3-round"
                            onClick={() => setConfirmDelete(false)}
                            disabled={busy}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}


// Questions tab
export default function QuestionsTab({ noteId }) {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    // Load questions for this note
    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        getQuestionsByNote(noteId)
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
    }, [noteId]);

    // Add question
    async function handleCreate(e) {
        e.preventDefault();

        if (!newQuestion.trim() || creating) return;

        setCreating(true);
        setError("");

        try {
            const created = await createQuestion(
                newQuestion.trim(),
                noteId
            );

            // Newest question appears first
            setQuestions(previous => [created, ...previous]);
            setNewQuestion("");
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }

    function handleUpdated(updated) {
        setQuestions(previous =>
            previous.map(question =>
                question.id === updated.id ? updated : question
            )
        );
    }

    function handleDeleted(id) {
        setQuestions(previous =>
            previous.filter(question => question.id !== id)
        );
    }

    return (
        <div className="w3-padding-16">
            <h3>Questions</h3>

            {/* Add a question */}
            <form
                onSubmit={handleCreate}
                className="w3-card w3-padding w3-round-large"
            >
                <textarea
                    className="w3-input w3-border w3-round"
                    rows={3}
                    placeholder="Write a new question..."
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        resize: "vertical"
                    }}
                />

                <button
                    className="w3-button w3-orange w3-round w3-margin-top"
                    type="submit"
                    disabled={creating || !newQuestion.trim()}
                >
                    <Plus size={18} style={{ verticalAlign: "middle" }} />
                    {" "}{creating ? "Adding..." : "Add question"}
                </button>
            </form>

            {error && <p className="w3-text-red">{error}</p>}

            {loading && <p>Loading questions...</p>}

            {!loading && !error && questions.length === 0 && (
                <p className="w3-text-grey">
                    No questions yet.
                </p>
            )}

            {/* Existing questions */}
            <div
                className="w3-margin-top"
                style={{
                    display: "grid",
                    gap: 16
                }}
            >
                {questions.map(question => (
                    <QuestionItem
                        key={question.id}
                        question={question}
                        onUpdated={handleUpdated}
                        onDeleted={handleDeleted}
                    />
                ))}
            </div>
        </div>
    );
}