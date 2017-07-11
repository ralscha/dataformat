Ext.define('Df.Application', {
	extend: 'Ext.app.Application',

	name: 'Df',

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true
        }
    },

	onAppUpdate: function() {
		window.location.reload();
	}
});
