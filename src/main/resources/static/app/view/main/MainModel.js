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
				name: 'compressionSave',
				calculate: function(data) {
					return 100 - (data.compressed * 100 / data.uncompressed);
				}
			} ],
			data: [ {
				format: 'XML',
				uncompressed: 297199,
				compressed: 77144
			}, {
				format: 'JSON',
				uncompressed: 232058,
				compressed: 73376
			}, {
				format: 'JSON Array',
				uncompressed: 145971,
				compressed: 65414
			}, {
				format: 'CBOR',
				uncompressed: 185038,
				compressed: 74489
			}, {
				format: 'CBOR Array',
				uncompressed: 120974,
				compressed: 65462
			}, {
				format: 'MessagePack',
				uncompressed: 183545,
				compressed: 75111
			}, {
				format: 'MessagePack Array',
				uncompressed: 119482,
				compressed: 65851
			}, {
				format: 'CSV',
				uncompressed: 132383,
				compressed: 63709
			} ]
		}
	}
});