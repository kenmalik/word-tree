"""
JSON export functionality for D3.js visualization.
"""

import json
from typing import Dict, List
from datetime import datetime


def export_to_json(root_word_trees: Dict, speeches: List[Dict],
                   output_path: str) -> None:
    """
    Export word tree data to JSON file in D3.js-compatible format.

    Args:
        root_word_trees: Dictionary mapping root words to their tree structures
                        Format: {root_word: {'after': tree, 'before': tree}}
        speeches: List of all speeches (for metadata generation)
        output_path: Path to output JSON file
    """
    from .metadata import get_all_eras, parse_date

    # Collect global metadata
    presidents = sorted(set(speech['president'] for speech in speeches))
    eras = get_all_eras()

    # Find date range
    dates = [parse_date(speech['date']) for speech in speeches if speech.get('date')]
    if dates:
        min_date = min(dates)
        max_date = max(dates)
        date_range = [min_date.strftime('%Y-%m-%d'), max_date.strftime('%Y-%m-%d')]
    else:
        date_range = []

    # Build final output structure
    output = {
        'root_words': root_word_trees,
        'metadata': {
            'total_speeches': len(speeches),
            'date_range': date_range,
            'eras': eras,
            'presidents': presidents,
            'root_words_analyzed': list(root_word_trees.keys()),
        }
    }

    # Write to file with pretty formatting
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Successfully exported word tree data to {output_path}")
    print(f"Total speeches processed: {len(speeches)}")
    print(f"Root words analyzed: {', '.join(root_word_trees.keys())}")
    print(f"Date range: {date_range[0] if date_range else 'N/A'} to {date_range[1] if date_range else 'N/A'}")


def generate_tree_statistics(tree: Dict) -> Dict:
    """
    Generate statistics about a tree structure.

    Args:
        tree: Tree structure

    Returns:
        Dictionary of statistics
    """
    def count_nodes(node: Dict) -> int:
        """Recursively count nodes in tree."""
        count = 1
        if 'children' in node and node['children']:
            for child in node['children']:
                count += count_nodes(child)
        return count

    def max_depth(node: Dict, current_depth: int = 0) -> int:
        """Find maximum depth of tree."""
        if 'children' not in node or not node['children']:
            return current_depth

        return max(max_depth(child, current_depth + 1) for child in node['children'])

    stats = {
        'total_nodes': count_nodes(tree),
        'max_depth': max_depth(tree),
        'root_name': tree.get('name', 'unknown'),
    }

    return stats


def print_tree_preview(tree: Dict, max_depth: int = 3, indent: int = 0) -> None:
    """
    Print a preview of the tree structure for debugging.

    Args:
        tree: Tree structure
        max_depth: Maximum depth to print
        indent: Current indentation level
    """
    name = tree.get('name', 'unknown')
    value = tree.get('value', 0)

    print('  ' * indent + f"{name} ({value})")

    if indent < max_depth and 'children' in tree and tree['children']:
        # Print top 5 children only
        for child in tree['children'][:5]:
            print_tree_preview(child, max_depth, indent + 1)

        if len(tree['children']) > 5:
            print('  ' * (indent + 1) + f"... and {len(tree['children']) - 5} more")
