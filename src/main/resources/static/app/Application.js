Ext.define('DF.Application', {
	extend: 'Ext.app.Application',
	name: 'DF',

	launch: function() {
		Ext.fly('appLoadingIndicator').destroy();
	}
});
