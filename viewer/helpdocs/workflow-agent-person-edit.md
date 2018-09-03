---
section: Arbetsflöden
title: Redigera befintlig Agent - Person
order: 45
date: 2018-08-28
tags:
- editor
- under arbete
--- 

## Redigera befintlig Agent - Person
Lathunden beskriver de egenskaper och klasser som finns i en befintlig auktoriserad agent och vilka egenskaper som bör läggas till. Ett urval av egenskaper relevanta för person som är möjliga att lägga till men som inte finns i mallen beskrivs i slutet av lathunden. 

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget. Verktyget är fortfarande under utveckling och viss åtskillnad från lathunden, t.ex. avseende ordning på egenskaper kan förekomma.

Exemplet nedan baseras på Jansson, Erik, f. 1848. Tillägg är fiktiva, enbart för att exemplifiera.

### Befintliga egenskaper i beskrivningen
Beskrivning av den auktoriserade agenten. 

* Efternamn (FamilyName = 100 i1=1 ‡a)
  <br/>```Exempel: Jansson```

* Förnamn (GivenName = = 100 ‡a)
  <br/>```Exempel: Erik```

* Födelse- och/eller dödstid (lifeSpan = 100 ‡d)
  <br/>Årtal används i första hand som särskiljande tillägg för personer. Redigera om det behövs.
  <br/>```Exempel: 1848-1920```

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>```Exempel: Väckelsepredikant i Österbotten```

* Nationalitet/verksamhetsland (Nationality = 043 ‡a)
  <br/>Nationalitet/verksamhetsland förknippat med personen. Vid behov kan denna ändras eller raderas.
  <br/>För att lägga till: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Samma sak som (SameAs)
  <br/>```Exempel: resource/auth/247521```
  
### Egenskaper att lägga till i beskrivningen

* Födelsedatum (birthDate = 046 ‡f)
  <br/>Ange fullständigt födelsedatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/>```Exempel: 18480219```
  
* Dödsdatum (deathDate = 046 ‡g)
  <br/>Ange fullständigt dödsdatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/>```Exempel: 19201209```

* Variant (hasVariant = 400 ‡a ‡d)
  <br/>Här anges variantnamn och alternativa namnformer samt födelse och/eller dödstid. Hit hör stavningsvaranter, förkortningar, ändringar till följd av namnbyten, hänvisning från det andra ledet av sammansatt efternamn etc. Variantnamn kan t.ex. finnas i referenskällor eller i de bibliografiska informationen. Egenskapen upprepas om flera variantnamn behöver läggas till.
  <br/>```Exempel: Efternamn: Jansson ; Förnamn: Eric```
  <br/>```Exempel: Namn: Janzon ; Förnamn: Erik Gustaf```
    <br/>För att lägga till ytterligare Variant: Klicka på +ikonen under egenskapen Variant, och välj typ (Person). Klicka på +ikonen inom den tillagda egenskapen Person, sök efter och lägg till Efternamn, Förnamn, Födelse- och/eller dödstid (ELLER Namn och Födelse- och/eller dödstid).
  
* Identifikator (identifiedBy = 024 ‡a)
  <br/>ISNI som identifikator är valfri uppgift men önskvärt om tillgänglig (uppgiften hämtas förslagsvis från VIAF). 
  <br/>```Exempel: 0000000121339888 ```
  <br/>För att lägga till: Klicka på +-ikonen under Identifikator, välj typ (ISNI). Klicka på +-ikonen inom det tillagda Identifikator, sök efter och lägg till Värde.

* Har yrke eller sysselsättning (hasOccupation = 374)
   <br/>Ange yrke eller sysselsättning om det behövs för att skilja en person från en annan, t.ex. när en persons födelsetid eller dödstid inte är tillgängligt. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord och länka.
   <br/>```Exempel: Romanförfattare ```
   <br/>```Exempel: Översättare```
   <br/>För att lägga till: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>Används för att ange biografisk information är information om personens liv eller historia.
  <br/>```Exempel: Skönlitterär författare, nobelpristagare 1909, första kvinnliga ledamot av Svenska akademien 1914.```
  <br/>Lägg till egenskapen genom att klicka på +ikonen. Klicka på +ikonen inom den tillagda egenskapen och välj Benämning där uppgifterna anges.

### Befintliga egenskaper i Adminmetadata
Information av administrativ karaktär som är väsentlig för auktoriseringen i sig och inte är direkt förknippad med den auktoriserade namnformen.

* Kontrollnummer (controlNumber = 001)
  <br/>LibrisID. Ändras ej.

* Skapad av (descriptionCreator = 040 ‡a)
  <br/>Förval: Sigel för skapare av agenten. Ändras ej.  
  <br/>```Exempel: Organisation: S```

* Katalogiseringsregler (descriptionConventions = 040 ‡e)
  <br/>Förval: rda. Ändra vid behov. 
  <br/>```Kod: rda``` 

* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
  <br/>Förval: Svenska

