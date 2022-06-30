/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 66.66666666666667, "KoPercent": 33.333333333333336};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6257309941520468, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "UnregisterUser"], "isController": false}, {"data": [0.9789473684210527, 500, 1500, "getUsers"], "isController": false}, {"data": [0.6526315789473685, 500, 1500, "See users"], "isController": false}, {"data": [0.0, 500, 1500, "registerUser"], "isController": false}, {"data": [0.0, 500, 1500, "Usernotfound"], "isController": false}, {"data": [1.0, 500, 1500, "GetResources"], "isController": false}, {"data": [1.0, 500, 1500, "createUser"], "isController": false}, {"data": [1.0, 500, 1500, "GetaUser"], "isController": false}, {"data": [1.0, 500, 1500, "getUsersbyPage"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1710, 570, 33.333333333333336, 264.61578947368395, 51, 1355, 230.0, 466.0, 549.0, 718.0, 141.35736132925518, 1398.5456750640656, 23.666928009010498], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["UnregisterUser", 190, 190, 100.0, 419.1789473684208, 391, 476, 416.0, 445.0, 453.45, 467.81000000000006, 20.238602471239883, 15.86549984022156, 4.209787428099702], "isController": false}, {"data": ["getUsers", 190, 0, 0.0, 243.1, 205, 797, 217.0, 247.9, 416.29999999999916, 796.09, 18.813743935043075, 33.323031673928114, 2.2598540078225566], "isController": false}, {"data": ["See users", 190, 0, 0.0, 555.6789473684211, 386, 1355, 542.0, 667.1000000000001, 770.4999999999999, 1096.5600000000009, 20.129250979976693, 1615.0937723474415, 2.319581655895752], "isController": false}, {"data": ["registerUser", 190, 190, 100.0, 418.75789473684216, 390, 589, 417.5, 441.0, 451.0, 478.89000000000044, 20.327377768267894, 15.932585321493528, 4.764229164437788], "isController": false}, {"data": ["Usernotfound", 190, 190, 100.0, 86.50000000000003, 51, 452, 55.0, 69.80000000000001, 407.9, 441.08000000000004, 21.21245952886011, 16.525897168415764, 3.542315018979569], "isController": false}, {"data": ["GetResources", 190, 0, 0.0, 86.07894736842101, 52, 439, 54.0, 80.40000000000003, 406.1499999999999, 428.08000000000004, 21.236168548116687, 21.696889495082154, 3.5670126858164752], "isController": false}, {"data": ["createUser", 190, 0, 0.0, 419.67368421052635, 392, 466, 419.5, 440.0, 447.45, 462.36, 20.37533512064343, 16.162345006702413, 4.636184651474531], "isController": false}, {"data": ["GetaUser", 190, 0, 0.0, 95.99473684210525, 51, 440, 54.0, 398.9, 423.0, 439.09000000000003, 20.41254834550924, 21.82262569832402, 2.8505804818435756], "isController": false}, {"data": ["getUsersbyPage", 190, 0, 0.0, 56.578947368421076, 52, 97, 55.0, 62.0, 64.44999999999999, 83.35000000000005, 20.403780068728523, 36.82957809815292, 2.590323641537801], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 380, 66.66666666666667, 22.22222222222222], "isController": false}, {"data": ["404/Not Found", 190, 33.333333333333336, 11.11111111111111], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1710, 570, "400/Bad Request", 380, "404/Not Found", 190, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["UnregisterUser", 190, 190, "400/Bad Request", 190, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["registerUser", 190, 190, "400/Bad Request", 190, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Usernotfound", 190, 190, "404/Not Found", 190, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
