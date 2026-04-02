# Presidential Speech Word Tree Analysis

Python-based tokenization and data processing system for analyzing 1,056 presidential speeches and creating interactive word tree visualizations.

## Overview

This project analyzes presidential speeches to build hierarchical word trees showing word sequences that follow (or precede) specific root words. The output is formatted for D3.js visualization with metadata for color coding by historical era or speaker.

## Features

- **Bidirectional Analysis**: Track words both before and after root words
- **Historical Context**: Speeches categorized into 9 historical eras
- **Case-Insensitive Matching**: Captures all variations of root words
- **Rich Metadata**: Era and speaker distributions at each tree node
- **D3.js Ready**: Output formatted for hierarchical D3.js layouts

## Dataset

- **1,056 speeches** from 45 U.S. presidents
- Date range: 1789-04-30 to 2026-02-28
- Speeches include inaugurals, State of the Union addresses, major policy speeches, etc.

## Root Words Analyzed

1. **we** - 113,290 nodes (after), 131,471 nodes (before)
2. **must** - 23,705 nodes (after), 24,809 nodes (before)
3. **freedom** - 8,224 nodes (after), 8,111 nodes (before)
4. **fear** - 2,104 nodes (after), 2,075 nodes (before)
5. **never** - 9,613 nodes (after), 9,339 nodes (before)

## Historical Eras

- Founding Era (1789-1828)
- Jacksonian Era (1829-1860)
- Civil War & Reconstruction (1861-1877)
- Gilded Age (1878-1900)
- Progressive Era (1901-1920)
- Roaring 20s & Depression (1921-1945)
- Cold War (1946-1991)
- Post-Cold War (1992-2001)
- Modern Era (2001-present)

## Usage

### Running the Analysis

```bash
python3 main.py
```

This will:
1. Load all 1,056 speeches from `speeches/` directory
2. Process each root word (we, must, freedom, fear, never)
3. Build word trees for both "after" and "before" directions
4. Export results to `output/word_tree_data.json`

### Output Format

The output JSON has the following structure:

```json
{
  "root_words": {
    "freedom": {
      "after": {
        "name": "freedom",
        "children": [
          {
            "name": "and",
            "value": 429,
            "metadata": {
              "eras": {
                "Cold War": 150,
                "Modern Era": 120,
                ...
              },
              "speakers": {
                "Ronald Reagan": 45,
                "Barack Obama": 38,
                ...
              }
            },
            "children": [...]
          }
        ]
      },
      "before": { ... }
    }
  },
  "metadata": {
    "total_speeches": 1056,
    "date_range": ["1789-04-30", "2026-02-28"],
    "eras": [...],
    "presidents": [...]
  }
}
```

### Node Structure

Each tree node contains:
- `name`: The word at this position
- `value`: Number of occurrences (for node sizing in D3.js)
- `metadata`: Era and speaker distributions (for color coding)
- `children`: Array of child nodes (words that follow)

## Example Word Sequences

From the "we" root word analysis:

**After "we":**
- we → have → to → do
- we → are → not → going → to
- we → will → not → be
- we → must → be → prepared
- we → can → do → it

**Before "we":**
- [words] → [words] → [words] → [words] → we

## Implementation Details

### Tokenization
- Simple whitespace splitting
- Punctuation preserved initially, stripped for matching
- Case-insensitive matching (we = We = WE)

### Tree Building
- Context window: 5 words before/after root
- Hierarchical aggregation with occurrence counting
- Metadata attached at each node level
- Trees sorted by occurrence count (most common first)

### Color Coding Options

Use the metadata to color branches by:
- **Era**: Assign colors to historical periods
- **Speaker**: Highlight contributions from specific presidents
- **Frequency**: Gradient based on occurrence count

### Interactive Features

- Toggle between "after" and "before" directions
- Filter by era or speaker
- Expand/collapse tree branches
- Hover for details (full phrase, metadata)
- Search for specific word sequences

## Dependencies

- Python 3.8 or higher
- Standard library only (no external packages required)

## Files

- `main.py`: Entry point (91 lines)
- `src/metadata.py`: Era and president data (148 lines)
- `src/tokenizer.py`: Text processing (118 lines)
- `src/tree_builder.py`: Tree construction (209 lines)
- `src/exporter.py`: JSON export (107 lines)
