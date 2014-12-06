Ext.define('DF.Application', {
	extend: 'Ext.app.Application',
	requires: [ 'DF.data.reader.Cbor', 'DF.data.reader.Msgpack',
			'DF.data.reader.CborArray', 'DF.data.reader.MsgpackArray' ],
	name: 'DF',

	launch: function() {
		Ext.fly('appLoadingIndicator').destroy();
	}
});
