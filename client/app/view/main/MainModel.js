Ext.define('Df.view.main.MainModel', {
	extend: 'Ext.app.ViewModel',

	requires: [ 'Df.store.AddressBaseStore', 
	            'Df.model.AddressWithMapping', 
	            'Df.data.reader.Csv', 
	            'Df.data.reader.Cbor', 
	            'Df.data.reader.Msgpack', 
	            'Df.data.reader.CborArray', 
	            'Df.data.reader.MsgpackArray',
	            'Df.data.reader.Smile',
	            'Df.data.reader.SmileArray', 
	            'Df.data.reader.ProtoBuf',
	            'Df.data.reader.FlatBuffers',
	            'Ext.data.reader.Xml',
	            'Ext.data.reader.Json',
	            'Ext.data.reader.Array',
	            'Ext.data.proxy.Ajax'],

	stores: {
		addressesJSON: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: serverUrl + 'addresses?format=json',
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
				url: serverUrl + 'addressesArray?format=json',
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
				url: serverUrl + 'addresses?format=xml',
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
				url: serverUrl + 'addresses?format=cbor',
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
				url: serverUrl + 'addressesArray?format=cbor',
				reader: {
					xclass: 'Df.data.reader.CborArray'
				}
			}
		},
		addressesSMILE: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: serverUrl + 'addresses?format=smile',
				reader: {
					xclass: 'Df.data.reader.Smile'
				}
			}
		},
		addressesSMILEARRAY: {
			xclass: 'Df.store.AddressBaseStore',
			model: 'Df.model.AddressWithMapping',
			proxy: {
				type: 'ajax',
				binary: true,
				url: serverUrl + 'addressesArray?format=smile',
				reader: {
					xclass: 'Df.data.reader.SmileArray'
				}
			}
		},		
		addressesMSGPACK: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: serverUrl + 'addresses?format=msgpack',
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
				url: serverUrl + 'addressesArray?format=msgpack',
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
				url: serverUrl + 'addresses?format=protobuf',
				reader: {
					xclass: 'Df.data.reader.ProtoBuf'
				}
			}
		},
		addressesFLATBUFFERS: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				binary: true,
				url: serverUrl + 'addresses?format=flatbuffers',
				reader: {
					xclass: 'Df.data.reader.FlatBuffers'
				}
			}
		},		
		addressesCSV: {
			xclass: 'Df.store.AddressBaseStore',
			proxy: {
				type: 'ajax',
				url: serverUrl + 'addresses?format=csv',
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
				uncompressed: 177000,
				compressed: 73427
			}, {
				format: 'CBOR Array',
				uncompressed: 111936,
				compressed: 64230
			}, {
				format: 'SMILE',
				uncompressed: 125740,
				compressed: 68067
			}, {
				format: 'SMILE Array',
				uncompressed: 114672,
				compressed: 64518
			}, {
				format: 'MsgPack',
				uncompressed: 175511,
				compressed: 74224
			}, {
				format: 'MsgPack Array',
				uncompressed: 111448,
				compressed: 64746
			}, {
				format: 'CSV',
				uncompressed: 127124,
				compressed: 62519
			}, {
				format: 'Protocol Buffers',
				uncompressed: 119531,
				compressed: 68833
			}, {
				format: 'FlatBuffers',
				uncompressed: 160964,
				compressed: 80948
			} ]
		}
	}
});
