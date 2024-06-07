---
title: 'Hjälp'
---

# Hjälp

## Versionsinformation

Här kommer vi kontinuerligt berätta om nytillkomna funktioner och planerad utveckling:

### 2024-05-29

- Vanlig fritextsökning
- Filter för avgränsning av sökträffarna
- Träfflista med paginering och möjlighet att sortera
- Sidor för mer detaljerad information om material med information om vilka bibliotek som har det
- Sidor för personer och ämnesord med listning av material som är relaterat till dessa
- Grundläggande stöd för sökkoder i sökrutan. Exempel: `pippi språk:svenska typ:Ljud`
- Grundläggande sökavgränsning som utesluter kommande titlar (förhandsinformation) eller elektroniska pliktlevererade resurser, med möjlighet att inkludera dem

### Planerad framtida utveckling:

- Förbättrad materialkategorisering (typer) såsom bok, e-bok, affisch, tidning istället för "text, elektronisk" (se nedan).
- Förbättrad layout och informationsinnehåll i sökträfflistan
- Förbättrad presentation och urval av information på detaljsidorna
- Förbättrad relevansrankning av sökträffar
- Gränssnitt för avancerad sökfunktionalitet
- Utökad koppling till lokala bibliotekssystem gällande lånestatus och länkar
- Avgränsning för fritt tillgängligt material
- Libris fjärrlån
- Libris låntagarbeställningar
- Lopac - Libris som lokal bibliotekskatalog
- Referensverktyg
- Möjlighet att spara sökningar och listor med material
- Möjlighet att exportera träfflistor
- Möjlighet att ställa in favoritbibliotek med mera
  och mycket mer

Utöver planerad utveckling kommer förbättringar av nuvarande funktionalitet att genomföras samt eventuellt nya funktioner tillkomma baserat på den återkoppling vi får från er användare.

## Hjälp och information

### Allmänt om söktjänsten

