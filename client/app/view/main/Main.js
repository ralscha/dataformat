Ext.define('Df.view.main.Main', {
	extend: 'Ext.tab.Panel',

	requires: [ 'Df.view.main.MainController', 'Df.view.main.MainModel' ],

	controller: {
		xclass: 'Df.view.main.MainController'
	},

	viewModel: {
		xclass: 'Df.view.main.MainModel'
	},

	listeners: {
		beforetabchange: 'onBeforeTabChange'
	},

	items: [ {
		title: 'XML',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesXML}'
	}, {
		title: 'JSON',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesJSON}'
	}, {
		title: 'JSON Array',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesJSONARRAY}'
	}, {
		title: 'CBOR',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesCBOR}'
	}, {
		title: 'CBOR Array',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesCBORARRAY}'
	}, {
		title: 'MessagePack',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesMSGPACK}'
	}, {
		title: 'MessagePack Array',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesMSGPACKARRAY}'
	}, {
		title: 'CSV',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesCSV}'
	}, {
		title: 'Protocol Buffers',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesPROTO}'
	}, {
		title: 'Result',
		xclass: 'Df.view.main.ResultPanel'
	} ]

});
