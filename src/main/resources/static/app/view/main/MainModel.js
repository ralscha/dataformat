Ext.define('DF.view.main.MainModel', {
	extend: 'Ext.app.ViewModel',
	requires: ['DF.view.main.AddressBaseStore', 'DF.model.AddressWithMapping'],

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
			 fields: ['format', 'uncompressed', 'compressed', {
				 name: 'compressionSave',
			     calculate: function (data) {
			         return 100 - (data.compressed * 100 / data.uncompressed);
			     }
			 } ],
	            data: [
	                { format: 'XML', uncompressed: 297696, compressed: 77689 },
	                { format: 'JSON', uncompressed: 232557, compressed: 73923 },
	                { format: 'JSON Array', uncompressed: 146475, compressed: 65966 },
	                { format: 'CBOR', uncompressed: 185537, compressed: 75035 },
	                { format: 'CBOR Array', uncompressed: 121478, compressed: 66013 },
	                { format: 'MessagePack', uncompressed: 184052, compressed: 75666 },
	                { format: 'MessagePack Array', uncompressed: 119994, compressed: 66411 },
	                { format: 'CSV', uncompressed: 132873, compressed: 64246 }
	            ]
		}
	}
});