Ext.define('Df.Application', {
	extend: 'Ext.app.Application',

	name: 'Df',

	onAppUpdate: function() {
		window.location.reload();
	}
});
