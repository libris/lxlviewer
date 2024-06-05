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

Det som är helt nytt i och med denna beta är att den läser data utan dröjsmål direkt från Libriskatalogen och bygger på de fördelar den nya informationsmodellen för med sig. Detta innebär bland annat att redigeringar i katalogiseringsklienten (på QA) syns direkt i söktjänsten men också att viss text kan upplevas mer teknisk än tidigare, detta är något vi kommer att arbeta vidare med för att förbättra.

### Förbättrad materialkategorisering

De materialkategorier (eller "typer") som syns i betaversionen idag kommer på sikt att ersättas där de inte är tydliga nog. Begrepp som “Text, tryck”, “Instans“, “Monografisk resurs” och så vidare kommer att ersättas med tydligare begrepp i stil med “Tidskrift“, “Ljudbok“, “Affisch” och “Vykort“. Målet är begripliga och användbara typer som håller över tid.

I dagens libris.kb.se räknas etiketter som “bok”, “e-bok” och “affisch” ut i söktjänsten på ett komplicerat sätt utifrån en mängd datapunkter. Denna onödiga komplexitet beror bl.a. på begränsningarna som fanns i katalogen då tjänsten togs fram. Parallellt med utvecklingen av den nya söktjänsten jobbar vi nu med att förbättra katalogens data och informationsmodell. Eftersom nya Libris Sök på ett mer direkt sätt avspeglar katalogen kommer kommande förbättringar synas så fort de är utförda.

Det kan fortfarande behövas olika begrepp och grad av precision i olika sammanhang. Men dessa skillnader kan i stor utsträckning fångas i den gemensamma katalogmodellen istället för att, som idag, ligga hårt knutna till olika tjänster.

### Om hur sökningen fungerar

Utöver vanlig fritextsökning så går det även att skriva mer avancerade sökfrågor direkt i sökrutan, till exempel FÖRF:Rowling, TITEL:Sockerormen eller ÅR>2000, och sökoperatorer, till exempel AND för att inkludera samtliga sökord eller NOT för att exkludera sökord.

Exempel: `pippi språk:(engelska OR franska) NOT medverkande:"astrid lindgren"`
Här får vi träff på engelska och franska verk, som “astrid lindgren” inte medverkar på och som matchar sökordet “pippi”.

För att söka fraser eller ordkombinationer ska du sätta sökorden inom citationstecken, till exempel "sju sjösjuka sjömän". Observera att detta även tills vidare behöver göras för titlar eller söksträngar med kolon “:“ i sig då det tecknet idag tolkas som en operator för riktad sökning.

För att inkludera flera ordformer trunkera med asterisk, till exempel ger sökning på kulturarv\* träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

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
<b>Övrigt</b> för inkludering av kommande titlar (förhandsinformation) eller elektroniska pliktlevererade resurser samt för avgränsning av resurser med bild

När ett eller flera filter har valts visas knappen “Redigera“ som ger dig möjligheten att redigera söksträngen i med operatorer.

Observera att allt innehåll i Libris inte är beskrivet med samtliga filtertyper. Hur material är beskrivet i Libris har varierat över tid. Du kan därför behöva göra flera kompletterande sökningar eller justera filtreringen för att fånga upp relevanta objekt. Filtren visar max 100 alternativ, du kan avgränsa sökningen ytterligare för att få fram färre.

### Om vad som visas i en detaljerad vy av objektet

I detaljvyn visas detaljerad och beskrivande information om objektet samt information som är relaterat till det. (Se ovan om detaljerna för materialtyper.)

Om materialet finns utgivet i flera utgåvor, visas utgåvorna i en lista med nyast först. Genom att klicka på pilen för varje utgåva visas detaljerad information om respektive utgåva samt de bibliotek som har den specifika utgåvan.

I vissa fall finns det en länk till materialet online. En del av dessa är fritt tillgängliga för alla, för en del krävs det att man är låntagare på ett bibliotek som har licens att visa materialet.

Genom att använda funktionen Kopiera länk till utgåva, kan du kopiera och spara direkt länk till utgåvan.
