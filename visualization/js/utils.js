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
 * Get dominant speaker from metadata
 * @param {Object} metadata - Node metadata containing speaker counts
 * @returns {string} - Most common speaker name
 */
function getDominantSpeaker(metadata) {
    if (!metadata || !metadata.speakers) return "Unknown";

    const speakers = metadata.speakers;
    let maxCount = 0;
    let dominantSpeaker = "Unknown";

    for (const [speaker, count] of Object.entries(speakers)) {
        if (count > maxCount) {
            maxCount = count;
            dominantSpeaker = speaker;
        }
    }

    return dominantSpeaker;
}

/**
 * Get color for a node based on current color mode
 * @param {Object} node - D3 hierarchy node
 * @param {string} colorMode - Either 'era' or 'speaker'
 * @returns {string} - Hex color code
 */
function getNodeColor(node, colorMode) {
    const colorScale = createEraColorScale();

    if (colorMode === 'era') {
        const era = getDominantEra(node.data.metadata);
        const eraIndex = ERA_ORDER.indexOf(era);
        return eraIndex >= 0 ? colorScale(eraIndex) : '#999';
    } else if (colorMode === 'speaker') {
        // Simple hash function for consistent speaker colors
        const speaker = getDominantSpeaker(node.data.metadata);
        const hash = speaker.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const index = Math.abs(hash) % 10;
        return d3.schemeCategory10[index];
    }

    return '#69b3a2'; // Default color
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
 * Filter tree by dominant metadata bucket presence.
 * Keeps only nodes where selected era or speaker is in node metadata
 * and any ancestors that keep matching descendants connected
 * @param {Object} root - Tree root object
 * @param {string} filterType - Either 'era' or 'speaker'
 * @param {string} filterValue - Selected era/speaker value
 * @returns {Object|null} - Filtered tree or null if no matches
 */
function filterTreeByMetadata(root, filterType, filterValue) {
    if (!root || !filterType || !filterValue) return root;

    const bucketKey = filterType === 'era' ? 'eras' : 'speakers';

    const cloneAndFilter = (node, isRoot = false) => {
        const children = Array.isArray(node.children) ? node.children : [];
        const filteredChildren = children
            .map(child => cloneAndFilter(child, false))
            .filter(Boolean);

        const count = node.metadata?.[bucketKey]?.[filterValue] || 0;
        const nodeMatches = count > 0;

        if (!isRoot && !nodeMatches && filteredChildren.length === 0) {
            return null;
        }

        const nextNode = { ...node };

        if (filteredChildren.length > 0) {
            nextNode.children = filteredChildren;
        } else {
            delete nextNode.children;
        }

        if (!isRoot && count > 0 && typeof nextNode.value === 'number') {
            nextNode.value = count;
        }

        return nextNode;
    };

    return cloneAndFilter(root, true);
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
