---
title: 'Hjälp'
---

# Hjälp

## Versionsinformation

Här kommer vi kontinuerligt berätta om nytillkomna funktioner och planerad utveckling:
### 2024-05-29

- Vanlig fritextsökning.
- Filter för avgränsning av sökträffarna.
- Träfflista med paginering och möjlighet att sortera.
- Sidor för mer detaljerad information om material med information om vilka bibliotek som har det.
- Sidor för personer och ämnesord med listning av material som är relaterat till dessa.
- Boolsk söklogik i sökrutan.
- Exempel: `pippi SPRÅK:"lang:swe" hasInstanceType:Print itemHeldBy:"sigel:S"`.

### Planerad framtida utveckling:

- Förbättrad layout och informationsinnehåll i sökträfflistan.
- Justering av urval och presentation av information på detaljsidorna.
- Grundläggande sökavgränsning som utesluter kommande titlar (förhandsinformation) eller elektroniska pliktlevererade resurser, med möjlighet att manuellt avaktiveras.
- Stöd i gränssnittet för avancerad sökfunktionalitet.
- Utökad koppling till lokala bibliotekssystem gällande lånestatus och länkar.
- Förbättrad materialkategorisering (typer) som: bok, e-bok, affisch, tidning och så vidare.
- Förbättrad relevansrankning av sökträffar.
- Avgränsning för fritt tillgängligt material.
- Libris fjärrlån.
- Libris låntagarbeställningar.
- Lopac - Libris som lokal bibliotekskatalog.
- Referensverktyg.
- Möjlighet att spara sökningar och listor med material.
- Möjlighet att exportera träfflistor.
- Möjlighet att ställa in favoritbibliotek med mera.

Utöver planerad utveckling kommer förbättringar av nuvarande funktionalitet att genomföras samt eventuellt nya funktioner tillkomma baserat på den återkoppling vi får från er användare.

## Hjälp och information

### Allmänt om söktjänsten

Det som är helt nytt i och med denna beta är att den läser data utan dröjsmål direkt från Libriskatalogen och bygger på de fördelar den nya informationsmodellen för med sig. Detta innebär bland annat att redigeringar i katalogiseringen syns direkt i söktjänsten.

### Information om hur sökningen fungerar:

Utöver vanlig fritextsökning så går det även att skriva mer avancerade sökfrågor direkt i sökrutan, till exempel FÖRF:Rowling,  TITEL:Sockerormen eller ÅR:2000, och sökoperatorer, till exempel AND för att inkludera samtliga sökord eller NOT för att exkludera sökord.

För att söka fraser eller ordkombinationer ska du sätta sökorden inom citationstecken, till exempel "sju sjösjuka sjömän". Observera att detta även tills vidare behöver göras för titlar eller söksträngar med kolon “:“ i sig då det tecknet idag tolkas som en operator för riktad sökning.

För att inkludera flera ordformer trunkera med asterisk, till exempel ger sökning på kulturarv* träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

Avgränsa träffmängden med följande filter:<br>
<b>Typ</b> för materialtyp<br>
<b>Bärartyp</b> för typ för lagring eller uppspelning/visning<br>
<b>Genre/form</b> för beskrivning av vad objektet är<br>
<b>Språk</b> för det språk som används i objektet<br>
<b>Utgivningsår</b> för årtalet då objektet gavs ut<br>
<b>Bibliotek</b> för bibliotek som har objektet i sina samlingar<br>
<b>Bibliografi</b> för förteckning över material inom ett specifikt område, exempelvis person, ämne eller geografiskt område<br>
<b>Ämne</b> för ämnesord som objektet är beskrivet med<br>
<b>Medverkan</b> för personer eller organisationer som skapat eller har bidragit till tillkomsten av objektet<br>
<b>Målgrupp</b> för den tänkta målgruppen för objektet<br>

När ett eller flera filter har valts visas knappen “Redigera“ som ger dig möjligheten att redigera söksträngen i med operatorer.

Observera att allt innehåll i Libris inte är beskrivet med samtliga filtertyper. Hur material är beskrivet i Libris har varierat över tid. Du kan därför behöva göra flera kompletterande sökningar eller justera filtreringen för att fånga upp relevanta objekt. Filtren visar max 100 alternativ, du kan avgränsa sökningen ytterligare för att få fram färre.

### Information om vad som visas i en detaljerad vy av objektet:
I detaljvyn visas detaljerad och beskrivande information om objektet samt information som är relaterat till det.<br>
Tryck = en tryckt resurs<br>
Elektronisk = en elektronisk resurs<br>
Instans = en resurs där den exakta typen inte är definierad (ofta på grund av att posten kommit till Libris via ett maskinellt flöde)<br>

Vi arbetar parallellt på en förbättrad kategorisering av material som vi kommer att testa framgent, mer information om det kommer.

Om materialet finns utgivet i flera utgåvor, visas utgåvorna i en lista med nyast först. Genom att klicka på pilen för varje utgåva visas detaljerad information om respektive utgåva samt de bibliotek som har den specifika utgåvan.

I vissa fall finns det en länk till materialet online. En del av dessa är fritt tillgängliga för alla, för en del krävs det att man är låntagare på ett bibliotek som har licens att visa materialet.

Genom att använda funktionen Kopiera länk till utgåva, kan du kopiera och spara direkt länk till utgåvan.