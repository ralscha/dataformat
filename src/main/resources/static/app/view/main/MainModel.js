Ext.define('DF.view.main.MainModel', {
	extend: 'Ext.app.ViewModel',
	requires: [ 'DF.view.main.AddressBaseStore', 'DF.model.AddressWithMapping' ],

	stores: {
		addressesJSON: {
			xclass: 'DF.view.main.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: 'addresses.json',
				reader: {
					type: 'json'
				}
			}
		},
		addressesJSONARRAY: {
			xclass: 'DF.view.main.AddressBaseStore',
			model: 'DF.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				url: 'addressesArray.json',
				reader: {
					type: 'array'
				}
			}
		},
		addressesXML: {
			xclass: 'DF.view.main.AddressBaseStore',
			autoLoad: true,
			proxy: {
				type: 'ajax',
				url: 'addresses.xml',
				reader: {
					type: 'xml',
					record: 'address',
					rootProperty: 'addresses'
				}
			}
		},
		addressesCBOR: {
			xclass: 'DF.view.main.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addresses.cbor',
				reader: {
					xclass: 'DF.data.reader.Cbor'
				}
			}
		},
		addressesCBORARRAY: {
			xclass: 'DF.view.main.AddressBaseStore',
			model: 'DF.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addressesArray.cbor',
				reader: {
					xclass: 'DF.data.reader.CborArray'
				}
			}
		},
		addressesMSGPACK: {
			xclass: 'DF.view.main.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addresses.msgpack',
				reader: {
					xclass: 'DF.data.reader.Msgpack'
				}
			}
		},
		addressesMSGPACKARRAY: {
			xclass: 'DF.view.main.AddressBaseStore',
			model: 'DF.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addressesArray.msgpack',
				reader: {
					xclass: 'DF.data.reader.MsgpackArray'
				}
			}
		},
		addressesCSV: {
			xclass: 'DF.view.main.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: 'addresses.csv',
				reader: {
					xclass: 'DF.data.reader.Csv'
				}
			}
		},
		results: {
			fields: [ 'format', 'uncompressed', 'compressed', {
				name: 'spaceSavings',
				calculate: function(data) {
					return 100 - (data.compressed * 100 / data.uncompressed);
				}
			}, {
				name: 'uncompressedComparison',
				calculate: function(data) {
					return data.uncompressed / 1114.48;
				}
			}, {
				name: 'compressedComparison',
				calculate: function(data) {
					return data.compressed / 625.19;
				}
			} ],
			data: [ {
				format: 'XML',
				uncompressed: 291940,
				compressed: 75970
			}, {
				format: 'JSON',
				uncompressed: 224798,
				compressed: 72128
			}, {
				format: 'JSON Array',
				uncompressed: 138711,
				compressed: 64007
			}, {
				format: 'CBOR',
				uncompressed: 176999,
				compressed: 73416
			}, {
				format: 'CBOR Array',
				uncompressed: 112935,
				compressed: 64408
			}, {
				format: 'MessagePack',
				uncompressed: 175511,
				compressed: 74224
			}, {
				format: 'MessagePack Array',
				uncompressed: 111448,
				compressed: 64746
			}, {
				format: 'CSV',
				uncompressed: 127124,
				compressed: 62519
			} ]
		}
	}
});