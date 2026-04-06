/**
 * Utility functions for color scales, data processing, and search
 */

// Color scale for historical eras (sequential - chronological)
const ERA_ORDER = [
    "Founding Era",
    "Jacksonian Era",
    "Civil War & Reconstruction",
    "Gilded Age",
    "Progressive Era",
    "Roaring 20s & Depression",
    "Cold War",
    "Post-Cold War",
    "Modern Era"
];

/**
 * Create sequential color scale (blue → purple → red)
 * Early eras = blue tones, Modern eras = red/orange tones
 */
function createEraColorScale() {
    return d3.scaleSequential()
        .domain([ERA_ORDER.length - 1, 0])  // Reversed domain: early = blue, modern = red
        .interpolator(d3.interpolateRdYlBu);
}

/**
 * Get dominant era from metadata
 * @param {Object} metadata - Node metadata containing era counts
 * @returns {string} - Most common era name
 */
function getDominantEra(metadata) {
    if (!metadata || !metadata.eras) return "Unknown";

    const eras = metadata.eras;
    let maxCount = 0;
    let dominantEra = "Unknown";

    for (const [era, count] of Object.entries(eras)) {
        if (count > maxCount) {
            maxCount = count;
            dominantEra = era;
        }
    }

    return dominantEra;
}

/**
 * Get color for a node based on its dominant historical era
 * @param {Object} node - D3 hierarchy node
 * @returns {string} - Hex color code
 */
function getNodeColor(node) {
    const colorScale = createEraColorScale();
    const era = getDominantEra(node.data.metadata);
    const eraIndex = ERA_ORDER.indexOf(era);
    return eraIndex >= 0 ? colorScale(eraIndex) : '#999';
}

/**
 * Search tree for nodes containing a word
 * @param {Object} node - Root node to search from
 * @param {string} searchTerm - Term to search for
 * @param {Array} results - Accumulator for results
 * @returns {Array} - Array of matching nodes
 */
function searchTree(node, searchTerm, results = []) {
    const normalizedTerm = searchTerm.toLowerCase().trim();
    if (!normalizedTerm) return results;

    const nodeName = node.data.name.toLowerCase();

    if (nodeName.includes(normalizedTerm)) {
        results.push(node);
    }

    if (node.children) {
        node.children.forEach(child => searchTree(child, searchTerm, results));
    }

    if (node._children) {
        node._children.forEach(child => searchTree(child, searchTerm, results));
    }

    return results;
}

/**
 * Format number with commas for better readability
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Show loading indicator
 */
function showLoading() {
    d3.select('#loading').classed('hidden', false);
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    d3.select('#loading').classed('hidden', true);
}
