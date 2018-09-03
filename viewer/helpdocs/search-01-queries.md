---
section: Sök
title: Utforma sökfrågor
order: 1
date: 2018-05-29
tags:
- search
---

# Sök

## Operatorer för frågespråk

   `+` betyder AND  
   `|` betyder OR  
   `-` innebär uteslutning  
   `"` används för frassökning  
   `*` innebär trunkering av en term  

---

### Standardsökning

En standardsökning ger träff på sammanslagen sökterm. En sökning på Astrid Lindgren kommer matcha poster innehållandes Astrid och Lindgren, oavsett ordning och oavsett var i posten orden finns. Sökningen kommer alltså även matcha `Lindgren Astrid`, `Astrid heter i efternamn Lindgren` och liknande.

### Exakt sökning

Om du vill söka på en exakt fras, använd `"`. En sökning på `"Emil i Lönneberga"` ger träff på fras i angiven ordning. Sökningen kommer alltså inte matcha till exempel `Emil som bor i Lönneberga`.

### Eller

Om du vill söka på eller, använd `"|"`. Exempelvis ger `"Tove Jansson" | "Astrid Lindgren"` träff på `Tove Jansson` eller `Astrid Lindgren`.

### Exkludera termer

Om du vill exkludera en term, använder `-`. Exempelvis ger `Astrid -Lindgren` träff på alla träffar som innehåller `Astrid` men inte `Lindgren`.

### Gruppering av termer 

Om du vill gruppera termer och operatorer, använd `(` och `)`. Exempelvis ger en sökning på `(Tove | Lars) Jansson`träff på Tove eller Lars Jansson. Utan parenteserna söker du efter `Tove` eller `Lars Jansson`, men med parenteserna söker du på `Tove Jansson` eller `Lars Jansson`

### Trunkering

Om du vill trunkera, använd `*`. Trunkering ger träff på alla ändelser efter prefixet. Exempelvis ger `sol*` träff på bland andra `solros` , `sola` och `solig`.

### ISBN

Ett ISBN innefattar fem delar som åtskiljs med bindestreck eller mellanrum. I nya Libris sparas konsekvent ISBN utan bindestreck och mellanrum vilket underlättar hantering av data och möjliggör därmed bland annat dubblettkontroll.

Det går att söka på ISBN både med och utan tecken. 

    Exempel fritext: `9789144113074`

Fritextsökning utan bindestreck kan även ge träffar på relaterade resurser. 

Fritextsökning på ISBN med bindestreck föredras inte, eftersom XL tar bort bindestrecken vid indexeringen.

För att optimera och rikta sökning på ISBN, ange sökkoden `ISBN:` Vid sökning med sökkoden ISBN: måste katalogisatören för närvarande fälla ut sökrutan och välja `ISBN:`.
