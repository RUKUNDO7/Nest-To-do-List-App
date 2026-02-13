'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTodos, addTodo, updateTodo, deleteTodo } from '@/lib/api';
import TodoItem from '@/components/TodoItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ListTodo, Search, Sparkles, AlarmClock } from 'lucide-react';
import IconSection from '../components/IconSection';

type Todo = {
  id: number;
  title: string;
  status: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodos()
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch todos', err);
        setLoading(false);
      });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    // Optimistic update could go here, but simple wait is fine for now
    const newTodo = await addTodo(title);
    setTodos((prev) => [...prev, newTodo]);
    setTitle('');
  }

  async function handleUpdate(id: number, updates: Partial<Todo>) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    await updateTodo(id, updates);
  }

  async function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await deleteTodo(id);
  }

  const completedCount = todos.filter((t) => t.status).length;
  const totalCount = todos.length;
  const openCount = totalCount - completedCount;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesQuery = todo.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'open' && !todo.status) ||
        (filter === 'done' && todo.status);
      return matchesQuery && matchesFilter;
    });
  }, [todos, query, filter]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-shell rounded-[28px] p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  To do List App
                </p>
                <h1 className="text-3xl font-semibold text-foreground">
                  Personal Workspace
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <AlarmClock size={16} />
              <span>{todayLabel}</span>
              <span className="pill bg-muted px-3 py-1 text-xs font-medium text-foreground">
                {openCount} open
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 shadow-sm">
              <Search size={18} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, e.g. prepare sprint demo"
                className="w-full bg-transparent text-sm text-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em]">Progress</p>
                <p className="text-lg font-semibold text-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                {completedCount}/{totalCount || 0}
              </div>
            </div>
          </div>
        </motion.header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onSubmit={handleAdd}
              className="app-shell rounded-[26px] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[220px]">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Add task
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Outline Q1 roadmap review"
                    className="mt-2 w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="mt-6 flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {(['all', 'open', 'done'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`pill px-3 py-1 font-medium transition ${
                      filter === item
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item === 'all' ? 'All tasks' : item === 'open' ? 'Open' : 'Done'}
                  </button>
                ))}
              </div>
            </motion.form>

            <div className="app-shell rounded-[26px] p-5 shadow-sm">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/60 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredTodos.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
                      >
                        <ListTodo className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg">No matching tasks.</p>
                        <p className="text-sm">Try clearing filters or add a new one.</p>
                      </motion.div>
                    ) : (
                      filteredTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="app-shell rounded-[26px] p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Overview
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted-foreground">Total tasks</span>
                  <span className="text-lg font-semibold text-foreground">
                    {totalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted-foreground">Open</span>
                  <span className="text-lg font-semibold text-foreground">
                    {openCount}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-lg font-semibold text-foreground">
                    {completedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="app-shell rounded-[26px] p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Focus tips
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p className="rounded-2xl bg-card px-4 py-3 shadow-sm">
                  Keep one priority task in focus before switching context.
                </p>
                <p className="rounded-2xl bg-card px-4 py-3 shadow-sm">
                  Add clear verbs so tasks feel actionable.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
