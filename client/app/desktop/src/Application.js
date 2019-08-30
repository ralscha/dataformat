Ext.define('Df.Application', {
	extend: 'Ext.app.Application',
	name: 'Df',
	requires: ['Df.*'],

	removeSplash: function () {
		Ext.getBody().removeCls('launching')
		var elem = document.getElementById("splash")
		elem.parentNode.removeChild(elem)
	},

	launch: function () {
		this.removeSplash()
		Ext.Viewport.add([{xclass: 'Df.view.main.Main'}])
	},
	onAppUpdate: function() {
		window.location.reload();
	}
});
