---
section: Arbetsflöden
title: Tryckta monografier
order: 30
tags:
- editor
- rda
- workflow
- print-monograph
---

# Tryckt monografi RDA

[Extern länk till MARC21-anpassad information](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Tryckta-monografier/)

**OBS! Detta arbetsflöde är under arbete**

**Element tillhörande instans/manifestation:**

* Föredragen källa för beskrivningen


* Utgivningssätt
* Har titel
  * Titel
  * Parallelltitel
* Identifikator
  * ISBN
* Upphovsuppgift
* Upplageuppgift
* Utgivning
* Utgivningsland
* Distribution
* Tillverkning
* Copyrightår
* Medietyp
* Bärartyp
* Omfång
* Har mått
* Serieuppgift
* Har serie
* Anmärkning
* Teckengrad

(Datum från 008 återstår)

**Element tillhörande verk/uttryck**

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

---

## Föredragen källa

Börja med den information som finns på titelsidan (RDA 2.1.2.2 och RDA 2.2.2.2).

Uppgifter som saknas på titelsidan hämtas i första hand från valfri källa inom resursen. Det finns ingen prioriteringsordning bland övriga källor inom resursen.

Uppgifter från copyright: Det är endast uppgift om copyrightår som kan hämtas från copyrightuppgiften. När andra uppgifter som ska anges i beskrivningen endast finns i copyrightuppgiften (till exempel uppgift om upphov, utgivare eller utgivningsort) kan uppgiften tas därifrån om den bedöms rimlig och avser manifestationen. Uppgiften måste då anges inom klammer.

För samlingsverk som saknar gemensam titelsida behandlas de ingående verkens titelsidor som en gemensam titelsida för manifestationen (RDA 2.1.2.2).

Om det finns flera titelsidor eller olika källor med olika datum, använd i första hand den information som finns i källan med det senaste datumet (RDA 2.2.3.2).

Om resursen saknar titelsida eller annan källa med information som är nödvändig för att identifiera resursen, använd information som finns på (i denna ordning): medföljande material som inte är en del av resursen själv, annan publicerad beskrivning av resursen, en förpackning, annan tillgänglig källa. Klamra information som hämtats utanför resursen (RDA 2.2.4).

Se RDA 2.2

## Utgivningssätt

Ange utgivningssätt för den beskrivna resursen. Elementet reflekterar om en resurs är utgiven i en eller flera delar, på vilket sätt den uppdateras, och dess tänkta avslutning. Tidigare kallad bibliografisk nivå.

Se RDA 2.13

## Titel

**OBS! Detta arbetsflöde är under arbete**

## Upphovsuppgift

Upphovsuppgift som hänför sig till huvudtiteln är ett kärnelement och anges i detta fält. Om det finns mer än en, är endast den första ett kärnelement.

Hämta upphovsuppgift som hänför sig till huvudtiteln från följande källor (i denna ordning): 

1. samma källa som huvudtiteln
2. en annan källa inom resursen
3. en annan av de källor som specificeras i RDA 2.2.4. 

Endast upphovsuppgifter som hämtas från en källa utanför resursen ska klamras.

Återge upphovsuppgiften som den förekommer i källan, RDA 2.4.1.4.
I RDA 2.4.1.4 finns en valfri uteslutning som gör det möjligt att förkorta omfångsrika upphovsuppgifter men bara om det kan göras utan att värdefull information förloras. Librispraxis är att generellt inte förkorta upphovsuppgifter.


`Kiki Lundberg och Carina Trägårdh Tornhill ; faktagranskare: Eva Skoog, leg. dietist, Lisa Lundmark, leg. dietist och Elisabeth Nilsson, leg. sjuksköterska ; fotografi: Helén Sahlstrand, Härlig hälsa, Istock, Shutterstock`

Se RDA 2.4

### Upphovsuppgift med mer än en namngiven agent

Återge varje enskild upphovsuppgift som ett element oavsett om två eller flera personer etc. som omnämns har samma eller olika funktioner, RDA 2.4.1.5.

`Helena Rosén Andersson, Eva-Maj Mühlenbock, Henrik Willquist, Natalie Svensson`

**Valfri uteslutning:** Om en enskild upphovsuppgift namnger fler än tre personer, familjer/släkter eller institutioner, uteslut alla utom den första personen etc. Uteslutningen markeras med en klamrad summering av vad som uteslutits.

`Helena Rosén Andersson [och tre andra]`

Librispraxis: Katalogisatören avgör om den valfria uteslutningen ska tillämpas.
NB-praxis: Generellt, tillämpa inte den valfria uteslutningen.

När kunskap finns, ska summeringen vara på resursens språk.

`Knut Sydsæter [and three others]`

**OBS! Detta arbetsflöde är under arbete**

## Identifikator

Identifikatorn är en teckensträng som är knuten till en resurs och ska användas för att särskilja resursen från andra.

**OBS! Detta arbetsflöde är under arbete**

  * Lägg till Identifikator
  * Välj:  ISBN


    värde: 9789197841214
    anmärkning: inbunden


Bandtyper

    inbunden  
      board book  
      halvfranskt band  
      halvklotband  
      kartonnage  
      klotband  
    häftad  
      danskt band 
      flipback-bok  
      flexband  
      pocket  
      storpocket  
    spiralhäftad  
    spiralbunden  

Om katalogisatören bedömer det viktigt att ange bandtyp, och resursen inte har ett ISBN, ska uppgiften om bandtyp anges i en vanlig anmärkning.

`I ringpärm`

Ange bestämningar som hämtas från resursen i den form de har där och bestämningar som hämtas utanför resursen i utskriven form. Ange till exempel kart. om det står så i resursen, och annars den utskrivna formen kartonnage.

**OBS! Detta arbetsflöde är under arbete**

Se RDA 2.15

## Upplageuppgift

Upplagebeteckning och påföljande upplagebeteckning är kärnelement. Övriga underelement är valfria.

Återge upplageuppgiften så som den förekommer i resursen, dock inte nödvändigtvis när det gäller stora och små bokstäver eller interpunktion, se dokumentet ”Transcription" - RDA 1.7. Förkortningar används endast om de förekommer i källan som uppgiften hämtas från.

Återge inte en uppgift som är relaterad till tryckning eller antal exemplar av en viss upplaga som upplageuppgift. Då det är tveksamt om en uppgift är att betrakta som upplageuppgift, ska ord som utgåva, upplaga, nummer, version (eller deras motsvarigheter på andra språk) uppfattas som tecken på att uppgiften är en upplageuppgift, och då behandlas som en sådan. Ta inte med uppgift om oförändrad tryckning som står tillsammans med upplageuppgiften såvida inte uppgiften om tryckning är en oskiljaktig del av upplageuppgiften, d.v.s. är grammatikaliskt sammanbunden.

Om en resurs saknar upplageuppgift men det är känt att betydliga ändringar från tidigare upplagor gjorts, tillämpa det valfria tillägget och lägg till en upplageuppgift, om det är viktigt för identifikation och åtkomst, RDA 2.5.1.2. Ange uppgiften inom klammer på huvudtitelns språk. För resurser med huvudtitel på svenska, följ Svenska skrivreglers rekommendation och använd termen "upplaga" för förändrat innehåll.

`[Utökad upplaga]`

Se RDA 2.5

### Upplagebeteckning

TODO: editionEnumeration?
Upplagebeteckning är ett kärnelement och anges i delfält 250 #a. Hämta uppgiften från följande källor (i denna ordning): samma källa som huvudtiteln, en annan källa inom resursen, en annan av de källor som specificeras i RDA 2.2.4.

`Ny udgave`

`*** ed.`

`1st ed.`

`Svensk utgåva [när uppgiften utgör upplageuppgift]`

`Första upplagans första tryckning`

`Uppl. 1`


**Upplagebeteckning på mer än ett språk eller i mer än en skriftart**

Om upplagebeteckningen förekommer i källan på mer än ett språk eller i mer än en skriftart, återge den uppgift som är på huvudtitelns språk eller i dess skriftart. Om detta kriterium inte går att tillämpa, återge den upplagebeteckning som kommer först i källan.

