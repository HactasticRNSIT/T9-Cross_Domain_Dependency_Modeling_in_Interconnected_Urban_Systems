import networkx as nx

# These are the exact mathematical weights P2 just discovered!
DEPENDENCY_WEIGHTS = {
    "Transport": 0.96,
    "Water": 0.70,
    "Comms": 0.16,
    "Environment": 0.13,
    "Emergency": -0.06
}

def simulate_cascade(start_node, threshold=0.5):
    """
    Simulates a failure spreading through the city.
    If the dependency weight is greater than the threshold (0.5), it breaks.
    """
    # 1. Build the AI-driven City Graph
    G = nx.DiGraph()
    
    # We map the energy failure to all other domains
    for target_domain, weight in DEPENDENCY_WEIGHTS.items():
        G.add_edge("Energy", target_domain, weight=weight)

    # 2. Run the smart cascade
    if start_node not in G:
        return [f"Error: {start_node} not in graph. Try 'Energy'."]

    failed_nodes = [start_node]
    
    # Check all systems that depend on the failed node
    for neighbor in G.neighbors(start_node):
        dependency_strength = G[start_node][neighbor]['weight']
        
        # If the math says it's a strong dependency, it fails!
        if dependency_strength >= threshold:
            failed_nodes.append(neighbor)

    return failed_nodes