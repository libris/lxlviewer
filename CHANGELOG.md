# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
