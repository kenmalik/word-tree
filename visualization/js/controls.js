/**
 * Controls class for handling UI interactions
 */
class Controls {
    constructor(tree, dataLoader) {
        this.tree = tree;
        this.dataLoader = dataLoader;
        this.currentRootWord = 'we';
        this.currentDirection = 'after';
        this.currentPage = 1;
        this.pageSize = 10;

        this.initEventListeners();
    }

    /**
     * Initialize all event listeners for controls
     */
    initEventListeners() {
        // Root word selector
        d3.select('#root-word-select').on('change', (event) => {
            this.currentRootWord = event.target.value;
            this.loadTreeData();
        });

        // Direction toggle
        d3.selectAll('input[name="direction"]').on('change', (event) => {
            this.currentDirection = event.target.value;
            this.loadTreeData();
        });

        // Search functionality
        d3.select('#search-btn').on('click', () => {
            this.performSearch();
        });

        // Allow Enter key to trigger search
        d3.select('#search-input').on('keypress', (event) => {
            if (event.key === 'Enter') {
                this.performSearch();
            }
        });

        d3.select('#clear-search-btn').on('click', () => {
            d3.select('#search-input').property('value', '');
            this.tree.highlightNodes('');
        });

        // Expand/Collapse all
        d3.select('#expand-all-btn').on('click', () => {
            this.tree.expandAll();
        });

        d3.select('#collapse-all-btn').on('click', () => {
            this.tree.collapseAll();
        });

        // Zoom controls
        d3.select('#fit-zoom-btn').on('click', () => {
            this.tree.zoomToFit();
        });

        // Pagination
        d3.select('#page-size-select').on('change', () => {
            this.pageSize = +d3.select('#page-size-select').property('value');
            this.currentPage = 1;
            this.applyPage();
        });

        d3.select('#page-prev').on('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.applyPage();
            }
        });

        d3.select('#page-next').on('click', () => {
            const totalPages = Math.ceil(this.tree.totalRootChildren / this.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.applyPage();
            }
        });
    }

    applyPage() {
        this.tree.setPage(this.currentPage, this.pageSize);
        this.updatePageControls();
    }

    updatePageControls() {
        const totalPages = Math.ceil(this.tree.totalRootChildren / this.pageSize);
        d3.select('#page-indicator').text(`Page ${this.currentPage} of ${totalPages}`);
        d3.select('#page-prev').property('disabled', this.currentPage <= 1);
        d3.select('#page-next').property('disabled', this.currentPage >= totalPages);
    }

    /**
     * Perform search and show results
     */
    performSearch() {
        const searchTerm = d3.select('#search-input').property('value');
        if (!searchTerm.trim()) {
            alert('Please enter a search term');
            return;
        }

        const count = this.tree.highlightNodes(searchTerm);
        if (count > 0) {
            alert(`Found ${count} node${count > 1 ? 's' : ''} matching "${searchTerm}"`);
        } else {
            alert(`No nodes found matching "${searchTerm}"`);
        }
    }

    /**
     * Load tree data for current root word and direction
     */
    async loadTreeData() {
        showLoading();

        try {
            const data = await this.dataLoader.loadRootWord(
                this.currentRootWord,
                this.currentDirection
            );
            this.tree.loadData(data);
            this.currentPage = 1;
            this.applyPage();
            this.tree.zoomToFit(0);

            // Clear search highlights when loading new data
            d3.select('#search-input').property('value', '');
        } catch (error) {
            console.error('Error loading tree data:', error);
            alert('Error loading data. Please try again.');
        } finally {
            hideLoading();
        }
    }

    updateLegend() {
        const legendContent = d3.select('#legend-content');
        legendContent.html('');

        const colorScale = createEraColorScale();
        ERA_ORDER.forEach((era, i) => {
            const item = legendContent.append('div')
                .attr('class', 'legend-item');

            item.append('div')
                .attr('class', 'legend-color')
                .style('background-color', colorScale(i));

            item.append('span')
                .text(era)
                .style('font-size', '12px');
        });
    }
}
