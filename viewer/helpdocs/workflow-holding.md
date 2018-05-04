---
section: Arbetsflöden
title: Beståndsregistrering
order: 85
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Beståndsregistrering

Det är endast bibliotekskod/sigel som är obligatorisk och den sätts automatiskt när du väljer att lägga bestånd.

De mest vanliga fälten finns färdiga att fylla i. Det motsvarar vad som kunde göras i Libris webbregistrering. Övriga fält läggs till via plusstecknet för bestånd.

### Har komponent (852)
Klicka på pilen för *Bestånd*. Du kan då lägga till
* Hyllkod (852 ‡h)
Här lägger du uppställning efter klassifikation eller annan hyllkod

  ```Exempel: 158.1```

* Om ytterligare information om placering utöver Hyllkod behöver läggas till.

  ```Exempel: Institution 140```

* Hyllsignum: Löpnummer (852 ‡j)

  ```Exempel: 2694```


Många ytterligare fält kan läggas till *Har komponent* - gå till plusstecknet vid bestånd.
* Tidigare hylluppställning (852 ‡d)
* Precisering av hyllplacering (852 ‡g)
* Exemplarstatus (852 ‡i)
* Prefix för lokalsignum (852 ‡k)
* Suffix för lokalsignum (852 ‡m)
* Unik exemplarbeteckning (streckkod) (852 ‡p)
* Exemplarets fysiska tillstånd (852 ‡q)
* Exemplarnummer (852 ‡t)
* URI (852 ‡u)
* Intern anmärkning (852 ‡x)
* Publik anmärkning (852 ‡z)

För att lägga till ytterligare ett bestånd (motsvarande flera 852) klickar du på plusstecknet vid *Har komponent*.

### Oformaterad beståndsuppgift - huvudpublikation (866)
* Benämning (866 ‡a)
* Intern anmärkning (866 ‡x)
* Publik anmärkning (866 ‡z)
* Underordnad institution/enhet (866 ‡9)

### Adminmetadata
För enkla monografier behöver vanligen inte Adminmetadata läggas till eller ändras. Information om fält som kan läggas till kommer i en senare version av hjälpen.

### Anmärkningar
* Anmärkning/hasNote. Klicka på plusstecknet vid Anmärkning för att lägga till en allmän anmärkning. (500 ‡a)
* Villkor för användning och åtkomst/Villkor som användning och åtkomst (som lokal entitet) /Benämning (506 ‡a)
  * URI (506 u)

* Sammanfattning av innehåll/Benämning (520 ‡a)
  * Utförligare anmärkningstext (520 ‡b)
  * Instans som åsatt anmärkning/etikett (520 ‡c)
  * URI (520 ‡u)

* Förvärvsuppgifter/Förvärvskälla (541 ‡a)
  * Adress (541 ‡b)
  * Förvärvssättt (541 ‡c)
  * Förvärvsdataum (541 ‡d)
  * Accessionsnummer (541 ‡e)
  * Ägare (541 ‡f)
  * Anskaffningspris (541 ‡u)

* Ägarhistorik (561 ‡a)

* Har lokal anmärkning: Identifiering av exemplar, kopia eller version/ Igenkänningstecken  (562 ‡a)
  * Identifiering av exemplar (562 ‡b)
  * Identifiering av version (562 ‡f)
  * Presentationsformat (562 ‡d)

* Har lokal anmärkning: Bokband  (563 ‡a)

* Har lokal anmärkning: Åtgärd (583 ‡a)

* Katalogisatörens anmärkning (599 ‡a)

### Lokala ämnesord och klassifikation
Lägg i första hand ämnesord och klassifikation till det beskrivna verket.

*Klassifikation/DDK-klassifikation/Kod (082 ‡a)
  * Klassifikationsupplaga (082 ‡2) Skriv in 23/sw

* Klassifikation/Klassifikation/Kod (084 a)


### Lokalt definierade beståndsfält
* Lokalt definierat beståndsfält (beståndsfält 948)
* Lokalt definierat beståndsfält (beståndsfält 949)
Beståndsfält a-z, A-Z samt 0-9 kan läggas till.
Sök upp dett fält som önskas, t.ex. Beståndsfält 948, delfält a
