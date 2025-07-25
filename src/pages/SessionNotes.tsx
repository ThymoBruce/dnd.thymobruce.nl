import React, { useState } from 'react';
import { useSessionNotes } from '../hooks/useSessionNotes';
import { Plus, ScrollText, Trash2, Calendar } from 'lucide-react';

const SessionNotes = () => {
  const { sessionNotes, addSessionNote, deleteSessionNote, loading, error } = useSessionNotes();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    participants: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteData = {
      ...formData,
      participants: formData.participants.split(',').map(p => p.trim()).filter(p => p),
      is_private: true
    };
    addSessionNote(noteData)
      .then(() => {
        setFormData({ 
          date: new Date().toISOString().split('T')[0], 
          title: '', 
          content: '', 
          participants: '' 
        });
        setIsCreating(false);
      })
      .catch(err => console.error('Failed to create session note:', err));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session note?')) {
      try {
        await deleteSessionNote(id);
      } catch (err) {
        console.error('Failed to delete session note:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading session notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
        <p className="text-red-400">Error loading session notes: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ScrollText className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">Session Notes</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Session Note</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New Session Note</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., The Goblin Caves, Episode 1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Participants (comma-separated)
              </label>
              <input
                type="text"
                value={formData.participants}
                onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Player1, Player2, Player3..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Session Summary
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="What happened in this session? Key events, discoveries, combat encounters, roleplay moments, etc."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Add Session Note
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {sessionNotes.length === 0 && !isCreating ? (
        <div className="text-center py-12">
          <ScrollText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 mb-2">No session notes yet</p>
          <p className="text-slate-400 mb-6">Keep track of your adventures and important moments</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add First Session Note
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sessionNotes
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(note => (
            <div key={note.id} className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{note.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(note.date)}</span>
                    </div>
                    <div>
                      Participants: {note.participants.join(', ')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="prose prose-slate prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionNotes;