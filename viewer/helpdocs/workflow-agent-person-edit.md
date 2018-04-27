---
section: Arbetsflöden
title: Redigera befintlig Agent - Person
order: 45
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Redigera befintlig Agent - Person
Lathunden beskriver de fält som finns i den befintliga auktoritetsposten och vilka fält som bör läggas till. Ett urval av fält relevanta för person som är möjliga att lägga till men som inte finns i mallen beskrivs i slutet av lathunden. 

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget.

Exemplet nedan baseras på Jansson, Erik, f. 1848. Tillägg är fiktiva, enbart för att exemplifiera.

### Befintliga fält i beskrivningen
Beskrivning av den auktoriserade agenten. 

* Efternamn (FamilyName = 100 i1=1 ‡a)
  <br/>```Exempel: Jansson```

* Förnamn (GivenName = = 100 ‡a)
  <br/>```Exempel: Erik```

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>```Exempel: Väckelsepredikant i Österbotten```
  
* Födelse- och/eller dödstid (lifeSpan = 100 ‡d)
  <br/>Årtal används i första hand som särskiljande tillägg för personer. Redigera om det behövs.
  <br/>```Exempel: 1848-1920```

* Nationalitet/verksamhetsland (Nationality = 043 ‡a)
  <br/>Nationalitet/verksamhetsland förknippat med personen. Vid behov kan denna ändras eller raderas.
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Samma sak som (SameAs)
  <br/>```Exempel: resource/auth/247521```
  
### Fält att lägga till i beskrivningen

* Födelsedatum (birthDate = 046 ‡f)
  <br/>Ange fullständigt födelsedatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/>```Exempel: 18480219```
  
* Dödsdatum (deathDate = 046 ‡g)
  <br/>Ange fullständigt dödsdatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/>```Exempel: 19201209```

* Variant (hasVariant = 400 ‡a ‡d)
  <br/>I detta fält anges variantnamn och alternativa namnformer. Här anges stavningsvaranter, förkortningar, ändringar till följd av namnbyten, hänvisning från det andra ledet av sammansatt efternamn etc. Variantnamn kan t.ex. finnas i referenskällor eller i de bibliografiska posterna. Fältet upprepas om flera variantnamn behöver läggas till.
  <br/>```Exempel: Efternamn: Jansson ; Förnamn: Eric```
  <br/>```Exempel: Namn: Janzon ; Förnamn: Erik Gustaf```
  <br/>För att lägga till ytterligare fält: Klicka på +ikonen under Variant, välj Person under Skapa lokal entitet. Klicka på +ikonen inom det tillagda Person-fältet, sök efter och lägg till Efternamn. Upprepa för Förnamn och Födelse- och/eller dödstid (ELLER Namn och Födelse- och/eller dödstid). OBS! Variant ska ej göras till länkbara entiteter!
  
* Identifikator (identifiedBy = 024 ‡a)
  <br/>ISNI som identifikator är valfri uppgift men önskvärt om tillgänglig. 
  <br/>```Exempel: 0000000121339888 ```
  <br/>För att lägga till fält: Klicka på +-ikonen under Identifikator, välj typ (ISNI). Klicka på +-ikonen inom det tillagda Identifikator-fältet, sök efter och lägg till fältet Värde.

* Har yrke eller sysselsättning (hasOccupation = 374)
   <br/>Ange yrke eller sysselsättning om det behövs för att skilja en person från en annan, t.ex. när en persons födelsetid eller dödstid inte är tillgängligt. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord.
   <br/>```Exempel: Romanförfattare ```
   <br/>```Exempel: Översättare```
   <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>Används för att ange biografisk information är information om personens liv eller historia.
  <br/>```Exempel: Skönlitterär författare, nobelpristagare 1909, första kvinnliga ledamot av Svenska akademien 1914.```
  <br/>Lägg till fält genom att klicka på +ikonen. Klicka på +ikonen inom det tillagda fältet och välj Benämning där uppgifterna anges.

### Befintliga fält i Adminmetadata
Information av administrativ karaktär som är väsentlig för auktoritetsposten i sig och inte är direkt förknippad med den auktoriserade namnformen.

* Kontrollnummer (controlNumber = 001)
  <br/>LibrisID. Ändras ej.

* Katalogiseringsregler (descriptionConventions = 040 ‡e)
  <br/>Förval: rda. Ändra vid behov. 
  <br/>```Kod: rda``` 

* Skapad av (descriptionCreator = 040 ‡a)
  <br/>Förval: Sigel för skapare av agenten. Ändras ej.  
  <br/>```Exempel: Organisation: S```

* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
  <br/>Förval: Svenska

* Senast ändrad av (descriptionLastModifier)  
  <br/>Förval: Sigel som gjort senaste ändring. Ändras ej.  
  
* Beskrivningsnivå (encodingLevel = 000)
  <br/>Ändras ej.

* Katalogiserande instans (marc:catalogingSource = 008/39)
  <br/>Ändras ej.

* Marc:headingMain (marc:headingMain = 008/14)
  <br/>Ändras ej.
  
* Typ av auktoritetspost (marc:kindOfRecord = 008/9)
  <br/>Ändras ej.

* Auktoritetskontrollnivå (marc:level = 008/33)
  <br/>Ändras ej.
  
* Differentiering av posten (marc:personalName = 008/32)
  <br/>Ändras ej.

* Uppdatering av posten (marc:recordUpdate = 008/31)
  <br/>Ändras ej.

* Poststatus (recordStatus = 000)
  <br/>Ändras ej.

* Samma sak som 
  <br/>Ändras ej.
  
* Konsulterad källa (sourceConsulted = 670 ‡a) samt Uppgift från källa (citationNote = 670 ‡b)
  <br/>Källa vid belagd uppgift. 
  <br/>Välj typ av konsulterad källa i rullgardinsmenyn till vänster. Vid val av "Källa vid belagd uppgift" finns möjlighet att ange såväl källa som uppgift hämtad från källa. 
  <br/>```Exempel: Källa: NE 2018-04-12. Uppgift från källa: Levnadstid: 1848-1920```
  <br/>Den resurs som föranleder auktoriseringen är obligatorisk källa.
  <br/>```Exempel: Källor i tåredalen, 1999```
  
### Fält att lägga till i adminmetadata

* Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det kan till exempel vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur.
<br/>```Exempel: Ändrat auktoriserad namnform från Xxx till Yyy 2010-01-03/S/marjan```

### Valbara fält relevanta för Agent - Person
Vid behov är det möjligt att lägga till fält som inte ingår i mallen. Nya fält läggs till med hjälp av den runda +ikonen i verktygsmenyn.

* Namn (name = 100 0/- ‡a)
  <br/>Används för namn i rak följd istället för fälten Förnamn och Efternamn. Kan användas i kombination med fälten Förnamn och Efternamn endast för att ange variantnamn.
  <br/>```Exempel: Namn: Bang``` Som variantnamn till den auktoriserade namnformen Alving, Barbro, 1909-1987
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Se även, välj typen Person i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar entitet behöver en skapas, dvs. Skapa ny Agent med länkning till den första. Avsluta och spara den ursprungliga först.)

* Fullständigare namnform (fullerFormOfName = 100 ‡q och 378)
  <br/>Används för att ange fullständig namnform i de fall då fortkortning används i den auktoriserade namnformen.
  <br/>```Exempel: Efternamn: Smith ```
  <br/>```Exempel: Förnamn: A. D. ```
  <br/>```Exempel: Fullständigare namnform: Adam David```

* Verksamhetsområde (fieldOfActivity = 372)
  <br/>Personens verksamhetsområde beskriver vad personen är intresserad av eller ägnar sig åt och det behöver inte ha med yrkesutövning att göra. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord.
   <br/>```Exempel: Fågelskådning```
   <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Titel eller övrig beteckning (marc:titlesAndOtherWordsAssociatedWithAName = 100 ‡c ‡d)
  <br/>Används vid behov som särskiljande tillägg till den auktoriserade namnformen.
  <br/>```Exempel: Påve```
  
* Andra attribut för person- och organisationsnamn (hasOtherAttributes = 368)
  <br/>Används för att ange akademiska titlar, kyrkliga ämbeten, militära tjänstegrader (till exempel kapten), hederstitlar etc.
  <br/>```Exempel: Kapten```
  
#### Glöm inte att redigera Adminmetadata och spara entiteten innan vidare navigation i verktyget!
