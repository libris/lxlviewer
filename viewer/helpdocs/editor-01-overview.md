---
section: Redigering
title: Översikt
order: 20
tags:
- editor
---

# Översikt
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



## Träfflista
Träfflistan i Libris XL sorteras enligt relevansordning som konfigureras i den underliggande sökmotorn Elasticsearch.

Facetteringen är automatiskt inställd på typen instans, men sökningen kan utökas till att även söka i typerna Verk, Agent och Koncept genom att kryssa i lådorna för dessa. Observera att du då söker direkt efter dessa typer av poster och inte efter förekomst i bibliografiska poster.

Antalet träffar som visas är förinställt till 20 träffar per sida och kan visas antingen som en utökad eller en komprimerad lista.

I vänsterspalten finns ytterligare möjligheter till filtreringar såsom: Typ, verkstyp, verksspråk och utgivningsdatum.

[^1]:	librispraxis
