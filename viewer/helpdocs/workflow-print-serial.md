---
section: Arbetsflöden
title: Tryckt seriell resurs
order: 25
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Tryckt seriell resurs

Denna hjälptext beskriver ett antal vanligt förekommande fält, med utgångspunkt från exempel. För instruktioner om att länka till entitet, skapa lokal entitet och om hur formuläret fungerar i övrigt, se Redigering i vänstermenyn. För information om katalogregler, skrivregler och övriga katalogiseringsanvisningar, se [Anvisningar för katalogisering - RDA](http://www.kb.se/rdakatalogisering/ "Anvisningar för katalogisering - RDA").

I de flesta fall ska informationen delas upp i olika fält och delfält. I några undantagsfall är det nödvändigt att använda ISBD-interpunktion inom fält, för att separera uppgifter. Dessa fall visas genom exempel nedan. Använd vid behov också klamrar inom fält, enligt Anvisningar för katalogisering - RDA.

Exempel hämtade från: Kammarmusik-nytt, ISSN 2001-2721, Voyager BibID 12683491  
samt andra poster.


### Adminmetadata  
* Skapad av/Organisation/Namn (040 ‡a)   
  Förval: den sigel som skapat posten. Ska inte ändras.  
  ```Exempel: S```  
  
* Uppgraderad eller importerad av/Organisation/Namn (040 ‡d)  
  Skriv in sigel som har uppgraderat (ändrat nivå) eller importerat posten. För att söka fram sigel, se [Biblioteksdatabasen](https://biblioteksdatabasen.libris.kb.se/ "Biblioteksdatabasen")
  ```Exempel: U```

* Bibliografi/Bibliotek/Sigel (042 ‡9)  
  Ange bibliografikod genom att skriva in sigel. För att söka fram sigel, se [Biblioteksdatabasen](https://biblioteksdatabasen.libris.kb.se/ "Biblioteksdatabasen")

* Katalogiseringsspråk (040 ‡b)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```  

* Katalogiseringsregler (040 ‡e)  
  För post katalogiserad enligt RDA, länka till entitet: marc/Isbd samt skapa lokal entitet med Kod: rda    
  ```Exempel: marc/Isbd (länkad entitet) + lokal entitet, Kod: rda```

* Beskrivningsnivå (000/05)  
  Länka till entitet.  
  ```Exempel: nationalbibliografisk/fullständig nivå```

### Instans
* Utgivningssätt  
  Välj från lista.  
  ```Exempel: Seriell resurs```
  
* Har titel/Nyckeltitel/Huvudtitel (222 -/0 ‡a)  
  Länka till entitet.
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  Kammarmusik-nytt```  

* Har titel/Nyckeltitel/Huvudtitel/Särskiljande tillägg (222 ‡b)  
  Skriv in uppgiften.  
  ```Exempel:  (Brämhult)```

* Har titel/Titel/Huvudtitel (245 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusik-nytt```  
  
* Har titel/Titel/Huvudtitel/Övrig titelinformation (245 ‡b)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusikförbundets tidskrift```
  
* Har titel/Varianttitel/Huvudtitel (246 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Hushållningssällskapets magasin```  
  
* Har titel/Varianttitel/Täckning eler tillkomst (246 #f)  
  Skriv in uppgiften.  
  ```Exempel: 2011, nr 4-2012, nr 4``` 
  
* Identifikator/Typ  
  Välj från lista.  
  ```Exempel: ISSN```  
  
* Identifikator/Typ/Värde (022 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 2001-2721```

* Identifikator/Källa/Nationell ISSN-central/Kod (022 #f)  
  Skapa lokal entitet. Skriv in uppgiften.  
  ```Exempel: f (= ISSN Sverige)```  
  
* Identifikator/Internationellt intresse (022 ind1: 0)  
  Skriv in uppgiften.     
  ```Exempel: true```  
  
* Identifikator/Felaktigt ISSN (022 ‡y)   
  Skriv in uppgiften.   
  ```Exempel: 1653-2945```

* Utgivning  
  Välj typ från lista. För seriell resurs, välj Pågående utgivningsperiod eller Avslutad utgivningsperiod.  
  (= Typ av utgivningsdatum/utgivningsstatus) (008/06)    
   
  * Utgivningsland (008/15-17)  
  Länka till entitet.  
  ```Exempel: Sverige (sw)```  
  * Plats/Benämning (264 -/1 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Brämhult```  
  * Agent/Benämning (264 -/1 ‡b)  
  Skriv in uppgiften.  
  ```Exempel: Kammarmusikförbundet```  
  * Datum (264 -/1 ‡c)  
  Skriv in uppgiften.  
  ```Exempel: 2011-2013```  
  * Startdatum  (008/7-10)   
  Skriv in uppgiften.  
  ```Exempel: 2011```  
  * Slutdatum  (008/11-14)  
  Skriv in uppgiften.  
  ```Exempel: 2013```  
 
* Frekvens  
  * Frekvensterm (008/18)  
    Länka till entitet.  
    ```Exempel: var tredje månad (q = quarterly)```  
  * Regelbundenhet (008/19)  
    Länka till entitet.  
    ```Exempel: regelbunden (r = regular)```

* Har numrering av seriell resurs/Benämning (362 0/- ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 2011: 4-2013: 2```

* Medietyp (337 ‡b)  
  Länka till entitet.  
  ```Exempel:  n (= omedierad)```

* Bärartyp (338 ‡b)  
  Länka till entitet.  
```Exempel:  nc (= volym)```

* Bärartyp/Bokformat (= Form för katalogiserat objekt) (008/23)  
  Länka till entitet.  
  ```Exempel: - (= ingen av följande)```
  
* Anmärkning/Benämning (= hasNote/Note/label) (500 ‡a)  
  Skriv in uppgiften.  
  Skriv in allmänna anmärkningar här. Anmärkningar om specifika fält skrivs in i Kommentar (note) under respektive fält, när sådana specifika anmärkningsfält finns. 

* Relaterad till/Dokument/URI (856 4/8 ‡u)  
   Skriv in uppgiften.  
   ```Exempel:  http://www.kammarmusikforbundet.se```  
* Relaterad till/Dokument/Anmärkning/Anmärkning (856 ‡z)    
   Skriv in uppgiften.  
  ```Exempel:  Förbundets webbplats```

### Verk
* Instans av Verk/Text

* Har titel/Huvudtitel (130 0/- ‡a)  
  Skriv in uppgiften.  
  ```Exempel:  Architecture (Paris. 1888)```  
  
* Behandling vid titeländring (008/34)  
  Länka till entitet.  
  ```Exempel: 0 (= Successive entry = Titeländring ger upphov till ny post)```
  
* Medverkan och funktion/Medverkan/Agent (710 2/- ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Riksförbundet Sveriges kammarmusikarrangörer```  
* Medverkan och funktion/Medverkan/Agent/Funktion (710 ‡4)   
  Länka till entitet.   
  ```Exempel:  Utgivare (pbl = publisher)```

* Klassifikation/DDK-klassifikation/Kod (082 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: 785.005```  
  
* Klassifikation/DDK-klassifikation/Kod/Klassifikationsupplaga (082 ‡2)  
  Skriv in uppgiften.  
  ```Exempel: 23/swe```
  
* Klassifikation/Kod (084 0/4 ‡a)  
  Skriv in uppgiften.  
  ```Exempel: Ij-c:bf Riksförbundet Sveriges kammarmusikarrangörer(p)```

* Klassifikation/Termlista/Termlista/ID (084 ‡2)  
  Skriv in uppgiften.  
 ```Exempel: https://id.kb.se/term/kssb/8```

* Ämne/Agent/Organisation (610 2/- ‡a)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.   
  ```Exempel: Riksförbundet Sveriges kammarmusikarrangörer``` 
  
 * Ämne/Sao-term (650 -7- ‡a, ‡2 sao)   
   Länka till entitet.  
   ```Exempel: Kammarmusik```  
   
 * Geografiskt ämnesord (651 -/4 ‡a)  
  Skapa lokal entitet. Skriv in uppgiften.  
  ```Exempel: Sverige```
   
* Genre/form – saogf-termer (655 ‡a, ‡2 saogf)  
  Länka till entitet.  
  ```Exempel: Organisationspress```  
  ```Exempel: Musiktidskrifter```  
   
* Typ av fortlöpande resurs (008/21)  
  Länka till entitet.  
  ```Exempel: p ( = marc/Periodical)```  
  
* Konferenspublikation (008/29)  
  Länka till entitet.  
  ```Exempel: 0 (= inte konferenspublikation)```  

* Språk (008/35-37)  
  Länka till entitet.  
  ```Exempel: svenska (swe)```
  
* Alfabet/skriftart (008/33)   
   Länka till entitet.  
  ```Exempel: b (= Extended roman = Latinskt alfabet med diakriter och specialtecken (a-ö))```

* Innehållstyp (336 ‡b)  
  Länka till entitet.  
  ```Exempel: text (txt)```
  
* Utgiven med/Verk/Inledande anmärkning - Marc:displayText (unhandled term) (777 0/8 ‡i)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: 2011:4-2013:2 omvänt sammanhäftad med```
  
* Utgiven med/Verk/Har titel/Titel/Titel (777 ‡t)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.   
  ```Exempel: Musikant (Stockholm. 2011)```  
  
* Utgiven med/Verk/Identifikator/Typ  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  ISSN```  
  
* Utgiven med/Verk/Identifikator/Typ/Värde (777 ‡x)  
  Länka till entitet.
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  2001-273X```  
  
* Utgiven med/Verk/Beskriven av/Post/Kontrollnummer (777 0/1 ‡w)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: 12683514```  

* Relaterade verk/Fortsätter delvis/Verk/Har instans/Instans/Har titel/Titel/Huvudtitel (780 ‡t)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Musikant och kammarmusik-nytt```  
  
* Relaterade verk/Fortsätter delvis/Verk/Har instans/Instans/Identifikator/Typ  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  ISSN```  
  
* Relaterade verk/Fortsätter delvis/Verk/Har instans/Instans/Identifikator/Typ/Värde (780 ‡x)  
   Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  1653-2945```  
  
* Relaterade verk/Fortsätter delvis/Verk/Har instans/Instans/Beskriven av/Post/Kontrollnummer (780 0/1 ‡w)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: 9955452```

* Relaterade verk/Fortsättes av/Verk/Har instans/Instans/Har titel/Titel/Huvudtitel (785 ‡t)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: Kammarmusik-nytt (Brämhult. Online)```  
  
*  Relaterade verk/Fortsättes av/Verk/Har instans/Instans/Identifikator/Typ  
   Länka till entitet.  
   I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
   ```Exempel:  ISSN```  
   
* Relaterade verk/Fortsättes av/Verk/Har instans/Instans/Identifikator/Typ/Värde (785 ‡x)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel:  2001-6921```  
  
* Relaterade verk/Fortsättes av/Verk/Har instans/Instans/Beskriven av/Post/Kontrollnummer (785 0/0 ‡w)  
  Länka till entitet.  
  I undantagsfall, skapa lokal entitet och skriv in uppgiften.  
  ```Exempel: 14697501```
