---
title: 'se'
---

# Sök i Libris

Använd sökrutan för att söka! Skriv in din sökning i fritext, eller använd dig av de filter som föreslås i sökrutan.
Klicka på exemplen längre ner på den här sidan för att se hur filter och sökoperatorer kan användas i praktiken.

## Filter

En sökning kan snävas ner genom att lägga till olika sökfilter. Dessa kan skrivas in för hand, genom att skriva in något av de tillåtna [nyckelorden](/help/filters) följt av ett kolon (`:`). Enklast är att välja bland de förslag som dyker upp när sökrutan är markerad.

Exempel på nyckelord är `Författare/Upphov`, `Titel`, `Språk` etc. I filtret väljer du sen ett värde bland förslagen, t.ex. en specifik författare, boktitel eller ett språk.

Sökfilter kan också läggas till genom att välja dem i vänsterpanelen.

## Operatorer

Sökfilter och ord eller fraser i fritext kan kombineras med operatorerna `AND`,`OR` och `NOT`.
Operatorer måste anges med versaler. Om ingen operator anges mellan ord eller filter i en följd tillämpas ett underförstått `AND`.

Det går lika bra att använda de svenska varianterna `OCH`,`ELLER` och `INTE`.

### NOT -- uteslut sökord eller filter

Med `NOT` kan du utesluta sökord, filter eller fraser från träffmängden.

- Exempel: [Sök på Astrid Lindgren men uteslut träffar om Pippi Långstrump.](https://beta.libris.kb.se/find?_q=contributor:"libris:fcrtpljz1qp2bdv%23it"+NOT+"Pippi+långstrump")

![NOT](/docs/img/NOT.png)

### OR -- bredda sökningen

Lägg till `OR` mellan söktermer eller filter för att få fler sökträffar. Träffarna innehåller då en eller fler av de angivna söktermerna.

- Exempel: [Sök efter poesi på meänkieli eller finska.](<https://beta.libris.kb.se/find?_q=(Språk:"lang:9mk"+OR+Språk:"lang:fin")+Kategori:"saogf:Poesi">)

![OR](/docs/img/OR.png)

### AND -- alla sökord eller filter måste finnas med

`AND` behöver sällan anges direkt utan tillämpas automatiskt av systemet om ingen annan operator anges.

![AND](/docs/img/AND.png)

## Gruppering

Använd parenteser `()` för att konstruera mer komplicerade sökfrågor som innehåller kombinationer av operatorer, sökfilter och sökfraser.

- Exempel: [Sök efter romaner eller noveller som handlar om kärlek eller vänskap.](<https://beta.libris.kb.se/find?_q=(Kategori:"saogf:Noveller"+OR+Kategori:"saogf:Romaner")+(subject:"sao:K%25C3%25A4rlek"+OR+subject:"sao:V%25C3%25A4nskap")>)

## Frassökning

Om du vill söka mer exakt kan du sätta citationstecken (`""`) runt sökfrasen.
En sökning utan citationstecken gör att fler dokument matchar sökningen, då variationer på sökfrasen också inkluderas
(s.k. mjuk matchning).

- Exempel: [`"Désert"`](https://beta.libris.kb.se/find?_q="Désert") (franska för öken) inom citationstecken utesluter träffar på engelskans `Desert`.
- Exempel: [`"His dark materials"`](https://beta.libris.kb.se/find?_q="His+dark+materials") ger enbart träffar som innehåller exakt den angivna ordföljden (i det här fallet titeln på en TV-serie).

## Trunkering

Använd asterisk (`*`) för att inkludera flera olika ändelser för ett sökord.

- Exempel: [`kulturarv*`](https://beta.libris.kb.se/find?_q=kulturarv*) ger träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

## Maskering

För att söka på ord som kan ha varierad stavning kan du maskera med hjälp av frågetecken (`?`).

- Exempel: [`organi?ation`](https://beta.libris.kb.se/find?_q=organi?ation) ger träffar på både organisation och organization (brittisk och amerikansk stavning).

## Relevans och rankning av sökträffar

Sökträffar rangordnas automatiskt enligt vissa kriterier.
T.ex. kommer träffar där sökfrasen ingår i titeln eller i de medverkandes namn (författare, illustratörer, översättare osv) rangordnas högre och därför hamna längre upp i träfflistan.

## Maskinell sökning

Se vår API-dokumentation för information om mer specialiserad sökning. Här kan du också läsa om hur du gör anrop för att skapa integrationer mot andra system.
