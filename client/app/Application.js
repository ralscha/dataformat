Ext.define('Df.Application', {
	extend: 'Ext.app.Application',

	name: 'Df',

	launch: function() {
		Ext.fly('loading_container').destroy();
	},

	onAppUpdate: function() {
		window.location.reload();
	}
});
