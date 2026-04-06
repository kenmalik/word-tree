/**
 * DataLoader class for on-demand loading of word tree data
 */
class DataLoader {
    constructor() {
        this.metadata = null;
        this.cache = {};
    }

    /**
     * Load global metadata
     * @returns {Promise<Object>} - Metadata object
     */
    async loadMetadata() {
        if (this.metadata) return this.metadata;

        try {
            const response = await fetch('data/metadata.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.metadata = await response.json();
            return this.metadata;
        } catch (error) {
            console.error('Error loading metadata:', error);
            throw error;
        }
    }

    /**
     * Load data for a specific root word and direction
     * @param {string} rootWord - Root word to load (we, must, freedom, fear, never)
     * @param {string} direction - Either 'after' or 'before'
     * @returns {Promise<Object>} - Tree data for visualization
     */
    async loadRootWord(rootWord, direction) {
        const cacheKey = `${rootWord}_${direction}`;

        // Return cached data if available
        if (this.cache[cacheKey]) {
            console.log(`Loading ${rootWord} (${direction}) from cache`);
            return this.cache[cacheKey];
        }

        try {
            console.log(`Fetching ${rootWord} data from server...`);
            const response = await fetch(`data/${rootWord}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const treeData = data[direction];

            // Cache the data
            this.cache[cacheKey] = treeData;

            console.log(`Loaded ${rootWord} (${direction}) successfully`);
            return treeData;
        } catch (error) {
            console.error(`Error loading ${rootWord} data:`, error);
            throw error;
        }
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Presidential Speech Word Tree...');

    // Create instances
    const dataLoader = new DataLoader();
    const tree = new WordTree('#tree-svg', window.innerWidth, window.innerHeight);
    const controls = new Controls(tree, dataLoader);

    try {
        // Load metadata
        showLoading();
        await dataLoader.loadMetadata();
        console.log('Metadata loaded');

        // Load initial tree (we, after)
        await controls.loadTreeData();

        // Initialize legend
        controls.updateLegend();

        // Add tooltip functionality
        addTooltipHandlers(tree);

        console.log('Initialization complete!');
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize visualization. Please refresh the page.');
    } finally {
        hideLoading();
    }
});

/**
 * Add tooltip handlers to tree nodes
 * @param {WordTree} tree - Tree instance
 */
function addTooltipHandlers(tree) {
    const tooltip = d3.select('#tooltip');

    // Use event delegation on the SVG container
    tree.svg.on('mouseover', function(event) {
        const target = event.target;

        // Check if we're hovering over a node circle or text
        if (target.tagName === 'circle' || target.tagName === 'text') {
            const nodeGroup = d3.select(target.closest('g.node'));
            const nodeData = nodeGroup.datum();

            if (nodeData && nodeData.depth !== 0 && !nodeData.data._isSentinel) {
                const content = getTooltipContent(nodeData);

                tooltip.select('#tooltip-content').html(content);
                tooltip.classed('hidden', false)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            }
        }
    });

    tree.svg.on('mouseout', function(event) {
        const target = event.target;

        // Hide tooltip when leaving node elements
        if (target.tagName === 'circle' || target.tagName === 'text') {
            tooltip.classed('hidden', true);
        }
    });

    // Also handle mouse move to follow cursor
    tree.svg.on('mousemove', function(event) {
        const target = event.target;

        if (target.tagName === 'circle' || target.tagName === 'text') {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        }
    });
}

/**
 * Generate tooltip content for a node
 * @param {Object} nodeData - D3 hierarchy node data
 * @returns {string} - HTML content for tooltip
 */
function getTooltipContent(nodeData) {
    const name = nodeData.data.name;
    const value = nodeData.data.value || 0;
    const metadata = nodeData.data.metadata;

    let html = `<strong>${name}</strong><br>`;
    html += `Occurrences: ${formatNumber(value)}<br>`;

    if (metadata) {
        // Add era information
        if (metadata.eras) {
            const topEra = Object.entries(metadata.eras)
                .sort((a, b) => b[1] - a[1])[0];
            if (topEra) {
                html += `<br><em>Top Era:</em><br>${topEra[0]} (${formatNumber(topEra[1])})<br>`;
            }
        }

        // Add speaker information
        if (metadata.speakers) {
            const topSpeakers = Object.entries(metadata.speakers)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3); // Top 3 speakers

            if (topSpeakers.length > 0) {
                html += `<br><em>Top Speakers:</em><br>`;
                topSpeakers.forEach(([speaker, count]) => {
                    html += `${speaker}: ${formatNumber(count)}<br>`;
                });
            }
        }
    }

    return html;
}
