---
section: Arbetsflöden
title: Bok – Tryckt monografi
order: 15
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Bok – Tryckt monografi

Denna hjälptext beskriver ett antal vanligt förekommande fält, med utgångspunkt från exempel. För instruktioner om att länka till entitet, skapa lokal entitet och om hur formuläret fungerar i övrigt, se Redigering i vänstermenyn. För information om katalogregler, skrivregler och övriga katalogiseringsanvisningar, se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/ "Anvisningar för katalogisering - RDA").

I de flesta fall ska informationen delas upp i olika fält och delfält. I några undantagsfall är det nödvändigt att använda ISBD-interpunktion inom fält, för att separera uppgifter. Dessa fall visas genom exempel nedan. Använd vid behov också klamrar inom fält, enligt Anvisningar för katalogisering - RDA.

Exempel hämtade från: Under cover, ISBN 9789188107213, Voyager BibID 19775078 samt  
30 år med Fredrika Bremer i forskning och idédebatt, Voyager BibID 22431305
samt exempel hämtade från andra poster.

[Adminmetadata](#adminmetadata)  
[Instans](#instans)  
[Verk](#verk)  


### Adminmetadata
* Skapad av/Organisation/Namn (descriptionCreator/Organization/name = 040 ‡a)  
  Förval: den sigel som skapat posten. Ska inte ändras.  
  ```Exempel: BOKR```

* Uppgraderad eller importerad av/Organisation/Namn (descriptionUpgrader/Organization/name = 040 ‡d)  
  Skriv in sigel som har uppgraderat (ändrat nivå) eller importerat posten. För att söka fram sigel, se [Biblioteksdatabasen](https://biblioteksdatabasen.libris.kb.se/ "Biblioteksdatabasen")  
  ```Exempel: S```

* Bibliografi/Bibliotek/Sigel (bibliography/Library/sigel = 042 ‡9)  
  Ange bibliografikod genom att skriva in sigel. För att söka fram sigel, se [Biblioteksdatabasen](https://biblioteksdatabasen.libris.kb.se/ "Biblioteksdatabasen")

* Identifikator/Systemnummer/Värde (identifiedBy/SystemNumber/value = 035 ‡a)  
  Om ett systemnummer finns i förhandspost, till exempel Bokinfos systemnummer, låt det vara kvar oförändrat.  
   ```Exempel: (BOKR)9789188107213```

* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```

* Katalogiseringsregler (descriptionConventions = 040 ‡e)  
  För post katalogiserad enligt RDA, länka till entitet: marc/Isbd samt skapa lokal entitet med Kod: rda    
  ```Exempel: marc/Isbd (länkad entitet) + lokal entitet, Kod: rda```

* Beskrivningsnivå (000/05)  
  Länka till entitet.  
  ```Exempel: CIP-post, ändra till biblioteksnivå```

### Instans
* Utgivningssätt (issuanceType)  
  Välj från lista.  
  ```Exempel: Monografisk resurs```
  
* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 245 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Under cover```  
  ```Exempel: En arbetsdag i skriftsamhället```  
    För en titel som börjar med bestämd eller obestämd artikel, ska artikeln fileras bort. Ange fileringsvärde genom att lägga till delfältet fileringsvärde och ange en siffra. Exempel: Huvudtitel: En arbetsdag i skriftsamhället, fileringsvärde: 3   
    
    
* Har titel/Titel/Övrig titelinformation (= Undertitel) (hasTitle/Title/subTitle = 245 ‡b)  
  Skriv in uppgiften. Om det finns flera undertitlar, skriv in dessa efter varandra i samma fält, åtskilda av mellanslag, kolon, mellanslag.  
  ```Exempel: livet som underrättelseagent åt MI5```  
  ```Exempel: ett etnografiskt perspektiv på skriftanvändning i vanliga yrken : småskrift utarbetad av Språkrådet```
    
* Har titel/Varianttitel/Huvudtitel (hasTitle/VariantTitle/mainTitle = 246 ‡a)  
  Skriv in uppgiften.
  
* Har titel/Varianttitel/Övrig titelinformation (= Undertitel) (hasTitle/VariantTitle/subTitle = 246 ‡b)  
  Skriv in uppgiften.    
  
* Omslagstitel, Ryggtitel, Rubriktitel etc - lägg till Har titel och välj typ. För typ av varianttitel som saknas i listan, välj Varianttitel och lägg därefter till Typanmärkning (= 246 ‡i). Lägg därefter till Huvudtitel och eventuell Övrig titelinformation.  
   
* Upphovsuppgift (responsibilityStatement = 245 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: Tom Marcus ; översättning: Svante Skoglund```

* Identifikator/Typ (identifiedBy)
  Välj från lista.    
  ```Exempel: ISBN```

* Identifikator/ISBN/Värde (identifiedBy/Isbn/value = 020 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 9789188107213```

* Identifikator/Särskiljande tillägg (= Bestämning) (identifiedBy/qualifier = 020 ‡q)  
  Skriv in uppgiften.  
  ```Exempel: inbunden```
  
 * Identifikator/Ogiltigt värde (identifiedBy/marc:hiddenValue = 020 ‡z)  
  Skriv in uppgiften.  
  ```Exempel: 97891881072```

* Upplageuppgift (editionStatement = 250 ‡a)  
  Skriv in upplagebeteckning här.  
  ```Exempel: Första upplagan```  
  
* Utgivning (publication)
  Välj typ från lista. För monografier, välj Primär utgivning. (= Typ av utgivningsdatum/utgivningsstatus) (008/06)  
   
  * Land (country = 008/15-17)  
  Länka till entitet.  
  ```Exempel: Sverige (sw)```  
  * Plats/Benämning (= Utgivningsort) (place/label = 264 -/1 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: [Göteborg]```  
  * Agent/Benämning (= Utgivarnamn) (agent/label = 264 -/1 ‡b)  
  Skriv in uppgiften.  Utgivarnamn ska inte länkas som entitet.  
  ```Exempel: NoNa```  
  * Datum (= Utgivningstid) (date = 008/07-10, 264 -/1 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 2017```  

* Tillverkning (manufacture)  
  * Plats/Benämning (place/label = 264 -/3 ‡a)  
  ```Exempel: Falun```  
  * Agent/Benämning (agent/label = 264 -/3 ‡b)  
  Skriv in uppgiften.   
  ```Exempel: Scandbook```
  
* Seriemedlemskap/Ingår i serie (seriesMembership)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften. 
  
* Seriemedlemskap/Serieuppgift (seriesMembership/seriesStatement = 490 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Årstasällskapets skriftserie```  
  
* Seriemedlemskap/Numrering inom serie (seriesMembership/seriesEnumeration = 490 ‡v, 830 ‡v)  
  Skriv in uppgiften.  
  ```Exempel: 8```  
  
* Seriemedlemskap/Indikator för seriebiuppslag (marc:seriesTracingPolicy = 490 i1: 0/1)  
  Ange indikator för seriebiuppslag: 1 om Instans av verk anges, 0 om Instans av verk inte anges. 
  Skriv in uppgiften.  
  ```Exempel: 1```
   
* Seriemedlemskap/Ingår i serie/Instans/Identifikator/ISSN/Värde (seriesMembership/inSeries/Instance/identifiedBy/ISSN/Value) (490 ‡x, 830 ‡x)  
  Skriv in uppgiften.  
  ```Exempel: 1103-498X```    
  
* Seriemedlemskap/Ingår i serie/Instans av Verk/Verk/Har titel/Titel/Huvudtitel (seriesMembership/inSeries/InstanceofWork/Work/hasTitle/Title/mainTitle = 830 ‡a)  
  Skriv in uppgiften.   
  ```Exempel: Årstasällskapets för Fredrika Bremer-studier skriftserie```    
 
* Medietyp (mediaType/Mediatype = 337 ‡b)  
  Länka till entitet.  
  ```Exempel:  n (= omedierad)```

* Bärartyp (carrierType/CarrierType = 338 ‡b)  
  Länka till entitet.  
```Exempel:  nc (= volym)```

* Omfång/Omfång/Benämning (extent/Extent/label = 300 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 319 sidor```

* Mått/Mått/Benämning (hasDimensions/Dimensions/label = 300 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 24 cm```
  
* Anmärkning/Anmärkning/Benämning (hasNote/Note/label = 500 ‡a)  
  Skriv in uppgiften.  
  Skriv in allmänna anmärkningar här. Anmärkningar om specifika fält skrivs in i Kommentar (note) under respektive fält, när sådana specifika anmärkningsfält finns. 

### Verk
* Instans av Verk/Text (instanceOf/Work/Text)

* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 240 1-/0 ‡a)  
  Skriv in uppgiften.  
  ```Exempel:  Soldier spy```

* Medverkan och funktion/Primär medverkan/Agent/Person (contribution/PrimaryContribution/agent/Person = 100 1/- ‡a)  
  Länka till entitet.
  I undantagsfall, skapa lokal entitet och skriv in uppgiften. 
* Medverkan och funktion/Primär medverkan/Agent/Person/Familjenamn (contribution/PrimaryContribution/agent/Person/familyName)
  ```Exempel: Marcus```

* Medverkan och funktion/Primär medverkan/Agent/Person/Förnamn  (contribution/PrimaryContribution/agent/Person/givenName)
  ```Exempel: Tom```

* Medverkan och funktion/Primär medverkan/Agent/Funktion (contribution/PrimaryContribution/agent/role = 100 ‡4)  
  Länka till entitet.  
  ```Exempel: relator/author (= författare)```

* Medverkan och funktion/Medverkan/Agent/Person (contribution/agent/Person = 700 1/- ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Skoglund, Svante, 1960-```

* Medverkan och funktion/Medverkan/Agent/Funktion (contribution/agent/role = 700 ‡4)  
  Länka till entitet.  
  ```Exempel: relator/trl (= översättare)```

* Klassifikation/DDK-klassifikation/Kod (classification/ClassificationDdc/code = 082 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 327.12092```

* Klassifikation/DDK-klassifikation/Klassifikationsupplaga (classification/ClassificationDdc/edition = 082 ‡2)  
  Skriv in uppgiften.  
  ```Exempel: 23/swe```

* Klassifikation/Kod (classification/Classification/code = 084 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Sei-e```

* Klassifikation/Termlista/Termlista/ID (classification/Classification/iinScheme/ConceptScheme = 084 ‡2)  
  Skriv in uppgiften.  
 ```Exempel: https://id.kb.se/term/kssb/8```

* Ämne/Agent/Person (subject/agent/person = 600 1/- ‡a)  
  Länka till entitet. 
  I undantagsfall, skapa lokal entitet. Skriv in uppgiften. 

* Ämne/Agent/Person/Familjenamn (subject/agent/person/familyName)  
  ```Exempel: Marcus```

* Ämne/Agent/Person/Förnamn (subject/agent/person/givenName)  
  ```Exempel: Tom```

* Ämne/Jurisdiktion/Är del av/Jurisdiktion/Namn (subject/Jurisdiction/isPartof/Jurisdiction/name = 610 1/4 ‡a)  
    Länka till entitet.  
    I undantagsfall, skapa lokal entitet. Skriv in uppgiften.  
    ```Exempel: Storbritannien```

* Ämne/Agent/Jurisdiktion/Namn på underordnad enhet (subject/Jurisdiction/isPartof/Jurisdiction/marc:subordinateUnit = 610 ‡b)  
  ```Exempel: MI5```  
  
* Ämne - sao-term (subject = 650 -/7 ‡a, ‡2 sao)  
  Länka till entitet.  
  ```Exempel: Säkerhetspolitik```

* Ämne - sao-term (subject = 650 -/7 ‡a, ‡2 sao)  
  Länka till entitet.  
  ```Exempel: Spionage```

* Ämne - sao-term (subject = 650 -/7 ‡a, ‡2 sao)  
  Länka till entitet.  
  ```Exempel: Terrorismbekämpning```

* Geografiskt ämnesord (subject = 651 -/4 ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Storbritannien```

* Genre/form – saogf-termer (genreForm = 655 -/7 ‡a, ‡2 saogf)  
  Länka till entitet.  
  ```Exempel: Självbiografier```

* Genre/form – litterär genre (genreForm = 008/33)  
  Länka till entitet.  
  ```Exempel: 0 ( = ej skönlitterärt verk)```

* Genre/form – biografiskt material (genreForm = 008/34)  
  Länka till entitet.  
  ```Exempel: a (= självbiografi)```

* Språk (language = 008/35-37)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```

* Översättning av/Verk/Språk (translationOf/Work/language = 041 ‡h)  
  Länka till entitet.  
  ```Exempel: engelska (eng)```

* Innehållstyp (contentType/ContentType = 336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```
