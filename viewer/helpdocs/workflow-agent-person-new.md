---
section: Arbetsflöden
title: Skapa ny Agent - Person
order: 35
tags:
- editor
---

UNDER ARBETE (uppdaterad 2018-08-28)


## Skapa ny: Agent - Person
Lathunden beskriver de egenskaper och klasser som finns representerade i mallen. Om något av inmatningsfälten i mallen inte behövs kan de raderas med hjälp av papperskorgen intill. Ett urval av egenskaper relevanta för person som är möjliga att lägga till men som inte finns i mallen beskrivs i slutet av lathunden. 

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget. Verktyget är fortfarande under utveckling och viss åtskillnad från lathunden, t.ex. avseende ordning på egenskaper kan förekomma. 

Exemplet nedan baseras på den auktoriserade namnformen Lagerlöf, Selma, 1858-1940 (i de fall det är möjligt och relevant).


### Mall för beskrivning av Agent - Person
Beskrivning av agenten som ska auktoriseras. 

* Efternamn (FamilyName = 100 1/- ‡a)
  <br/>Enkelt eller sammansatt släktnamn/efternamn. Föredragen namnform som tillsammans med förnamn utgör den auktoriserade namnformen.
  <br/>```Exempel: Lagerlöf```

* Förnamn (GivenName = 100 ‡a)
  <br/>Förnamn som tillsammans med efternamn utgör den auktoriserade namnformen. 
  <br/>```Exempel: Selma```
  <br/>Om flera förnamn ska ingå i den auktoriserade namnformen skrivs de direkt efter varandra.
  
* Födelse- och/eller dödstid (lifeSpan = 100 ‡d)
  <br/>Årtal används i första hand som särskiljande tillägg för personer. 
  <br/>```Exempel: 1858-1940```
  <br/>```Exempel: 1968-```

* Födelsedatum (birthDate = 046 ‡f)
  <br/>Ange fullständigt födelsedatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/> ```Exempel: 18581120```
  <br/> ```Exempel: 1902```
  
* Dödsdatum (deathDate = 046 ‡g)
  <br/>Ange fullständigt dödsdatum om uppgiften är känd. I annat fall, ange känd uppgift.
  <br/> ```Exempel: 19400316```
  <br/> ```Exempel: 1977```

* Variant (hasVariant = 400 ‡a ‡d)
  <br/>Här anges variantnamn och alternativa namnformer samt födelse- och/eller dödstid. Hit hör stavningsvaranter, förkortningar, ändringar till följd av namnbyten, hänvisning från det andra ledet av sammansatt efternamn etc. Variantnamn kan t.ex. finnas i referenskällor eller i den bibliografiska informationen. Egenskapen upprepas om flera variantnamn behöver läggas till. 
  <br/>```Exempel: Efternamn: Lagerlöf Förnamn: Selma Ottiliana Lovisa Födelse- och/eller dödstid: 1858-1940```
  <br/>```Exempel: Efternamn: Lagerlœf Förnamn: Selma Födelse- och/eller dödstid: 1858-1940```
  <br/>För att lägga till ytterligare Variant: Klicka på +ikonen under egenskapen Variant, och välj typ (Person). Klicka på +ikonen inom den tillagda egenskapen Person, sök efter och lägg till Efternamn, Förnamn, Födelse- och/eller dödstid (ELLER Namn och Födelse- och/eller dödstid)

* Se även (seeAlso = 500 ‡a ‡d)
  <br/>Här länkas se även-hänvisning till en annan auktoriserad namnform, t.ex. till en pseudonym eller då en upphovsperson är verksam under mer än en identitet.
  <br/>```Exempel: Efternamn: Smith Förnamn: Rosamond Födelse- och/eller dödstid: 1938-``` som se-hänvisning från den  auktoriserade namnformen för Oates, Joyce Carol, 1938-.
    <br/>För att lägga till: Klicka på +ikonen under egenskapen Se även, välj typen Person i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar entitet behöver en skapas, dvs. Skapa ny Agent med länkning till den första. Avsluta och spara den ursprungliga först.)

* Verksamhetsområde (fieldOfActivity = 372)
  <br/>Personens verksamhetsområde beskriver vad personen är intresserad av eller ägnar sig åt och det behöver inte ha med yrkesutövning att göra. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord och länka.
   <br/>```Exempel: Fågelskådning```
   <br/>För att lägga till: Klicka på +ikonen under egenskapen Verksamhetsområde, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Har yrke eller sysselsättning (hasOccupation = 374)
   <br/>Ange yrke eller sysselsättning om det behövs för att skilja en person från en annan, t.ex. när en persons födelsetid eller dödstid inte är tillgängligt. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord och länka.
   <br/>```Exempel: Romanförfattare```
   <br/>```Exempel: Översättare```
   <br/>För att lägga till: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)
  
