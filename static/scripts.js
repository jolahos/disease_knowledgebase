
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawCharts);

let allExpressionData = [];
let allCountData = [];
let currentSort = 'alphabet';

function drawCharts() {
    drawBarChart();
    drawCountBarChart();
}

function drawBarChart(expressionData = []) {
    var data = google.visualization.arrayToDataTable([
        ['Tissue', 'Expression Level'],
        ...expressionData
    ]);

    var options = {
        title: 'Gene Expression Levels',
        hAxis: {
            slantedText: true,
            slantedTextAngle: 90,
            textStyle: {
                fontSize: 10
            }
        },
        vAxis: {
            title: 'TPM',
            titleTextStyle: {
                fontSize: 12,
                italic: false,
                bold: true,
                margin: 20 // Adjust margin to move the title away from the axis
            },
            textStyle: {
                fontSize: 10
            },
            viewWindow: {
                min: 0
            }
        },
        legend: 'none',
        bar: { groupWidth: '75%' },
        explorer: { 
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 4.0
        },
        chartArea: {width: '90%', height: '70%'},
        height: 600,
        width: '100%'
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    // Update table
    updateTable(expressionData);
}

function drawCountBarChart() {
    var data = google.visualization.arrayToDataTable([
        ['Tissue', 'Count'],
        ...allCountData
    ]);

    var options = {
        title: 'Number of Donors per Tissue',
        hAxis: {
            title: 'Tissue',
            slantedText: true,
            slantedTextAngle: 90,
            textStyle: {
                fontSize: 10
            }
        },
        vAxis: {
            title: 'Count',
            titleTextStyle: {
                fontSize: 12,
                italic: false,
                bold: true,
                margin: 20 // Adjust margin to move the title away from the axis
            },
            textStyle: {
                fontSize: 10
            },
            viewWindow: {
                min: 0
            }
        },
        legend: 'none',
        chartArea: {width: '90%', height: '70%'},
        height: 400,
        width: '100%'
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('count_chart_div'));
    chart.draw(data, options);
}

function fetchGeneExpressionData(geneId) {
    console.log('Fetching expression data for gene ID:', geneId); // Debugging log
    fetch('/api/gene_expression_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gene_id: geneId })
    })
    .then(response => {
        console.log('Response status:', response.status); // Debugging log
        return response.json();
    })
    .then(data => {
        console.log('Expression data received:', data); // Debugging log
        allExpressionData = data.map(item => [item.tissue, item.expression_level]);
        sortData(currentSort);
        drawBarChart(allExpressionData);
    })
    .catch(error => {
        console.error('Error fetching expression data:', error); // Debugging log
    });

    fetch(`/api/expression_count/${geneId}`)
        .then(response => response.json())
        .then(data => {
            allCountData = data.map(item => [item.tissue, item.count]);
            sortData(currentSort);
            drawCountBarChart();
        });
}

function filterData() {
    const selectedTissues = Array.from(document.querySelectorAll('input[name="tissue"]:checked')).map(checkbox => checkbox.value);
    const minExpression = parseFloat(document.getElementById('min_expression').value) || -Infinity;
    const maxExpression = parseFloat(document.getElementById('max_expression').value) || Infinity;

    const filteredData = allExpressionData.filter(([tissue, expression_level]) => {
        return (selectedTissues.includes('all') || selectedTissues.includes(tissue)) &&
               expression_level >= minExpression &&
               expression_level <= maxExpression;
    });

    drawBarChart(filteredData);
}

function updateTable(expressionData) {
    const tableBody = document.getElementById('expression_table_body');
    tableBody.innerHTML = '';

    expressionData.forEach(([tissue, expression_level]) => {
        const row = document.createElement('tr');
        const tissueCell = document.createElement('td');
        const expressionLevelCell = document.createElement('td');

        tissueCell.textContent = tissue;
        expressionLevelCell.textContent = expression_level.toFixed(1);

        row.appendChild(tissueCell);
        row.appendChild(expressionLevelCell);
        tableBody.appendChild(row);
    });
}

