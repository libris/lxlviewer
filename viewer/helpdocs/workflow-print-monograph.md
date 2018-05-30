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

I vissa fall fungerar det ännu inte fullt ut att lägga till alla uppgifter som beskrivs i denna hjälptext. Arbete pågår med förbättra gränssnittet. För att anmäla fel, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLSfOChJOGDoHUQguSF83F5XyTZiQL-yU47nvcqb6qwNT9GX7Aw/viewform). För att lämna synpunkter, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLScgz_0enebhBn6uB8xvowkDBB4ax_dbvaobLSFfqFMoty6eQg/viewform).  

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
  Länka till entitet.  
  ```Exempel: S```

* Bibliografi/Bibliotek/Sigel (bibliography/Library/sigel = 042 ‡9)  
  Länka till entitet.  
  ```Exempel: NB```

* Identifikator/Systemnummer/Värde (identifiedBy/SystemNumber/value = 035 ‡a)  
  Om ett systemnummer finns i förhandspost, till exempel Bokinfos systemnummer, låt det vara kvar oförändrat.    
   ```Exempel: (BOKR)9789188107213```  
 
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```

* Katalogiseringsregler (descriptionConventions = 040 ‡e)  
  För post katalogiserad enligt RDA, länka till entitet: marc/Isbd samt skapa lokal entitet med Kod: rda    
  ```Exempel: marc/Isbd (länkad entitet) + lokal entitet, Kod: rda```

* Beskrivningsnivå (000/17)  
  Länka till entitet.  
  ```Exempel: CIP-post, ändra till biblioteksnivå```
  
* Poststatus (000/05)  
  Uppdateras automatiskt. Ändra inte.   
  ```Exempel: Ny post```  
  ```Exempel: Rättad eller reviderad post```

### Instans
* Utgivningssätt (issuanceType)  
  Välj från lista.  
  ```Exempel: Monografisk resurs```
  
* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 245 ‡a)  
  Återge huvudtiteln från titelsidan eller annan föredragen källa så som den förekommer i källan. se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Tryckta-monografier/#huvudtitel "Anvisningar för katalogisering - RDA").  
  Skriv in uppgiften.    
  ```Exempel: Under cover```  
  ```Exempel: En arbetsdag i skriftsamhället```  
    För en titel som börjar med bestämd eller obestämd artikel, ska artikeln fileras bort. Ange fileringsvärde genom att lägga till delfältet fileringsvärde och ange en siffra. Exempel: Huvudtitel: En arbetsdag i skriftsamhället, fileringsvärde: 3   
    
* Har titel/Titel/Övrig titelinformation (= Undertitel) (hasTitle/Title/subTitle = 245 ‡b)  
  Skriv in uppgiften. Om det finns flera undertitlar, skriv in dessa efter varandra i samma fält, åtskilda av mellanslag, kolon, mellanslag.    
  ```Exempel: livet som underrättelseagent åt MI5```  
  ```Exempel: ett etnografiskt perspektiv på skriftanvändning i vanliga yrken : småskrift utarbetad av Språkrådet```
  
  För att ange originaltitel, se Verk/Har titel/Titel/Huvudtitel.  
    
* Har titel/Varianttitel/Huvudtitel (hasTitle/VariantTitle/mainTitle = 246 ‡a)  
  Skriv in uppgiften.
  
* Har titel/Varianttitel/Övrig titelinformation (= Undertitel) (hasTitle/VariantTitle/subTitle = 246 ‡b)  
  Skriv in uppgiften.    
  
* Omslagstitel, Ryggtitel, Rubriktitel etc - lägg till Har titel och välj typ. För typ av varianttitel som saknas i listan, välj Varianttitel och lägg därefter till Typanmärkning (= 246 ‡i). Lägg därefter till Huvudtitel och eventuell Övrig titelinformation.  
  Skriv in uppgiften.  
   
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
   * År (= Utgivningstid) (date = 008/07-10, 264 -/1 ‡c)  
 Ange utgivningsår, utan klamrar eller andra tecken, endast fyra positioner. Skriv in uppgiften.  
För att ange ett år utan klamrar eller andra tecken, ange det endast här. För att ange klamrar eller andra tecken utöver fyra positioner, använd Datum.  
  ```Exempel: 2017```  
  * Datum (= Utgivningstid) (date = 264 -/1 ‡c)  
 Om du behöver ange ett utgivningsdatum med fler än fyra positioner, skriv in det här. Skriv in uppgiften.  
Om du bara vill ange ett år utan klamrar eller andra tecken, använd endast År.   
  Skriv in uppgiften.  
  ```Exempel: [2017]```  
  ```Exempel: [mellan 1863 och 1866?]```  

* Tillverkning (manufacture)  
  * Plats/Benämning (place/label = 264 -/3 ‡a)  
  ```Exempel: Falun```  
  * Agent/Benämning (agent/label = 264 -/3 ‡b)  
  Skriv in uppgiften.   
  ```Exempel: Scandbook```  
  
* Copyright/Copyright/Datum (copyright/Copyright/date = 264 -/4 ‡c)  
  Skriv in uppgiften. För att få fram copyrighttecknet, se [Specialtecken](https://libris-dev.kb.se/katalogisering/help/search-04-special-chars). Du kan t ex söka på teckenuppsättning i “Sök i windows” och öppna programmet, markera och kopiera tecknet och sedan klistra in det.  
  ```Exempel: ©2017``` 
  
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
  
* Övriga fysiska detaljer (other physical details = 300 ‡b)  
  Skriv in uppgiften.  
  ```Exempel: illustrationer```

* Mått/Mått/Benämning (hasDimensions/Dimensions/label = 300 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 24 cm```
  
