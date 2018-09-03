---
section: Arbetsflöden
title: Tryckt monografi - bok
order: 15
date: 2018-08-28
tags:
- editor
- under arbete
--- 

## Tryckt monografi -bok

Denna hjälptext beskriver ett antal vanligt förekommande fält, med utgångspunkt från exempel. För instruktioner om att länka till entitet, skapa lokal entitet och om hur formuläret fungerar i övrigt, se Redigering i vänstermenyn. För information om katalogregler, skrivregler och övriga katalogiseringsanvisningar, se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Tryckta-monografier/ "Anvisningar för katalogisering - RDA").

I de flesta fall ska informationen delas upp i olika fält och delfält. I några undantagsfall är det nödvändigt att använda ISBD-interpunktion inom fält, för att separera uppgifter. Dessa fall visas genom exempel nedan. I övriga fall, lägg inte in ISBD-interpunktion för att avsluta ett fält. Använd vid behov klamrar inom fält, enligt Anvisningar för katalogisering - RDA.

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

* Uppgraderad eller importerad av/Bibliotek/Sigel (descriptionUpgrader/Library/sigel = 040 ‡d)  
  Om beskrivningsnivån uppgraderas, lägg till denna uppgift. Vid postimport, lägg till uppgiften. Lägg inte till uppgiften när posten endast ändras utan att beskrivningsnivån uppgraderas.  
  Skapa lokal entitet. Klicka på Lägg till agent (+-ikonen vid Uppgraderad eller importerad av), välj därefter Skapa lokal entitet och välj Bibliotek i listan. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.     
  ```Exempel: S```  

* Bibliografi/Bibliotek/Sigel (bibliography/Library/sigel = 042 ‡9)  
  Observera att bibliografikod ska läggas endast av det bibliotek som arbetar med respektive bibliografi. Som exempel läggs bibliografikod NB endast av NB.  
  Skapa lokal entitet. Klicka på Lägg till bibliotek (+-ikonen vid Bibliografi), välj därefter Skapa lokal entitet. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.  
  ```Exempel: NB```  
  ```Exempel: SAMB```  

