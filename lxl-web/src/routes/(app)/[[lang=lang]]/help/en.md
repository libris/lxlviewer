---
title: 'Help'
---

# Help

<i>WARNING: Automated machine translation</i>

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
