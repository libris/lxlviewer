# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Input textareas in form autosize to fit content.
- Readability when printing Marc21 preview.

### Added
- Link to release notes in footer

## [1.1.0] - 2018-08-30

### Fixed
- Fixed entity adder modal not correctly resetting previous search.
- Set explicit (0px) left-position for hovering cards (needed for IE11). They should now appear directly below the chip in all browsers.
- Fixed a bug where the user sometimes were not notified about unsaved changes.
- Fixed a bug where the application couldn't find the correct `...byLang` variation of a property.
- Fixed various key shortcut bugs.
- Adjusted various small design elements (such as icons).
- Fixed bug in Internet Explorer which caused modal-searches containing umlauts to fail entirely.

### Added
- Added info on Keyboard shortcuts on some tooltips and menu-items.
- Newly added local entities are now highlighted.
- Added links to "next" and "previous" post in inspector, based on the search list the user came from.
- URI-type fields should now become clickable links in viewing mode if they are hyperlinks.
- Added support for the "compositional" model-category.

### Changed
- Unlocked `technicalNote`-property. It should now be editable.
- Changed how missing information is represented in labels. It should now handle missing literals in a much nicer way.
- Remote databases: Logged in users selected databases are now saved between visits and searches.
- Improved print layout in inspector.
- Improved responsiveness for small and zoomed screens.
- Updated various templates.
- The type selector in search modals has been changed from a dropdown to a combo box solution.
- Field adder modal no longer closes when adding fields with "+"-button, allowing you to add multiple fields before closing the modal.

## [Released]

## [1.0.12] - 2018-07-02

### Changed 
- Updated help documentation.

## [1.0.10] - 2018-06-15

### Changed
- Updated template for `classificationDdc` to include `ind 1` (Full) and `$2` (23/swe).

## [1.0.9] - 2018-06-13

### Fixed
- Fixed incorrect caching of results from the record relation API. This bug caused the holding information to not update correctly in some browsers.
- Fixed `heldBy` property not being present in locally added `Item` entities. This caused `852 #b` to go missing in MARC conversion.

## [1.0.8] - 2018-06-11

### Fixed
- Fixed bug in Firefox where entities couldn't be added.

## [1.0.7] - 2018-06-11
### Fixed
- Update holdings template with correct property for `866#a` in MARC21 exports. Also adding indicators with space to make up for missing handling of not being able to add them from a list and no handling of their default values in conversion.
- "Copy record" will no longer copy the fields `controlNumber` and `descriptionUpgrader` from the original.

## [1.0.6] - 2018-06-08
## [1.0.5] - 2018-06-08
## [1.0.4] - 2018-06-08
## [1.0.3] - 2018-06-08
## [1.0.2] - 2018-06-07
## [1.0.1] - 2018-06-05

### Changed
- Rewrite README file.
- Refactor viewer to a SPA, using VueJS 2 and Webpack 3.
- Refactor components in SPA, now using SUIT CSS naming convention.
- Refactor components in SPA, added ARIA attributes where applicable.
- Refactor components in SPA, add HTML5 semantics.
