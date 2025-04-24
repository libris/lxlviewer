---
title: 'Help'
---

# Help

## Version Information

Here we will continuously provide information about newly added features and planned developments:

### 2025-04-24

- Ability to set and filter on favourite libraries

### 2025-03-11

- Add advanced search functionality

### 2024-11-07

- Cookie settings

### 2024-10-14

- Improvements in the filter panel, filter items can now be sorted by preference.
- Bug fixes

### 2024-09-09

- Loan status information now shown in the library holdings list
- Library list now contains more detailed information and search functionality
- Spelling suggestions next to search result
- Access and usage policy for cover images
- Loading indicator
- Bug fixes

### 2024-06-27

- Changed default number of hits per page to 20
- Added search on result list for people and subjects
- Hide labels for free text queries and add quotes instead
- Bug fixes

### 2024-06-12

- Improved help text
- Selectable text in search results
- Improved pagination

### 2024-05-29

- Standard free text search
- Filters to narrow down search results
- Result list with pagination and sorting options
- Pages for detailed information about materials, including which libraries hold them
- Pages for persons and subject terms listing related materials
- Boolean search logic in the search box. Example: pippi SPRÅK:"lang" hasInstanceType itemHeldBy:"sigel S"
- Basic search filtering that excludes upcoming titles (preliminary information) or electronically deposited resources, with the option to manually deactivate.

### Features to look forward to:

- Improved layout and information content in the search result list
- Adjustments to the selection and presentation of information on detailed pages
- Support in the interface for advanced search functionality
- Enhanced connection to local library systems regarding loan status and links
- Improved material categorization (types) such as book, e-book, poster, newspaper, and so on
- Improved relevance ranking of search results
- Filtering for freely available material
- Libris interlibrary loan
- Libris borrower requests
- Lopac - Libris as a local library catalog
- Reference tools
- Ability to save searches and lists of materials
- Ability to export result lists
- Ability to set favourite libraries, etc
- In addition to planned developments, improvements to current functionality will be made, and possibly new features will be added based on feedback from you, our users

## Help and information

### General information about the search service

