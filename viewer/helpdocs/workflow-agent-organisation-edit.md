---
section: Arbetsflöden
title: Redigera befintlig Agent - Organisation
order: 65
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Redigera befintlig: Agent - Organisation

<br/>Första delen av lathunden beskriver fält som redan finns i beskrivningen. Ett urval av fält kopplade till organisation, som är möjliga att lägga till, beskrivs i slutet av lathunden. 

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget.

<br/>Exemplet nedan är baserat på Sveriges släktforskarförbund. Tillägg kan vara fiktiva och enbart med som exempel.

### Befintliga fält i beskrivningen

* Namn (name) (110 ‡a)
  <br/>Föredragen namnform som utgör den auktoriserade namnformen.
  <br/>```Exempel: Sveriges släktforskarförbund```
  
* Tid för grundande/Startdatum (establishDate = 046 ‡q)
  <br/>```Exempel: 1886```
  
* Verksamhetsområde (fieldOfActivity = 372 ‡a ‡2)
  <br/>Ange verksamhetsområde för en organisation vid behov.
  <br/>```Exempel: Släktforskning```
  <br/>Länka i första hand termen från en kontrollerad vokabulär som Svenska ämnesord. 
För att lägga till fält: Klicka på +ikonen under egenskapen Verksamhetsområde, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
    
* Administativ historik (has Historical Data = 678 ‡a)
  <br/>Anmärkning om administrativ historik.
  <br/>```Exempel: Riksförbund för svenska släktforskare```
  <br/>Lägg till fält genom att klicka på +ikonen. Klicka på +ikonen inom det tillagda fältet och välj Benämning där uppgifterna anges.
  
* Variant (hasVariant = 410 ‡a)
  <br/>I detta fält anges variantnamn och alternativa namnformer som stavningsvarianter, förkortningar etc. Fältet upprepas om flera variantnamn behöver läggas till.
  <br/>```Exempel: Släktforskarförbundet```
  <br/>```Exempel: Federation of Swedish Genealogical Societies```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen variant, och skapa lokal entitet t ex organisation. Lägg sedan till det fält som behövs t ex namn. OBS! Varianter ska inte göras till sökbara länkar.
  
  
* Identifikator (identifiedBy = 024 ‡a ‡2)
  <br/>Identifikator t ex ISNI kan läggas till om tillgänglig. 
  <br/>```Exempel:  ISNI, 0000000104839039```
  <br/>För att lägga till fält: Klicka på +ikonen under Identifikator, välj typ. Klicka på +ikonen inom det tillagda Identifikator-fältet, sök efter och lägg till fältet Värde.
  
* Nationalitet/verksamhetsland (nationality = 043 ‡a)
  <br/>Nationalitet/verksamhetsland för organisationen. Vid behov kan denna ändras eller flera nationaliteter läggas till.
  <br/>```Exempel: e-sw---```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
  
* Samma sak som (sameAs)
  <br/>Ändras ej.
    
  
### Befintliga fält i Adminmetadata

Information av administrativ karaktär som inte är direkt förknippad med den auktoriserade namnformen.

* Kontrollnummer (controllNumber = 001)
  <br/>LibrisID. Ändras ej.
      
* Katalogiseringsregler (descriptionConventions = 040 ‡e)
 <br/>Förval: rda. Ändra vid behov.
 <br/>```Exempel: Kod: rda```
 
 * Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det kan till exempel vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur.
  <br/>```Exempel: Ändrat auktoriserad namnform från Xxx till Yyy /2010-01-03/S/UL/marjan```

 * Skapad av (descriptionCreator = 040 ‡a)
 <br/>Förval: Sigel för skapare av agenten. Ändras ej.
 <br/>```Exempel: Organisation S```
  
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
 <br/>Förval: Svenska. Ändras ej.
 
* Senast ändrad av (descriptionLastModifier)
 <br/>Förval: Sigel som gjort senaste ändring. Ändras ej.
  
* Beskrivningsnivå (encodingLevel = 000)
 <br/>Ändras ej.
 
