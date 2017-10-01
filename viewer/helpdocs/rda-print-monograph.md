---
section: Arbetsflöden
title: Tryckta monografier
tags:
- editor
- rda
- workflow
- print-monograph
---

# Tryckta monografier

## Innehåll

**Postetikett och andra kodfält vid MARC 21-katalogisering:**

TODO:administrativ metadata instead?

* 000 Leader/Postetikett
* 008 Mediespecifika koder
* 040 Katalogiserande instans
* 041 Språkkod

**Element tillhörande manifestationen:**

* Föredragen källa för beskrivningen
* Huvudtitel
* Parallell huvudtitel
* Övrig titelinformation
* Upphovsuppgift
* Upplageuppgift
* Utgivningsuppgifter
* Distributionsuppgifter
* Tillverkningsuppgifter
* Copyrightår
* Serieuppgift
* Identifikator för manifestationen (t.ex. ISBN)
* Anmärkningar om manifestationen
* Medietyp
* Bärartyp
* Omfång
* Mått
* Teckenstorlek (t.ex. stor stil)


**Element tillhörande verk och uttryck:**

* Innehållstyp
* Innehållets karaktär
* Målgrupp
* Akademisk avhandling och dylikt
* Sammanfattning av innehåll
* Innehållets språk
* Typ av notation (t.ex. skriftart)
* Illustrativt innehåll

**Relationer:**

* Ämnesord och klassifikation
* Sökingångar för personer, familjer/släkter, institutioner
* Sökingångar för verk och uttryck
* Relaterade verk, uttryck m.m.




exempeltext:

## Föredragen källa (RDA 2.2)
Börja med den information som finns på titelsidan (RDA 2.1.2.2 och RDA 2.2.2.2).

Uppgifter som saknas på titelsidan hämtas i första hand från valfri källa inom resursen. Det finns ingen prioriteringsordning bland övriga källor inom resursen.

Uppgifter från copyright: Det är endast uppgift om copyrightår som kan hämtas från copyrightuppgiften. När andra uppgifter som ska anges i beskrivningen endast finns i copyrightuppgiften (till exempel uppgift om upphov, utgivare eller utgivningsort) kan uppgiften tas därifrån om den bedöms rimlig och avser manifestationen. Uppgiften måste då anges inom klammer.

För samlingsverk som saknar gemensam titelsida behandlas de ingående verkens titelsidor som en gemensam titelsida för manifestationen (RDA 2.1.2.2).

Om det finns flera titelsidor eller olika källor med olika datum, använd i första hand den information som finns i källan med det senaste datumet (RDA 2.2.3.2).

Om resursen saknar titelsida eller annan källa med information som är nödvändig för att identifiera resursen, använd information som finns på (i denna ordning): medföljande material som inte är en del av resursen själv, annan publicerad beskrivning av resursen, en förpackning, annan tillgänglig källa. Klamra information som hämtats utanför resursen (RDA 2.2.4).
