---
title: 'se'
---

# Sök i Libris

Använd sökrutan för att söka! Välj bland de förslag på filter som dyker upp, eller genom att göra en vanlig fritextsökning.

Se vår API-dokumentation för information om mer specialiserad sökning. Här kan du också läsa om hur du göra anrop för att skapa integrationer mot andra system.

## Filter

En sökning kan snävas ner genom att applicera olika sökfilter. Dessa kan skrivas in för hand eller läggas till genom att välja bland de förslag som dyker upp när sökrutan är markerad.
Exempel på filter är `Författare`, `Titel`, `Språk` etc. Alla sökfilter finns samlade listade [här](/help/filters). Nånting om sökkoder "vi använder dem synonymt"

Exempel:
Du har valt författarfiltret: Välj vilken författare du vill söka på genom att fortsätta skriva.

Fler exempel på länkad data powerr

Sökfilter kan också läggas till genom att välja dem i vänsterpanelen.

## Operatorer

Sökfilter och ord i fritext kan kombineras med operatorerna `AND`,`OR` och `NOT`.
Om ingen operator anges mellan ord eller filter i en följd tillämpas ett underförstått `AND`.
DET MÅSTE VARA VERSALER
Det FUNKAR OCKSÅ MED OCH ELLER INTE

### NOT

`NOT`
![NOT](/docs/img/NOT.png)

Exempel:

### AND --

`AND`
![AND](/docs/img/AND.png)

Exempel:

### OR --

`OR`
![OR](/docs/img/OR.png)

Exempel:

## Frassökning

avvaktiverar mjuk matchning (stemming i elastic)
matchar diakriter
"bananer" inga träffar på "banan"
Om du vill söka på en exakt sökfras där ordföljden är viktig kan du sätta citationstecken (`""`) runt sökfrasen.

Exempel: `"Hundra år av ensamhet"`
I normala fall ....?? Brasklapp om att det inte behövs i vanliga fall?

## Trunkering

Använd asterisk (`*`) för att inkludera flera olika ändelser för ett sökord.

Exempel: `kulturarv*`ger träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.

## Maskering

Ett eller flera tecken?
För att söka på ord som kan ha varierad stavning går det bra att maskera med hjälp av frågetecken (`?`).

Exempel: `organi?ation` ger träffar på både organisation och organization (brittisk och amerikansk stavning).
