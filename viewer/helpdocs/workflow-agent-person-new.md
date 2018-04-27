---
section: Arbetsflöden
title: Skapa ny Agent - Person
order: 35
tags:
- editor
---
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Skapa ny Agent - Person
Lathunden beskriver de fält som finns representerade i mallen. Om något av fälten i mallen inte behövs kan de raderas genom ett klick på papperskorgsikonen intill fältet. Ett urval av fält relevanta för person som är möjliga att lägga till men som inte finns i mallen beskrivs i slutet av lathunden. 

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget.

Exemplet nedan baseras på den auktoriserade namnformen Lagerlöf, Selma, 1858-1940 (i de fall det är möjligt och relevant)


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
  <br/>I detta fält anges variantnamn och alternativa namnformer. Här anges stavningsvaranter, förkortningar, ändringar till följd av namnbyten, hänvisning från det andra ledet av sammansatt efternamn etc. Variantnamn kan t.ex. finnas i referenskällor eller i den bibliografiska informationen. Fältet upprepas om flera variantnamn behöver läggas till. 
  <br/>```Exempel: Efternamn: Lagerlöf Förnamn: Selma Ottiliana Lovisa```
  <br/>```Exempel: Efternamn: Lagerlœf Förnamn: Selma```
  <br/>För att lägga till ytterligare fält: Klicka på +ikonen under Variant, välj Person under Skapa lokal entitet. Klicka på +ikonen inom det tillagda Person-fältet, sök efter och lägg till Efternamn. Upprepa för Förnamn och Födelse- och/eller dödstid (ELLER Namn och Födelse- och/eller dödstid). OBS! Variant ska ej göras till länkbara entiteter!

* Se även (seeAlso = 500 ‡a ‡d)
  <br/>I detta fält länkas se även-hänvisning till en annan auktoriserad namnform, t.ex. till en pseudonym eller då en upphovsperson är verksam under mer än en identitet.
  <br/>```Exempel: Efternamn: Smith Förnamn: Rosamond Födelse- och/eller dödstid: 1938-``` som se-hänvisning från auktoritetsposten för Oates, Joyce Carol, 1938-
    <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Se även, välj typen Person i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar entitet behöver en skapas, dvs. Skapa ny Agent med länkning till den första. Avsluta och spara den ursprungliga först.)

* Verksamhetsområde (fieldOfActivity = 372)
  <br/>Personens verksamhetsområde beskriver vad personen är intresserad av eller ägnar sig åt och det behöver inte ha med yrkesutövning att göra. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord.
   <br/>```Exempel: Fågelskådning```
   <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Har yrke eller sysselsättning (hasOccupation = 374)
   <br/>Ange yrke eller sysselsättning om det behövs för att skilja en person från en annan, t.ex. när en persons födelsetid eller dödstid inte är tillgängligt. Hämta i första hand termen från en kontrollerad vokabulär som Svenska ämnesord.
   <br/>```Exempel: Romanförfattare ```
   <br/>```Exempel: Översättare```
   <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Har yrke eller sysselsättning, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)
  
* Identifikator (identifiedBy = 024 ‡a ‡2)
  <br/>Isni som identifikator är valfri uppgift men önskvärt om tillgänglig. 
  <br/> ```Exempel: 0000000121339888 ```
   <br/>För att lägga till fält: Klicka på +-ikonen under Identifikator, välj typ (ISNI). Klicka på +-ikonen inom det tillagda Identifikator-fältet, sök efter och lägg till fältet Värde.

* Nationalitet/verksamhetsland (nationality = 043)
  <br/>I mallen ligger nationalitetskoden för Sverige (e-sw---) förifylld. Vid behov kan denna raderas. 
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till.)

* Biografiska uppgifter (hasBiographicalInformation = 678)
  <br/>Används för att ange biografisk information är information om personens liv eller historia.
  <br/>```Exempel: Skönlitterär författare, nobelpristagare 1909, första kvinnliga ledamot av Svenska akademien 1914.```
  <br/>Lägg till fält genom att klicka på +ikonen. Klicka på +ikonen inom det tillagda fältet och välj Benämning där uppgifterna anges.
  
### Adminmetadata
Information av administrativ karaktär som är väsentlig för auktoritetsposten i sig och inte är direkt förknippad med den auktoriserade namnformen.

* Katalogiseringsregler (descriptionConventions = 040 ‡e)
  <br/>Förval: rda. Ändra vid behov. 
  <br/>```Exempel: Kod: rda```

* Skapad av (descriptionCreator = 040 ‡a)
  <br/>Förval: Inloggad sigel. Ändras ej.  
  <br/>```Exempel: S```

* Beskrivningsnivå (encodingLevel = 000/Leader/?)
  <br/>Val i meny?/Ändras ej?

* Translitterering (marc:romanization = 008/07)
  <br/>Ändras ej.
  
* Typ av auktoritetspost (marc:kindOfRecord = 008/09)
  <br/>Ändras ej.

* Marc:headingMain (008/14)
  <br/>Ändras ej.

* Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det kan till exempel vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur.
  <br/>```Exempel: Författaren vill inte ha sitt födelseår i auktoritetsposten. Enligt e-post 2017-05-12, S/NB/annbjo```

* Konsulterad källa (sourceConsulted = 670)
  <br/>Välj typ av källa. Ange källa och vid behov vilken uppgift som hämtats från källan. Den resurs som föranleder auktoriseringen är obligatorisk källa i auktoritetsposten. 
  <br/>```Exempel: Jerusalem / Selma Lagerlöf, 1901```
  <br/>```Exempel: NE 2018-04-12```
  <br/>```Exempel: Wikipedia (svenska) 2018-04-12```
  <br/>Lägg till ytterligare källa genom att klicka på +-ikonen under Konsulterad källa, välj typ och ange uppgifterna.
  
* Poststatus (recordStatus = 000/Leader/?)
  <br/>Val i meny?/Ändras ej?

* Uppdatering av posten (marc:recordUpdate = 008/31)
  <br/>Ändras ej.

* Differentiering av posten (marc:personalName = 008/32)
  <br/>Ändras ej.

* Auktoritetskontrollnivå (marc:level = 008/33)
  <br/>Ändras ej.

* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
  <br/>Förval: language/swe. Ändras ej.


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

* Titel eller övrig beteckning (marc:titlesAndOtherWordsAssociatedWithAName = 100 ‡c ‡d)
  <br/>Används vid behov som särskiljande tillägg till den auktoriserade namnformen.
  <br/>```Exempel: Påve```
  
* Andra attribut för person- och organisationsnamn (hasOtherAttributes = 368)
  <br/>Används för att ange akademiska titlar, kyrkliga ämbeten, militära tjänstegrader (till exempel kapten), hederstitlar etc.
  <br/>```Exempel: Kapten```

#### Glöm inte att redigera Adminmetadata och spara entiteten innan vidare navigation i verktyget!
