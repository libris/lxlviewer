---
section: Import
title: Import av poster
tags:
- search
- import
---

# Import av poster

**Metaproxy, som nås via katalogiseringsklientens gränssnitt för remotesökning i Voyager**, erbjuder tre olika sätt att söka. Du kan söka direkt i ett antal nationalbiblioteksskataloger eller andra större och särskilt intressanta databaser, eller så kan du söka i ett antal olika samlingar av databaser. (Anglosax 1-4, Metasök Asien, Metasök Latin, Metasök Mellaneuropa och Metasök Norden.)

Från och med juni 2013 finns samtliga databasgrupperingar tillgängliga i uppdaterade versioner. 

Allsök & Metasök
Den aktuella konfigurationen erbjuder många källor för sökning med ett stort antal databaser. För en enkel hantering har vi strukturerat dem på följande sätt.

**Allsök innehåller databaser från anglosaxiska områden:**

* Allsök 1: Anglosaxiska databaser från USA
* Allsök 2: Anglosaxiska databaser från USA
* Allsök 3: Anglosaxiska databaser från Kanada
* Allsök 4: Anglosaxiska databaser från övriga världen

**Metasök erbjuder databaser utanför de engelskspråkiga områdena. De har för enkelhetens skull fått självförklarande namn:**

* Metasök Asien
* Metasök Latin
* Metasök Norden
* Metasök Mellaneuropa

Det finns också ett stort antal enskilda nationalbibliotek representerade i Metaproxyn och dessa är listade under sina respektive namn.


Lista över institutioner som ingår i Metaproxyns delmängder
(25 juni 2013)

## Metaproxy - egenskaper
Libris har sedan tidigare ett supportavtal med det danska företaget Indexdata som utvecklat programvaran Metaproxy. Tillsammans har vi identifierat vissa förbättringsområden för produkten och specialutveckling har gjort den till ett ännu bättre redskap för ”copy cataloguing”.

Exempel på funktionalitet som finns i vår version av metaproxyn är:

Konfigurering av söksyntax på individuell databasnivå vilket innebär att många fler databaser kan samsökas.
Unimarc-konvertering möjliggör sökning i unimarc-databaser.
Förbättrad teckenkonvertering för databaser som inte har UTF-8 eller marc-8.
Rensning av lokala fält i samtliga databaser.
SRU-sökning, det vill säga sökning i Z3950-databaser via http.
Förbättrad felhantering vid sökning och visning i träfflistor.
Om Metasök
Sökning
Varje databas har två sökingångar: ISBN och valfria sökord. Detta för att harmonisera och optimera sökfrågorna så att de passar så många databaser som möjligt. Metaproxyn är optimerad för ISBN-sökning och det är denna man bör välja i första hand. Vid användning av valfria sökord bör man välja så unika sökord som möjligt.

Eftersom Metaproxy sköter felhanteringen, innan posterna skickas till katalogiseringsklienten, kan samma sökfråga ge olika resultat vid olika tillfällen. Vid sökning hämtas ett begränsat antal poster från varje databas. Dessa presenteras i träfflistan och man väljer en lämplig post att bearbeta. Efter den nya konfigurationen finns möjlighet att se från vilken databas posten kommer. Fält 599 anger IP-adressen, parentesen som anger (Do not remove) är inskriven för att förtydliga hur viktigt det är att IP-adressen lämnas kvar vid import till Libris. Nyttan av informationen i fält 599 är att man enkelt med söktermen spec:imported kan söka upp samtliga från Metaproxy importerade poster i Libris webbsök. Det här ger en möjlighet att enkelt ta ut statistik. 

