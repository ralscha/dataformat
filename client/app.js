/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'Df.Application',

    name: 'Df',

    requires: [
        // This will automatically load all classes in the Df namespace
        // so that application classes do not need to require each other.
        'Df.*'
    ],

    // The name of the initial view to create.
    mainView: 'Df.view.main.Main'
});