* Identifikator (identifiedBy = 024 ‡a ‡2)
  <br/>Isni som identifikator är valfri uppgift men önskvärt om tillgänglig (uppgiften hämtas förslagsvis från VIAF). 
  <br/> ```Exempel: 0000000121339888 ```
   <br/>För att lägga till: Klicka på +-ikonen under Identifikator, välj typ (ISNI). Klicka på +-ikonen inom Identifikator, sök efter och lägg till Värde.

* Nationalitet/verksamhetsland (nationality = 043)
  <br/>I mallen ligger nationalitetskoden för Sverige (e-sw---) förifylld. Vid behov kan denna raderas. 
  <br/>För att lägga till: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>Används för att ange biografisk information är information om personens liv eller historia.
  <br/>```Exempel: Skönlitterär författare, nobelpristagare 1909, första kvinnliga ledamot av Svenska akademien 1914.```
  <br/>Lägg till egenskapen genom att klicka på +ikonen i verktygsmenyn. Klicka på +ikonen inom den tillagda egenskapen och välj Benämning där uppgifterna anges.
  
### Adminmetadata
Information av administrativ karaktär som är väsentlig för auktoriseringen i sig men inte är direkt förknippad med den auktoriserade namnformen.

* Kontrollnummer (controlNumber = 001)
  <br/>Libris-ID. Genereras automatiskt vid sparande. Ändras ej.
  
* Skapad av (descriptionCreator = 040 ‡a)
  <br/>Förval: Inloggad sigel. Ändras ej.<br/>```Exempel: S```
  
* Katalogiseringsregler (descriptionConventions = 040 ‡e)
  <br/>Förval: rda. Ändra vid behov. 
  <br/>```Exempel: Kod: rda```

* Translitterering (marc:romanization = 008/07)
  <br/>Ändras ej.
  
* Typ av auktoritetspost (marc:kindOfRecord = 008/09)
  <br/>Ändras ej.

* Marc:headingMain (008/14)
  <br/>Ändras ej.

* Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det är önskvärt att alla nya auktoriserade namnformer kompletteras med datum/sigel/signatur. I övrigt kan det t.ex. vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur. 
  <br/>```Exempel:``` 
  <br/>```2018-08-27 S/MSS/evaann```
  <br/>```Författaren vill inte ha sitt födelseår kopplat till den auktoriserade namnformen. Enligt e-post 2017-05-12, S/NB/annbjo```

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
  
* Poststatus (recordStatus = 000/Leader/)
  <br/>Val i meny. Välj Ny post vid skapande av ny auktoriserad agent. Vid uppdatering ändras status automatiskt.

* Uppdatering av posten (marc:recordUpdate = 008/31)
  <br/>Ändras ej.

* Differentiering av posten (marc:personalName = 008/32)
  <br/>Ändras ej.

* Auktoritetskontrollnivå (marc:level = 008/33)
  <br/>Ändras ej.

* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
  <br/>Förval: language/swe. Ändras ej.


### Valbara egenskaper relevanta för Agent - Person
Vid behov är det möjligt att lägga till egenskaper som inte ingår i mallen. Nya egenskaper läggs till med hjälp av den runda +ikonen i verktygsmenyn.

* Namn (name = 100 0/- ‡a)
  <br/>Används för namn i rak följd istället för Förnamn och Efternamn. Kan användas i kombination med Förnamn och Efternamn endast för att ange variantnamn.
  <br/>```Exempel: Namn: Bang``` Som variantnamn till den auktoriserade namnformen Alving, Barbro, 1909-1987
  <br/>För att lägga till: Klicka på +ikonen under egenskapen Se även, välj typen Person i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar entitet behöver en skapas, dvs. Skapa ny Agent med länkning till den första. Avsluta och spara den ursprungliga först.)

* Fullständigare namnform (fullerFormOfName = 100 ‡q och 378)
  <br/>Används för att ange fullständig namnform i de fall då fortkortning används i den auktoriserade namnformen.
  <br/>```Exempel: Efternamn: Smith```
  <br/>```Exempel: Förnamn: A. D.```
  <br/>```Exempel: Fullständigare namnform: Adam David```

* Titel eller övrig beteckning (marc:titlesAndOtherWordsAssociatedWithAName = 100 ‡c ‡d)
  <br/>Används vid behov som särskiljande tillägg till den auktoriserade namnformen. 
  <br/>```Exempel: påve```
  
* Andra attribut för person- och organisationsnamn (hasOtherAttributes = 368)
  <br/>Används vid behov som särskiljande tillägg för att ange akademiska titlar, kyrkliga ämbeten, militära tjänstegrader (till exempel kapten), hederstitlar etc. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord.
  <br/>```Exempel: Professorer```

* Ordningstal (marc:numeration = 100 ‡b)
  <br/>Används som särskiljande tillägg till den auktoriserade namnformen för kungligheter samt för påvar, biskopar och andra personer med religiösa yrken.
  <br/>```Exempel: XXII```
  <br/>```Exempel: 2```
  
#### Glöm inte att redigera Adminmetadata och spara entiteten innan vidare navigation i verktyget!