Se RDA 2.5.2.4.

**Upplagebeteckning som är en del av huvudtitel, etc.**

`Tenth anniversary edition of Economic justice for all`

`The compact edition of the Oxford English Dictionary`

Upplagebeteckning som är en integrerad del av huvudtitel, övrig titelinformation eller upphovsuppgift, eller grammatiskt sammanhängande med något av dessa element ska anges tillsammans med det element som det är en del av. 

_Ange det inte igen som en upplagebeteckning, RDA 2.5.2.6._

## Upplagespecifik upphovsuppgift
Ej kärnelement.

NB-praxis: Obligatoriskt att ange upplagespecifik upphovsuppgift (RDA 2.5.4).

    TODO:LibrisXL element 

Upplagespecifika upphovsuppgifter består av en upplagebeteckning och en upphovsuppgift som båda finns i samma källa och relaterar till just den upplagan. Det är endast bidragsgivare (aldrig skapare) som kan vara upplagespecifika. Hämta alltid upplagespecifika upphovsuppgifter från samma källa som upplagebeteckningen.

`Tredje upplagan / reviderad och korrigerad av Maja Lindblad`

_(I källan, på insidan av bakre omslag: ”Tredje upplagan, reviderad och korrigerad av Maja Lindblad”)_

### Påföljande upplagebeteckning

**OBS! Detta arbetsflöde är under arbete**

Påföljande upplagebeteckning är ett kärnelement.

Om en resurs betecknas som en återutgivning som innehåller förändringar i förhållande till en viss upplaga, anges denna uppgift efter upplagebeteckningen, RDA 2.5.6.3.
Hämta påföljande upplagebeteckning från följande källor (i denna ordning): samma källa som upplagebeteckningen, en annan källa inom resursen, en annan av de källor som specificeras i 
RDA 2.2.4.


6. upplagan, rättad och reviderad

### Påföljande upplagebeteckning på mer än ett språk eller i mer än en skriftart

Om påföljande upplagebeteckning förekommer i källan på mer än ett språk eller i mer än en skriftart, återge den uppgift som är på huvudtitelns språk eller i dess skriftart. Om detta kriterium inte går att tillämpa, återge den påföljande upplagebeteckning som kommer först i källan.

Se RDA 2.5.6.4.

### Upphovsuppgifter som hänför sig till påföljande upplagebeteckning

Ej kärnelement.
NB-praxis: Obligatoriskt att ange upphovsuppgifter som hänför sig till påföljande upplagebeteckning.

Se RDA 2.5.8

## Utgivning

**OBS! Detta arbetsflöde är under arbete**

Se RDA 2.8

## Distributions

**OBS! Detta arbetsflöde är under arbete**

Se RDA 2.9

## Tillverkning

**OBS! Detta arbetsflöde är under arbete**

Se RDA 2.10

## Copyrightår

Copyrightår är inte ett kärnelement. 

Librispraxis är att ange copyrightår i elementet för copyrightår när uppgift om utgivningstid, distributionstid och tillverkningstid saknas i resursen (eller när utgivningstiden  i resursen är fiktiv/felaktig). Det gäller endast copyrightår som hör till den manifestation som katalogiseras. Om copyrightåret kan antas vara samma år som utgivningsåret anges copyrightåret inom klammer i elementet för utgivningstid. I annat fall suppleras utgivningstid enligt anvisningarna i dokumentet Tidsangivelser - RDA 1.9.

Copyrightår ska föregås av symbolen © eller fonogramsymbolen ℗. Om symbolen inte kan återges ska tiden föregås av copyright eller phonogram copyright.

Se RDA 2.11

## Medietyp

Obligatoriskt enligt Librispraxis. 

Medietyp anger vilken typ av enhet som behövs för att se, spela eller visa innehållet i resursen.

**OBS! Detta arbetsflöde är under arbete**

Källor för beskrivningen av medietyp är resursen, medföljande material eller förpackning/behållare. Uppgifter kan även hämtas utanför resursen.

