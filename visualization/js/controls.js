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
        this.currentFilterType = 'none';
        this.currentFilterValue = null;

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

        // Filter type select
        d3.select('#filter-type-select').on('change', (event) => {
            this.currentFilterType = event.target.value;
            if (this.currentFilterType === 'none') {
                d3.select('#filter-value-select').style('display', 'none');
                this.currentFilterValue = null;
                this.tree.setFilter('none', null);
            } else {
                this.populateFilterDropdown(this.currentFilterType);
                d3.select('#filter-value-select').style('display', null);
                this.tree.setFilter(this.currentFilterType, this.currentFilterValue);
            }
        });

        // Filter value dropdown
        d3.select('#filter-value-select').on('change', (event) => {
            this.currentFilterValue = event.target.value;
            this.tree.setFilter(this.currentFilterType, this.currentFilterValue);
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

        } catch (error) {
            console.error('Error loading tree data:', error);
            alert('Error loading data. Please try again.');
        } finally {
            hideLoading();
        }
    }

    populateFilterDropdown(type) {
        const items = type === 'president'
            ? this.dataLoader.metadata.metadata.presidents
            : this.dataLoader.metadata.metadata.eras;
        const select = d3.select('#filter-value-select');
        select.html('');
        items.forEach(item => select.append('option').attr('value', item).text(item));
        this.currentFilterValue = items[0];
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