function sortData(criteria) {
    if (criteria === 'alphabet') {
        allExpressionData.sort((a, b) => a[0].localeCompare(b[0]));
    } else if (criteria === 'value') {
        allExpressionData.sort((a, b) => b[1] - a[1]);
    }
    currentSort = criteria;
    drawBarChart(allExpressionData);
    updateTable(allExpressionData);
    drawCountBarChartWithOrder();
}

function drawCountBarChartWithOrder() {
    const orderedCountData = allExpressionData.map(([tissue]) => {
        const countData = allCountData.find(([countTissue]) => countTissue === tissue);
        return countData ? countData : [tissue, 0];
    });

    var data = google.visualization.arrayToDataTable([
        ['Tissue', 'Count'],
        ...orderedCountData
    ]);

    var options = {
        title: 'Number of Donors per Tissue',
        hAxis: {
            title: 'Tissue',
            slantedText: true,
            slantedTextAngle: 90,
            textStyle: {
                fontSize: 10
            }
        },
        vAxis: {
            title: 'Count',
            titleTextStyle: {
                fontSize: 12,
                italic: false,
                bold: true,
                margin: 20 // Adjust margin to move the title away from the axis
            },
            textStyle: {
                fontSize: 10
            },
            viewWindow: {
                min: 0
            }
        },
        legend: 'none',
        chartArea: {width: '90%', height: '70%'},
        height: 400,
        width: '100%'
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('count_chart_div'));
    chart.draw(data, options);
}

function fetchDiseasePathwayData(pathway) {
    console.log('Fetching data for pathway:', pathway); // Debugging log
    fetch('/api/disease_pathway_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pathway: pathway })
    })
    .then(response => {
        console.log('Response status:', response.status); // Debugging log
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data); // Debugging log
        updateDiseasePathwayTable(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error); // Debugging log
    });
}

function updateDiseasePathwayTable(data) {
    const tableBody = document.getElementById('disease_pathway_table_body');
    tableBody.innerHTML = '';

    data.forEach(({ gene_id, description }) => {
        const row = document.createElement('tr');
        const geneIdCell = document.createElement('td');
        const descriptionCell = document.createElement('td');

        geneIdCell.textContent = gene_id;
        descriptionCell.textContent = description;

        row.appendChild(geneIdCell);
        row.appendChild(descriptionCell);
        tableBody.appendChild(row);
    });
}

function fetchGeneIdsForPathway(pathway) {
    console.log('Fetching gene IDs for pathway:', pathway); // Debugging log
    fetch('/api/gene_ids_for_pathway', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pathway: pathway })
    })
    .then(response => {
        console.log('Response status:', response.status); // Debugging log
        return response.json();
    })
    .then(data => {
        console.log('Gene IDs received:', data); // Debugging log
        updateGeneIdDropdown(data);
        if (data.length > 0) {
            fetchGeneExpressionData(data[0]); // Fetch and display data for the first gene ID
        }
    })
    .catch(error => {
        console.error('Error fetching gene IDs:', error); // Debugging log
    });
}

function updateGeneIdDropdown(geneIds) {
    const geneIdSelect = document.getElementById('gene_id');
    geneIdSelect.innerHTML = '';

    geneIds.forEach(gene_id => {
        const option = document.createElement('option');
        option.value = gene_id;
        option.textContent = gene_id;
        geneIdSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const firstGeneId = "{{ first_gene_id }}";
    if (firstGeneId) {
        fetchGeneExpressionData(firstGeneId);
    }

    document.getElementById('disease_pathway').addEventListener('change', function() {
        const pathway = this.value;
        fetchDiseasePathwayData(pathway);
        fetchGeneIdsForPathway(pathway);
    });

    document.getElementById('gene_id').addEventListener('change', function() {
        const geneId = this.value;
        fetchGeneExpressionData(geneId);
    });

    document.getElementById('filter_form').addEventListener('input', filterData);

    document.getElementById('sort_alphabet').addEventListener('click', function() {
        sortData('alphabet');
    });

    document.getElementById('sort_value').addEventListener('click', function() {
        sortData('value');
    });
});