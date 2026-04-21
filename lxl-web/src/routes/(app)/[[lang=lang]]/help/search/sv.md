---
title: 'Hjälp och tips'
---

# Hjälp och tips

Använd sökrutan för att söka! Skriv in din sökning i fritext, eller använd dig av de filter som föreslås i sökrutan.
Klicka på exemplen längre ner på den här sidan för att se hur filter och sökoperatorer kan användas i praktiken.

## Filter

En sökning kan snävas ner genom att lägga till olika sökfilter.
Enklast är att välja bland de förslag som dyker upp när sökrutan är markerad, eller från listan i vänsterpanelen.
Filter kan också läggas till för hand, genom att skriva in något av de tillåtna [nyckelorden](/help/filters) följt av ett kolon (`:`).
Exempel på nyckelord är `Författare/Upphov`, `Titel`, `Språk` etc.

I filtret väljer du sen ett värde bland förslagen, t.ex. en specifik författare, boktitel eller ett språk.
Det går också bra att ange filtrets värde i fritext.

## Frassökning

Om du vill söka mer exakt kan du sätta citationstecken (`""`) runt sökfrasen.
En sökning utan citationstecken gör att fler dokument matchar sökningen, då variationer på sökfrasen också inkluderas
(s.k. mjuk matchning).

- Exempel: [`"Désert"`](/find?_q="Désert") (franska för öken) inom citationstecken utesluter träffar på engelskans `Desert`.
- Exempel: [`"Gift"`](/find?_q="Gift") ger träffar där Tove Ditlevsens roman _Gift_ ingår men inte August Strindbergs _Giftas_.
- Exempel: [`"His dark materials"`](/find?_q="His+dark+materials") ger enbart träffar som innehåller exakt den angivna ordföljden (i det här fallet titeln på en roman- och TV-serie).

## Trunkering

Använd asterisk (`*`) för att inkludera flera olika ändelser för ett sökord.

- Exempel: [`kulturarv*`](/find?_q=kulturarv*) ger träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.
  Om en sökning ger noll träffar läggs automatiskt trunkering till för att fånga eventuella felstavningar med mera.

## Maskering

För att söka på ord som kan ha varierad stavning kan du maskera med hjälp av frågetecken (`?`).

- Exempel: [`organi?ation`](/find?_q=organi?ation) ger träffar på både organisation och organization (brittisk och amerikansk stavning).

Maskering av sista bokstaven i ett ord görs med `\?`.

## Operatorer

Sökfilter och ord eller fraser i fritext kan kombineras med operatorerna `AND`,`OR` och `NOT`.
Operatorer måste anges med versaler. Om ingen operator anges mellan ord eller filter i en följd tillämpas ett underförstått `AND`.

Det går lika bra att använda de svenska varianterna `OCH`,`ELLER` och `INTE`.

### NOT – uteslut sökord eller filter

Med `NOT` kan du utesluta sökord, filter eller fraser från träffmängden.

- Exempel: [Sök på Astrid Lindgren men uteslut träffar om Pippi Långstrump.](/find?_q=contributor:"libris:fcrtpljz1qp2bdv%23it"+NOT+"Pippi+långstrump")

![NOT](/docs/img/NOT.png)

### OR – bredda sökningen

Lägg till `OR` mellan söktermer eller filter för att få fler sökträffar. Träffarna innehåller då en eller fler av de angivna söktermerna.

- Exempel: [Sök efter poesi på meänkieli eller finska.](</find?_q=(Språk:"lang:9mk"+OR+Språk:"lang:fin")+Kategori:"saogf:Poesi">)

![OR](/docs/img/OR.png)

### AND – alla sökord eller filter måste finnas med

`AND` behöver sällan anges direkt utan tillämpas automatiskt om ingen annan operator anges.

![AND](/docs/img/AND.png)

## Gruppering

Använd parenteser `()` för att konstruera mer komplicerade sökfrågor som innehåller kombinationer av operatorer, sökfilter och sökfraser.

- Exempel: [Sök efter romaner eller noveller som handlar om kärlek eller vänskap.](</find?_q=(Kategori:"saogf:Noveller"+OR+Kategori:"saogf:Romaner")+(subject:"sao:K%25C3%25A4rlek"+OR+subject:"sao:V%25C3%25A4nskap")>)

## Relevans och rankning av sökträffar

Sökträffar rangordnas automatiskt enligt vissa kriterier.
Till exempel kommer träffar där sökfrasen ingår i titeln eller i de medverkandes namn (författare, illustratörer, översättare osv) högre upp i träfflistan. Du kan även sortera träfflistan efter A-Ö, Ö-A, Nyast-Äldst, Äldst till nyast och Antal bibliotek.

## Maskinell sökning

Se vår [API-dokumentation](https://libris.kb.se/api/docs/) för information om mer specialiserad sökning.
Här kan du också läsa om hur du gör anrop för att skapa integrationer mot andra system.

## Söktips

### Kopiera sökningar

Det går enkelt att kopiera sökningar (inklusive filter) genom att markera innehållet i sökrutan och kopiera det som om det vore vanlig text.

- Exempel: [En sökning på datorspel som finns på Bergslagsbibblan](/find?_q=category:"saogf:Datorspel"+itemHeldByOrg:"sigel:org/BER"), som klickats fram från föreslagna filter, kan omvandlas till dess textrepresentation (`category:"saogf:Datorspel" itemHeldByOrg:"sigel:org/BER"`) genom att markera och kopiera den.

### Tomma filter – kräv att en egenskap ska finnas

Ett tomt filter kan användas för att kräva att sökträffarna ska innehålla egenskapen som filtret beskriver (oavsett värde).

- Exempel: [Sök på allt material i Libris som har en ISMN-kod.](</find?_q=ISMN%3A()>)

### Exakta eller liknande träffar

När du söker på en person som är kopplad till flera verk visas både exakta och liknande träffar i träfflistan. Det innebär att du även kan få träffar på material där personens namn är likadant stavat, men där det ännu inte är länkat i katalogen. Detta beror på att allt innehåll i katalogen inte är fullständigt länkat. Vill du endast se titlar där personen är korrekt och aktivt länkad, klickar du på länken ”Visa bara exakta träffar för …” som visas under antalet träffar.

## Favoritbibliotek

Du kan spara ett eller flera bibliotek som favoriter för att snabbt avgränsa dina sökningar till dessa.
Du gör detta antingen genom att: klicka på “Mina sidor“ högst upp på sidan eller på “penn-ikonen“ bredvid filtret “Avgränsa till mina bibliotek“ på sökträffsidan.
På “Mina sidor“ söker du fram önskade bibliotek och klickar på “lägg till“. För att ta bort bibliotek från dina favoriter klickar du på “ta bort“ under respektive bibliotek.
Informationen om dina favoritbibliotek sparas lokalt i din webbläsare i en kak-fil.

## Referenser

Varje utgåva har en knapp ‘Referera‘ som gör det enkelt att skapa referenser i ett antal olika format. När du klickar på knappen öppnas ett fönster där du kan du välja mellan referensformat och kopiera den färdiga referensen som text. Det finns även stöd för vanliga insticksprogram i webbläsaren vilket gör att du kan exportera referensen direkt till ditt referenshanteringsverktyg.

## “Finns online”

Material som innehåller länkar till material som är tillgängligt online har en knapp “Finns online“. Där listas alla de länkar som finns tillgängliga via bibliotek eller andra källor. Mycket av detta material är också fritt tillgängligt.
