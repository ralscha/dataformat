Ext.define('Df.view.main.Main', {
	extend: 'Ext.tab.Panel',

    requires: [
        'Df.view.main.AddressGrid',
        'Df.view.main.MainController',
        'Df.view.main.MainModel',
        'Df.view.main.ResultPanel'
    ],

    controller: {
		xclass: 'Df.view.main.MainController'
	},

	viewModel: {
		xclass: 'Df.view.main.MainModel'
	},

	listeners: {
		activeitemchange: 'onActiveItemChange'
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
		title: 'SMILE',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesSMILE}'
	}, {
		title: 'SMILE Array',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesSMILEARRAY}'
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
		title: 'FlatBuffers',
		xclass: 'Df.view.main.AddressGrid',
		bind: '{addressesFLATBUFFERS}'
	}, {
		title: 'Result',
		xclass: 'Df.view.main.ResultPanel'
	} ]

});
