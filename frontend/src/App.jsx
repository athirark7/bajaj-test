import React, { useState } from 'react';
import axios from 'axios';
import { 
  Network, 
  Send, 
  AlertCircle, 
  ChevronRight, 
  Hash, 
  GitBranch, 
  RefreshCw,
  Trophy
} from 'lucide-react';

const API_URL = 'http://localhost:3000/bfhl';

const TreeNode = ({ node, children }) => {
  const childKeys = Object.keys(children || {});
  return (
    <div className="node">
      <div className="node-label">
        <div className="circle" />
        <span>{node}</span>
      </div>
      {childKeys.map(key => (
        <TreeNode key={key} node={key} children={children[key]} />
      ))}
    </div>
  );
};

const HierarchyCard = ({ hierarchy }) => {
  const { root, tree, depth, has_cycle } = hierarchy;
  
  return (
    <div className="hierarchy-item">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>
          <GitBranch size={20} className="text-blue-400" />
          Root: {root}
        </h3>
        <div className="summary-badges">
          {!has_cycle && <span className="badge">Depth: {depth}</span>}
          {has_cycle && <span className="badge cycle">Cycle Detected</span>}
        </div>
      </div>
      
      {!has_cycle && tree[root] && (
        <div style={{ marginTop: '1rem' }}>
          <TreeNode node={root} children={tree[root]} />
        </div>
      )}
      {has_cycle && (
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>
          Cyclic groups do not display a tree view.
        </div>
      )}
    </div>
  );
};

function App() {
  const [input, setInput] = useState('["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->I"]');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = JSON.parse(input);
      } catch (e) {
        throw new Error('Invalid JSON input. Please provide an array of strings.');
      }

      if (!Array.isArray(data)) {
        throw new Error('Input must be a JSON array of strings.');
      }

      const res = await axios.post(API_URL, { data });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Graph Explorer</h1>
        <p className="subtitle">SRM Full Stack Engineering Challenge</p>
      </header>

      <section className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter node relationships as a JSON array, e.g. ["A->B", "A->C"]'
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <RefreshCw className="animate-spin" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Send size={18} />
              Process Graph
            </div>
          )}
        </button>
      </section>

      {error && (
        <div className="error-msg">
          <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {error}
        </div>
      )}

      {response && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="results-grid">
            <div className="card">
              <div className="label">Total Trees</div>
              <div className="value">{response.summary.total_trees}</div>
              <h3><Network size={18} /> Valid Structures</h3>
            </div>
            <div className="card">
              <div className="label">Total Cycles</div>
              <div className="value">{response.summary.total_cycles}</div>
              <h3><RefreshCw size={18} /> Loop Groups</h3>
            </div>
            <div className="card">
              <div className="label">Largest Tree</div>
              <div className="value">{response.summary.largest_tree_root || 'N/A'}</div>
              <h3><Trophy size={18} /> Best Root</h3>
            </div>
          </div>

          <div className="hierarchy-view">
            <h2 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Detected Hierarchies</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {response.hierarchies.map((h, i) => (
                <HierarchyCard key={i} hierarchy={h} />
              ))}
            </div>
          </div>

          {(response.invalid_entries.length > 0 || response.duplicate_edges.length > 0) && (
            <div className="results-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 style={{ color: '#f87171' }}>Invalid Entries</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {response.invalid_entries.map((entry, i) => (
                    <span key={i} className="badge cycle">{entry}</span>
                  ))}
                  {response.invalid_entries.length === 0 && <span style={{ color: '#64748b' }}>None</span>}
                </div>
              </div>
              <div className="card" style={{ background: 'rgba(251, 191, 36, 0.05)' }}>
                <h3 style={{ color: '#fbbf24' }}>Duplicate Edges</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {response.duplicate_edges.map((edge, i) => (
                    <span key={i} className="badge" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>{edge}</span>
                  ))}
                  {response.duplicate_edges.length === 0 && <span style={{ color: '#64748b' }}>None</span>}
                </div>
              </div>
            </div>
          )}

          <div className="hierarchy-item">
            <h3 style={{ color: '#94a3b8' }}>Full JSON Response</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