* Senast ändrad av (descriptionLastModifier)  
  <br/>Förval: Sigel som gjort senaste ändring. Ändras automatiskt vid sparande  
  
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
  <br/>Ändras ej. Vid uppdatering ändras status automatiskt.

* Samma sak som 
  <br/>Ändras ej.
  
* Konsulterad källa (sourceConsulted) innehåller Benämning (label = 670 ‡a) samt Uppgift från källa (citationNote = 670 ‡b)
  <br/>Ange källa och vid behov vilken uppgift som hämtats från källan. Den resurs som föranleder auktoriseringen är obligatorisk källa. 
  <br/>```Exempel på obligatorisk källa:``` 
  <br/>```Benämning: Jerusalem / Selma Lagerlöf, 1901 Uppgift från källa: Selma Lagerlöf```
  <br/>```Benämning: Harry Potter och hemligheternas kammare / J. K. Rowling, 2000 Uppgift från källa: Rowling, J. K.```
  <br/>```Exempel på ytterligare källor:```
  <br/>```Benämning: NE 2018-04-12. Uppgift från källa: Levnadstid 1848-1920```
  <br/>```Benämning: Wikipedia (svenska) 2018-04-12 Uppgift från källa: Dödstid 1867```
  <br/>```Benämning: NE 2016-10-01 Uppgift från källa: Fullständigare namnform: Joanne Kathleen```
  <br/>```Benämning: LC i VIAF 2017-11-21 Uppgift från källa: Fullständigare namnform: Rowling, J. K.```
  <br/>OBS! Förkortningen t.p., isbd-interpunktion och parenteser som inte behövs för förståelse/läsbarhet behöver inte anges.      
  <br/>För att lägga till: Klicka på +ikonen under Konsulterad källa. Välj typ av konsulterad källa i rullmenyn. 
Vid val av "Källa vid belagd uppgift" finns möjlighet att ange såväl Benämning (källa) som Uppgift hämtad från källa.
  
### Egenskaper att lägga till i adminmetadata

* Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det kan t.ex. vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur. 
  <br/>```Exempel:``` 
  <br/>```Författaren vill inte ha sitt födelseår kopplat till den auktoriserade namnformen. Enligt e-post 2017-05-12, S/NB/annbjo```
<br/>```Ändrat auktoriserad namnform från Xxx till Yyy 2010-01-03/S/marjan```

### Valbara egenskaper relevanta för Agent - Person
Vid behov är det möjligt att lägga till egenskaper som inte ingår i mallen. Nya egenskaper läggs till med hjälp av den runda +ikonen i verktygsmenyn.

* Namn (name = 100 0/- ‡a)
  <br/>Används för namn i rak följd istället för Förnamn och Efternamn. Kan användas i kombination med Förnamn och Efternamn endast för att ange variantnamn.
  <br/>```Exempel: Namn: Bang``` Som variantnamn till den auktoriserade namnformen Alving, Barbro, 1909-1987
  <br/>För att lägga till: Klicka på +ikonen under egenskapen Se även, välj typen Person i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar entitet behöver en skapas, dvs. Skapa ny Agent med länkning till den första. Avsluta och spara den ursprungliga först.)

* Fullständigare namnform (fullerFormOfName = 100 ‡q och 378)
  <br/>Används för att ange fullständig namnform i de fall då fortkortning används i den auktoriserade namnformen.
  <br/>```Exempel: Efternamn: Smith ```
  <br/>```Exempel: Förnamn: A. D. ```
  <br/>```Exempel: Fullständigare namnform: Adam David```

* Verksamhetsområde (fieldOfActivity = 372)
  <br/>Personens verksamhetsområde beskriver vad personen är intresserad av eller ägnar sig åt och det behöver inte ha med yrkesutövning att göra. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord och länka.
   <br/>```Exempel: Fågelskådning```
   <br/>För att lägga till: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)
  
* Titel eller övrig beteckning (marc:titlesAndOtherWordsAssociatedWithAName = 100 ‡c ‡d)
  <br/>Används vid behov som särskiljande tillägg till den auktoriserade namnformen. 
  <br/>```Exempel: påve```
  
* Andra attribut för person- och organisationsnamn (hasOtherAttributes = 368)
  <br/>Används vid behov som särskiljande tillägg för att ange akademiska titlar, kyrkliga ämbeten, militära tjänstegrader (till exempel kapten), hederstitlar etc. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord och länka.
  <br/>```Exempel: Professorer```
  <br/>För att lägga till: Klicka på +ikonen under egenskapen Andra attribut för person- och organisationsnamn, välj       Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Ordningstal (marc:numeration = 100 ‡b)
  <br/>Används som särskiljande tillägg till den auktoriserade namnformen för kungligheter samt för påvar, biskopar och andra personer med religiösa yrken.
  <br/>```Exempel: XXII```
  <br/>```Exempel: 2```
  
#### Glöm inte att redigera Adminmetadata och spara entiteten innan vidare navigation i verktyget!