Om ingen av termerna i listan är lämplig, välj "annan" (x).
Om medietypen/medietyperna inte lätt kan bestämmas, välj "ospecificerad" (z).

Om resursen består av mer än en medietyp är Librispraxis att ange den medietyp som är tillämplig på den huvudsakliga delen av resursen. Ange inte medietyp för medföljande material av uppenbart underordnad karaktär.

Om resursen består av flera likvärdiga delar (kombinerat material) ange medietyp för alla delarna.

Se RDA 3.2 

## Bärartyp

Bärartyp är ett kärnelement.

Bärartyp anger fysiskt medium för lagring samt den enhet som behövs för att se, spela eller visa innehållet i resursen. Bärartyperna korrelerar till medietyperna och kan ses som underindelningar till dessa.

Källor för beskrivningen av bärare är resursen, medföljande material eller förpackning/behållare. Uppgifter kan även hämtas utanför resursen.

**OBS! Detta arbetsflöde är under arbete**

Om ingen av termerna i listan är lämplig, välj "annan" (nz).
Om bärartypen/bärartyperna inte lätt kan bestämmas, välj "ospecificerad" (zu).

Om resursen består av mer än en bärartyp är Librispraxis att ange den bärartyp som är tillämplig på den huvudsakliga delen av resursen. Ange inte bärartyp för medföljande material av uppenbart underordnad karaktär.

- Valfritt tillägg: Om bärarna ligger i en behållare/förpackning, namnge behållaren och dess mått.
- Librispraxis: Katalogisatören avgör om det valfria tillägget ska tillämpas.
- NB-praxis: Tillämpa det valfria tillägget.

Se RDA 3.3

## Omfång

Omfång är ett kärnelement om resursen är komplett eller om det totala antalet fysiska enheter är känt. 

Omfång är antalet och typen av enheter (t.ex. volym) och underenheter (t.ex. sidor) en resurs består av.

Använd hela resursen (eller medföljande material eller behållare) som källa. Om det behövs kan kompletterande information hämtas utanför resursen.

Ange resursens omfång genom att ange antalet och typen av enheter den består av. För typen kan en passande term från listan för bärartyper i RDA 3.3.1.3 (bärartyperna på svenska) användas.
Alternativ: Använd en vanligt förekommande term (inklusive varumärken, om det är tillämpligt):

a) om bäraren inte finns i listan
eller
b) som ett alternativ till en term i listan

* Librispraxis: Tillämpa alternativ a) och använd en vanligt förekommande term om bäraren inte finns i listan.
För fysiska digitala resurser ska alternativ b) tillämpas. Använd t.ex. CD, CD-ROM, DVD, DVD-ROM och diskett i stället för term från listan.

RDA har särskilda instruktioner för bland annat textresurser, 

Se RDA 3.4, RDA 3.4.5 och nästa stycke.

### Omfång för text

**OBS! Detta arbetsflöde är under arbete**

Se RDA 3.4.5

## Mått

Enligt Librispraxis är det inte obligatoriskt att ange mått. Mått som är standard för bäraren anges inte.

Om mått anges, och om instruktionerna inte säger något annat, ange mått i centimeter, avrundat uppåt till närmaste hela centimetertal. Ange måttet  i cm (om en volym mäter 17,2 cm, anges måttet som 18 cm).

`25 cm`

`50 mm`

`21 x 37 cm`

`27 cm i skyddskassett 28 x 25 x 5 cm`

Se RDA 3.5

## Serieuppgift

**OBS! Detta arbetsflöde är under arbete**

Se RDA 2.12
 
## Anmärkningar

Anmärkningar om manifestationen är inte ett kärnelement.

Gör anmärkning när det bedöms viktigt för identifikation, urval eller åtkomst.

Se RDA 2.17

## Teckengrad

För resurser med typsnitt anpassat för personer med synnedsättning, ange storleken på typsnittet med termen stor stil.

`stor stil`

Katalogisatören avgör om det valfria tillägget att ange storleken på typsnittet i antal punkter inom parentes ska tillämpas.

Se RDA 3.13