The new Libris search service will eventually replace [libris.kb.se](https://www.libris.kb.se/). The old service is technically outdated and needs to be replaced to meet the legal requirements for accessibility in digital public services. This beta version is a first step towards a service that will bring several improvements for users.

A cornerstone of Libris is the information model based on linked data used to describe the material in the catalog. The new service is built with a more direct connection to this model, making it both simpler and technically more robust. This also means that changes made using the Libris cataloging tool are reflected in the search service without delay.

The goal is also to build a more user-friendly interface while improving and expanding many of the existing features. With a more data-oriented design, some text may initially appear more technical than before. This is something we will continue to work on to improve. The design and graphical expression of the service will also change and improve over time.

### Improved material categorization:

The material categories (or "types") visible in the current beta version will eventually be replaced if they are not clear enough. Terms like "Text, print", "Instance", "Monographic resource", and so on will be replaced with clearer terms such as "Journal", "Audiobook", "Poster", and "Postcard". The goal is understandable and usable types that will stand the test of time.

In today’s libris.kb.se, labels like “book”, “e-book”, and “poster” are calculated in the search service in a complicated way, based on a multitude of data points. This unnecessary complexity is partly due to the limitations that existed in the catalog when the service was developed. Alongside the development of the new search service, we are now working to improve the catalog's data and information model. Because the new search service more directly reflects the catalog, improvements will be visible as soon as they are made.

Different terms and degrees of precision may still be needed in different contexts. However, these differences can largely be captured in the common catalog model instead of being tightly bound to different services, as they are today.

### Using the search function

A lot of material can be found with a simple free-text search in the search box. The results can be sorted according to the categories available in the drop-down menu on the right side of the page. In addition to regular free-text search, there is also the option to construct more advanced search queries containing filters and search operators. One way to explore more complex search queries is to click on the filters in the left column. Active filters are displayed directly under the search box. The entire search query also has a text representation that can be freely edited by clicking the Edit button.

The filters in the left column are:

<b>Type</b> - material type<br>
<b>Format</b> - type for storage or playback/display<br>
<b>Genre/form</b> - description of what the object is<br>
<b>Language</b> - the language used in the object<br>
<b>Publication year</b> - the year the object was published<br>
<b>Library</b> - libraries that have the object in their collections<br>
<b>Bibliography</b> - list of materials within a specific area, such as person, subject, or geographic area<br>
<b>Subject</b> - subject terms describing the object<br>
<b>Contribution</b> - people or organizations that created or contributed to the creation of the object<br>
<b>Target Audience</b> - the intended audience for the object<br>
<b>Other</b> - inclusion of upcoming titles (preliminary information) or electronically delivered resources, and for limiting resources with images

Additional properties that can be filtered are listed at [id.kb.se/vocab](https://id.kb.se/vocab/) (click the Properties button). Some common properties will get simpler labels to make it quick to enter common search queries by hand. Already now, you can use the short form `ÅR` to search for material with a specified publication year or year span. In edit mode, there is also support for the search operators `AND`, `OR`, and `NOT`.

To search for phrases, enclose the search words in quotation marks, for example, "seven seasick sailors". Note that this also needs to be done for titles or search strings containing colons “:” for the time being, as this character is currently interpreted as an operator for directed search.

An asterisk is used for truncation when you want to include more word forms. For example, searching for cultur\* will return hits where the words culture and cultural are included.

#### Example searches

Here are some examples that can be entered as search queries directly in the search box. Click on the different examples to open them in the search service.

English and French works that match the search phrase "Pippi Långstrump” (Pippi Longstocking) published after 2002:

[`pippi långstrump språk:(engelska OR franska) ÅR>2002`](<https://beta.libris-qa.kb.se/find?_i=pippi+l%C3%A5ngstrump&_q=pippi+l%C3%A5ngstrump+SPR%C3%85K:(engelska%20OR%20franska)&_limit=10&_x=advanced>)

Materials published between 2010 and 2024, that are in Swedish and have [dragons](https://id.kb.se/term/sao/Drakar) as a subject:

[`språk:svenska ÅR>2010 ÅR<=2024 ämne:"sao:Drakar"`](https://beta.libris-qa.kb.se/find?_i=&_q=SPR%C3%85K:svenska+%C3%85R%3E2010+%C3%85R%3C%3D2024+subject:%22sao:Drakar%22&_limit=10&_x=advanced)

Free-text search for träd* (tree*), where all results are included in the bibliography Digitaliserat Svenskt Tryck but do not have the work type “Text”:\*

[`träd* bibliografi:"sigel:DST" NOT typ:Text`](https://beta.libris-qa.kb.se/find?_i=tr%C3%A4d*&_q=tr%C3%A4d*+bibliography:%22sigel:DST%22+NOT+%22rdf:type%22:Text&_limit=10&_x=advanced)

Works where Selma Lagerlöf is the author and has at least one edition that is an electronic resource:

[`författare:"selma lagerlöf" "hasInstanceType":Electronic`](https://beta.libris-qa.kb.se/find?_i=&_q=F%C3%96RF:%22selma+lagerl%C3%B6f%22+hasInstanceType:Electronic&_limit=10&_x=advanced)

### Detailed view

Each object in the catalog can be accessed either by clicking on it in the results list or by entering its unique URL in the browser's address bar. Here you will find a more detailed description of the object along with information related to it.

If the material is published in several editions, these are shown in a list sorted by publication date. By clicking the arrow for each edition, more detailed information about it is displayed, as well as the libraries that have that specific edition.

In some cases, the detail view contains one or more links to access the material online. Some material is freely available to everyone, while others require you to be a borrower at a library that has a license to display the material.

<i>Translation done with the help of ChatGPT.</i>
