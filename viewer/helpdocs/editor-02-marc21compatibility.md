---
section: Anvisningar
title: Fält för MARC21-kompatibilitet
order: 21
tags:
- editor
---

Fält som av systemtekniska skäl och kompatibilitet med MARC21 är inkluderade i formatet.

## Fileringsvärde

### Antal icke-filerande tecken
Fileringsindikator används i MARC21 för att specificera det antal inledande tecken (0-9 st.) som skall uteslutas vid filering av sökelement och titlar. Indikatorn är definierad som ind. 2 i MARC21 (eller i vissa fall ind. 1).

Fileringsvärde 0 innebär att fileringen skall starta med fältets första alfanumeriska tecken. Observera att fileringsvärde "0" skall användas även i de fall första filerande alfanumeriska tecken endast föregås av klammer, citattecken eller annat specialtecken.

Indikatorvärde 1-9 innebär att fältet inleds med alfanumeriska tecken som skall uteslutas vid filering. Värde skall sättas till det antal tecken som föregår fileringsstart. Typfall utgör inledande bestämda och obestämda artiklar (t.ex. En, A, Le, Les, The, Der). Observera att indikatorvärde skall motsvara samtliga tecken/positioner som föregår fileringsstart; i den bortfilerade delen ingående blank- och specialtecken (t.ex. apostrof, bindestreck) skall således medräknas. Diakrit räknas som eget tecken.

Exempel på fileringsvärden:

0 `Filmen i Sverige`  
2 `L'homme dans la paysage`  
3 `En historisk sommar`  
4 `Hē ekklēsia tēs "Palatianēs" chōras Androu`  

Se även [formathandboken](http://www.kb.se/katalogisering/Formathandboken/Fileringsindikator/)
