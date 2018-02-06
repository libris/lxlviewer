---
section: Sök
title: Utforma sökfrågor
order: 1
tags:
- search
---

# Sökindex

I Libris XL används en sökmotor för fulltext och analys.


## Operatorer för frågespråk

   `+` betyder AND  
   `|` betyder OR  
   `-` innebär uteslutning  
   `"` används för frassökning  
   `*` innebär trunkering av en term  

Standardfunktionaliteten i sökmotorn ger träff på sammanslagen sökterm, `+`. En sökning på `Astrid Lindgren` kommer matcha poster innehållandes `Astrid` och `Lindgren`, `Astrid Lindgren`.

De föredragna operatorerna är `+` (termen måste vara inkluderad) och `-` (denna term får ej vara inkluderad) Alla andra termer är valfria.

`quick brown +fox -news`

betyder att:

`fox` måste vara med i träffen
`news` får inte vara med i träffen
`quick` and `brown` är valfria — men ökar relevans

`"quick brown fox"` innebär att hela frasen måste vara med.
