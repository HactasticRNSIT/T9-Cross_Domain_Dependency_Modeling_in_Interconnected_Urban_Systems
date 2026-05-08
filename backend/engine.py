import json
import networkx as nx

def simulate_cascade(start_node):
    try:
        with open("data/mock_city.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        return ["Error: Run generator.py first!"]

    # Build the city graph
    G = nx.DiGraph()
    for edge in data["edges"]:
        G.add_edge(edge["source"], edge["target"])

    # Run BFS to find all downstream nodes affected by the failure
    if start_node not in G:
        return [f"Node {start_node} not found"]
    
    affected_nodes = list(nx.bfs_tree(G, start_node).nodes())
    return affected_nodes