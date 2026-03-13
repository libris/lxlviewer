---
title: 'en'
---

# Search in Libris

Use the search box to search! Enter your query as free text, or use the filters suggested in the search box.
Click the examples further down on this page to see how filters and search operators can be used in practice.

## Filters

A search can be narrowed down by adding different search filters.
The easiest way is to choose from the suggestions that appear when the search box is active, or from the list in the left panel.
Filters can also be added manually by typing one of the allowed [keywords](/help/filters) followed by a colon (`:`).
Examples of keywords include `Author/Contributor`, `Title`, `Language` etc.

In the filter you then choose a value from the suggestions, such as a specific author, book title, or language.
It is also possible to enter the filter value as free text.

## Phrase search

If you want to search more precisely, you can put quotation marks (`""`) around the search phrase.
A search query without quotation marks matches more documents, since variations of the search phrase are also included
(so-called soft matching).

- Example: [`"Désert"`](/find?_q="Désert") (French for desert) between quotation marks excludes results for the English word `Desert`.
- Example: [`"Gift"`](/find?_q="Gift") returns results that include Tove Ditlevsen's novel _Gift_ but not August Strindberg's _Giftas_.
- Example: [`"His dark materials"`](/find?_q="His+dark+materials") returns only results containing that specific word order (in this case the title of a TV series).

## Truncation

Use an asterisk (`*`) to include multiple endings of a search term.

- Example: [`kulturarv*`](/find?_q=kulturarv*) returns results containing the words kulturarv, kulturarvet, and kulturarvsinstitutioner.

## Wildcards

To search for words with variable spelling, you can use a question mark (`?`) as a wildcard.

- Example: [`organi?ation`](/find?_q=organi?ation) returns results for both organisation and organization (British and American spelling).

Masking the final letter of a word is achieved with `\?`.

## Operators

Search filters and words or phrases in free text can be combined with the operators `AND`,`OR` and `NOT`.
Operators must be written in uppercase. If no operator is specified between words or filters, an implicit `AND` is applied.

You can also use the Swedish equivalents `OCH`,`ELLER` and `INTE`.

### NOT -- exclude search terms or filters

With `NOT` you can exclude search terms, filters, or phrases from the result set.

- Exempel: [Search for Astrid Lindgren but exclude results about Pippi Longstocking.](/find?_q=contributor:"libris:fcrtpljz1qp2bdv%23it"+NOT+"Pippi+långstrump")

![NOT](/docs/img/NOT.png)

### OR -- broaden the search

Add `OR` between search terms or filters to get more results. The results will then contain one or more of the specified search terms.

- Example: [Search for poetry in Meänkieli or Finnish.](</find?_q=(Språk:"lang:9mk"+OR+Språk:"lang:fin")+Kategori:"saogf:Poesi">)

![OR](/docs/img/OR.png)

### AND -- all search terms or filters must be included

`AND` rarely needs to be written explicitly; it is applied automatically if no other operator is specified.

![AND](/docs/img/AND.png)

## Grouping

Use parentheses `()` to construct more complex search queries that combine operators, search filters, and search phrases.

- Example: [Search for novels or short stories about love or friendship.](</find?_q=(Kategori:"saogf:Noveller"+OR+Kategori:"saogf:Romaner")+(subject:"sao:K%25C3%25A4rlek"+OR+subject:"sao:V%25C3%25A4nskap")>)

## Relevance and ranking of search results

Search results are automatically ranked according to certain criteria.
For example, results where the search phrase appears in the title or in the contributor names (authors, illustrators, translators, etc.) will appear higher in the results list.

## Search APIs

See our [API-documentation](https://libris.kb.se/api/docs/) for information about more specialized search. Here you can also read about how to make requests to create integrations with other systems.
