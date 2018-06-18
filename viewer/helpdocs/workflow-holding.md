---
section: Arbetsflöden
title: Beståndsregistrering
order: 85
tags:
- editor
--- 
*UNDER ARBETE (uppdaterad 2018-06-15)*

# Beståndsregistrering

Det är endast bibliotekskod/sigel som är obligatorisk och den sätts automatiskt när du väljer att lägga bestånd. (852 ‡b)

De mest använda fälten finns färdiga att fylla i. Det motsvarar vad som kunde göras i Libris webbregistrering. Övriga fält läggs till via **+ikonen** för bestånd.


### Har komponent (852)
Klicka på pilen för **Bestånd**. Du kan då lägga till
* Hyllkod (852 ‡h)
Här lägger du uppställning efter klassifikation eller annan hyllkod
  ```Exempel: 158.1```

* Hyllplacering (Avdelning,samling) (852 ‡c)
Om ytterligare information om placering utöver Hyllkod behöver läggas till.
  ```Exempel: Institution 140```

* Hyllsignum: Löpnummer (852 ‡j)
  ```Exempel: 2694```


Många ytterligare fält kan läggas till **Har komponent** - gå till **+ikonen** vid beståndet under **Har komponent**. Där kan du söka upp följande:
* Tidigare hylluppställning (852 ‡d)
* Precisering av hyllplacering (852 ‡g)
* Exemplarstatus (852 ‡i)
* Prefix för lokalsignum (852 ‡k)
* Hyllsignum: uppställningsord (852 ‡l)
* Sufffix för lokalsignum (852 ‡m)
* Unik exemplarbeteckning (streckkod) (852 ‡p)
* Exemplarets fysiska tillstånd (852 ‡q)
* Exemplarnummer (852 ‡t)
* URI (852 ‡u)
* Katalogisatörens anmärkning (852 ‡x)
* Anmärkning (hasNote) / Klicka på **+ikonen** direkt vid Anmärkning (Note) / Klicka på pilen. Du får då fram fältet **Benämning**. Skriv in din offentliga anmärkning (852 ‡z)
* Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (852 ‡3)
* Underordnad institution/enhet (852 ‡9)

För att lägga till ytterligare ett bestånd (motsvarande flera 852) klickar du på **+ikonen**  vid **Har komponent**.



### Adminmetadata
För enkla monografier behöver vanligen inte Adminmetadata läggas till eller ändras. Hör av dig till Supportforumet du saknar möjlighet att lägga till Adminmetadata som. ditt bibliotek behöver
* Posttyp. Om inget val görs blir värdet (000 [6] u). För att ändra värde lägg till Posttyp och välj i lista (000 [6]
  * Fortlöpande (seriell eller integrerande) resurs) (000 [6] y)
  * Monografisk resurs (000 [6] x)
  * Monografisk resurs (1 bibliografisk post med flera delar) (000 [6] v)
  
* Beskrivningsnivå (000 [17])
Välj önskad nivå:
  * 1 Nivå 1 (grundnivå endast 852). Normalnivå för monografier
  * 3	Nivå 3 (summariskt bestånd i 853-855 och/eller 86X) (Beståndpost med nivå 3 måste innehålla minst ett fält 866)
  * 4	Nivå 4 (detaljerat bestånd i 853-855 och/eller 86X)	
  * 5	Nivå 5 (detaljerat bestånd, inkl. exemplarinformation, i 853-855 och/eller 86X)
  * z	Annan nivå

* Katalogisatörens anmärkning (599 ‡a)

*För att lägga till information nedan behöver man använda rätt **+ikon**. **+ikonen** i högermenyn lägger till  t.ex.  Identifikator. Från **+ikonen** till höger om den identifikatortyp som valts väljer man det som motsvarar delfält.* 

### Identifierare
* Identifikator (IdentifiedBy) / Välj från lista (024 indikator 1)
  * Värde (024 ‡a)
  * Ogiltigt värde (024 ‡z)
  * Typanmärkning, bestämning till indikator 1=7 (024 ‡2)



### Anmärkningar
* Anmärkning/hasNote. Klicka på plusstecknet vid Anmärkning för att lägga till en allmän anmärkning. (500 ‡a)

* Villkor för användning och åtkomst/Villkor som användning och åtkomst (val vid Skapa som lokal entitet)
  * Benämning (506 ‡a)
  * Tillsåndsgivare (506 ‡b)
  * Fysiska omständigheter (506 ‡c)
  * Godkända användare (506 ‡d)
  * Laglig grund för restriktion (506 ‡e)
  * Standardiserad terminologi för åtkomstbegränsning (506 ‡f)
  * URI (506 ‡u)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (506 ‡3)

* Sammanfattning av innehåll (520)
Klicka på **+ikonen** för att lägga till. Klicka därefter på **+ikonen** till höger om sammanfattning för att lägga till delfält.
  * Benämning (520 ‡a)
  * Utförligare anmärkningstext (520 ‡b)
  * Instans som åsatt anmärkning/etikett (520 ‡c)
  * URI (520 ‡u)

* Förvärvsuppgifter (541)
Klicka på **+ikonen** för att lägga till. Gå till Skapa lokal entitet. Förvärvsuppgister kommer då automatiskt.
  * Förvärvskälla (541 ‡a)
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
Klicka på **+ikonen** för att lägga till. Klicka därefter på **+ikonen** till höger om Lokal anmärkning: Bokband för att lägga till delfält.
  * Benämning (563 ‡a)

