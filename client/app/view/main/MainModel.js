Ext.define('Df.view.main.MainModel', {
	extend: 'Ext.app.ViewModel',

	requires: [ 'Df.store.AddressBaseStore', 
	            'Df.model.AddressWithMapping', 
	            'Df.data.reader.Csv', 
	            'Df.data.reader.Cbor', 
	            'Df.data.reader.Msgpack', 
	            'Df.data.reader.CborArray', 
	            'Df.data.reader.MsgpackArray', 
	            'Df.data.reader.ProtoBuf',
	            'Ext.data.reader.Xml',
	            'Ext.data.reader.Json',
	            'Ext.data.reader.Array',
	            'Ext.data.proxy.Ajax'],

	stores: {
		addressesJSON: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: 'addresses.json',
				reader: {
					type: 'json'
				}
			}
		},
		addressesJSONARRAY: {
			xclass: 'Df.store.AddressBaseStore',
			model: 'Df.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				url: 'addressesArray.json',
				reader: {
					type: 'array'
				}
			}
		},
		addressesXML: {
			xclass: 'Df.store.AddressBaseStore',
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
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addresses.cbor',
				reader: {
					xclass: 'Df.data.reader.Cbor'
				}
			}
		},
		addressesCBORARRAY: {
			xclass: 'Df.store.AddressBaseStore',
			model: 'Df.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addressesArray.cbor',
				reader: {
					xclass: 'Df.data.reader.CborArray'
				}
			}
		},
		addressesMSGPACK: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addresses.msgpack',
				reader: {
					xclass: 'Df.data.reader.Msgpack'
				}
			}
		},
		addressesMSGPACKARRAY: {
			xclass: 'Df.store.AddressBaseStore',
			model: 'Df.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addressesArray.msgpack',
				reader: {
					xclass: 'Df.data.reader.MsgpackArray'
				}
			}
		},
		addressesPROTO: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: 'addresses.protobuf',
				reader: {
					xclass: 'Df.data.reader.ProtoBuf'
				}
			}
		},
		addressesCSV: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: 'addresses.csv',
				reader: {
					xclass: 'Df.data.reader.Csv'
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
				uncompressed: 292111,
				compressed: 76074
			}, {
				format: 'JSON',
				uncompressed: 224969,
				compressed: 72193
			}, {
				format: 'JSON Array',
				uncompressed: 138882,
				compressed: 64059
			}, {
				format: 'CBOR',
				uncompressed: 177173,
				compressed: 73484
			}, {
				format: 'CBOR Array',
				uncompressed: 113109,
				compressed: 64463
			}, {
				format: 'MsgPack',
				uncompressed: 175696,
				compressed: 74301
			}, {
				format: 'MsgPack Array',
				uncompressed: 111633,
				compressed: 64804
			}, {
				format: 'CSV',
				uncompressed: 127297,
				compressed: 62565
			}, {
				format: 'Protocol Buffers',
				uncompressed: 119705,
				compressed: 68910
			} ]
		}
	}
});
