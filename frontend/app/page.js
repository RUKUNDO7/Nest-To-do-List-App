'use client';

import { useEffect, useMemo, useState } from 'react';

function getApiBaseCandidates() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const candidates = [];

  if (configured) {
    candidates.push(configured);
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    candidates.push(`${protocol}//${hostname}:5000`);
    if (port !== '5000') {
      candidates.push(`${protocol}//${hostname}:3000`);
      candidates.push(`${protocol}//${hostname}:3001`);
    }
  } else {
    candidates.push('http://localhost:5000');
    candidates.push('http://localhost:3000');
    candidates.push('http://localhost:3001');
  }

  return [...new Set(candidates)];
}

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join(', ');
    }
  } catch {}
  return `${fallbackMessage} (HTTP ${response.status})`;
}

const FILTERS = ['All', 'Active', 'Done'];

export default function HomePage() {
  const apiBaseCandidates = useMemo(() => getApiBaseCandidates(), []);
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [apiBase, setApiBase] = useState(apiBaseCandidates[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCount = todos.length;
  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );
  const doneCount = totalCount - activeCount;
  const hasDone = doneCount > 0;
  const completionPercent =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const dueMin = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    const tz = now.getTimezoneOffset();
    return new Date(now.getTime() - tz * 60_000).toISOString().slice(0, 16);
  }, []);
  const visibleTodos = useMemo(() => {
    const byFilter = todos.filter((todo) => {
      if (filter === 'Active') return !todo.completed;
      if (filter === 'Done') return todo.completed;
      return true;
    });
    const term = search.trim().toLowerCase();
    if (!term) return byFilter;
    return byFilter.filter((todo) => todo.title.toLowerCase().includes(term));
  }, [filter, search, todos]);

  function formatDueAt(dueAt) {
    if (!dueAt) return '';
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dueAt));
  }

  function getDueClass(todo) {
    if (!todo?.dueAt || todo.completed) return '';
    const dueTime = new Date(todo.dueAt).getTime();
    const now = Date.now();
    if (dueTime < now) return 'overdue';
    if (dueTime - now < 24 * 60 * 60 * 1000) return 'soon';
    return '';
  }

  function getDuePrefix(todo) {
    const dueClass = getDueClass(todo);
    if (dueClass === 'overdue') return 'Overdue';
    if (dueClass === 'soon') return 'Due soon';
    return 'Due';
  }

  function getFilterCount(name) {
    if (name === 'All') return totalCount;
    if (name === 'Active') return activeCount;
    if (name === 'Done') return doneCount;
    return 0;
  }

  async function requestTodos(path, init) {
    const candidates = apiBase
      ? [apiBase, ...apiBaseCandidates.filter((candidate) => candidate !== apiBase)]
      : apiBaseCandidates;

    let lastError = null;

    for (const candidate of candidates) {
      try {
        const response = await fetch(`${candidate}${path}`, init);
        setApiBase(candidate);
        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error('Failed to fetch');
  }

  async function loadTodos() {
    setLoading(true);
    setError('');
    try {
      const response = await requestTodos('/todos', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to load todos.'));
      }
      const data = await response.json();
      setTodos(data);
    } catch (e) {
      setError(e.message || 'Failed to load todos.');
    } finally {
      setLoading(false);
    }
  }

  async function onCreateTodo(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setError('');
    try {
      const dueAtIso = dueAt ? new Date(dueAt).toISOString() : null;
      const response = await requestTodos('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          description: description.trim() || null,
          dueAt: dueAtIso,
          status: 'Pending',
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Could not create todo.'));
      }

      setTitle('');
      setDescription('');
      setDueAt('');
      await loadTodos();
    } catch (e) {
      setError(e.message || 'Failed to create todo.');
    }
  }

  async function onToggleTodo(id, completed) {
    setError('');
    const previousTodos = todos;
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
    );
    try {
      const response = await requestTodos(`/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Could not update todo.'));
      }
    } catch (e) {
      setTodos(previousTodos);
      setError(e.message || 'Failed to update todo.');
    }
  }

  function onStartEdit(todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  function onCancelEdit() {
    setEditingId(null);
    setEditingTitle('');
  }

  async function onSaveEdit(id) {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setError('Title cannot be empty.');
      return;
    }

    setError('');
    try {
      const response = await requestTodos(`/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Could not update todo.'));
      }

      onCancelEdit();
      await loadTodos();
    } catch (e) {
      setError(e.message || 'Failed to update todo.');
    }
  }

  async function onDeleteTodo(id) {
    setError('');
    try {
      const response = await requestTodos(`/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Could not delete todo.'));
      }

      await loadTodos();
    } catch (e) {
      setError(e.message || 'Failed to delete todo.');
    }
  }

  async function onClearDone() {
    setError('');
    try {
      const doneTodos = todos.filter((todo) => todo.completed);
      const responses = await Promise.all(
        doneTodos.map((todo) =>
          requestTodos(`/todos/${todo.id}`, {
            method: 'DELETE',
          }),
        ),
      );
      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to clear done todos.');
      }
      await loadTodos();
    } catch {
      setError('Failed to clear done todos.');
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="shell">
      <main className="app">
        <section className="top">
          <div className="top-row">
            <div>
              <p className="eyebrow">TODO APP</p>
              <h1>Simple Task List</h1>
              <p className="subtitle">Plan your day at a glance.</p>
            </div>

            <div className="progress-wrap">
              <p className="progress-label">Progress bar</p>
              <div className="progress-mini" aria-label={`Progress ${completionPercent}%`}>
                <span className="progress-mini-value">{completionPercent}</span>
                <span
                  className="progress-mini-ring"
                  style={{ '--progress': `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

        </section>

        <section className="controls">
          <div className="tabs">
            {FILTERS.map((name) => (
              <button
                key={name}
                type="button"
                className={`tab ${filter === name ? 'active' : ''}`}
                onClick={() => setFilter(name)}
              >
                {name} ({getFilterCount(name)})
              </button>
            ))}
          </div>

          <button
            type="button"
            className="clear-button"
            disabled={!hasDone}
            onClick={onClearDone}
          >
            Clear Done
          </button>
        </section>

        <section className="content">
          <div className="search-wrap">
            <span className="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.13l4.23 4.24-1.41 1.41-4.24-4.23A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
              </svg>
            </span>
            <input
              className="search-input"
              type="text"
              placeholder="Search a task by title"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <form className="todo-form" onSubmit={onCreateTodo}>
            <div className="task-table">
              <div className="task-table-body">
                <input
                  className="task-title-input"
                  type="text"
                  placeholder="Create a task, then hit Enter"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <div className="task-extra-grid">
              <input
                className="task-extra-input"
                type="text"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <input
                className="task-extra-input"
                type="datetime-local"
                value={dueAt}
                min={dueMin}
                onChange={(event) => setDueAt(event.target.value)}
              />
            </div>
          </form>

          {error ? <p className="message error">{error}</p> : null}
          {!error && loading ? <p className="message">Loading...</p> : null}
          {!error && !loading && visibleTodos.length === 0 ? (
            <p className="empty">No tasks in this view.</p>
          ) : null}

          {!error && visibleTodos.length > 0 ? (
            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <div className="todo-main">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(event) =>
                        onToggleTodo(todo.id, event.target.checked)
                      }
                    />
                    <span className="todo-copy">
                      {editingId === todo.id ? (
                        <input
                          className="todo-edit-input"
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              onSaveEdit(todo.id);
                            }
                            if (event.key === 'Escape') {
                              onCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                          {todo.title}
                        </span>
                      )}
                      {todo.description ? (
                        <span className="todo-description">{todo.description}</span>
                      ) : null}
                      <span className="todo-meta">
                        Status: {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                      {todo.dueAt ? (
                        <span className={`todo-due ${getDueClass(todo)}`}>
                          {getDuePrefix(todo)}: {formatDueAt(todo.dueAt)}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="todo-actions">
                    {editingId === todo.id ? (
                      <>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => onSaveEdit(todo.id)}
                          aria-label="Save task"
                          title="Save"
                        >
                          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                            <path d="m9 16.17-3.88-3.88L3.7 13.7 9 19l12-12-1.41-1.41z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={onCancelEdit}
                          aria-label="Cancel edit"
                          title="Cancel"
                        >
                          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                            <path d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.29 19.7 2.87 18.3 9.17 12l-6.3-6.29L4.29 4.3l6.3 6.3 6.29-6.3z" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => onStartEdit(todo)}
                        aria-label="Edit task"
                        title="Edit"
                      >
                        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                          <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => onDeleteTodo(todo.id)}
                      aria-label="Delete task"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                        <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Zm3-4h6l1 2h4v2H4V5h4l1-2Z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}