* Anmärkning/Anmärkning/Benämning (hasNote/Note/label = 500 ‡a)  
  Skriv in uppgiften.  
  Skriv in allmänna anmärkningar här. Anmärkningar om specifika fält skrivs in i Kommentar (note) under respektive fält, när sådana specifika anmärkningsfält finns. 
  
* Målgrupp/Målgrupp/Benämning (intendedAudience/IntendedAudience/label = 521 ‡a)   
  Skriv in uppgiften.    
  ```Exempel: För årskurs 1```   

### Verk

* Instans av Verk/Text (instanceOf/Work/Text)

Skapa verket som lokal entitet eller bryt ut verket till en länkbar entitet. Vi rekommenderar att du skapar verket som lokal entitet under den första tiden som Nya Libris är i drift. Vi återkommer med anvisningar för att skapa verk som länkbara entiteter. Denna hjälptext beskriver exempel på verk som lokal entitet. Det betyder att du anger de uppgifter som listas här nedan, under Instans av Verk, utan att klicka på länksymbolen (Länka entitet) vid Instans av Verk.

* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 240 1-/0 ‡a)  
  Ange den föredragna titeln för verket här, vid behov. Följ [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/Anvisningar/Allmanna-anvisningar/Sokingangar-for-verk-och-uttryck "Anvisningar för katalogisering - RDA").
  För översättningar och för verk som har givits ut under olika titlar på samma språk eller när samma titel har använts för olika verk, ska den föredragna titeln för verket anges. För övriga verk, hoppa över detta fält.  
  "Originaltitel" anger du här.  
  Skriv in uppgiften.  
  ```Exempel:  Soldier spy```
  
* Språk (language = 008/35-37)  
  Här anger du det språk som den text du beskriver är skriven på. För en text på svenska, ange svenska. För att ange      originalspråk för ett översatt verk, se Översättning av/Verk/Språk.  
  Länka till entitet.  
  ```Exempel: svenska (swe)```
  
  För en översättning, ange även:
* Språk/Benämning (Language/label = 240 ‡l)  
  Skriv in språket i klartext. Det du skriver här - verkets (översättningens) språk - visas som ett tillägg till verkets titel i marcpostens 240 ‡l.  
  ```Exempel: Svenska```  

* Översättning av/Verk/Språk (translationOf/Work/language = 041 ‡h)  
  Här anger du det språk som en översatt text är översatt från. För en text som är översatt från engelska till svenska, ange   engelska här.  
  Länka till entitet.  
  ```Exempel: engelska (eng)```

* Medverkan och funktion/Primär medverkan/Agent/Person (contribution/PrimaryContribution/agent/Person = 100 1/- ‡a)  
  Länka till entitet.
  I undantagsfall, skapa lokal entitet och skriv in uppgiften. 
* Medverkan och funktion/Primär medverkan/Agent/Person/Efternamn (contribution/PrimaryContribution/agent/Person/familyName)  
  ```Exempel: Marcus```

* Medverkan och funktion/Primär medverkan/Agent/Person/Förnamn  (contribution/PrimaryContribution/agent/Person/givenName)  
  ```Exempel: Tom```

* Medverkan och funktion/Primär medverkan/Funktion (contribution/PrimaryContribution/role = 100 ‡4)  
  Länka till entitet.  
  ```Exempel: relator/author (= författare)```

* Medverkan och funktion/Medverkan/Agent/Person (contribution/agent/Person = 700 1/- ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Skoglund, Svante, 1960-```

* Medverkan och funktion/Medverkan/Funktion (contribution/role = 700 ‡4)  
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
  
 * Målgrupp (intendedAudience = 008/22)  
  Länka till entitet.  
  ```Exempel: j (= barn- och ungdom, 0-16 år)```  
  
* Innehållstyp (contentType/ContentType = 336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```
