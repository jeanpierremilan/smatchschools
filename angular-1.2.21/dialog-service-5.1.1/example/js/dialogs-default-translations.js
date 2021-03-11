/**
 * Dialog Default Translations.
 *
 * Include this module if you're not already using angular-translate in your application, and
 * add it to your application module's dependency list in order to get default header and 
 * dialog messages to appear.
 * 
 * Ex: var myApp = angular.module('myApplication',['dialogs.main','dialogs.default-translations']);
 *
 * It was necessary to separate this out for those already using angular-translate because this would
 * automatically reset their translation list for 'en-US'
 *
 * For those already using angular-translate, just copy the list of DIALOG_[..] translations to your
 * translation list where you set 'en-US' using the $translateProvider.
 */

//== Translations =============================================================//

 angular.module('dialogs.default-translations',['pascalprecht.translate'])
 /**
     * Default translations in English.
     * 
     * Use angular-translate's $translateProvider to provide translations in an
     * alternate language.
     *
     * $translateProvider.translations('[lang]',{[translations]});
     * To use alternate translations set the preferred language to your desired
     * language.
     * $translateProvider.preferredLanguage('[lang]');
     */
    .config(['$translateProvider',function($translateProvider){
        $translateProvider.translations('en-US',{
            DIALOGS_ERROR: "Errore",
            DIALOGS_ERROR_MSG: "Ops qualcosa non va. Si prega di riprovare.",
            DIALOGS_CLOSE: "Chiudi",
            DIALOGS_PLEASE_WAIT: "Attendere prego",
            DIALOGS_PLEASE_WAIT_ELIPS: "Attendere prego...",
            DIALOGS_PLEASE_WAIT_MSG: "Attendere un momento per favore.",
            DIALOGS_PERCENT_COMPLETE: "% Completata",
            DIALOGS_NOTIFICATION: "Notifica",
            DIALOGS_NOTIFICATION_MSG: "Notifica sconosciuta.",
            DIALOGS_CONFIRMATION: "Conferma",
            DIALOGS_CONFIRMATION_MSG: "Si prega di confermare.",
            DIALOGS_OK: "OK",
            DIALOGS_YES: "Si",
            DIALOGS_NO: "No"
        });

        $translateProvider.preferredLanguage('en-US');
    }]); // end config