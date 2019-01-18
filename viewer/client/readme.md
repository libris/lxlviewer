# Static client

This builds the JS and STYLE applied directly on top of the Flask templates when we want to deliver a (mostly) static frontend (like for id.kb.se at the time writing this).

We should aim to keep this as small as possible and with as few dependencies as possible. Currently the only dependencies are Bootstrap 3, jQuery, the kb-styles package and the less package.

The only thing the npm scripts do is handle the packaging of the combined styles and concatenates the vendor js (jQuery and Bootstrap).

## Building the project

Produce everyting you need for deploying:

``npm i`` or ``npm ci`` (on ci machines)

If you are developing, consider running watch instead:

``npm run watch``

## Improvments to be made

Currently there is only 1 use of the Boostrap JS code, and that is the left navigation tabs for the marcframe view. If we could rewrite this code in plain JS we could possibly get rid of both jQuery and the Boostrap JS (keeping the Boostrap styling code).