## Felmeddelanden
Samsökningstjänsten har en komplicerad struktur där flera olika programvaror interagerar med varandra. Detta innebär bland annat att katalogiseringklienten kan ha svårt att tolka resultaten från Metaproxy. Till exempel får man ibland felmeddelandet ”Search failed”, som är ett standardmeddelande i katalogiseringsklienten, men kan betyda flera olika saker. Det kan ibland betyda ”Inga träffar”. Det kan också betyda ”Något gick snett i sökningen” och då kan man bara klicka på Search igen och förhoppningsvis få ett sökresultat. Om man i stället får ”Search failed” vid upprepade tillfällen betyder det oftast ”Jag har tappat kontakten med Metaproxy”. För att återskapa uppkopplingen tar man bort den från listan över valda databaser, lägger till den igen och utför sökningen på nytt.

## Postbearbetning
De framsökta marcposterna bearbetas innan de skickas till katalogiseringsklienten. Det är lite beroende på ur vilken databas den framsökta posten hämtas men generellt rensas posten från lokala fält och vissa indikatorer rättas. Detta möjliggör också import av poster från system som har andra marcformat än MARC21. Vid sökning i, exempelvis UNIMARC-databaser, konverteras posterna ”on-the-fly” till MARC21 innan de skickas till katalogiseringsklienten. Rensning av fält och formatkonvertering är ett pågående arbete med att förenkla arbetsflödet för katalogisatören och att förbättra posternas kvalitet innan de visas i katalogiseringsklienten.

## Databaser i Metaproxy 
De delmängder som ingår i Metaproxy och som kan tillkomma är utvalda efter olika kriterier. De ska ha snabba svarstider, vara driftsmässigt pålitliga, innehålla många poster, täcka in olika språk- och ämnesområden, täcka in material för både folk- och forskningsbibliotek, och även täcka in andra materialtyper såsom CD, DVD, dataspel med mera.

Genom att markera flera metadatabaser kan delmängderna samsökas direkt i katalogiseringsklienten och då rensas även dubblettposter i träfflistan.

## Förslag på fler databaser
Önskemål och förslag på andra bibliotekskataloger som bör göras sökbara via Metaproxy och katalogiseringsklienten kan skickas till Libris kundservice. Ange institutionens namn, adressen till Z-servern, port samt databasens namn. (Exempelvis: Library of Congress,  address: z3950.loc.gov, port 7090, databasnamn: Voyager.)

Det är bara databaser som har ett Z39.50-gränssnitt eller ett SRU/SRW-gränssnitt tillgängligt som är möjliga att göras samsökningsbara via Metaproxy eller genom katalogiseringsklienten. Metaproxyn testas också i samband med utvecklingen av det nya katalogiseringsverktyget där den ska ingå som en integrerad del.

## Söktips
Får du för många eller för få träffar när du söker i Metaproxy? Vi har sammanställt några söktips för att få så relevanta träffar som möjligt.

## Tydlighet

**Det är viktigt att sökfrågan alltid är så tydlig och unik som möjligt.**

Försök att i så stor utsträckning som möjligt lägga till ett årtal när du söker på titel.
Gör sökfrågan så precis som möjligt. En stor sökfråga med för många träffar kan från värdserverns sida uppfattas som spam. Det kan i sin tur leda till att vi blir blockerade från värdservern vilket vi naturligtvis vill undvika.

**ISBN**

Sök alltid på ISBN i första hand.

ISBN skrivs utan bindestreck.

Om du inte får träff kan du prova att skriva ISBN i fältet för Valfria sökord istället för i fältet för ISBN. Eftersom ISBN inte alltid ligger i 020-fältet kan en sökning i hela posten ge träff.

**Samsökdatabaserna**

Välj den grupp av databaser som bäst passar din sökning. Om du till exempel söker en asiatisk källa, använd Metasök Asien. Se databasernas gruppering: Delmängder.

En sökning i gruppen Metasök Mellaneuropa går tyvärr inte lika snabbt som de andra grupperna.

## Allmänt
Radera inte fält 599. Genom att fält 599 finns i posten går det i Libris webbsök att ange söktermen spec:imported och få fram vilka och hur många poster som importerats genom Metaproxy.
Kontrollera den importerade posten! Trots att nya Metaproxy rensar och rättar i större utsträckning än tidigare är det viktigt att se till att varje post är korrekt inför importen till Libris och det lokala systemet. 
