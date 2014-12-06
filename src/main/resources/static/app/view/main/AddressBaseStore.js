Ext.define('DF.view.main.AddressBaseStore', {
	extend: 'Ext.data.Store',
	requires: [ 'DF.model.Address' ],
	model: 'DF.model.Address',
	autoLoad: false,
	pageSize: 0,
	remoteSort: false,
	remoteFilter: false,
	autoSync: false
});