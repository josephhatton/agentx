Modustri Web Portal Documentation 1.0
=====================================

App Summary
-----------

The Modustri Web portal is a client-side web app written in Javascript using the AngularJS (v1.2) framework.
It communicates with a seperate API to handle CRUD operations on data for heavy-duty construction machinery.
Its compatibility target is IE 10+ and all 'evergreen' browsers. Javascript libraries are managed by Bower and
the build script uses Gulp.js.

Structure
---------

The file structure is built around MVC, as opposed to individual features or functionality.

    /bower_components/
    /images/
    /scripts/
        /controllers/
        /services/
        /ui/
    /styles/
    /views/

    index.html


###Bower Components

Most Javascript components for the portal are managed through Bower and are placed in this folder. The few that are not are manually placed in
the lib folder.

###Images

Static UI images and SVGs are kept here.

###Controlers

For most templates, edit and view share the same controller. An add view has its own controller, the major exception being inspections.

###Services

Most services are for getting data to and from the API. Additional services provide authentication checking and various utilities.

###UI

JS files that alter the UI but are too simple to be implemented as custom directives are placed here.
Each JS file is included at the bottom of the template that uses it, and not in index.html.

###Styles

All css files are kept here. Zurb Foundation is used.

###Views

###Root

Directives
----------

Angular directives provide custom DOM elements while keeping presentational code
out of controllers. These custom directives provide:

- Pagination across different views.
- Implement autocomplete search boxes and form fields with jQuery UI.
- Image uploading via the FileReader API.
- Drop-in Google Maps for inspection locations.
- Conversion of measurement values to metric

Dashboard
---------

Reports
-------

Notes on Data Structures
------------------------

Each __component object__ contains its own wear tables.

__Customer objects__ do not contain emails - they link to contact records via __primary_contact_id__. If you update a customer object,
you'll need to update the contact record as well.

If you are entering a __new inspection__, or you are __editing the latest inspection__ for a particular machine, the
corresponding machine record needs to be updated as well to account for any changes to the __hour meter reading__.

__New inspection dates__ are defaulted to current date.

__Unit numbers__ and __UC numbers__ are only alphanumeric, no symbols, underscore excepted.

In a new inspection everything defaults to __unknown component__ type (these don't have wear values).

__Filters__, since there are only a few of them, are bundled in __setup.js__.

Authentication
--------------

All data is sent through TSL. When logging in, authorization services initialy sends the username and password to the server (the password is sent once
and only once). The API approves or denies the credentials. If approved, the API returns a salt for the particular user. The portal
generates a hash based upon the user's name, password, salt, andcurrent time within +1 and -1 hours. On each API call thereafter, the user's ID and hash
is sent along with the request. The API generates a hash based on the same credentials, and it matches what was sent, the request is fulfilled.

Password Services
-----------------

todo

Emitted Events
--------------

Using the pub/sub pattern the following events are fired when various things happen in the application:

- inspection_loaded
- inspection_saved
- inspection_deleted
- components_loaded
- summaries_table_built
- inspector_list_loaded
- user_logged_in
- machine_saved

These events can be used to add functionality while preserving loose coupling of components.

3rd Party Dependencies
----------------------

In addition to Angular and its associated components, the web portal has these dependencies:

- jQuery
- jQuery UI
- CryptoJS
- ES6 Shim [https://github.com/paulmillr/es6-shim/]
- jQuery Formalize
- Underscore.js
- Moment.js
- Twix.js
- Bootstrap
- Zurb Foundation
- Highcharts

Major Development dependencies (see package.json for more):

- Gulp.js
- Browserify
- Bower
- Sass

Quirks and Oddities
-------------------

The __calendar widget__ that uses jQuery UI returns a timestamp set at 5am by default, that needs to be adjusted
to account for the full day.

When __measurement values__ are out of range of what is listed in the wear tables, the values 'hi' or 'lo' are returned.

The _Mac Datepicker_ directive needs to tie into a model in a controller that saves the date
values to localStorage. The directive itself will not cache the values.