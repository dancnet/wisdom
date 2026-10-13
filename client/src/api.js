const BASE_URL = "/api";

// Common request handler
async function request(endpoint, method = "GET", data = undefined) {
    const options = { method };

    if (data !== undefined) {
        options.headers = {
            "Content-Type": "application/json"
        };
        options.body = JSON.stringify(data);
    }

    const response = await fetch(BASE_URL + endpoint, options);

    // Handle empty responses (DELETE returns 204)
    if (response.status === 204) {
        return null;
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "API request failed");
    }

    return result;
}


// ==================== FOLDERS ====================

export function getFolders() {
    return request("/folders");
}

export function createFolder(name) {
    return request("/folders", "POST", { name });
}

export function renameFolder(id, name) {
    return request(`/folders/${id}`, "PUT", { name });
}

export function deleteFolder(id) {
    return request(`/folders/${id}`, "DELETE");
}


// ==================== NOTES ====================

export function getNotes(folderId) {
    return request(`/notes?folder_id=${folderId}`);
}

export function createNote(note, folderId) {
    return request("/notes", "POST", {
        note,
        folder_id: folderId
    });
}

export function updateNote(id, data) {
    // data can contain note, folder_id, or both
    return request(`/notes/${id}`, "PUT", data);
}

export function deleteNote(id) {
    return request(`/notes/${id}`, "DELETE");
}


// ==================== QUESTIONS ====================

export function getQuestionsByNote(noteId) {
    return request(`/questions?note_id=${noteId}`);
}

export function getQuestionsByFolder(folderId) {
    return request(`/questions?folder_id=${folderId}`);
}

export function createQuestion(question, noteId) {
    return request("/questions", "POST", {
        question,
        note_id: noteId
    });
}

export function updateQuestion(id, question) {
    return request(`/questions/${id}`, "PUT", { question });
}

export function deleteQuestion(id) {
    return request(`/questions/${id}`, "DELETE");
}