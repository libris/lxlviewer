# JSON Resources

This folder contains JSON resources for different purposes.

## baseTemplates

Warning, not curated at this time and usage unclear.

## combinedTemplates

Templates for different cataloging profiles based on three categories:

- instance
- agent
- concept

They are all formatted in the same way with each template being assigned the following:

`"label": "name used in gui",`

`"description": "description used in gui"`

`"value": "{<JSON-LD code for the template>}",`

if the following status flag is set a template in progress will be ignored in both create view and embellish:

`"status": "draft"` 

## copy

## display

Mock file of display resource.

Master file available at [definitions](https://github.com/libris/definitions/blob/master/source/vocab/display.jsonld)

Provides four levels of order and presentation. Can (and probably should in most cases) extend each other.

`Token`  Small representation of an an entity usually inScheme for inclusion in chips/cards.

`Chips`  Properties used for identification of an entity.

`Card` Provides more extended information for presentation in a hitlist or hovering for example.

`Full` Provides sorting order in full record view.


## displayGroups

Determines what template slot different properties go into.

## help

Mock file of help resource.

## i18n

Translations

## keybindings

## propertymappings

## serviceWidgetSettings

## structuredValueTemplates

Snippets for structured values like different Titles, Identifiers and ProvisionActivities. Also fallback for providing unlinked entites with a common shape. 

For now it can only be set once per Class and not being aware of context is a limitation which need to be factored in the design. For example a Work entity can look very different depending on where it is added, so choose wisely!