* Har lokal anmärkning: Åtgärd (583=)
Klicka på **+ikonen** för att lägga till. Klicka därefter på **+ikonen** till höger om Lokal anmärkning: Åtgärd för att lägga till delfält
  * Benämning (583 ‡a)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (583 ‡3)



### Lokala ämnesord och klassifikation
Lägg i första hand ämnesord och klassifikation till det beskrivna verket.
För att lägga till lokalt, se särskild hjälp för att skapa ämnesord och genre/form.

* Lokala ämnesor/rubriker (övriga) (698)
  * Kod (698 ‡a)
  * Benämning (698 ‡b)

* Klassifikation/DDK-klassifikation/Kod (082 ‡a)
  * Klassifikationsupplaga (082 indikator 1). Vanligen fullständig upplaga.
  ```Skriv in: full```
  * Utgåvans nummer och upphov (082 ‡2)
  ```Skriv in: 23/swe```

* Klassifikation/Klassifikation/Kod (084 ‡a)

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

  * Funktion - lägg till vid **+ikonen** till höger om Medverkan (700 ‡4)
    Länka till entitet. Sök på kod eller term
    ```Exempel: relator/fmo (=Tidigare ägare)```

### Elektronisk Adress (856)
Defaultvärde för indikator 1 är 4 (http).
* Elektronisk adress / Mediaobjekt (val vid Skapa lokal entitet) (856 4/_)
Ingen information om relation mellan den elektroniska resursen och bibliografiska resurs som beskrivis

* Tillhörande media / Mediaobjekt (val vid Skapa lokal entitet) (856 4/0)
Länk till den elektroniska resurs som är den bibliografisk resurs som beskrivs

* Annan relaterad resurs / Elektronisk (val vid Skapa lokal entitet) (856 4/1)
Länk till elektronisk resurs av en icke elektronisk bibliografisk resurs som beskrivits

* Är huvudämne för / Dokument (val vid Skapa lokal entitet) (856 4/2)
Länk till relaterad resurs till den bibliografiska resursen, men som inte är en annan resurs. Entiteten Del av materialet som beskrivs ($3) kan användas för att beskriva relationen.

* Relaterad till  / Dokument (val vid Skapa lokal entitet) (856 4/8)
Ospecificerad relation

  * Värddator (856 ‡a)
  * Elektroniskt namn (856 ‡f)
  * URI (856 ‡u)
  * Katalogisatörens anmärkning (856 ‡x)
  * Länktext (856 ‡y)
  * Offentlig anmärkning (856 ‡z)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (856 ‡3)



### Oformaterad beståndsuppgift - huvudpublikation (866)
*OBS! Ta inte bort de "tomma" fälten Marc:holdingsLevel samt Marc:typeOfNotation! I mallen finns ett blanksteg med som behövs för att få med värden i indikator 1 och 2. För att ändra från "ej angiven/saknas" måste blanktecknet först tas bort och därefter rätt siffra skrivas in. Detta är en temporär lösning på problemet med att 866 inte exporterades.*
* Beståndsuppgift (866 ‡a)
* Katalogisatörens anmärkning (866 ‡x)
* Offentlig anmärkning (866 ‡z)
* Underordnad institution/enhet (866 ‡9)

### Exemplarinformation (876-877)
* Har exemplarinformation - huvudpublikation etc. (876)
  * Internt exemplarnummer (876 ‡a)
  * Ogiltigt/makulerat intern exemplarnummer (876 ‡b)
  * Förvärvspris (876 ‡c)
  * Förvärvsdatum (876 ‡d)
  * Förvärvskälla (876 ‡e)
  * Begränsningar för användning (876 ‡h)
  * Tillfällig placering (876 ‡l)
  * Unik exemplarbeteckning (streckkod) (876 ‡p)
  * Exemplarnummer (876 ‡t)
  * Katalogisatörens anmärkning (876 ‡x)
  * Offentlig anmärkning (876 ‡z)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (876 ‡3)
  * Underordnad institution/enhet (876 ‡9)

* Har exemplarinformation - bihang etc. (877)
  * Internt exemplarnummer (877 ‡a)
  * Ogiltigt/makulerat intern exemplarnummer (877 ‡b)
  * Förvärvspris (877 ‡c)
  * Förvärvsdatum (876 ‡d)
  * Förvärvskälla (876 ‡e)
  * Begränsningar för användning (use) (876 ‡h)
  * Tillfällig placering (876 ‡l)
  * Unik exemplarbeteckning (streckkod) (876 ‡p)
  * Exemplarnummer (876 ‡t)
  * Katalogisatörens anmärkning (876 ‡x)
  * Offentlig anmärkning (876 ‡z)
  * Del av materialet som avses / Resurs (val vid Skapa lokal entitet) / Benämning (876 3)
  * Underordnad institution/enhet (876 ‡9)


### Lokalt definierade beståndsfält
* Lokalt definierat beståndsfält (beståndsfält 948)
* Lokalt definierat beståndsfält (beståndsfält 949)
Beståndsfält a-z, A-Z samt 0-9 kan läggas till.
Sök upp dett fält som önskas, t.ex. Beståndsfält 948, delfält a
