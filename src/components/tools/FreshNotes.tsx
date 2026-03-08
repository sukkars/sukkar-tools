import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = "toolbox-fresh-notes";

const FreshNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeId);

  const addNote = () => {
    const note: Note = { id: crypto.randomUUID(), title: "Untitled", content: "", updatedAt: Date.now() };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
  };

  const updateNote = (field: "title" | "content", value: string) => {
    setNotes((prev) => prev.map((n) => n.id === activeId ? { ...n, [field]: value, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) setActiveId(notes.find((n) => n.id !== id)?.id || null);
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="animate-fade-in">
      <h1 className="tool-title">Fresh Notes</h1>
      <p className="tool-description mb-6">Your thoughts and notes, saved locally in your browser.</p>

      <div className="tool-card p-0 overflow-hidden">
        <div className="flex min-h-[450px]">
          {/* Sidebar */}
          <div className="w-56 border-r border-border bg-muted/30 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-border">
              <button className="tool-btn w-full text-xs" onClick={addNote}>
                <Plus className="w-3.5 h-3.5" /> New Note
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notes.length === 0 && (
                <p className="text-xs text-muted-foreground p-4 text-center">No notes yet</p>
              )}
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border text-sm transition-colors group ${activeId === note.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate text-foreground text-xs">{note.title || "Untitled"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{formatDate(note.updatedAt)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {activeNote ? (
              <>
                <input
                  className="border-b border-border bg-transparent px-4 py-3 text-base font-semibold text-foreground focus:outline-none"
                  value={activeNote.title}
                  onChange={(e) => updateNote("title", e.target.value)}
                  placeholder="Note title..."
                />
                <textarea
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground resize-none focus:outline-none leading-relaxed"
                  value={activeNote.content}
                  onChange={(e) => updateNote("content", e.target.value)}
                  placeholder="Start writing..."
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a note or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreshNotes;
