---
section: Arbetsflöden
title: Tryckt seriell resurs
order: 25
date: 2018-08-28
tags:
- editor
- under arbete
--- 

## Tryckt seriell resurs

Denna hjälptext beskriver ett antal vanligt förekommande fält, med utgångspunkt från exempel. För instruktioner om att länka till entitet, skapa lokal entitet och om hur formuläret fungerar i övrigt, se Redigering i vänstermenyn. För information om katalogregler, skrivregler och övriga katalogiseringsanvisningar, se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Tryckta-seriella-resurser/ "Anvisningar för katalogisering - RDA").

I de flesta fall ska informationen delas upp i olika fält och delfält. I några undantagsfall är det nödvändigt att använda ISBD-interpunktion inom fält, för att separera uppgifter. Dessa fall visas genom exempel nedan. Använd vid behov också klamrar inom fält, enligt Anvisningar för katalogisering - RDA.

I vissa fall fungerar det ännu inte fullt ut att lägga till alla uppgifter som beskrivs i denna hjälptext. Arbete pågår med förbättra gränssnittet. För att anmäla fel, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLSfOChJOGDoHUQguSF83F5XyTZiQL-yU47nvcqb6qwNT9GX7Aw/viewform). För att lämna synpunkter, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLSfOChJOGDoHUQguSF83F5XyTZiQL-yU47nvcqb6qwNT9GX7Aw/viewform).  

Exempel hämtade från:
Kammarmusik-nytt, ISSN 2001-2721, Voyager BibID 12683491  
Familjehemsnytt, ISSN 2002-0694, Voyager BIBID 17852499  
samt andra poster.

