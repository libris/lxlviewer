---
section: Arbetsflöden
title: Skapa ny Agent - Organisation
order: 55
tags:
- editor
--- 
UNDER ARBETE (uppdaterad 2018-06-14)

## Skapa ny: Agent - Organisation

Lathunden beskriver de fält som finns representerade i mallen. Om något av fälten i mallen inte behövs kan de raderas genom ett klick på papperskorgsikonen intill fältet. Fält relevanta för organisation som är möjliga att lägga till, men som inte finns i mallen, beskrivs i slutet av lathunden.

OBS! Var noggrann vid sökning/testlänkning för att säkerställa att auktoriserad namnform inte redan finns. Glöm inte att redigera Adminmetadata och spara innan vidare navigation i verktyget.

Exemplet nedan är baserat på Arbetslivscentrum. Tillägg kan vara fiktiva och enbart med som exempel.

### Mall för beskrivning av Agent - Organisation

Beskrivning av agenten som ska auktoriseras.
   
* Namn (name) (110 ‡a)
  <br/>Föredragen namnform som utgör den auktoriserade namnformen.
  <br/>```Exempel: Arbetslivscentrum```
  <br/>För namnformer som består av överordnad och underordnad enhet används istället fälten Är del av tillsammans med Namn på underordnad enhet. Om fältet Namn används måste fälten Är del av samt Namn på underordnad enhet raderas. Klicka i så fall på papperskorgsikonen under respektive egenskap.
  
* Är del av/Namn (isPartOf/name = 110 2/- ‡a)
  <br/>Överordnat namn i en auktoriserad namnform som består av underordnad enhet. Fältet används endast tillsammans med Namn på underordnad enhet.
  <br/>```Exempel: Stockholms universitet```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Är del av, och skapa lokal entitet organisation. Lägg sedan till fältet Namn.
  
* Namn på underordnad enhet (marc/subordinateUnit =110 2/- ‡b)
  <br/>Underordnade och relaterade organisationer som ska anges som underavdelning. Kännetecknande kan vara att namnet är osjälvständigt och det överordnade begreppet behövs för att man med säkerhet ska kunna identifiera organisationen. Namn på underordnad enhet ingår i den auktoriserade namnformen. Fältet används endast tillsammans med Är del av. Om dessa två fält används måste fältet Namn raderas. Klicka i så fall på papperskorgsikonen under egenskapen Namn. 
  <br/>```Exempel: Centrum för medeltidsstudier```  
    
* Verksamhetens starttid/Startdatum för aktivitetsperiod (activityStartDate = 046 ‡s)
  <br/>```Exempel: 1977```
    
* Verksamhetens sluttid/Slutdatum för aktivitetsperiod (activityEndDate = 046 ‡t)
  <br/>```Exempel: 1994```    

* Administativ historik (hasHistoricalData = 678 ‡a)
  <br/>Anmärkning om administrativ historik.
  <br/>```Exempel: Statligt forskningsinstitut inom arbetslivsområdet. 1994 ändrades namnet till Institutet för arbetslivsforskning```
  <br/>Lägg till fält genom att klicka på +ikonen. Klicka på +ikonen inom det tillagda fältet och välj Benämning där uppgifterna anges.
  
* Variant (hasVariant = 410 ‡a ‡b)
  <br/>I detta fält anges variantnamn och alternativa namnformer som stavningsvarianter, förkortningar etc. Använd de expanderbara fälten och skapa nya fält om ytterligare namnvarianter behöver läggas till.
  <br/>```Exempel: ALC```
  <br/>```Exempel: Swedish Centre for Working Life```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen variant, och skapa lokal entitet t ex organisation. Lägg sedan till de fält som behövs t ex namn. 
  <br/>För att ange auktoriserad namnform som består av underordnad enhet: Klicka på +ikonen under egenskapen variant, och skapa lokal entitet organisation. Till organisation läggs, genom att klicka på +ikonen längst ut till höger vid organisation, fälten Är del av samt Namn på underordnad enhet. Vid Är del av skapas lokal entitet Organisation och fältet Namn läggs till.
  <br/>```Exempel: Är del av/Organisation/Namn: Stockholm University samt Namn på underordnad enhet: Centre for Medieval Studies```
  <br/>OBS! Varianter ska inte göras till sökbara länkar.
    
* Se även (seeAlso = 510)
  <br/>I detta fält länkas mot annan agent som hör ihop med organisationen. Det kan t ex vara föregångare eller efterföljare.
  <br/>```Exempel: Institutet för arbetslivsforskning```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Se även, välj typen Organisation i sökrutan till vänster. Sök efter auktoriserad namnform och klicka på Lägg till-rutan till höger. (Finns ingen länkbar organisation behöver en ny skapas som kan länkas. Spara och avsluta innan ny organisation skapas. Använd befintlig mall för Skapa ny: Agent - Organisation).

* Identifikator (identifiedBy = 024 ‡a ‡2)
  <br/>Identifikator t ex ISNI kan läggas till om tillgänglig. 
  <br/>```Exempel:  ISNI, 0000000104839039```
  <br/>För att lägga till fält: Klicka på +ikonen under Identifikator, välj typ. Klicka på +ikonen inom det tillagda Identifikator-fältet, sök efter och lägg till fältet Värde.
       
