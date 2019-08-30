Ext.define('Df.store.AddressBaseStore', {
	extend: 'Ext.data.Store',
	requires: [ 'Df.model.Address' ],
	model: 'Df.model.Address',
	autoLoad: false,
	pageSize: 0,
	remoteSort: false,
	remoteFilter: false,
	autoSync: false
});