[Adminmetadata](#adminmetadata)  
[Instans](#instans)  
[Verk](#verk)  


### Adminmetadata  
* Skapad av/Organisation/Namn (descriptionCreator/Organization/name = 040 ‡a)  
  Förval: den sigel som skapat posten. Ska inte ändras.  
  ```Exempel: S```  
  
* Uppgraderad eller importerad av/Bibliotek/Sigel (descriptionUpgrader/Library/sigel = 040 ‡d)  
  Om beskrivningsnivån ändras, lägg till denna uppgift. Vid postimport, lägg till uppgiften.  
  Skapa lokal entitet. Klicka på Lägg till agent (+-ikonen vid Uppgraderad eller importerad av), välj därefter Skapa lokal entitet. Välj Bibliotek i rullgardinsmenyn. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.     
  ```Exempel: S```  

* Bibliografi/Bibliotek/Sigel (bibliography/Library/sigel = 042 ‡9)  
  Observera att bibliografikod ska läggas endast av det bibliotek som arbetar med respektive bibliografi. Som exempel läggs bibliografikod NB endast av NB.  
 Skapa lokal entitet. Klicka på Lägg till bibliotek (+-ikonen vid Bibliografi), välj därefter Skapa lokal entitet. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.  
  ```Exempel: NB```  
  ```Exempel: SAMB```  
  
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)   
  Länka till entitet.  
  ```Exempel: svenska (swe)```  

* Katalogiseringsregler (descriptionConventions = 040 ‡e)  
För post katalogiserad enligt RDA, sök fram och länka till entitet: "ISBD-interpunktions finns: i" (välj Regler för deskriptiv katalogisering vid sökningen). När man skapar ny post från mall visas entiteten som "marc/isbd". I en sparad post visas samma entitet som "ISBD information finns". Båda är rätt.  
Skapa också lokal entitet under Katalogiseringsregler, välj typ Katalogiseringsregler. Lägg till Kod. Skriv in "rda".  
 ```Exempel: marc/Isbd (länkad entitet) + lokal entitet, Kod: rda ```

* Beskrivningsnivå (000/17)  
  Välj från lista.    
  ```Exempel: nationalbibliografisk/fullständig nivå```
  
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
  ```Exempel: Seriell resurs```
  
* Har titel/Nyckeltitel/Huvudtitel (hasTitle/KeyTitle/mainTitle = 222 -/0 ‡a)  
  Länka till entitet.
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  Kammarmusik-nytt```  

* Har titel/Nyckeltitel/Särskiljande tillägg (hasTitle/KeyTitle/qualifier = 222 ‡b)  
  Skriv in uppgiften, inom parentes.  
  ```Exempel:  (Brämhult)```

* Har titel/Titel/Huvudtitel (hasTitle/Title/mainTitle = 245 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusik-nytt```  
  
* Har titel/Titel/Övrig titelinformation (hasTitle/Title/subtitle = 245 ‡b)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusikförbundets tidskrift```
  
* Har titel/Titelvariant/Huvudtitel (hasTitle/DistinctiveTitle/mainTitle = 246 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Hushållningssällskapets magasin```  
  
* Har titel/Titelvariant/Täckning eller tillkomst (hasTitle/DistinctiveTitle/coverage = 246 #f)  
  Skriv in uppgiften.  
  ```Exempel: 2011, nr 4-2012, nr 4``` 
  
* Identifikator/Typ (identifiedBy)  
  Välj från lista.  
  ```Exempel: ISSN```  
  
* Identifikator/ISSN/Värde (identifiedBy/Issn/value = 022 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 2001-2721```

* Identifikator/Källa/Nationell ISSN-central/Kod (identifiedBy/source/marc:NationalIssnCentre = 022 #f)  
  Skapa lokal entitet. Skriv in uppgiften.  
  ```Exempel: f (= ISSN Sverige)```  
  
* Identifikator/Internationellt intresse (identifiedBy/marc:internationalInterest = 022 ind1: 0)  
  Skriv in uppgiften.     
  ```Exempel: true```  
  
* Identifikator/Felaktigt ISSN (identifiedBy/marc:incorrectIssn = 022 ‡y)  
  Skriv in uppgiften.   
  ```Exempel: 1653-2945```

* Utgivning  
  Välj typ från lista. För seriella resurser med endast en utgivare, använd Primär utgivning.  
  För att beskriva en seriell resurs med flera utgivningsperioder (motsvarande 264, indikator 1 - sekvens av utgivaruppgifter) saknas vissa delar av formatet. Dessa är under arbete.  
  
  * Land (country = 008/15-17)  
  Länka till entitet.  
  ```Exempel: Sverige (sw)```  
  * Plats/Plats/Benämning (= Utgivningsort) (place/label = 264 -/1 ‡a)  
  För att lägga till Plats, klicka på Lägg till fält under Primär utgvning och välj Plats. Sök inte efter Plats som entitet utan välj istället Skapa lokal entitet, typ Plats. Lägg till Benämning.  
  Skriv in uppgiften. Klamra vid behov. Plats ska inte länkas som entitet.  
  ```Exempel: [Göteborg]```  
  * Agent/Benämning (= Utgivarnamn) (agent/label = 264 -/1 ‡b)  
  För att lägga till Agent, klicka på Lägg till fält under Primär utgivning och välj Agent. Sök inte efter Agent som entitet utan välj istället Skapa lokal entitet, typ Agent. Lägg till Benämning.  
  Skriv in uppgiften. Klamra vid behov. Utgivarnamn ska inte länkas som entitet.  
  ```Exempel: NoNa```  
  Om flera utgivare ska anges, lägg till "Har del" (hasPart) under Primär utgivning. Lägg därefter till Utgivning som lokal entitet (klicka på +-ikonen vid Har del och klicka sedan på Skapa lokal entitet. Välj Utgivning i listan). Använd Startår, slutår och vid behov Datum enligt anvisningar nedan. Upprepa Utgivning som lokal entitet för nästa utgivare.
  Se [exempel](https://libris.kb.se/katalogisering/1kcsx46c1pmjdxz#it).  
  
  * Startår (startYear = 008/7-10)  
  Startår får endast innehålla siffror (0-9) och bokstaven u. Startår ska endast förekomma inom Primär utgivning.  
  För att ange ett startår utan klamrar eller andra tecken, ange det endast här. Det kommer då att exporteras till både marcpostens 08/07-10 och 264 -/1 ‡c. Bindestreck sätts automatiskt. För att ange årtal med klamrar eller andra tecken utöver fyra positioner, använd Datum.  
  Skriv in uppgiften.  
    ```Exempel: 2011```  
  * Slutår (endYear = 008/11-14)  
  Slutår får endast innehålla siffror (0-9) och bokstaven u. Slutår ska endast förekomma inom Primär utgivning.  
  För att ange ett slutår utan klamrar eller andra tecken, ange det endast här. Det kommer då att exporteras till både marcpostens 08/11-14 och 264 -/1 ‡c. Bindestreck sätts automatiskt. För att ange årtal med klamrar eller andra tecken utöver fyra positioner, använd Datum.   
  Om slutår inte anges, sätts utgivningsstatus (008/06) automatiskt till "c = Utgivning pågår".  
  Om slutår anges, sätts utgivningsstatus (008/06) automatiskt till "d = Utgivning avslutad".  
  Skriv in uppgiften.  
  ```Exempel: 2013```     
  För att ange slutår för senaste utgivningsperiod (264 -/3 ‡c), notera först vilket startåret för utgivningsperioden är, ta bort Startår och lägg till Datum. Skriv in hela datumangivelsen med startår och slutår (se nedan under Datum).    
  * Datum (date = 264 -/1 ‡c)  
  Datum får innehålla text och interpunktionstecken.  
  För att ange utgivningsdatum med fler än fyra positioner, till exempel klamrade årtal, skriv in det här. Det kommer att exporteras till marcpostens  264 -/1 ‡c.  
  För att ange år utan klamrar eller andra tecken, använd endast Startår och Slutår.  
  Skriv in uppgiften.  
  ```Exempel: 2012-2013```  
  ```Exempel: [1988-]```  
 
* Frekvens (frequency)  
  * Frekvensterm (008/18)  
    Länka till entitet.  
    ```Exempel: var tredje månad (q = quarterly)```  
  * Regelbundenhet (008/19)  
    Länka till entitet.  
    ```Exempel: regelbunden (r = regular)```

* Har numrering av seriell resurs/Numrering av seriell resurs/Benämning  
  (hasNumberingofSerials/NumberingofSerials/label = 362 0/- ‡a)   
  Skriv in uppgiften.  
  ```Exempel: 2011: 4-2013: 2```

* Medietyp (mediaType/Mediatype = 337 ‡b)  
  Länka till entitet.  
  ```Exempel:  n (= omedierad)```

* Bärartyp (carrierType/CarrierType = 338 ‡b)  
  Länka till entitet.  
```Exempel:  nc (= volym)```

* Bärartyp/Bokformat (carrierType/BookFormat = 008/23/Form för katalogiserat objekt)  
  Länka till entitet.  
  ```Exempel: - (= ingen av följande)```
  
* Anmärkning/Anmärkning/Benämning (hasNote/Note/label = 500 ‡a)  
  Skriv in uppgiften.  
  Skriv in allmänna anmärkningar här. Anmärkningar om specifika fält skrivs in i Kommentar (note) under respektive fält, när sådana specifika anmärkningsfält finns. 
  
* Annat bärarformat (otherPhysicalFormat = 776)  
  För att länka till en utgåva i annat format, till exempel en elektronisk utgåva, lägg till Annat bärarformat genom att klicka på Lägg till fält. Välj Annat bärarformat.  
  Skapa en instans som lokal entitet genom att klicka på +-tecknet vid Annat bärarformat (lägg till instans). Klicka på Skapa lokal entitet och välj Instans. 
* Annat bärarformat/Har titel/Titel (776 ‡t)  
  Under Instans, lägg till titel genom att klicka på +-tecknet vid Instans (Lägg till fält under: Instans) och välj Har titel. Välj Titel. Ta bort Övrig titelinformation och skriv in huvudtiteln under Huvudtitel. 
* Annat bärarformat/Identifikator/ISSN/Värde (776 ‡x)  
  Under Instans, lägg till identifikator genom att klicka på +-tecknet vid Instans (Lägg till fält under: Instans) och välj Identifikator. Välj typ ISSN. Skriv in ISSN för den utgåva du vill länka till under Värde.  
* Annat bärarformat/Beskriven av/Post/Kontrollnummer (776 ‡w)  
  Beskriven av/Post/Kontrollnummer, motsvarande delfält w, är för närvarande låst för redigering. Det går därmed inte att lägga till fältet eller redigera det i befintliga beskrivningar.  

* Relaterad till/Dokument/URI (relatedTo/Document/uri = 856 4/8 ‡u)  
  Skriv in uppgiften.  
   ```Exempel:  http://www.kammarmusikforbundet.se```  
* Relaterad till/Dokument/Åtkomstmetod (relatedTo/Document/marc:electronicLocatorType = 856 4/8 ‡u)  
  Skriv in uppgiften.  
   ```Exempel:  http```  
 
* Relaterad till/Dokument/Offentlig anmärkning (relatedTo/Document/marc:copyNote = 856 ‡z)    
   Skriv in uppgiften.  
  ```Exempel:  Förbundets webbplats```

### Verk

* Instans av Verk/Text (instanceOf/Work/Text)  
  Skapa verket som lokal entitet (bryt inte ut verket till en länkbar entitet). Vi rekommenderar att du skapar verket som lokal entitet under den första tiden som Nya Libris är i drift. Vi återkommer med anvisningar för att skapa verk som länkbara entiteter. Denna hjälptext beskriver exempel på verk som lokal entitet. Det betyder att du anger de uppgifter som listas här nedan, under Instans av Verk, utan att klicka på länksymbolen (Länka entitet) vid Instans av Verk/Text.  
Läs mer om [Verk och Instans](https://librisbloggen.kb.se/2018/05/30/verk-och-instans-i-startversionen/).  

* Uttryck av/Verk/Har titel/Huvudtitel (hasExpression/Work/hasTitle/mainTitle = 130 0/- ‡a)  
  Lägg till Uttryck av genom att klicka på +-tecknet vid Instans av Verk/Text (Lägg till fält under: Text). Välj Uttryck av och lägg till det. Skapa ett verk som lokal entitet genom att klicka på +-tecknet vid Uttryck av (Lägg till verk). Klicka på Skapa lokal entitet. Välj Verk i listan. Klicka på +-tecknet vid Verk (Lägg till fält under: Verk) och lägg till Har titel. Välj Titel. Ta bort Övrig titelinformation. Under Huvudtitel, skriv in uppgiften. Skriv eventuellt särskiljande tillägg inom parentes.  
  ```Exempel:  Architecture (Paris. 1888)```  
  
* Behandling vid titeländring (marc:typeOfEntry = 008/34)  
  Länka till entitet.  
  ```Exempel: 0 (= Successive entry = Titeländring ger upphov till ny post)```
  
* Medverkan och funktion  
  Läs mer:  
  [Auktoritetsgruppens rekommendationer](https://kundo.se/org/librisxl/d/kbs-auktoritetsgrupp-informerar-jraz/)   
  [Lägga till Agent - Organisation i Instans av Verk](https://libris.kb.se/katalogisering/help/workflow-agent-org-instance)  
  
* Medverkan och funktion/Medverkan/Agent (contribution/Contribution/agent = 710 2/- ‡a)  
  Länka till entitet. Börja alltid med att söka efter om agenten redan finns. Klicka på Länka entitet (länkikonen) vid Person. I sökrutan, skriv in sökbegrepp, till exempel "Riksförbundet Sveriges kammarmusikarrangörer". Om agenten visas i träfflistan, högerklicka på entiteten, öppna den i ny flik eller nytt fönster och granska den. Är agenten rätt, gå tillbaka till katalogiseringsformuläret och länka till den genom att klicka på Ersätt lokal entitet.  
  Saknas auktoriserad namnform (som konstaterats vid sökning i pop up-rutan för Länka entitet), stäng pop up-rutan och ange kända uppgifter i formuläret.  
  ```Exempel: Riksförbundet Sveriges kammarmusikarrangörer```  
* Medverkan och funktion/Medverkan/Agent/Funktion (contribution/Contribution/agent/role = 710 ‡4)   
  Länka till entitet.   
  ```Exempel:  Utgivare (pbl = publisher)```

* Klassifikation/DDK-klassifikation/Kod (classification/ClassificationDdc/code = 082 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 785.005```  
  
* Klassifikation/DDK-klassifikation/Klassifikationsupplaga (classification/ClassificationDdc/edition = 082 ‡2)  
  ```Exempel: 23/swe```
  
* Klassifikation/Kod (classification/Classification/code = 084 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Ij-c:bf Riksförbundet Sveriges kammarmusikarrangörer(p)```

* Klassifikation/Termlista/Termlista/ID (classification/Classification/iinScheme/ConceptScheme = 084 ‡2)   
  Skriv in uppgiften.  
 ```Exempel: https://id.kb.se/term/kssb/8```  
 
 * Ämne  
  Läs mer:  
  [Lägg till auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-linked-entity-sh)  
  [Lägg till kontrollerade men ej auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-controlled-non-auth-sh)  
  [Lägg till sammansatta men ej auktoriserade ämnesord](https://libris.kb.se/katalogisering/help/workflow-non-auth-sh)  

* Ämne/Agent/Organisation (subject/agent/Organization = 610 2/- ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.   
  ```Exempel: Riksförbundet Sveriges kammarmusikarrangörer```  
  
* Ämne/Sao-term (subject = 650 -/7 ‡a, ‡2 sao)   
   Länka till entitet.  
   ```Exempel: Kammarmusik```  
 
* Geografiskt ämnesord (subject = 651 -/4 ‡a)  
   Länka till entitet.  
   I undantagsfall, skapa lokal entitet och skriv in uppgiften.   
    ```Exempel: Sverige```
   
* Genre/form – saogf-termer (genreForm = 655 -/7 ‡a, ‡2 saogf)  
  Länka till entitet.  
  För att söka efter entiteter inom saogf-termer, välj Genre/form i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
  Under Genre/form, välj Genre/form i listan över typer.  
  ```Exempel: Organisationspress```  
  ```Exempel: Musiktidskrifter```  
   
* Genre/form - typ av fortlöpande resurs (genreForm/marc:Periodical = 008/21)  
  Länka till entitet.  
  För att söka efter entiteter inom Typ av fortlöpande resurs, välj Typ av fortlöpande resurs i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
  ```Exempel: p (Tidskrift = marc/Periodical)```  
  
* Genre/form – konferenspublikation (genreForm = 008/29)  
  Länka till entitet.  
  För att söka efter entiteter inom Konferenspublikation, välj Konferenspublikation i listan över typer, under Genre/form. Trunkera genom att trycka på mellanslagstangenten eller med * i sökrutan. Välj rätt entitet genom att klicka på Lägg till.  
     ```Exempel: Ja, resursen härrör från konferens```       

* Språk (language = 008/35-37)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```
  
* Alfabet/skriftart (marc:alphabet = 008/33)   
   Länka till entitet.  
  ```Exempel: b (= Extended roman = Latinskt alfabet med diakriter och specialtecken (a-ö))```

* Innehållstyp (contentType/ContentType = 336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```
  
 * Länkfält/relationer under verk: Fortsätter (780 0/0), Fortsättes av (785 0/0), Ersätter (780 0/2), med flera -   
  konstrueras enligt följande mönster. Ange relationen, skapa verket som lokal instans och skapa en lokal instans av verket, ange egenskaper för instansen, till exempel titel och identifikator, se nedan.  
  Under Instans av Verk, lägg till fält genom att klicka på +-tecknet vid Instans av Verk/Text (Lägg till fält under: Text). Välj till exempel Fortsätter (eller Fortsättes av eller annan relation) och lägg till det. Skapa ett verk som lokal entitet genom att klicka på +-tecknet vid Fortsätter. Klicka på Skapa lokal entitet. Välj Verk i listan. Skapa en instans av verket genom att klicka på +-tecknet vid Verk (Lägg till fält under: Verk) och lägg till Har instans. Klicka på +-tecknet vid Har instans och skapa instansen som lokal entitet (klicka på Skapa lokal entitet och välj Instans). 
  
* Fortsätter/Verk/Har instans/Instans/Har titel/Titel (780 0/0 ‡t)  
  För att lägga till titel under Fortsätter, Fortsättes av, Ersätter, med flera:  
  Klicka på +-tecknet vid Instans (Lägg till fält under: Instans) och lägg till Har titel. Välj Titel. Ta bort Övrig titelinformation. Under Huvudtitel, skriv in uppgiften.  
```Exempel:   Aktuellt magazin```  
  
* Fortsätter/Verk/Har instans/Instans/Identifikator/ISSN/Värde (780 0/0 ‡x)  
 För att lägga till ISSN för den resurs man länkar till, under Fortsätter, Fortsättes av, Ersätter, med flera, klicka på +-tecknet vid Instans (lägg till fält under: Instans) och lägg till Identifikator (identifiedBy). Välj typ ISSN. Skriv in ISSN under Värde.  
 ```Exempel: 1402-1250```

* Fortsätter/Verk/Har instans/Instans/Beskriven av/Post/Kontrollnummer (780 0/0 ‡w)  
  Beskriven av/Post/Kontrollnummer, motsvarande delfält w, är för närvarande låst för redigering. Det går därmed inte att lägga till fältet eller redigera det i befintliga beskrivningar.  

  Hör följer ett urval av de relationer som kan läggas till, enligt samma mönster som Fortsätter (se ovan), under Instans av Verk:  
  
  Fortsätter (continues = 780 0/0)  
  Fortsätter delvis (continuesInPartBy = 780 0/1)  
  Föregående (precededBy = 780 0/2)  
  Ersätter delvis (precededInPartBy = 780 0/3)  
  Sammanslagen med (mergerOf = 780 0/4)  (se [Exempel](https://libris.kb.se/katalogisering/5ng67r2h49lzkl9#it))  
  Har införlivat (absorbed = 780 0/5)  
  Har delvis införlivat (absorbedInPart = 780 0/6)  
  Separat från (separatedFrom = 780 0/7)  
  
  Fortsättes av (continuedBy = 785 0/0)  
  Fortsättes delvis av (continuedInPartBy = 785 0/1)  
  Efterföljande (succeededBy = 785 0/2)  
  Ersättes delvis av (succeededInPartBy = 785 0/3)  
  Har uppgått i (absorbedBy = 785 0/4)  
  Har delvis uppgått i (absorbedInPartBy = 785 0/5)  
  Uppdelat på (splitInto = 785 0/6)  
  Sammanslagen till (mergedToForm = 785 0/7)  (se [Exempel](https://libris.kb.se/katalogisering/tb4vcdf54hzlsr3#it))  