* Marc:headingMain (marc:headingMain = 008/14)
 <br/>Ändras ej.
 
* Typ av auktoritetspost (marc:kindOfRecord = 008/9)
 <br/>Ändras ej.
 
* Auktoritetskontrollnivå (marc:level = 008/33)
  <br/>Ändras ej.

* Numrering i serie (marc:numberedSeries = 008/13)
 <br/>Ändras ej.
     
* Differentiering av posten (marc:personalName = 008/32)
  <br/>Ändras ej.
  
* Uppdatering av posten (marc:recordUpdate = 008/31)
  <br/>Ändras ej.
  
* Formatering av icke auktoriserade sökelement (marc:reference = 008/29)
 <br/>Ändras ej. 

* Translitterering (marc:romanization = 008/07)
 <br/>Ändras ej
 
* Geografisk precisering (marc:subdivision = 008/6)
 <br/>Ändras ej.  

* Typ av underindelning (marc:subjectSubdivision = 008/7)
 <br/>Ändras ej.  

* Typ av serie (marc:typeOfSeries = 008/12)
 <br/>Ändras ej.  

* Poststatus (recordStatus = 000)
  <br/>Ändras ej.
  
* Samma sak som (sameAs)
  <br/>Ändras ej.

* Konsulterad källa (sourceConsulted) innehåller Benämning (label = 670 ‡a) samt Uppgift från källa (citationNote = 670 ‡b)
  <br/>Ange källa och vid behov vilken uppgift som hämtats från källan. Den resurs som föranleder auktoriseringen är en obligatorisk källa.
  <br/>```Exempel: Benämning: Wikipedia (Svenska) 2018-04-24. Uppgift från källa: Startår 1886 ```
  <br/>```Exempel: Benämning: Fader okänd / Sveriges släktforskarförbund, 2016```
  <br/>```Exempel: Benämning: Statskalendern, 1994```
  <br/>För att lägga till fält: Klicka på +ikonen under konsulterad källa. Välj typ av konsulterad källa i rullmenyn. Vid val av "Källa vid belagd uppgift" finns möjlighet att ange såväl Benämning (källa) som Uppgift hämtad från källa.
  
### Ett urval valbara fält att lägga till i beskrivningen

* Tid för upphörande/Slutdatum (terminateDate = 046 ‡r)
  <br/>```Exempel: 2003```

* Verksamhetens starttid/Startdatum för aktivitetsperiod (activityStartDate, 046 ‡s)
  <br/>```Exempel: 1886```
    
* Verksamhetens sluttid/Slutdatum för aktivitetsperiod (activityEndDate, 046 ‡t)
  <br/>```Exempel: 1999``` 
  
* Se även (seeAlso = 510)
  <br/>I detta fält länkas mot annan agent som hör ihop med organisationen. Det kan t ex vara föregångare eller efterföljare. 
  <br/>```Exempel: Föreningen Emigrantinstitutets vänner```
 <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Se även, välj typen Organisation i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar organisation behöver en ny skapas som kan länkas. Spara och avsluta innan ny organisation skapas. Använd befintlig mall för Skapa ny: Agent - Organisation).

* Språk (associatedLanguage = 377 ‡a)
  <br/>Ange språk som organisation använder vid behov.
  <br/>```Exempel: Engelska```
  <br/>Klicka på +ikonen under egenskapen Språk. Välj Språk som typ och sök i rutan till vänster. Välj önskat språk och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
    
* Andra attribut för person- och organisationsnamn (marc:hasOtherAttributes = 368 ‡a ‡2)
  <br/>Ange en term för att beskriva typ av organisation om det använts som särskiljande tillägg i den auktoriserade sökingången.
  <br/>```Exempel: Herrgårdar```
  <br/>Länka i första hand termen från en kontrollerad vokabulär som Svenska ämnesord. 
För att lägga till fält: Klicka på +ikonen under egenskapen Andra attribut för person- och organisationsnamn, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
