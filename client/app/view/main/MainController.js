Ext.define('Df.view.main.MainController', {
	extend: 'Ext.app.ViewController',

	onBeforeTabChange: function(tabPanel, newCard) {
		if (newCard.xclass !== 'Df.view.main.ResultPanel') {
			newCard.getStore().load();
		}
	}
});
