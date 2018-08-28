---
section: Arbetsflöden
title: Lägga till sammansatt men ej auktoriserat ämnesord (sao)
order: 115
tags:
- editor
---

UNDER ARBETE (Uppdaterad 2018-08-27)

## Lägg till sammansatt men ej auktoriserat ämnesord 

Lathunden beskriver hur sammansatta ämnesord läggs till verksinformationen i Instans av Verk och där de ingående beståndsdelarna (huvudord respektive underindelning) är auktoriserade termer från ämnesordssystemet Svenska ämnesord (sao). 

För att lägga till geografiska sammansatta ämnesord är tillvägagångssättet delvis annorlunda. Se avsnittet **Geografiskt huvudord med geografisk underindelning** nedan.

#### Utgå från Instans av Verk
Utgår katalogiseringen från en mall finns egenskapen Ämne redan i mallen inom avsnittet för Instans av Verk. Vid behov av att lägga till egenskapen Ämne: Klicka på +ikonen högst upp till höger inom avsnittet för Instans av Verk, sök efter och lägg till Ämne (subject).

### Allmänt ämnesord med allmän underindelning

* Klicka på **+ikonen** intill egenskapen Ämne, pop up-rutan för **Lägg till entitet** öppnas. Välj typen **Sammansatt term** i rullgardinsmenyn **Skapa lokal entitet**

* Klicka på **+ikonen** inom den tillagda typen Sammansatt term, pop up-rutan **Lägg till fält under** öppnas. Sök efter och välj **Termkomponenter** (termComponentList)

* Klicka på **+ikonen** intill Termkomponenter, pop up-rutan för **Lägg till entitet** öppnas. Välj typen **Allmänt ämnesord** i sökrutans rullgardinsmeny och sök efter aktuell term och klicka på Lägg till. Termen länkas till verksinformationen

* Klicka på **+ikonen** intill Termkomponenter, pop up-rutan för **Lägg till entitet** öppnas. Välj typen **Underindelning för allmänt ämnesord** i sökrutans rullgardinsmeny och sök efter aktuell term och klicka på Lägg till. Termen länkas till verksinformationen

* Klicka på **+ikonen** inom den tillagda typen Sammansatt term, pop up-rutan **Lägg till fält under** öppnas. Söker efter och välj **Termlista** (inScheme)

* Klicka på **+ikonen** intill Termlista, pop up-rutan för **Lägg till entitet** öppnas. Sök efter listkod **sao** och Lägg till. Koden länkas till verksinformationen

Upprepa punkterna ovan för att lägga till fler sammansatta termer

OBS! Instruktionen ovan fungerar även för sammansatta men ej auktoriserade termer ur andra kontrollerade ämnesordssystem. Momenten i punkt tre och fyra ersätts då av Allmänt ämnesord respektive Underindelning för lokalt ämnesord i den grå rullgardinsmenyn för Skapa lokal entitet. Länka till aktuell listkod.

### Geografiskt huvudord med geografisk underindelning
Instruktionen nedan gäller geografiska ämnesord i flera led konstruerade enligt Riktlinjer för Svenska ämnesord.
Exempel: Tyskland--Bonn--sao

* Klicka på **+ikonen** intill egenskapen Ämne, pop up-rutan för **Lägg till entitet** öppnas. Välj **Sammansatt term** under Skapa lokal entitet

* Klicka på **+ikonen** inom Sammansatt term, pop up-rutan för **Lägg till fält under** öppnas. Sök efter och lägg till **Föredragen benämning** (Skriv "Tyskland--Bonn" som en sträng)

* Klicka på **+ikonen** inom Sammansatt term, pop up-rutan **Lägg till fält under** öppnas. Sök efter och lägg till **Termlista**

* Klicka på **+ikonen** inom Termlista, pop up-rutan för **Lägg till entitet** öppnas. Sök efter och lägg till listkod **sao**. Koden länkas till verksinformationen
    
* Klicka på **+ikonen** inom Sammansatt term, pop up-rutan **Lägg till fält** under öppnas. Sök efter och lägg till **Termkomponenter**

* Klicka på **+ikonen** inom Termkomponenter, pop up-rutan för **Lägg till entitet** öppnas. Välj **Geografiskt ämnesord** under Skapa lokal entitet

* Klicka på **+ikonen** inom Geografiskt ämnesord, pop up-rutan **Lägg till fält under** öppnas. Sök efter och lägg till **Föredragen benämning** (skriv "Tyskland")
    
* Klicka på **+ikonen** inom Termkomponenter, pop up-rutan **Lägg till entitet** öppnas. Välj **Geografiskt ämnesord** under Skapa lokal entitet

* Klicka på **+ikonen** inom Geografiskt ämnesord, pop up-rutan **Lägg till fält under** öppnas. Sök efter och lägg till **Föredragen benämning** (skriv "Bonn") OBS! Här ska inte Geografisk underindelning användas

Upprepa momenten ovan för att lägga till fler sammansatta termer eller enbart det senaste momentet för ytterligare underordnat led (t.ex. Tyskland--Bonn--Beuel).
