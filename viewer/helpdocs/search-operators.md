---
section: Sök
title: Utforma sökfrågor
tags:
- search
---

# Sökindex

I grunden för Libris XL ligger sökmotorn [elasticsearch](https://www.elastic.co/)

## "Query string syntax"

https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax


## Booleska operatorer

Standard är att sökmotorn ger träff på valfri sökterm så länge en av de matchar. En sökning på `Astrid Lindgren` kommer matcha poster som innehåller antingen (1) `Astrid Lindgren` eller (2) `Astrid` eller (3) `Lindgren`.

De föredragna operatorerna är `+` (termen måste vara inkluderad) och `-` (denna term får ej vara inkluderad) Alla andra termer är valfria.

`quick brown +fox -news`

betyder att:

`fox` måste vara med i träffen
`news` får inte vara med i träffen
`quick` and `brown` är valfria — men ökar relevans

Se även Booleska operatorer i elasticsearch dokumentationssidor

https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_boolean_operators

## Grupperingar

Se även https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_grouping

## Reserverade tecken

Om du behöver använda tecken i din sökfråga som innehåller en operator kan du undanta detta med ett omvänt snedstreck som skiftestecken.
Exempel en sökning på `(1+1)=2`, så behöver sökfrågan utformas `\(1\+1\)\=2`.

Lista på reserverade tecken: 
>`+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`

Om man inte använder skiftestecken i sökfrågan kan det leda till felaktiga söksträngar.
