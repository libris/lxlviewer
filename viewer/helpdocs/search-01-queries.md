---
section: Sök
title: Utforma sökfrågor
tags:
- search
---

# Sökindex

I Libris XL används [elasticsearch](https://www.elastic.co/), en sökmotor för fulltext och analys.

Vi frågespråket som de kallar Simple Query String Syntax och är en teckenvariant av boolska operatorer och andra tecken för att specificera sin sökfråga.


## Operatorer för frågespråk

`+` betyder AND
`|` betyder OR
`-` innebär uteslutning
`"` wraps a number of tokens to signify a phrase for searching
`*` at the end of a term signifies a prefix query
`( word )` signify precedence


Standard är att sökmotorn ger träff på valfri sökterm så länge en av de matchar. En sökning på `Astrid Lindgren` kommer matcha poster som innehåller antingen (1) `Astrid Lindgren` eller (2) `Astrid` eller (3) `Lindgren`.

De föredragna operatorerna är `+` (termen måste vara inkluderad) och `-` (denna term får ej vara inkluderad) Alla andra termer är valfria.

`quick brown +fox -news`

betyder att:

`fox` måste vara med i träffen
`news` får inte vara med i träffen
`quick` and `brown` är valfria — men ökar relevans

Se även Booleska operatorer i elasticsearch dokumentationssidor

https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_boolean_operators


## Reserverade tecken

Om du behöver använda tecken i din sökfråga som innehåller en operator kan du undanta detta med ett omvänt snedstreck som skiftestecken.

Exempel en sökning på `(1+1)=2`, så behöver sökfrågan utformas `\(1\+1\)\=2`.

Lista på reserverade tecken: 
>`+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`

Om man inte använder skiftestecken i sökfrågan kan det leda till felaktiga söksträngar.