* Nationalitet/verksamhetsland (nationality = 043 ‡a)
  <br/>I mallen ligger nationalitetskoden för Sverige (e-sw---) förifylld. Vid behov kan denna ändras eller flera nationaliteter läggas till.
  <br/>```Exempel: e-uk---```
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Nationalitet/verksamhetsland. Välj Nationalitet som typ och sök i rutan till vänster. Välj önskad nationalitet och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
  
### Adminmetadata

Information av administrativ karaktär som inte är direkt förknippad med den auktoriserade namnformen.

* Skapad av (descriptionCreator = 040 ‡a)
 <br/>Förval: Sigel för skapare av agenten. Ändras ej.
 <br/>```Exempel: library/S```
      
* Katalogiseringsregler (descriptionConventions = 040 ‡e)
 <br/>Förval: rda. Ändra vid behov.
 <br/>```Exempel: Kod: rda```
  
* Katalogiseringsspråk (descriptionLanguage = 040 ‡b)
 <br/>Förval: language/swe. Ändras ej.
  
* Translitterering (marc:romanization = 008/07)
 <br/>Ändras ej.

* Poststatus (recordStatus = = 000)
  <br/>Val i meny. Välj Ny post vid skapande av ny auktoriserad agent. Vid uppdatering ändras status automatiskt.

* Katalogisatörens anmärkning (cataloguersNote = 667 ‡a)
  <br/>Anmärkningar tänkta för kollegor inom Libriskollektivet. Det kan till exempel vara uppgifter som rör ändring av den auktoriserade namnformen. Motivera gärna ändringen och komplettera alltid med datum/sigel/signatur.
  <br/>```Exempel: Ändrat auktoriserad namnform från Xxx till Yyy /2010-01-03/S/UL/marjan```
  
* Konsulterad källa (sourceConsulted) innehåller Benämning (label = 670 ‡a) samt Uppgift från källa (citationNote = 670 ‡b)
  <br/>Ange källa och vid behov vilken uppgift som hämtats från källan. Den resurs som föranleder auktoriseringen är en obligatorisk källa.
  <br/>```Exempel: Benämning: Wikipedia (Svenska) 2018-04-24. Uppgift från källa: Startår 1886 ```
  <br/>```Exempel: Benämning: Fader okänd / Sveriges släktforskarförbund, 2016```
  <br/>```Exempel: Benämning: Statskalendern, 1994```
  <br/>För att lägga till fält: Klicka på +ikonen under konsulterad källa. Välj typ av konsulterad källa i rullmenyn. Vid val av "Källa vid belagd uppgift" finns möjlighet att ange såväl Benämning (källa) som Uppgift hämtad från källa.
  
* Uppdatering av posten (marc:recordUpdate = 008/31)
  <br/>Ändras ej.
    
* Differentiering av posten (marc:personalName = 008/32)
  <br/>Ändras ej.

* Auktoritetskontrollnivå (marc:level = 008/33)
  <br/>Ändras ej.
    
  
### Valbara fält för Agent- Organisation
Nya fält läggs till med hjälp av den runda +ikonen i verktygsmenyn.

* Tid för grundande/Startdatum (establishDate = 046 ‡q)
  <br/>```Exempel: 1965```

* Tid för upphörande/Slutdatum (terminateDate = 046 ‡r)
  <br/>```Exempel: 2003```
  
* Verksamhetsområde (fieldOfActivity = 372 ‡a ‡2)
  <br/>Ange verksamhetsområde för en organisation vid behov.
  <br/>```Exempel: Design```
  <br/>Länka i första hand termen från en kontrollerad vokabulär som Svenska ämnesord. 
För att lägga till fält: Klicka på +ikonen under egenskapen Verksamhetsområde, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
  
* Språk (associatedLanguage = 377 ‡a)
  <br/>Ange språk som organisation använder vid behov.
  <br/>```Exempel: Engelska```
  <br/>Klicka på +ikonen under egenskapen Språk. Välj Språk som typ och sök i rutan till vänster. Välj önskat språk och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).
 
* Andra attribut för person- och organisationsnamn (marc:hasOtherAttributes = 368 ‡a ‡2)
  <br/>Ange en term för att beskriva typ av organisation om det använts som särskiljande tillägg i den auktoriserade sökingången.
  <br/>```Exempel: Herrgårdar```
  <br/>Länka i första hand termen från en kontrollerad vokabulär som Svenska ämnesord. 
För att lägga till fält: Klicka på +ikonen under egenskapen Andra attribut för person- och organisationsnamn, välj Allmänt ämnesord som typ och sök i rutan till vänster, välj önskad term och klicka på den gröna Lägg till-rutan till höger. (Skapa lokal entitet används endast då det inte finns auktoriserad entitet att länka till).

* Organisatorisk tillhörighet (hasAffiliation = 373 ‡a)
  <br/>Här är det möjligt att ange en samhörande institution.
  <br/>```Exempel: Uppsala universitet``` 
  <br/>För att lägga till fält: Klicka på +ikonen under egenskapen Organisatorisk tillhörighet, och skapa lokal entitet t ex organisation. Lägg sedan till det fält som behövs t ex namn. OBS! Organisatorisk tillhörighet ska inte göras till sökbar länk.