* Identifikator/Systemnummer/Värde (identifiedBy/SystemNumber/value = 035 ‡a)  
  Om ett systemnummer finns i förhandspost, till exempel Bokinfos systemnummer, låt det vara kvar oförändrat.  
  ```Exempel: (BOKR)9789188107213```  
  För att lägga till ett lokalt systemnummer, till exempel ett DiVA-urn, lägg till Identifikator genom att klicka på +-fält (i Adminmetadata). Välj typ Lokal identifikator. Lägg till Värde genom att klicka på +-tecknet vid Lokal identifikator och välja Värde. Fyll i aktuellt systemnummer.  
  ```Exempel: (DIVA)urn:nbn:se:su:diva-83163```
 
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```

* Katalogiseringsregler (descriptionConventions = 040 ‡e)  
  För post katalogiserad enligt RDA, sök fram och länka till entitet: "ISBD-interpunktions finns: i" (välj Regler för deskriptiv katalogisering vid sökningen). När man skapar ny post från mall visas entiteten som "marc/isbd". I en sparad post visas samma entitet som "ISBD information finns". Båda är rätt.      
  Skapa också lokal entitet under Katalogiseringsregler, välj typ Katalogiseringsregler. Lägg till Kod. Skriv in "rda".    
  ```Exempel: marc/Isbd (länkad entitet) + lokal entitet, Kod: rda```

* Beskrivningsnivå (000/17)  
  Välj från lista.   
  ```Exempel: CIP-post, ändra till biblioteksnivå```
  
* Poststatus (000/05)  
  Uppdateras automatiskt. Ändra inte.   
  ```Exempel: Ny post```  
  ```Exempel: Rättad eller reviderad post```
  
 * Systemteknisk anmärkning/Benämning (599)  
 
 Följande anmärkningar är under arbete och fungerar ännu inte fullt ut:  
 * Katalogisatörens anmärkning  
 * Anmärkning om katalogiseringskälla  
 

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
 Se exempel i formathandboken för Libris/Voyager: 
[Fileringsindikator]( http://www.kb.se/katalogisering/Formathandboken/Fileringsindikator/)
 
* Har titel/Titel/Övrig titelinformation (= Undertitel) (hasTitle/Title/subtitle = 245 ‡b)  
  Skriv in uppgiften. Om det finns flera undertitlar, skriv in dessa efter varandra i samma fält, åtskilda av mellanslag, kolon, mellanslag.    
  ```Exempel: livet som underrättelseagent åt MI5```  
  ```Exempel: ett etnografiskt perspektiv på skriftanvändning i vanliga yrken : småskrift utarbetad av Språkrådet```
  
  För att ange originaltitel, se Verk/Har titel/Titel/Huvudtitel.  
    
* Har titel/Varianttitel/Huvudtitel (hasTitle/VariantTitle/mainTitle = 246 ‡a)  
  Skriv in uppgiften.
  
* Har titel/Varianttitel/Övrig titelinformation (= Undertitel) (hasTitle/VariantTitle/subtitle = 246 ‡b)  
  Skriv in uppgiften.  
  
* Har titel/Parallelltitel. Välj först Har titel, välj sedan typ Parallelltitel (246, ind1: 1, ind2: 1 = ParallelTitle). Välj Huvudtitel.    
Skriv in uppgiften.  
  ```Exempel: Har titel/Parallelltitel/Huvudtitel: The Great Northern War explained```  
Vid behov, klicka även på +-tecknet vid Parallelltitel och lägg till Övrig titelinformation (subtitle).  
```Exempel: Har titel/Parallelltitel/Övrig titelinformation: Charles XII and the ideological address```  
Det är tillåtet men inte nödvändigt att också göra följande. För att parallelltiteln även ska hamna i 245 ‡b med ISBD-interpunktion, lägg önskad ISBD-interpunktion direkt i Har titel/Titel/Huvudtitel/Övrig titelinformation (hasTitle/Title/mainTitle/subtitle).  
   ```Exempel: Har titel/Titel/Övrig titelinformation: Karl XII och det ideologiska tilltalet = The Great Northern War explained : Charles XII and the ideological address``` 
  
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
  Välj typ från lista. För monografier, använd Primär utgivning.  
  I konverterade och maskininlästa poster finns det ibland två avsnitt: ett Primär utgivning med År och Land, och ett Utgivning med Plats, Agent och Datum. När man redigerar maskininlästa poster med två utgivningsavsnitt får man, om man bedömer det nödvändigt, flytta uppgifterna om Plats, Agent och Datum till avsnittet Primär utgivning och ta bort avsnittet Utgivning.   
  
  * Land (country = 008/15-17)  
  Länka till entitet.  
  ```Exempel: Sverige (sw)```  
  * Plats/Plats/Benämning (= Utgivningsort) (place/label = 264 -/1 ‡a)  
  För att lägga till Plats, klicka på Lägg till fält under Primär utgvning och välj Plats. Sök inte efter Plats som entitet utan välj istället Skapa lokal entitet, typ Plats. Lägg till Benämning.  
  Skriv in uppgiften. Klamra vid behov. Plats ska inte länkas som entitet.  
  ```Exempel: [Göteborg]```  
  * Agent/Agent//Benämning (= Utgivarnamn) (agent/label = 264 -/1 ‡b)  
  För att lägga till Agent, klicka på Lägg till fält under Primär utgivning och välj Agent. Sök inte efter Agent som entitet utan välj istället Skapa lokal entitet, typ Agent. Lägg till Benämning.  
  Skriv in uppgiften. Klamra vid behov. Utgivarnamn ska inte länkas som entitet.  
  ```Exempel: NoNa```   
  Om flera utgivare ska anges, lägg till "Har del" (hasPart) under Primär utgivning. Lägg därefter till Utgivning som lokal entitet (klicka på +-ikonen vid Har del och klicka sedan på Skapa lokal entitet. Välj Utgivning i listan). Använd År och vid behov Datum enligt anvisningar nedan. Upprepa Utgivning som lokal entitet för nästa utgivare.
  Se [exempel](https://libris.kb.se/katalogisering/w4rp4hlwtr5lctjr#it).
  
  * År (= Utgivningstid) (date = 008/07-10, 264 -/1 ‡c)  
  År får endast innehålla siffror (0-9) och bokstaven u. År ska endast förekomma inom Primär utgivning.  
  Ange utgivningsår, utan klamrar eller andra tecken, endast fyra positioner. Skriv in uppgiften.  
  För att ange ett år utan klamrar eller andra tecken, ange det endast här. Det kommer då att exporteras till både marcpostens 08/07-10 och 264 -/1 ‡c. För att ange årtal med klamrar eller andra tecken utöver fyra positioner, använd Datum.  
  ```Exempel: 2017```  
  * Datum (= Utgivningstid) (date = 264 -/1 ‡c)  
  Datum får innehålla text och interpunktionstecken.  
  För att ange ett utgivningsdatum med fler än fyra positioner, till exempel ett klamrat årtal, skriv in det här. Det kommer att exporteras till marcpostens  264 -/1 ‡c. Skriv in uppgiften.  
  För att ange ett år utan klamrar eller andra tecken, använd endast År.   
  Skriv in uppgiften.  
  ```Exempel: [2017]```   
  ```Exempel: [mellan 1863 och 1866?]```  
  
  * Flera år (flerbandsverk)  
 Använd Startår och Slutår. Fälten ska ligga i avsnittet Primär utgivning. Om årtalen anges utan klammer eller andra tecken utöver fyra positioner, räcker det att ange årtalen här. De exporteras då både som 008 och 264 ‡c. Bindestreck sätts automatiskt. För att få rätt kod i 008/06 (Typ av utgivningsdatum/Utgivningsstatus) vid MARC-export: lägg till Typ av utgivningsdatum (marc:publicationStatus) (klicka på +-tecknet vid Primär utgivning) och välj ”Flera årtal (monografisk resurs)".    
```Exempel: ```  
```Startår: 1999 ```  
```Slutår: 2017```  
```Typ av utgivningsdatum: Flera årtal (monografisk resurs)```    

 Läs mer om [År och Datum](https://kundo.se/org/librisxl/d/falt-for-utgivningsar/)  

* Tillverkning (manufacture)  
  * Plats/Benämning (place/label = 264 -/3 ‡a)  
  ```Exempel: Falun```  
  * Agent/Benämning (agent/label = 264 -/3 ‡b)  
  Skriv in uppgiften.   
  ```Exempel: Scandbook```  
  * Datum (= Tillverkningstid) (date = 264 -/3 ‡c)  
   Skriv in uppgiften. Klamra vid behov.  
  ```Exempel: 2017```  
  ```Exempel: [2017]```  
  
* Copyright/Copyright/Datum (copyright/Copyright/date = 264 -/4 ‡c)  
  Skriv in uppgiften. För att få fram copyrighttecknet, se [Specialtecken](https://libris-dev.kb.se/katalogisering/help/search-04-special-chars). Du kan t ex söka på teckenuppsättning i “Sök i windows” och öppna programmet, markera och kopiera tecknet och sedan klistra in det.  
  ```Exempel: ©2017``` 
  
* Omfång/Omfång/Benämning (extent/Extent/label = 300 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 319 sidor```  
  
