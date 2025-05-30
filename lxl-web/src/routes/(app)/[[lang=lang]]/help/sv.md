---
title: 'Hjälp'
---

# Hjälp

### Att använda sökfunktionen

Mycket material går att hitta med en enkel fritextsökning i sökrutan. Träffarna kan sorteras enligt de kategorier som finns i rullgardinsmenyn till höger på sidan.
Utöver vanlig fritextsökning finns också möjligheten att konstruera mer avancerade sökfrågor som innehåller filter och sökoperatorer.
Ett sätt att utforska mer komplicerade sökfrågor är att klicka på de filter som finns i vänsterkolumnen. Aktiva filter visas direkt under sökrutan. Hela sökfrågan har även en textrepresentation som kan ändras fritt om man klickar på Redigera-knappen.

De filter som finns i vänsterkolumnen är:

<b>Typ</b> - materialtyp<br>
<b>Format</b> - typ för lagring eller uppspelning/visning<br>
<b>Genre/form</b> - beskrivning av vad objektet är<br>
<b>Språk</b> - det språk som används i objektet<br>
<b>Utgivningsår</b> - årtalet då objektet gavs ut<br>
<b>Bibliotek</b> - bibliotek som har objektet i sina samlingar<br>
<b>Bibliografi</b> - förteckning över material inom ett specifikt område, exempelvis person, ämne eller geografiskt område<br>
<b>Ämne</b> - ämnesord som objektet är beskrivet med<br>
<b>Medverkan</b> - personer eller organisationer som skapat eller har bidragit till tillkomsten av objektet<br>
<b>Målgrupp</b> - den tänkta målgruppen för objektet<br>
<b>Övrigt</b> - inkludering av kommande titlar (förhandsinformation) eller elektroniska pliktlevererade resurser samt för avgränsning av resurser med bild

Ytterligare egenskaper som går att filtrera på finns listade på [id.kb.se/vocab](https://id.kb.se/vocab/) (tryck på Egenskaper-knappen). Vissa vanliga egenskaper kommer ett få enklare etiketter för att det ska gå snabbt att skriva in vanliga sökfrågor för hand. Redan nu kan man använda kortformen `ÅR` för att söka på material med ett specificerat utgivningsår eller årsspann.
I redigeringsläget finns också stöd för sökoperatorerna `AND`, `OR` och `NOT`.

För att söka på fraser sätts sökorden inom citationstecken, till exempel "sju sjösjuka sjömän". Observera att detta även tills vidare behöver göras för titlar eller söksträngar som innehåller kolon “:“ eftersom det tecknet idag tolkas som en operator för riktad sökning.

Asterisk används för trunkering då man vill inkludera fler ordformer. Till exempel ger sökning på kulturarv\* träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

#### Exempelsökningar

Här följer några exempel som går att skriva in som sökfrågor direkt i sökrutan. Klicka på de olika exemplen för att öppna dem i söktjänsten.

Engelska och franska verk som matchar sökfrasen "pippi långstrump" som givits ut efter år 2002:

[`pippi långstrump språk:(engelska OR franska) ÅR>2002`](<https://beta.libris-qa.kb.se/find?_i=pippi+l%C3%A5ngstrump&_q=pippi+l%C3%A5ngstrump+SPR%C3%85K:(engelska%20OR%20franska)&_limit=20&_x=advanced>)

Material med utgivning mellan 2010 och 2024, som är på svenska och har [drakar](https://id.kb.se/term/sao/Drakar) som ämne:

[`språk:svenska ÅR>2010 ÅR<=2024 ämne:"sao:Drakar"`](https://beta.libris-qa.kb.se/find?_i=&_q=SPR%C3%85K:svenska+%C3%85R%3E2010+%C3%85R%3C%3D2024+subject:%22sao:Drakar%22&_limit=20&_x=advanced)

Fritextsökning på träd\*, där alla träffar ingår i bibliografin Digitaliserat Svenskt Tryck men som inte har verkstyp "Text":

[`träd* bibliografi:"sigel:DST" NOT typ:Text`](https://beta.libris-qa.kb.se/find?_i=tr%C3%A4d*&_q=tr%C3%A4d*+bibliography:%22sigel:DST%22+NOT+%22rdf:type%22:Text&_limit=20&_x=advanced)

Verk där Selma Lagerlöf är författare som har minst en upplaga som är en elektronisk resurs:

[`författare:"selma lagerlöf" "hasInstanceType":Electronic`](https://beta.libris-qa.kb.se/find?_i=&_q=F%C3%96RF:%22selma+lagerl%C3%B6f%22+hasInstanceType:Electronic&_limit=20&_x=advanced)

### Detaljvyn

Varje objekt i katalogen kan nås genom att antingen klicka på det i träfflistan eller genom att mata in dess unika URL i webbläsarens adressfält. Här finns en mer ingående beskrvning av objektet tillsammans med information som är relaterat till det.

Om materialet finns utgivet i flera utgåvor visas dessa i en lista sorterad efter utgivningsdatum. Genom att klicka på pilen för varje utgåva visas mer detaljerad information om denna, samt de bibliotek som har den specifika utgåvan.

I vissa fall innehåller detaljvyn en eller flera länkar för att komma åt materialet online. En del material är fritt tillgängliga för alla, annat kräver att man är låntagare på ett bibliotek som har licens för att visa materialet.
