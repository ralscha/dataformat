Ext.define('Df.view.main.MainController', {
	extend: 'Ext.app.ViewController',

	onActiveItemChange: function(tabPanel, newCard) {
		if (newCard.xclass !== 'Df.view.main.ResultPanel') {
			newCard.getStore().load();
		}
	}
});