* Övriga fysiska detaljer (other physical details = 300 ‡b)  
  Skriv in uppgiften.  
  ```Exempel: illustrationer```

* Mått/Mått/Benämning (hasDimensions/Dimensions/label = 300 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 24 cm```   
  
* Tillsammans med/Instans/Benämning (Bilagor) (accompaniedBy/Instance/label = 300 ‡e)  
  Under Instans, lägg till Tillsammans med. Lägg därefter till Instans, som lokal entitet, genom att klicka på +-tecknet vid Tillsammans med och därefter välja Skapa lokal entitet. Väj Instans i listan. Lägg därefter till Benämning. Skriv in uppgiften.  
   ```Exempel: 10 mönsterark```  
  
* Medietyp (mediaType/Mediatype = 337 ‡b)  
  Länka till entitet.  
  ```Exempel:  n (= omedierad)```

* Bärartyp (carrierType/CarrierType = 338 ‡b)  
  Länka till entitet.  
```Exempel:  nc (= volym)```  

* Seriemedlemskap/Ingår i serie (seriesMembership)  
  Avvakta med att skapa verk som länkade entiteter. Beskriv serien som lokal entitet, enligt exempel nedan.  
  
  Avsnittet Seriemedlemskap är under utredning. För närvarande måste man fylla i två Seriemedlemskap för att vid export till MARC få ut både 490 och 830. Om serien har ett ISSN ska även Identifikator/ISSN läggas till båda seriemedlemskapen. [Läs mer om seriemedlemskap](https://kundo.se/org/librisxl/d/uppgifter-om-seriemedlemskap-saknas-i-marc-export/).  
   
* Seriemedlemskap/Indikator för seriebiuppslag (marc:seriesTracingPolicy = 490 i1: 0/1)  
  Ange indikator 0 om endast serieuppgift samt eventuellt ISSN och eventuell numrering inom serie ska anges (om det inte finns en seriehuvudpost).   
    ```Exempel: 0```  
  Ange indikator 1 om Seriemedlemskap/Ingår i serie/Instans av Verk/Verk/Har titel/Titel/Huvudtitel (motsvarande 830 i MARC) anges (om det finns en seriehuvudpost).  
  Skriv in uppgiften.  
  ```Exempel: 1```  
  
* Seriemedlemskap/Serieuppgift (seriesMembership/seriesStatement = 490 ‡a)  
  Skriv in uppgiften.  
   ```Exempel: Årstasällskapets skriftserie```  
  
* Seriemedlemskap/Numrering inom serie (seriesMembership/seriesEnumeration = 490 ‡v, 830 ‡v)  
  Skriv in uppgiften.  
  ```Exempel: 8```  
  
* Seriemedlemskap/Ingår i serie/Instans/Identifikator/ISSN/Värde (seriesMembership/inSeries/Instance/identifiedBy/ISSN/Value) (490 ‡x, 830 ‡x)  
  Skriv in uppgiften.  
  ```Exempel: 1103-498X```    
  
* Seriemedlemskap/Ingår i serie/Instans av Verk/Verk/Har titel/Titel/Huvudtitel (seriesMembership/inSeries/InstanceofWork/Work/hasTitle/Title/mainTitle = 830 ‡a)  
  Skriv in uppgiften.   
  ```Exempel: Årstasällskapets för Fredrika Bremer-studier skriftserie```    

* Anmärkning/Anmärkning/Benämning (hasNote/Note/label = 500 ‡a)   
  Skriv in allmänna anmärkningar här.    
  Skriv in uppgiften.  
  
 * Har innehållsförteckning (innehållsanmärkning) (tableofContents = 505)  
 För en innehållsanmärkning med endast oformaterad text (505 ‡a), lägg till Innehållsförteckning under Har innehållsförteckning, lägg därefter till Benämning.  
 För en formaterad innehållsanmärkning (505 ‡t, ‡r), lägg till Innehållsförteckning under Har innehållsförteckning, lägg därefter till Har del/Utökad innehållsanmärkning som lokal entitet. Lägg därefter till Benämning och eventuell Upphovsuppgift.  
  
* Målgrupp/Målgrupp/Benämning (intendedAudience/IntendedAudience/label = 521 ‡a)   
  Skriv in uppgiften.    
  ```Exempel: För årskurs 1```  
  
* Relation/Relation/Entitet/Verk/Har titel/Titel/Huvudtitel (relationship/Relationship/entity/Work/hasTitle/Title/mainTitle = 740)  
Ange alternativa titlar här för att öka sökbarheten för titlar som innehåller exempelvis specialtecken, siffror eller oväntade stavningar av ord.  

* Annat bärarformat (otherPhysicalFormat = 776)  
  För att länka till en utgåva i annat format, till exempel en elektronisk utgåva, lägg till Annat bärarformat genom att klicka på Lägg till fält. Välj Annat bärarformat.  
  Skapa en instans som lokal entitet genom att klicka på +-tecknet vid Annat bärarformat (lägg till instans). Klicka på Skapa lokal entitet och välj Instans. 
* Annat bärarformat/Har titel/Titel (776 ‡t)  
  Under Instans, lägg till titel genom att klicka på +-tecknet vid Instans (Lägg till fält under: Instans) och välj Har titel. Välj Titel. Ta bort Övrig titelinformation och skriv in huvudtiteln under Huvudtitel. 
* Annat bärarformat/Identifikator/ISBN/Värde (776 ‡x)  
  Under Instans, lägg till identifikator genom att klicka på +-tecknet vid Instans (Lägg till fält under: Instans) och välj Identifikator. Välj typ ISBN. Skriv in ISBN för den utgåva du vill länka till under Värde.  
* Annat bärarformat/Beskriven av/Post/Kontrollnummer (776 ‡w)  
  Beskriven av/Post/Kontrollnummer, motsvarande delfält w, är för närvarande låst för redigering. Det går därmed inte att lägga till fältet eller redigera det i befintliga beskrivningar.  


### Verk

* Instans av Verk/Text (instanceOf/Work/Text)  
  Skapa verket som lokal entitet (bryt inte ut verket till en länkbar entitet). Vi rekommenderar att du skapar verket som lokal entitet under den första tiden som Nya Libris är i drift. Vi återkommer med anvisningar för att skapa verk som länkbara entiteter. Denna hjälptext beskriver exempel på verk som lokal entitet. Det betyder att du anger de uppgifter som listas här nedan, under Instans av Verk, utan att klicka på länksymbolen (Länka entitet) vid Instans av Verk/Text.  
Läs mer om [Verk och Instans](https://librisbloggen.kb.se/2018/05/30/verk-och-instans-i-startversionen/).  

* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 240 1/0 ‡a)  
  Ange den föredragna titeln för verket här, vid behov. Följ [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/Anvisningar/Allmanna-anvisningar/Sokingangar-for-verk-och-uttryck "Anvisningar för katalogisering - RDA").
  För översättningar och för verk som har givits ut under olika titlar på samma språk eller när samma titel har använts för olika verk, ska den föredragna titeln för verket anges. För övriga verk, hoppa över detta fält.  
  "Originaltitel" anger du här.  
  Skriv in uppgiften.  
  ```Exempel:  Soldier spy```  
  För en titel som börjar med bestämd eller obestämd artikel, ska artikeln fileras bort. Ange fileringsvärde genom att lägga till delfältet fileringsvärde och ange en siffra. Exempel: Huvudtitel: En arbetsdag i skriftsamhället, fileringsvärde: 3   
  
* Språk (language = 008/35-37)  
  Ange det språk som den text du beskriver är skriven på. För en text på svenska, ange svenska. För att ange originalspråk för ett översatt verk, se Originalversion/Verk/Språk.  
  Länka till entitet.  
  ```Exempel: svenska (swe)```
  
  För en översättning, ange även:  
* Språk/Språk/Benämning (Language/label = 240 ‡l)  
  Lägg till ytterligare en förekomst av Språk, under Språk (klicka på +-tecknet vid Språk), skapa lokal entitet (klicka på Skapa lokal entitet) och lägg till Benämning (klicka på Lägg till fält under: Språk).  
  Skriv in språket i klartext. Denna klartext - verkets (översättningens) språk - visas som ett tillägg till verkets titel i marcpostens 240 ‡l.  
  ```Exempel: Svenska```  

* Anmärkning: Språk (marc:LanguageNote = 041 i1: 1)  
  Ange om resursen är/innehåller en översättning. Välj från lista.  
  ```Exempel: objektet är/innehåller översättning```  
  
* Anmärkning/Anmärkning om språk/Anmärkning: Språk/Benämning (hasNote/marc:LanguageNote/marc:LanguageNote/label = 546 ‡a)  
  ```Exempel: Parallelltext på svenska och engelska```  
  Anmärkningen är under arbete och fungerar tyvärr ännu inte.  

* Originalversion/Verk/Språk (originalversion/Work/language = 041 ‡h)  
  Ange det språk som en översatt text är översatt från. För en text som är översatt från engelska till svenska, ange engelska här.   
   Klicka på Lägg till fält under: Text, välj Originalversion, klicka på +-tecknet vid Originalversion, välj Skapa lokal entitet och välj Verk i listan. Klicka på +-tecknet vid Verk (Lägg till fält under: Verk) och välj Språk. Klicka på +-tecknet vid Språk. Sök fram språkentiteten och länka.  
  ```Exempel: engelska (eng)```
  
* Medverkan och funktion  
  Läs [Auktoritetsgruppens rekommendationer](https://kundo.se/org/librisxl/d/kbs-auktoritetsgrupp-informerar-jraz/)  
  
* Medverkan och funktion/Primär medverkan/Agent/Person (contribution/PrimaryContribution/agent/Person = 100 1/- ‡a)  
  Länka till entitet. Börja alltid med att söka efter om agenten redan finns. Klicka på Länka entitet (länkikonen) vid Person. I sökrutan, skriv in sökbegrepp, till exempel "Lindgren, Astrid". Om agenten visas i träfflistan, högerklicka på entiteten, öppna den i ny flik eller nytt fönster och granska den. Är agenten rätt, gå tillbaka till katalogiseringsformuläret och länka till den genom att klicka på Ersätt lokal entitet.  
  Saknas auktoriserad namnform (som konstaterats vid sökning i pop up-rutan för Länka entitet), stäng pop up-rutan och ange kända uppgifter i formuläret.  
 ```Exempel: Lindgren, Astrid, 1907-2002```

* Medverkan och funktion/Primär medverkan/Funktion (contribution/PrimaryContribution/role = 100 ‡4)  
  Länka till entitet.  
  ```Exempel: relator/author (= författare)```

* Medverkan och funktion/Medverkan/Agent/Person (contribution/agent/Person = 700 1/- ‡a)  
  Länka till entitet. Börja alltid med att söka efter om agenten redan finns. Klicka på Länka entitet (länkikonen) vid Person. i Sökrutan, skriv in sökbegrepp, till exempel "Skoglund, Svante". Om agenten visas i träfflistan, högerklicka på entiteten, öppna den i ny flik eller nytt fönster och granska den. Är agenten rätt, gå tillbaka till katalogiseringsformuläret och länka till den genom att klicka på Ersätt lokal entitet.  
  Saknas auktoriserad namnform (som konstaterats vid sökning i pop up-rutan för Länka entitet), stäng pop up-rutan och ange kända uppgifter i formuläret.  
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

* Klassifikation/Termlista/Termlista/ID (classification/Classification/inScheme/ConceptScheme = 084 ‡2)  
  Skriv in uppgiften.  
 ```Exempel: https://id.kb.se/term/kssb/8```

* Ämne  
  Läs mer:  
  [Lägg till auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-linked-entity-sh)  
  [Lägg till kontrollerade men ej auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-controlled-non-auth-sh)  
  [Lägg till sammansatta men ej auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-non-auth-sh)  
  
* Ämne/Agent/Person (subject/agent/person = 600 1/- ‡a)  
  Länka till entitet. 
  I undantagsfall, skapa lokal entitet. Skriv in uppgiften. 

* Ämne/Agent/Person/Efternamn (subject/agent/person/familyName)  
  ```Exempel: Marcus```

* Ämne/Agent/Person/Förnamn (subject/agent/person/givenName)  
  ```Exempel: Tom```

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
  För att söka efter entiteter inom saogf-termer, välj Genre/form i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
  ```Exempel: Självbiografier```

* Genre/form – litterär genre (genreForm = 008/33)  
  Länka till entitet.  
  För att söka efter entiteter inom Litterär genre, välj Litterär genre i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
  ```Exempel: 0 ( = ej skönlitterärt verk)```

* Genre/form – biografiskt material (genreForm = 008/34)  
  Länka till entitet.  
  För att söka efter entiteter inom Biografiskt material, välj Biografiskt material i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
    ```Exempel: a (= självbiografi)```  
    
* Genre/form – festskrift (genreForm = 008/30)  
  Länka till entitet.  
  För att söka efter entiteter inom Festskrift, välj Festskrift i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
    ```Exempel: Ja, resursen är en festskrift```       
       
* Genre/form – konferenspublikation (genreForm = 008/29)  
  Länka till entitet.  
  För att söka efter entiteter inom Konferenspublikation, välj Konferenspublikation i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till. 
     ```Exempel: Ja, resursen härrör från konferens```     
  
 * Målgrupp (intendedAudience = 008/22)  
  Länka till entitet.  
  Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
  ```Exempel: j (= barn- och ungdom, 0-16 år)```  
  
* Innehållstyp/Innehållstyp (contentType/ContentType = 336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```  
  För att lägga till ytterligare innehållstyp, till exempel "sti" = stillbild för en bilderbok med både text och bild, lägg till Har del under Instans av Verk, från +-tecknet vid Text (Lägg till fält under: Text). Skapa därefter Verk som lokal entitet genom att klicka på +-tecknet vid Har del (Lägg till resurs). Välj Skapa lokal entitet och välj därefter ++Verk i listan. Lägg därefter till Innehållstyp från +-tecknet vid Verk (Lägg till fält under: Verk). Sök fram och länka till entitet.    
