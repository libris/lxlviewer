---
section: Sök
title: Utforma sökfrågor
tags:
- search
---

# Sökindex

I Libris XL används [elasticsearch](https://www.elastic.co/), en sökmotor för fulltext och analys.


## Operatorer för frågespråk

`+` betyder AND  
`|` betyder OR  
`-` innebär uteslutning  
`"` används för frassökning  
`*` innebär trunkering av en term  


Standardfunktionalitet är att sökmotorn ger träff på valfri sökterm med en `|` . En sökning på `Astrid Lindgren` kommer matcha poster som innehåller antingen (1) `Astrid` eller (2) `Lindgren`, ger även träff på (3) `Astrid Lindgren`.

De föredragna operatorerna är `+` (termen måste vara inkluderad) och `-` (denna term får ej vara inkluderad) Alla andra termer är valfria.

`quick brown +fox -news`

betyder att:

`fox` måste vara med i träffen
`news` får inte vara med i träffen
`quick` and `brown` är valfria — men ökar relevans

`"quick brown fox"` innebär att hela frasen måste vara med.
