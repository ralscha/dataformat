Ext.define('DF.view.main.ResultPanel', {
	extend: 'Ext.panel.Panel',
	layout: 'hbox',

	items: [{
		flex: 1,
		xtype: 'cartesian',
        width: '100%',
        height: '100%',
		bind: {
			store: '{results}'
		},
	
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
			grid: true,
			fields: [ 'uncompressed' ],
			renderer: Ext.util.Format.numberRenderer('0,000'),
			minimum: 0
		}, {
			type: 'category',
			position: 'bottom',
			grid: true,
			fields: [ 'format' ],
			label: {
				rotate: {
					degrees: -45
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
				renderer: function(storeItem, item) {
					var c = item.series.getTitle()[Ext.Array.indexOf(item.series
							.getYField(), item.field)];
					this.setHtml(c
							+ ': '
							+ Ext.util.Format.number(storeItem.get(item.field),
									'0,000') + ' bytes');
				}
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
			text: 'Compressed',
			dataIndex: 'compressed',
			width: 130,
			renderer: Ext.util.Format.numberRenderer('0,000'),
			hideable: false,
			draggable: false
		}, {
			text: 'Save',
			dataIndex: 'compressionSave',
			renderer: Ext.util.Format.numberRenderer('0.00 %'),
			hideable: false,
			draggable: false
		}],
		
		 listeners: {
             selectionchange: function(model, records) {
                 var record = records[0];
                 var chart = this.up('panel').down('cartesian');
                 var serie = chart.series[0];
                 var store = serie.getStore();
                 
                 chart.setHighlightItem(serie.getItemByIndex(store.indexOf(record)));
             }
         }
		
	} ]

});
