---
section: Arbetsflöden
title: Tryckt seriell resurs
order: 25
tags:
- editor
--- 
*Under arbete. Senast uppdaterad 2018-07-02.*

## Tryckt seriell resurs

Denna hjälptext beskriver ett antal vanligt förekommande fält, med utgångspunkt från exempel. För instruktioner om att länka till entitet, skapa lokal entitet och om hur formuläret fungerar i övrigt, se Redigering i vänstermenyn. För information om katalogregler, skrivregler och övriga katalogiseringsanvisningar, se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/ "Anvisningar för katalogisering - RDA").

I de flesta fall ska informationen delas upp i olika fält och delfält. I några undantagsfall är det nödvändigt att använda ISBD-interpunktion inom fält, för att separera uppgifter. Dessa fall visas genom exempel nedan. Använd vid behov också klamrar inom fält, enligt Anvisningar för katalogisering - RDA.

I vissa fall fungerar det ännu inte fullt ut att lägga till alla uppgifter som beskrivs i denna hjälptext. Arbete pågår med förbättra gränssnittet. För att anmäla fel, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLSfOChJOGDoHUQguSF83F5XyTZiQL-yU47nvcqb6qwNT9GX7Aw/viewform). För att lämna synpunkter, använd detta [formulär](https://docs.google.com/forms/d/e/1FAIpQLSfOChJOGDoHUQguSF83F5XyTZiQL-yU47nvcqb6qwNT9GX7Aw/viewform).  

Exempel hämtade från: Kammarmusik-nytt, ISSN 2001-2721, Voyager BibID 12683491  
samt andra poster.

### Adminmetadata  
* Skapad av/Organisation/Namn (descriptionCreator/Organization/name = 040 ‡a)  
  Förval: den sigel som skapat posten. Ska inte ändras.  
  ```Exempel: S```  
  
* Uppgraderad eller importerad av/Bibliotek/Sigel (descriptionUpgrader/Library/sigel = 040 ‡d)  
  Om beskrivningsnivån ändras, lägg till denna uppgift. Vid postimport, lägg till uppgiften.  
  Skapa lokal entitet. Klicka på Lägg till agent (+-ikonen vid Uppgraderad eller importerad av), välj därefter Skapa lokal entitet. Välj Bibliotek i rullgardinsmenyn. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.     
  ```Exempel: S```  

* Bibliografi/Bibliotek/Sigel (bibliography/Library/sigel = 042 ‡9)  
 Skapa lokal entitet. Klicka på Lägg till bibliotek (+-ikonen vid Bibliografi), välj därefter Skapa lokal entitet. Lägg till Sigel (+ikonen Lägg till fält under Bibliotek). Skriv in uppgiften.  
  ```Exempel: NB```
  
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)   
  Länka till entitet.  
  ```Exempel: svenska (swe)```  

