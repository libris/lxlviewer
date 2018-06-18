---
section: Arbetsflöden
title: Enkel beståndsregistrering
order: 75
tags:
- editor
--- 
*UNDER ARBETE (uppdaterad 2018-06-15)*

# Enkel beståndsregistrering

Det är endast bibliotekskod/sigel som är obligatorisk och den sätts automatiskt när du väljer att lägga bestånd.

De mest vanliga fälten finns färdiga att fylla i. Det motsvarar vad som kunde göras i Libris webbregistrering. Övriga fält läggs till via **+ikonen** för bestånd. För hjälp med detta se hjälpen **Beståndsregistrering**.

### Har komponent (852)
Klicka på pilen för *Bestånd*. Du kan då lägga till:
* Hyllkod (852 ‡h)
Här lägger du uppställning efter klassifikation eller annan hyllkod

 ```Exempel: 158.1```

* Hyllplacering (Avdelning,samling) (852 ‡c)
Om ytterligare information om placering utöver Hyllkod behöver läggas till.

 ```Exempel: Institution 14```

* Hyllsignum: Löpnummer (852 ‡j)

 ```Exempel: 2594```

För att lägga till ytterligare ett Bestånd (motsvarande flera 852) klickar du på **+ikonen** vid **Har komponent**.

### Oformaterad beståndsuppgift - huvudpublikation (866)
*OBS! Ta inte bort de "tomma" fälten Marc:holdingsLevel samt Marc:typeOfNotation! I mallen finns ett blanksteg med som behövs för att få med värden i indikator 1 och 2. För att ändra från "ej angiven/saknas" måste blanktecknet först tas bort och därefter rätt siffra skrivas in. Detta är en temporär lösning på problemet med att 866 inte exporterades.*

* Beståndsuppgift (866 ‡a)
* Katalogisatörens anmärkning (866 ‡x)
* Offentlig anmärkning (866 ‡z)
* Underordnad institution/enhet (866 ‡9)
