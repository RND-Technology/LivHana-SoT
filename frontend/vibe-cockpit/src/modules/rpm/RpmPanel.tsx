import React, { useEffect, useState } from 'react';
import styles from './RpmPanel.module.css';

type Item = { id: string; title: string; status: string; owner_role?: string; owner_user?: string; due_date?: string };

// Get JWT from localStorage (standard location)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken') || localStorage.getItem('jwt') || null;
}

export default function RpmPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [weekId, setWeekId] = useState<string>('');
  const [filter, setFilter] = useState<{status?: string; owner?: string}>({});
  const [gantt, setGantt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const wk = await fetch('/api/rpm/weeks/current').then(r=>r.json());
        if (wk?.id) {
          setWeekId(wk.id);
          const res = await fetch(`/api/rpm/weeks/${wk.id}/items`).then(r=>r.json());
          setItems(res.items || []);
          // Try API first, fallback to static file
          const mermaid = await fetch('/out/gantt.md').then(r=>r.text()).catch(()=> '');
          setGantt(mermaid || '');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load RPM data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => (!filter.status || i.status===filter.status) && (!filter.owner || (i.owner_role||'').includes(filter.owner)));

  const dl = async (fmt: 'md'|'csv'|'pdf') => {
    if (!weekId) return;
    
    const token = getAuthToken();
    if (!token) {
      alert('Authentication required. Please log in.');
      return;
    }
    
    try {
      // POST to export endpoint with JWT
      const res = await fetch(`/api/rpm/weeks/${weekId}/export?format=${fmt}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`Export failed: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // For async PDF generation, poll for completion
      if (fmt === 'pdf' && data.job) {
        // Poll export status
        let completed = false;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const statusRes = await fetch(`/api/rpm/exports/${data.export_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const status = await statusRes.json();
          if (status.status === 'completed' && status.url) {
            window.open(status.url, '_blank');
            completed = true;
            break;
          }
        }
        if (!completed) {
          alert('PDF generation is taking longer than expected. Check back in a few minutes.');
        }
      } else if (data.url) {
        // Immediate download for MD/CSV
        window.open(data.url, '_blank');
      }
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  if (loading) return <div className={styles.root}>Loading RPM data...</div>;
  if (error) return <div className={styles.root}>Error: {error}</div>;

  return (
    <div className={styles.root}>
      <h2>RPM Weekly Plan</h2>
      <div className={styles.toolbar}>
        <select aria-label="Status filter" onChange={e=>setFilter(f=>({...f, status:e.target.value||undefined}))}>
          <option value="">All Status</option>
          <option value="backlog">Backlog</option>
          <option value="ready">Ready</option>
          <option value="doing">Doing</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <input placeholder="Owner filter" onChange={e=>setFilter(f=>({...f, owner:e.target.value||undefined}))} />
        <div className={styles.spacer}>
          <button onClick={()=>dl('md')}>Download MD</button>
          <button onClick={()=>dl('csv')}>Download CSV</button>
          <button onClick={()=>dl('pdf')}>Download PDF</button>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tl}>Title</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px'}}>No items found</td></tr>
          ) : (
            filtered.map(it => (
              <tr key={it.id}>
                <td>{it.title}</td>
                <td>{it.status}</td>
                <td>{it.owner_role} {it.owner_user}</td>
                <td>{it.due_date||''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {gantt && (
        <div>
          <h3>Timeline</h3>
          <pre className={styles.pre}>{gantt}</pre>
        </div>
      )}
    </div>
  );
}