* Katalogiseringsregler (descriptionConventions = 040 ‡e)
För post katalogiserad enligt RDA, sök fram och länka till entitet: "ISBD-interpunktions finns: i" (välj Regler för deskriptiv katalogisering vid sökningen). Skapa också lokal entitet under Katalogiseringregler, välj typ Katalogiseringsregler. Lägg till Kod. Skriv in "rda".  
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
 
  Om flera utgivare ska anges, lägg till "Har del" (hasPart) under Primär utgivning. Lägg därefter till Utgivning som lokal entitet (klicka på +-ikonen vid Har del och klicka sedan på Skapa lokal entitet. Välj Utgivning i listan). Använd Startår, slutår och vid behov Datum enligt anvisningar nedan. Upprepa Har del och Utgivning som lokal entitet för nästa utgivare.
  Se [exempel](https://libris.kb.se/katalogisering/1kcsx46c1pmjdxz#it).  
  
  * Datum (date = 264 -/1 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 2011-2013```  
  * Startår (startYear = 008/7-10)  
  Skriv in uppgiften.  
    ```Exempel: 2011```  
  * Slutår (endYear = 008/11-14)  
  Om slutår inte anges, sätts utgivningsstatus (008/06) automatiskt till "c = Utgivning pågår".  
  Om slutår anges, sätts utgivningsstatus (008/06) automatiskt till "d = Utgivning avslutad".  
  Skriv in uppgiften.  
  ```Exempel: 2013```  
  För att ange slutår för senaste utgivningsperiod (264 -/3 ‡c), notera först vilket startåret för utgivningsperioden är, ta bort Startår och lägg till Datum. Skriv in hela datumangivelsen med startår och slutår.  
 ```Exempel: 2012-2013```   
 
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

* Har titel/Huvudtitel (hasTitle/mainTitle = 130 0/- ‡a)  
  Skriv in uppgiften. Skriv eventuellt särskiljande tillägg inom parentes.  
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
 
* Geografiskt ämnesord (subjcect = 651 -/4 ‡a)  
   Länka till entitet.  
   I undantagsfall, skapa lokal entitet och skriv in uppgiften.   
    ```Exempel: Sverige```
   
* Genre/form – saogf-termer (genreForm = 655 -/7 ‡a, ‡2 saogf)  
  Länka till entitet.  
  Under Genre/form, välj Genre/form i listan över typer.  
  ```Exempel: Organisationspress```  
  ```Exempel: Musiktidskrifter```  
   
* Genre/form - typ av fortlöpande resurs (genreForm/marc:Periodical = 008/21)  
  Länka till entitet.  
  ```Exempel: p (Tidskrift = marc/Periodical)```  
  
* Genre/form - konferenspublikation (genreForm/marc:conferencePublication = 008/29)  
  Länka till entitet.  
  ```Exempel: 0 (= inte konferenspublikation)```  

* Språk (language = 008/35-37)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```
  
* Alfabet/skriftart (marc:alphabet = 008/33)   
   Länka till entitet.  
  ```Exempel: b (= Extended roman = Latinskt alfabet med diakriter och specialtecken (a-ö))```

* Innehållstyp (contentType/ContentType = 336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```
  
* Utgiven med/Verk (issuedWith/Work = 777)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  
* Utgiven med/Verk/Inledande anmärkning (issuedWith/Work/Marc:displayText = 777 0/8 ‡i)  
  Skriv in uppgiften.  
  ```Exempel: 2011:4-2013:2 omvänt sammanhäftad med```
  
* Utgiven med/Verk/Har titel/Titel/Titel (issuedWith/Work/hasTitle/Title/Title = 777 ‡t)  
  Skriv in uppgiften.   
  ```Exempel: Musikant (Stockholm. 2011)```  
  
* Utgiven med/Verk/Identifikator/Typ   
  Välj från lista.   
  ```Exempel:  ISSN```  
  
* Utgiven med/Verk/Identifikator/ISSN/Värde (issuedWith/Work/identifiedBy/Issn/value = 777 ‡x)  
  Skriv in uppgiften.  
  ```Exempel:  2001-273X```  
  
* Utgiven med/Verk/Beskriven av/Post/Kontrollnummer   
  (issuedWith/Work/describedBy/record/controlNumber = 777 0/1 ‡w)  
  Skriv in uppgiften.  
  ```Exempel: 12683514```  

* Fortsätter delvis/Verk (continuesInPart/Work = 780)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  

* Fortsätter delvis/Verk/Har instans/Instans/Har titel/Titel/Huvudtitel          (continuesInPart/Work/hasInstance/Instance/title/Title/mainTitle = 780 ‡t)  
  Skriv in uppgiften.  
  ```Exempel: Musikant och kammarmusik-nytt```  
  
* Fortsätter delvis/Verk/Har instans/Instans/Identifikator/Typ  
  Välj från lista.  
  ```Exempel:  ISSN```  
  
* Fortsätter delvis/Verk/Har instans/Instans/Identifikator/ISSN/Värde    (continesInPart/Work/hasInstance/Instance/identifiedBy/Issn/value = 780 ‡x)  
   Skriv in uppgiften.  
  ```Exempel:  1653-2945```  
  
* Fortsätter delvis/Verk/Har instans/Instans/Beskriven av/Post/Kontrollnummer   (continuesInPart/Work/hasInstance/Instance/describedBy/record/controlNumber = 780 0/1 ‡w)  
  Skriv in uppgiften.  
  ```Exempel: 9955452```
  
* Fortsättes av/Verk  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  

* Fortsättes av/Verk/Har instans/Instans/Har titel/Titel/Huvudtitel   (continuedBy/Work/hasInstance/Instance/title/Title/mainTitle = 785 ‡t)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusik-nytt (Brämhult. Online)```  
  
*  Fortsättes av/Verk/Har instans/Instans/Identifikator/Typ  
   Välj från lista.    
   ```Exempel:  ISSN```  
   
* Fortsättes av/Verk/Har instans/Instans/Identifikator/ISSN/Värde     (continuedBy/Work/hasInstance/Instance/identifiedBy/Issn/value = 785 ‡x)  
  Skriv in uppgiften.  
  ```Exempel:  2001-6921```  
  
* Fortsättes av/Verk/Har instans/Instans/Beskriven av/Post/Kontrollnummer  (continuedBy/Work/hasInstance/Instance/describedBy/record/controlNumber = 785 0/0 ‡w)  
  Skriv in uppgiften.  
  ```Exempel: 14697501```  
