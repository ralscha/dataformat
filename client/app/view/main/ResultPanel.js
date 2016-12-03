Ext.define('Df.view.main.ResultPanel', {
	extend: 'Ext.Panel',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Category',
        'Ext.chart.axis.Numeric',
        'Ext.chart.series.Bar',
        'Ext.grid.Grid',
        'Ext.layout.HBox',
        'Ext.util.Format'
    ],

    layout: 'hbox',
	
	items: [ {
		flex: 1,
		xtype: 'cartesian',
		width: '100%',
		height: '100%',
		bind: {
			store: '{results}'
		},

		colors: [ '#82CAFA', '#FAB282' ],

		insetPadding: {
			top: 40,
			left: 40,
			right: 40,
			bottom: 40
		},

		axes: [ {
			type: 'numeric',
			position: 'left',
			adjustByMajorUnit: true,
			fields: [ 'uncompressed' ],
			renderer: Ext.util.Format.numberRenderer('0,000'),
			minimum: 0,
			titleMargin: 20,
			grid: true,
			title: {
				text: 'Bytes'
			}
		}, {
			type: 'category',
			position: 'bottom',			
			fields: [ 'format' ],
			label: {
				rotate: {
					degrees: -70
				}
			}
		} ],
		series: [ {
			type: 'bar',
			axis: 'left',
			title: [ 'uncompressed', 'compressed' ],
			xField: 'format',
			yField: [ 'uncompressed', 'compressed' ],
			stacked: false,
			highlight: {
				fillStyle: 'yellow'
			},
			tooltip: {
				renderer: function(tooltip, record, series) {
					tooltip.setHtml(record.get('format') + ': ' + Ext.util.Format.number(record.get(series.field), '0,000') + ' bytes');
				}
			},
			label: {
				field: [ 'uncompressed', 'compressed' ],
				display: 'insideEnd',
				renderer: Ext.util.Format.numberRenderer('0,000')
			}
		} ]
	}, {
		flex: 1,
		xtype: 'grid',
		bind: '{results}',
		columns: [ {
			text: 'Format',
			flex: 1,
			dataIndex: 'format',
			hideable: false,
			draggable: false
		}, {
			text: 'Uncompressed',
			dataIndex: 'uncompressed',
			width: 130,
			renderer: Ext.util.Format.numberRenderer('0,000'),
			hideable: false,
			draggable: false
		}, {
			text: 'Uncompressed Comparison',
			dataIndex: 'uncompressedComparison',
			width: 120,
			renderer: Ext.util.Format.numberRenderer('0.00 %'),
			hideable: false,
			draggable: false
		}, {
			text: 'Compressed',
			dataIndex: 'compressed',
			width: 110,
			renderer: Ext.util.Format.numberRenderer('0,000'),
			hideable: false,
			draggable: false
		}, {
			text: 'Compressed Comparison',
			dataIndex: 'compressedComparison',
			width: 110,
			renderer: Ext.util.Format.numberRenderer('0.00 %'),
			hideable: false,
			draggable: false
		}, {
			text: 'Space Savings',
			flex: 1,
			dataIndex: 'spaceSavings',
			renderer: Ext.util.Format.numberRenderer('0.00 %'),
			hideable: false,
			draggable: false
		} ],

		listeners: {
			selectionchange: function(model, records) {
				var record = records[0];
				var chart = this.up('panel').down('cartesian');
				var series = chart.getSeries()[0];
				var store = series.getStore();
				series.setHighlightItem(series.getItemByIndex(store.indexOf(record)));
				chart.redraw();
			}
		}

	} ]

});