Libris nya söktjänst ska på sikt ersätta [libris.kb.se](https://www.libris.kb.se/). Den gamla tjänsten är tekniskt utdaterad och behöver bytas ut bl.a. för att möta de lagkrav som finns på tillgänglighet inom digital offentlig service.
Den här betaversionen är ett första steg mot en tjänst som kommer medföra flera förbättringar för användarna.

En grundsten i Libris är den informationsmodell baserad på länkade data som används för att beskriva materialet i katalogen. Den nya tjänsten är byggd med en mer direkt koppling till denna modell, vilket gör den både enklare och tekniskt mer robust. Det innebär också att ändringar som görs m.h.a. [Libris katalogiseringsverktyg](https://libris-qa.kb.se/katalogisering/) syns i söktjänsten utan fördröjning.

Målet är också att bygga ett mer användarvänligt gränssnitt samtidigt som många av de funktioner som finns idag förbättras och byggs ut.
Med en mer datanära design kan viss text till en början upplevas som mer teknisk än tidigare. Detta är något vi kommer att arbeta vidare med för att förbättra. Även tjänstens formspråk och grafiska uttryck kommer att förändras och förbättras under resans gång.

### Förbättrad materialkategorisering

De materialkategorier (eller "typer") som syns i betaversionen idag kommer på sikt att ersättas där de inte är tydliga nog. Begrepp som “Text, tryck”, “Instans“, “Monografisk resurs” och så vidare kommer att bytas ut mot tydligare begrepp i stil med “Tidskrift“, “Ljudbok“, “Affisch” och “Vykort“. Målet är begripliga och användbara typer som håller över tid.

I dagens libris.kb.se räknas etiketter som “bok”, “e-bok” och “affisch” ut i söktjänsten på ett komplicerat sätt, utifrån en mängd datapunkter. Denna onödiga komplexitet beror bl.a. på begränsningarna som fanns i katalogen då tjänsten togs fram. Parallellt med utvecklingen av den nya söktjänsten jobbar vi nu med att förbättra katalogens data och informationsmodell. Eftersom den nya söktjänsten på ett mer direkt sätt avspeglar katalogen kommer typförbättringar synas så fort de är utförda.

Det kan fortfarande behövas olika begrepp och grad av precision i olika sammanhang. Men dessa skillnader kan i stor utsträckning fångas i den gemensamma katalogmodellen istället för att, som idag, ligga hårt knutna till olika tjänster.

### Att använda sökfunktionen

Utöver vanlig fritextsökning så finns också möjligheten att konstruera mer avancerade sökfrågor som innehåller filter och sökoperatorer.
Ett enkelt sätt att utforska mer komplicerade sökfrågor är att klicka på de filter som finns i vänsterkolumnen. Aktiva filter visas direkt under sökrutan. Hela sökfrågan har även en textrepresentation som kan ändras fritt om man klickar på Redigera-knappen.

De filter som finns i vänsterkolumnen är:

<b>Typ</b> för materialtyp<br>
<b>Format</b> för typ för lagring eller uppspelning/visning<br>
<b>Genre/form</b> för beskrivning av vad objektet är<br>
<b>Språk</b> för det språk som används i objektet<br>
<b>Utgivningsår</b> för årtalet då objektet gavs ut<br>
<b>Bibliotek</b> för bibliotek som har objektet i sina samlingar<br>
<b>Bibliografi</b> för förteckning över material inom ett specifikt område, exempelvis person, ämne eller geografiskt område<br>
<b>Ämne</b> för ämnesord som objektet är beskrivet med<br>
<b>Medverkan</b> för personer eller organisationer som skapat eller har bidragit till tillkomsten av objektet<br>
<b>Målgrupp</b> för den tänkta målgruppen för objektet<br>
<b>Övrigt</b> för inkludering av kommande titlar (förhandsinformation) eller elektroniska pliktlevererade resurser samt för avgränsning av resurser med bild

Ytterligare egenskaper som går att filtrera på finns listade på [id.kb.se/vocab](https://id.kb.se/vocab/) (tryck på Egenskaper-knappen). Vissa vanliga egenskaper kommer ett få enklare etiketter för att det ska gå snabbt att skriva in vanliga sökfrågor för hand. Redan nu kan man använda kortformen `ÅR` för att söka på material med ett specificerat utgivningsår eller årsspann.
I redigeringsläget finns också stöd för sökoperatorerna `AND`, `OR` och `NOT`.

För att söka på fraser sätts sökorden inom citationstecken, till exempel "sju sjösjuka sjömän". Observera att detta även tills vidare behöver göras för titlar eller söksträngar med kolon “:“ i sig då det tecknet idag tolkas som en operator för riktad sökning.

Asterisk används för trunkering då man vill inkludera fler ordformer. Till exempel ger sökning på kulturarv\* träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

#### Exempelsökningar

...

`pippi långstrump språk:(engelska OR franska) ÅR>2002` ger träff på engelska och franska verk som matchar sökordet "pippi långstrump".

`SPRÅK:svenska ÅR>2010 ÅR<=2024 subject:"sao:Drakar"` ger träff på material med utgivning mellan 2010 och 2024, som är på svenska och har [drakar](https://id.kb.se/term/sao/Drakar) som ämne.

... NOT

### Om vad som visas i en detaljerad vy av objektet

I detaljvyn visas detaljerad och beskrivande information om objektet samt information som är relaterat till det. (Se ovan om detaljerna för materialtyper.)

Om materialet finns utgivet i flera utgåvor, visas utgåvorna i en lista med nyast först. Genom att klicka på pilen för varje utgåva visas detaljerad information om respektive utgåva samt de bibliotek som har den specifika utgåvan.

I vissa fall finns det en länk till materialet online. En del av dessa är fritt tillgängliga för alla, för en del krävs det att man är låntagare på ett bibliotek som har licens att visa materialet.

Genom att använda funktionen Kopiera länk till utgåva, kan du kopiera och spara direkt länk till utgåvan.
