---
section: Arbetsflöden
title: Beståndsregistrering
order: 85
tags:
- editor
--- 
*UNDER ARBETE - UPPDATERAS KONTINUERLIGT*

## Beståndsregistrering

Det är endast bibliotekskod/sigel som är obligatorisk och den sätts automatiskt när du väljer att lägga bestånd. (852 ‡b)

De mest vanliga fälten finns färdiga att fylla i. Det motsvarar vad som kunde göras i Libris webbregistrering. Övriga fält läggs till via plusstecknet för bestånd.

### Har komponent (852)
Klicka på pilen för *Bestånd*. Du kan då lägga till
* Hyllkod (852 ‡h)
Här lägger du uppställning efter klassifikation eller annan hyllkod
  ```Exempel: 158.1```

* Hyllplacering (Avdelning,samling) (852 ‡c)
Om ytterligare information om placering utöver Hyllkod behöver läggas till.
  ```Exempel: Institution 140```

* Hyllsignum: Löpnummer (852 ‡j)
  ```Exempel: 2694```


Många ytterligare fält kan läggas till *Har komponent* - gå till plusstecknet vid bestånd.
* Tidigare hylluppställning (852 ‡d)
* Precisering av hyllplacering (852 ‡g)
* Exemplarstatus (852 ‡i)
* Prefix för lokalsignum (852 ‡k)
* Hyllsignum: uppställningsord (852 ‡l)
* Prefix för lokalsignum (852 ‡m)
* Unik exemplarbeteckning (streckkod) (852 ‡p)
* Exemplarets fysiska tillstånd (852 ‡q)
* Exemplarnummer (852 ‡t)
* URI (852 ‡u)
* Katalogisatörens anmärkning (852 ‡x)
* Publik anmärkning (852 ‡z)
* Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (852 ‡3)
* Underordnad institution/enhet (852 ‡9)

För att lägga till ytterligare ett bestånd (motsvarande flera 852) klickar du på plusstecknet vid *Har komponent*.


### Adminmetadata
För enkla monografier behöver vanligen inte Adminmetadata läggas till eller ändras. Information om fält som kan läggas till kommer i en senare version av hjälpen.

### Identifierare
* IdentifiedBy / Välj från lista (024 indikator 1)
  * Värde (024 ‡a)
  * Ogiltigt värde (024 ‡z)
  * Typanmärkning, bestämning till indikator 1=7 (024 ‡2)



### Anmärkningar
* Anmärkning/hasNote. Klicka på plusstecknet vid Anmärkning för att lägga till en allmän anmärkning. (500 ‡a)

* Villkor för användning och åtkomst/Villkor som användning och åtkomst (Skapa som lokal entitet)
  * Benämning (506 ‡a)
  * Tillsåndsgivare (506 ‡b)
  * Fysiska omständigheter (506 ‡c)
  * Godkända användare (506 ‡d)
  * Laglig grun för restriktion (506 ‡e)
  * Standardiserad terminologi för åtkomstbegränsning (506 ‡f)
  * URI (506 ‡u)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (506 ‡3)

* Innehållsbeskrivning (520)
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
  * Anskaffningspris (541 ‡h)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (541 ‡3)

* Ägarhistorik (561 ‡a)

* Har lokal anmärkning: Identifiering av exemplar, kopia eller version/ Igenkänningstecken  (562 ‡a)
  * Identifiering av exemplar (562 ‡b)
  * Identifiering av version (562 ‡c)
  * Presentationsformat (562 ‡d)
  * Antal exemplar (562 ‡e)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (562 ‡3)


* Har lokal anmärkning: Bokband (563)
  * Benämning (563 ‡a)

* Har lokal anmärkning: Åtgärd (583=)
  * Benämning (583 ‡a)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (583 ‡3)


* Katalogisatörens anmärkning (599 ‡a)

### Lokala ämnesord och klassifikation
Lägg i första hand ämnesord och klassifikation till det beskrivna verket.
Hjälp planeras för att skapa ämnesord och genre/form.

* Lokala ämnesor/rubriker (övriga) (698)
  * Kod (698 a)
  * Benämning (698 b)

* Klassifikation/DDK-klassifikation/Kod (082 ‡a)
  * Klassifikationsupplaga (082 ‡2) Skriv in 23/sw

* Klassifikation/Klassifikation/Kod (084 a)

### Agenter - Personer och Organisationer
Här anges agenter som hör till bestånd eller exemplarbeteckning.
Länka till auktoriteter i första hand, men det går att skapa en lokal entitet för en agent.
* Medverkan och funktion / Medverkan / Agent
  * Person / Efternamn / Förnamn / Levnadsår / Funktion (700 1/_)
  * Person / Namn/ Levnadsår / Funktion (700 0/_)
  * Släkt / Namn/ Levnadsår / Funktion (700 3/_)
  * Jurisdiktion / Namn / Funktion  (710 1/_)
  * Organisation / Namn / Funktion (710 2/_)
För information om vilka delfält som kan läggas till planeras en särskild hjälp för olika typer av agenter.

### Elektronisk Adress (856)
* Elektronisk adress / Dokument (val vid Skapa lokal entitet) (856 _/_)
* Tillhörande media (856 _/0)
* Annan relaterad resurs (856 _/1)
* Relaterad till (856 _/2)
* Är huvudämne för (856 _/8)
  * Värddator (856 ‡a)
  * Elektroniskt namn (856 ‡f)
  * URI (856 ‡u)
  * Katalogisatörens anmärkning (856 ‡x)
  * Länktext (856 ‡y)
  * Publik anmärkning (856 ‡z)


### Oformaterad beståndsuppgift - huvudpublikation (866)
* Benämning (866 ‡a)
* Intern anmärkning (866 ‡x)
* Offentlig anmärkning (866 ‡z)
* Underordnad institution/enhet (866 ‡9)

### Exemplarinformation (876-877)
* Har exemplarinformation - huvudpublikation etc. (876)
  *  Internt exemplarnummer (876 ‡a)
  * Ogiltigt/makulerat intern exemplarnummer (876 ‡b)
  * Förvärvspris (876 ‡c)
  * Förvärvsdatum (876 ‡d)
  * Förvärvskälla (876 ‡e)
  * Begränsningar för användning (876 ‡h)
  * Tillfällig placering (876 ‡l)
  * Unik exemplarbeteckning (streckkod) (876 ‡p)
  * Exemplarnummer (876 ‡t)
  * Intern anmärkning (876 ‡x)
  * Offentlig anmärkning (876 ‡z)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (876 ‡3)
  * Underordnad institution/enhet (876 ‡9)

* Har exemplarinformation - bihang etc. (877)
  *  Internt exemplarnummer (877 ‡a)
  * Ogiltigt/makulerat intern exemplarnummer (877 ‡b)
  * Förvärvspris (877 ‡c)
  * Förvärvsdatum (876 ‡d)
  * Förvärvskälla (876 ‡e)
  * Begränsningar för användning (use) (876 ‡h)
  * Tillfällig placering (876 ‡l)
  * Unik exemplarbeteckning (streckkod) (876 ‡p)
  * Exemplarnummer (876 ‡t)
  * Intern anmärkning (876 ‡x)
  * Offentlig anmärkning (876 ‡z)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (876 3)
  * Underordnad institution/enhet (876 ‡9)


### Lokalt definierade beståndsfält
* Lokalt definierat beståndsfält (beståndsfält 948)
* Lokalt definierat beståndsfält (beståndsfält 949)
Beståndsfält a-z, A-Z samt 0-9 kan läggas till.
Sök upp dett fält som önskas, t.ex. Beståndsfält 948, delfält a
