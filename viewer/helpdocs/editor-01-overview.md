---
section: Redigering
title: Redigering
tags:
- editor
---

# Redigering

## Översikt
Då gränssnittet är datadrivet så har posternas visningsvy och en redigeringsvy för alla olika typer av resurser i stort sett samma disposition. 
De övergripande element en post innehåller är: 

  * Administrativ metadata (Adminmetadata)
  * Sammanfattning av resursen
  * Deskriptiv metadata
  * Interaktionselement (i visning- och redigeringsvyn)

### Administrativ metadata
För att se postens administrativa metadatan klickar man på Adminmetadata-knappen som visas i postvyn. Där visas en utfällbar sektion med Administrativ metadata som bland annat innehåller information om när beskrivningen skapades, vem som skapade den, vilka regler som den är beskriven med, samt om den ingår i en bibliografi.

### Sammanfattning av resursen
För att snabbt kunna avläsa den viktigaste informationen i en post har alla poster en sammanfattning. Sammanfattningen innehåller resursens:

  * Typ, exempelvis: Text, Manuskript, Person, Ämne.
  * Titel, namn eller annan föredragen benämning.
  * Övrig information för särskiljning av resursen.


### Deskriptiv metadata
Den detaljerade beskrivningen som ligger till grund för posten. Denna innehåller:

  * Fältordning
  * Termer
  * Strukturerade värden (Lokala entiteter)
  * Värden
  * Länkade värden (Länkade entiteter)
  * Chips/Cards

## Interaktionselement i visningsvy

### Lägg bestånd (endast från typen instans)
Från instanser kan man lägga bestånd. Detta görs i postens visningsvy, där man når beståndsposten via beståndsknappen i sammanfattningen. På beståndsknappen ser du vilket sigel beståndet läggs på. Från instanser kan du även se hur många andra bibliotek som har bestånd på instansen.

### Visa som
Under rubriken “Visa som” kan man, utöver den grafiska vyn även granska informationen i formaten:

  * Json-LD (RDF anpassad för webbapplikationer) 
  * Turtle (RDF anpassad för läsning)
  * RDF/XML

### Verktyg

#### Expandera/minimera alla
För att skapa en bättre översikt på posten, samt för att enklare se vad posten innehåller finns möjlighet att expandera och minimera alla postens fält och delfält med ett klick.

#### Kopiera
Knappen för att kopiera duplicerar all beskrivning in i en ny post. Det står då [Kopia] i postens rubrik. 
OBS! Dock har ingen post skapats förrän postens sparats. När posten sparats får den ett nytt ID. Om man avbryter utan att spara försvinner posten.

#### Förhandsgranska i MARC21
Som ett ytterligare stöd finns också möjlighet att granska sitt arbete genom att förhandsgranska det i MARC21-format. MARC21-vyn konverterar posten vid öppning och är inte editerbar.

#### Ta bort post 
En post går att radera om den inte har obrytbra relationer.

### Redigering
Klicka redigera för att göra ändringar i posten. 

## Interaktionselement i redigeringsvy

### Verktyg
(se visningsvy ovan)

### Spara
Spara-knappen sparar posten direkt till Libris databas och tar dig tillbaka till visningsvyn. Vid sparning uppdateras uppgifter för tidpunk och användare som utfört sparningen.

### Avbryt
Vid avbryt sparas inga ändringar i posten och den behålls som den var innan du gick in i redigeringsläge.

### Ångra
Du kan ångra text du skrivit i ett fält, men även ångra om du till exempel lagt till ett felaktigt fält i formuläret.

### Lägg till och ta bort fält/delfält
För att lägga till ett nytt fält, klicka på den gröna runda knappen med ett plus nere i högra hörnet. 
För att lägga till ett delfält, klicka på +Fält ikonen som finns i anslutning till delfältet.
För att ta bort fält, klicka på soptunnan längst till höger i ett delfält eller på en rad. 

### Hjälp
På vissa fält i posten finns det kontextuell hjälp att tillgå som nås via frågetecken-ikonen.

## Entiteter

### Söka fram entiteter
När du ska lägga till en entitet är första steget att göra en sökning för att se om entiteten redan finns eller inte. Sökningen görs antingen via:

  * Fritextsök: Gör en bred sökning genom att skriva in text i sökfältet och få fram sökresultat.
  * Sök i typer: Välj en “typ” i listan i kombination med en fritextsökning. Då blir sökresultatet specifikt för den valda typen.

### Lägg till entitet eller Skapa lokal entitet
När du gjort din sökning finns det två scenarion:

#### 1) Lägg till entitet: 
Att du fått fram ett sökresultat där du identifierat en entitet att lägga till via “Lägg till entitet”. Om du fått fram ett önskat sökresultat kan du lägga till den relevanta entiteten genom att klicka på “Lägg till”. Entiteten lägger sig då i posten som en länk. 

#### 2) Skapa lokal entitet:
Om du inte identifierar en relevant entitet att lägga till i ditt sökresultat. Då kan du istället “Skapa en lokal entitet”. Om du inte hittar en lämplig länkad entitet genom sökning att lägga till kan du Skapa lokal entitet. Då skapas en lokal entitet som du kan redigera och göra länkbar.

### Länka entiteter
Eftersom det nya katalogiseringsverktyget bygger på Länkad data finns det möjlighet att länka entiteterna i posterna. Man kan tydligt se i posten vilka entiteter som är länkbara, eftersom dessa har en grå länksymbol till vänster om sig. Entiteter som redan är länkade är symbolen istället grön och dessa går att navigera vidare till.

För att länka en entitet klickar du på den gråa länk-symbolen. Du får då upp en dialog där du först gör en sökning för att se om entiteten redan finns eller inte. 

### Sökresultat
När du gjort din sökning finns det två scenarion:

#### 1) Ersätt lokal entitet:
Om du får fram ett sökresultat där du identifierar en entitet att ersätta den lokala entiteten med, kan du välja “Ersätt lokal entitet” Det betyder att du ersätter all entitetsinformation som finns lokalt i entiteten med informationen i den länkade entiteten. Om du vill se den länkade posten i sin helhet, innan du avgör om du vill ersätta till den, kan du högerklicka på den och välja “Öppna i ny flik”. 

#### 2) Skapa och länka entitet: 
Om du inte identifierar relevant entitet att ersätta med, kan du istället “Skapa och länka entitet”. Det betyder att du skapar en länk av din lokala entitet. All information från denne följer då med och blir till en egen post med ett eget ID. Efter att ha sparat posten kan du gå in i länken och redigera den i den nyskapade posten.

## Träfflista
Träfflistan i Libris XL sorteras enligt relevansordning som konfigureras i den underliggande sökmotorn Elasticsearch.

Facetteringen är automatiskt inställd på typen instans, men sökningen kan utökas till att även söka i typerna Verk, Agent och Koncept genom att kryssa i lådorna för dessa. Observera att du då söker direkt efter dessa typer av poster och inte efter förekomst i bibliografiska poster.

Antalet träffar som visas är förinställt till 20 träffar per sida och kan visas antingen som en utökad eller en komprimerad lista.

I vänsterspalten finns ytterligare möjligheter till filtreringar såsom: Typ, verkstyp, verksspråk och utgivningsdatum.

[^1]:	librispraxis
