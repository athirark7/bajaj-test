const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Placeholder user info
const USER_INFO = {
    user_id: "athira_24042026",
    email_id: "athira@college.edu",
    college_roll_number: "21CS1001"
};

/**
 * Validates the node format "X->Y" where X and Y are single uppercase letters (A-Z).
 */
function isValidFormat(edge) {
    if (typeof edge !== 'string') return false;
    const trimmed = edge.trim();
    if (!trimmed.includes('->')) return false;
    const parts = trimmed.split('->');
    if (parts.length !== 2) return false;
    const [parent, child] = parts;
    return /^[A-Z]$/.test(parent) && /^[A-Z]$/.test(child) && parent !== child;
}

function processGraph(data) {
    const invalid_entries = [];
    const duplicate_edges = [];
    const validEdges = [];
    const seenEdges = new Set();
    const childrenToParents = new Map(); // child -> parent

    data.forEach(entry => {
        if (!isValidFormat(entry)) {
            invalid_entries.push(entry);
            return;
        }

        const trimmed = entry.trim();
        const [parent, child] = trimmed.split('->');

        if (seenEdges.has(trimmed)) {
            duplicate_edges.push(trimmed);
            return;
        }
        seenEdges.add(trimmed);

        // First parent wins rule
        if (!childrenToParents.has(child)) {
            childrenToParents.set(child, parent);
            validEdges.push({ parent, child });
        }
        // else: subsequent parent edges are silently discarded
    });

    const nodes = new Set();
    const adj = new Map();
    validEdges.forEach(({ parent, child }) => {
        nodes.add(parent);
        nodes.add(child);
        if (!adj.has(parent)) adj.set(parent, []);
        adj.get(parent).push(child);
    });

    // Find all independent components
    const visited = new Set();
    const components = [];

    const allNodesArray = Array.from(nodes).sort();
    allNodesArray.forEach(node => {
        if (!visited.has(node)) {
            const componentNodes = new Set();
            const stack = [node];
            // Since it's a directed graph and we want components, 
            // we should treat it as undirected for component finding.
            // Actually, we can just find all nodes reachable from here and keep going.
            // But wait, "independent trees" means we should find the roots.
            // Let's find nodes with no parent in validEdges.
        }
    });

    // Correct way to find independent trees/cycles:
    // 1. Identify all nodes.
    // 2. Identify all roots (nodes that are not children of any valid edge).
    // 3. For each root, build the tree.
    // 4. Any nodes left (part of cycles) need to be handled.

    const allNodes = Array.from(nodes);
    const roots = allNodes.filter(n => !childrenToParents.has(n)).sort();
    const processedNodes = new Set();
    const hierarchies = [];

    roots.forEach(root => {
        const { tree, depth, nodesVisited, hasCycle } = buildHierarchy(root, adj, new Set());
        nodesVisited.forEach(n => processedNodes.add(n));
        hierarchies.push({
            root,
            tree,
            depth
        });
    });

    // Remaining nodes are part of cycles
    const remainingNodes = allNodes.filter(n => !processedNodes.has(n)).sort();
    const cyclicGroups = [];
    const cyclicVisited = new Set();

    remainingNodes.forEach(node => {
        if (!cyclicVisited.has(node)) {
            const group = [];
            const stack = [node];
            while (stack.length > 0) {
                const curr = stack.pop();
                if (cyclicVisited.has(curr)) continue;
                cyclicVisited.add(curr);
                group.push(curr);
                // Explore neighbors in validEdges (parent or child)
                validEdges.forEach(e => {
                    if (e.parent === curr && !cyclicVisited.has(e.child)) stack.push(e.child);
                    if (e.child === curr && !cyclicVisited.has(e.parent)) stack.push(e.parent);
                });
            }
            if (group.length > 0) {
                cyclicGroups.push(group.sort());
            }
        }
    });

    cyclicGroups.forEach(group => {
        hierarchies.push({
            root: group[0], // Lexicographically smallest
            tree: {},
            has_cycle: true
        });
    });

    // Summary
    const total_trees = hierarchies.filter(h => !h.has_cycle).length;
    const total_cycles = cyclicGroups.length;
    
    let largest_tree_root = "";
    let maxDepth = -1;

    hierarchies.forEach(h => {
        if (!h.has_cycle) {
            if (h.depth > maxDepth) {
                maxDepth = h.depth;
                largest_tree_root = h.root;
            } else if (h.depth === maxDepth) {
                if (h.root < largest_tree_root) {
                    largest_tree_root = h.root;
                }
            }
        }
    });

    return {
        ...USER_INFO,
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };
}

function buildHierarchy(node, adj, path) {
    if (path.has(node)) {
        return { tree: {}, depth: 0, nodesVisited: new Set(), hasCycle: true };
    }
    path.add(node);
    const nodesVisited = new Set([node]);
    const children = adj.get(node) || [];
    const subtree = {};
    let maxChildDepth = 0;

    children.forEach(child => {
        const res = buildHierarchy(child, adj, new Set(path));
        subtree[child] = res.tree[child] || res.tree; 
        // Wait, the schema example: "tree": { "A": { "B": { "D": {} }, "C": { "E": { "F": {} } } } }
        // The root itself is the key in the tree object.
        maxChildDepth = Math.max(maxChildDepth, res.depth);
        res.nodesVisited.forEach(n => nodesVisited.add(n));
    });

    // To match the exact format: "tree": { "A": { ... } }
    const resultTree = {};
    resultTree[node] = subtree;

    return { 
        tree: resultTree, 
        depth: maxChildDepth + 1, 
        nodesVisited 
    };
}

app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid request body. Expected 'data' as an array." });
        }
        const result = processGraph(data);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
