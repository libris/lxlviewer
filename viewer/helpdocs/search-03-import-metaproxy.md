---
section: Sök
title: Andra källor
tags:
- search
- import
---

# Import av poster från andra källor


Via tjänsten Metaproxy kan vi erbjuda tre olika sätt att söka i andra källor. Du kan söka direkt i ett antal nationalbiblioteksskataloger eller andra större och särskilt intressanta databaser, eller så kan du söka i ett antal olika samlingar av databaser. (Anglosax 1-4, Metasök Asien, Metasök Latin, Metasök Mellaneuropa och Metasök Norden.)

_Från och med juni 2013 finns samtliga databasgrupperingar tillgängliga i uppdaterade versioner._

Allsök & Metasök
Den aktuella konfigurationen erbjuder många källor för sökning med ett stort antal databaser. För en enkel hantering har vi strukturerat dem på följande sätt.

**Allsök innehåller databaser från anglosaxiska områden:**

* Allsök 1: Anglosaxiska databaser från USA
* Allsök 2: Anglosaxiska databaser från USA
* Allsök 3: Anglosaxiska databaser från Kanada
* Allsök 4: Anglosaxiska databaser från övriga världen

**Metasök erbjuder databaser utanför de engelskspråkiga områdena**

* Metasök Asien
* Metasök Latin
* Metasök Norden
* Metasök Mellaneuropa

Det finns också ett stort antal enskilda nationalbibliotek representerade i Metaproxyn och dessa är listade under sina respektive namn.


## Metaproxy - egenskaper
Libris har sedan tidigare ett supportavtal med det danska företaget Indexdata som utvecklat programvaran Metaproxy. Tillsammans har vi identifierat vissa förbättringsområden för produkten och specialutveckling har gjort den till ett ännu bättre redskap för ”copy cataloguing”.

Exempel på funktionalitet som finns i vår version av metaproxyn är:

* Konfigurering av söksyntax på individuell databasnivå vilket innebär att många fler databaser kan samsökas.
* Unimarc-konvertering möjliggör sökning i unimarc-databaser.
* Förbättrad teckenkonvertering för databaser som inte har UTF-8 eller marc-8.
* Rensning av lokala fält i samtliga databaser.
* SRU-sökning, det vill säga sökning i Z3950-databaser via http.
* Förbättrad felhantering vid sökning och visning i träfflistor.

## Om Metasök

## Sökning

Varje databas har två sökingångar: ISBN och valfria sökord. Detta för att harmonisera och optimera sökfrågorna så att de passar så många databaser som möjligt. Metaproxyn är optimerad för ISBN-sökning och det är denna man bör välja i första hand. Vid användning av valfria sökord bör man välja så unika sökord som möjligt.

Eftersom Metaproxy sköter felhanteringen, innan posterna skickas till katalogiseringsverktyget, kan samma sökfråga ge olika resultat vid olika tillfällen. _Vid sökning hämtas ett begränsat antal poster från varje databas_. Dessa presenteras i träfflistan och man väljer en lämplig post att bearbeta. Efter den nya konfigurationen finns möjlighet att se från vilken databas posten kommer. En teknisk anmärkning (599 i MARC21) anger IP-adressen, parentesen som anger (Do not remove) är inskriven för att förtydliga hur viktigt det är att IP-adressen lämnas kvar vid import till Libris. Nyttan av informationen i fältet är att man enkelt med söktermen spec:imported kan söka upp samtliga från Metaproxy importerade poster i Libris webbsök. Det här ger en möjlighet att enkelt ta ut statistik. 

## Felmeddelanden
Samsökningstjänsten har en komplicerad struktur där flera olika programvaror interagerar med varandra. Detta innebär bland annat att katalogiseringverktyget kan ha svårt att tolka resultaten från Metaproxy. Till exempel får man ibland felmeddelandet ”Search failed”, som är ett standardmeddelande i katalogiseringsklienten, men kan betyda flera olika saker. Det kan ibland betyda ”Inga träffar”. Det kan också betyda ”Något gick snett i sökningen” och då kan man bara klicka på Search igen och förhoppningsvis få ett sökresultat. Om man i stället får ”Search failed” vid upprepade tillfällen betyder det oftast ”Jag har tappat kontakten med Metaproxy”. För att återskapa uppkopplingen tar man bort den från listan över valda databaser, lägger till den igen och utför sökningen på nytt.

## Postbearbetning
De framsökta marcposterna bearbetas innan de skickas till katalogiseringsklienten. Det är lite beroende på ur vilken databas den framsökta posten hämtas men generellt rensas posten från lokala fält och vissa indikatorer rättas. Detta möjliggör också import av poster från system som har andra marcformat än MARC21. Vid sökning i, exempelvis UNIMARC-databaser, konverteras posterna ”on-the-fly” till MARC21 innan de skickas till katalogiseringsverktyget. Rensning av fält och formatkonvertering är ett pågående arbete med att förenkla arbetsflödet för katalogisatören och att förbättra posternas kvalitet innan de visas i katalogiseringsklienten.

## Databaser i Metaproxy 
De delmängder som ingår i Metaproxy och som kan tillkomma är utvalda efter olika kriterier. De ska ha snabba svarstider, vara driftsmässigt pålitliga, innehålla många poster, täcka in olika språk- och ämnesområden, täcka in material för både folk- och forskningsbibliotek, och även täcka in andra materialtyper såsom CD, DVD, dataspel med mera.

Genom att markera flera metadatabaser kan delmängderna samsökas direkt i katalogiseringsklienten och då rensas även dubblettposter i träfflistan.

## Förslag på fler databaser
Önskemål och förslag på andra bibliotekskataloger som bör göras sökbara via Metaproxy och katalogiseringsklienten kan skickas till Libris kundservice. Ange institutionens namn, adressen till Z-servern, port samt databasens namn. (Exempelvis: Library of Congress,  address: z3950.loc.gov, port 7090, databasnamn: Voyager.)

Det är bara databaser som har ett Z39.50-gränssnitt eller ett SRU/SRW-gränssnitt tillgängligt som är möjliga att göras samsökningsbara via Metaproxy eller genom katalogiseringsverktyget.

## Söktips
Får du för många eller för få träffar när du söker i Metaproxy? Vi har sammanställt några söktips för att få så relevanta träffar som möjligt.

**Tydlighet**

>Det är viktigt att sökfrågan alltid är så tydlig och unik som möjligt.

>Försök att i så stor utsträckning som möjligt lägga till ett årtal när du söker på titel.

>Gör sökfrågan så precis som möjligt. En stor sökfråga med för många träffar kan från värdserverns sida uppfattas som spam. Det kan i sin tur leda till att vi blir blockerade från värdservern vilket vi naturligtvis vill undvika.

**ISBN**

>Sök alltid på ISBN i första hand.

>ISBN skrivs utan bindestreck.

**Samsökdatabaserna**

>Välj den grupp av databaser som bäst passar din sökning. Om du till exempel söker en asiatisk källa, använd Metasök Asien. Se databasernas gruppering: Delmängder.

>En sökning i gruppen Metasök Mellaneuropa går tyvärr inte lika snabbt som de andra grupperna.

## Allmänt
Radera inte fält 599. Genom att fält 599 finns i posten går det i Libris webbsök att ange söktermen spec:imported och få fram vilka och hur många poster som importerats genom Metaproxy.
Kontrollera den importerade posten! Trots att nya Metaproxy rensar och rättar i större utsträckning än tidigare är det viktigt att se till att varje post är korrekt inför importen till Libris och det lokala systemet. 

## Delmängder i Metaproxy

### ANGLOSAX 1 (USA)
```
Boston University  
California StateUniversity, San Marcos  
Dallas Teological Seminary  
Evergreen State College  
Franklin: Penn Libraries Catalog, University of Pennsylvania  
Georgia Southern University  
Gordon State College  
Hammond Public Library  
Helin Library Consortium  
Humboldt State University  
Library of Congress  
Luther College  
More Librares  
Ohio Link (Ohio Library and Information Network)  
San José Library  
Seattle Public Library  
The Metropolitan Museum of Art Library  
The Ohio State University  
University of Maryland  
University of Michigan  
University of Nebraska-Lincoln  
University of Texas Libraries  
University of Wisconsin  
University of Wisconsin-Madyson  
Washington State University  
WHO (World health Organisation)  
```
### ANGLOSAX 2 (USA)
```
Acorn, Catalogue of Heard Libraries
Albany State University
Armstrong Atlantic State University
Atlanta Metropolitan State College
Augusta State University
Aurora Public Library
Ball State University
Boyden Library Catalogue
Brown University
Burlington County Library System
Calexico Unified School District
California State University
Catalogue of Samford Libraries
Charlston Southern University
Chesterfield County Public Library
Chinook University
Clayton State University
Colombia University
Colorado State University
Coyahoga County Public Library
CSU Long Beach
Dallas Public Library
Darton College
Flatbury Library Consortium
Florida A6M University
Florida Virtual Campus
Folker Shakespeare Library
Fort Valley State University
Gainesville State College
George Washington University Medical Center
Georgia Perimeter College
Georgia Southwestern State University James Earl Carter Library
Grinell College
Harvard University
Lion Libraries
Louisiana State University
Louisiana State University, at Eunice
Loyola University New Orleans
LSU Shravenport
LSUA Alexandria
Macon State College
Massachusetts Institute of Technology
Mervin H. Sterne Library
Metropolitan Museum of Art
Michigan State University
New Jersey Institutet of Technology
New Jersey State Library
NOBLE - Nort of Boston Library Exchange
Northern Arizona University
Oregon State University
Princeton Theological University
Prospector
Public Library Chula Vista
Rensselaer Polytechnic Institute
San Diego State University
San Francisco State University
SB Library Catalogue
Seattle Public Library
Sonoma State University
Taltom Law library
The Paul Getty Trust
The State University New York
University of Alabama
University of Arkansas
University of California
University of Colorado, Boulder
University of Connecticut
University of Nevada, Reno
University of North Carolina
University of Northern Colorado
University of Oregon
University of Pittsburg
Washington University Library
Waubonsee Community College - Todd Library
Wayne State University
Wisconsin School for the deaf
Yale University Library
York University
```
### ANGLOSAX 3 (CA)
```
Bishop's University
Brock University
California Institute of Technology
Carleton University
Canada Institute for Scientific and Technical Information (CISTI)
College of New Caledonia
Concordia University (CONCU)
Dalhousie University
The Department of Foreign Affairs and International Trade (DFAIT)
Douglas College
École Polytechnique de Montréal Bibliothèque
Florida Virtual Campus
Halifax Public Libraries
Halton Hills Public Library
Kwantlen University College
Lakehead University
Manitoba Public Library Services
National Library of Medicine
Nova Scotia Agricultural College
Nova Scotia College of Art and Design
Novanet
Ohio Link (Ohio Library and Information Network)
Okanagan College Library Catalogue
Queen's University
Simon Fraser University 
ST MARYS UNIV - LIBRARY UNICORN
ST MARYS UNIV - QUEST UNICORN
Supreme Court of Canada
Toronto Public Library
University of Calgary
Univeristy of Western Ontario
University of Saskatchewan
University of Toronto
University of British Columbia Library (UBC)
Université de Montréal
Université du Québec à Montréal
Université Laval
Université McGill
Universite Moncton
University of Alberta
University of Northern British Columbia
University of Rochester
University of Sherbrooke
University of Victoria
```
### ANGLOSAX 4 (ÖVRIGA)
```
Australian Institute of Aboriginal and Torres Strait Islander Studies (AIATSIS)
Australian National University
AUT Library 
Bangor University Library
Bond University
Brunel University London
Bury Council Libraries
Cardiff University
National Health Service (NHS) 
Christchurch City Libraries 
Christchurch Polytechnic Library 
Commonwealth Scientific and Industrial Research Organisation (CSIRO)
Curtin University
Deakin University
Edinburgh University Library Catalogue
Edith Cowan University
Imperial College London
Institute of Education
Institute of Technology
James Cook University
Leeds Metropolitan University
Leeds University
Library of Natural History Museum, London
Lincoln University Library 
London Business School
London Public Library
London South Bank University
Macquari University
Mandurah Libraries
Monash University
National Art Library
National Library of Australia
National Library of New Zealand Catalogue
Nottingham Trent University
Queen Mary University of London
Queensland University of Technology
Australian university of technology and design (RMIT)
Senate House Library, University of London
Sheffield Hallam University
SOAS Library Catalogue
State Library New South Wales
University College Cork
University of Abartay Dundee
University of Adelaine
University of Auckland Library 
University of Ballard
University of Canterbury
University of Dundee
University of Exeter
University of Greenwich
University of Hertfordshire
University of Huddersfield
University of Kent
University of Leicester
University of Newcastle
University of Ontago
University of Pretoria
University of Queensland
University of Reading
University of South Australia
University of Technology Sydney
University of the West of England
University of Waikato Library 
University of Wellington
University of Wellongong
University of Western Australia
University of Witwatersrand
UNSW
```
### METASÖK ASIEN
```
Academia Sinica
City University of Hong Kong
Independent Library Consortium
Indiana University
King Mongkut's Institute of Technology Ladkrabang (KMITL)
Koc University
Lingnan University Digital Library
United Arab Emirates Higher Education Library Consortium (LIWA)
National Kaohsing First University of Sciende and Technology
National University of Singapore
Penn Libraries Catalog
Ramkhamhaeng University
Russian National Public Library for Science and Technology
Sapporo Gakuin University Library
Scientific Library of Moscow M.V.Lomonosov State University Sripathum University
Taiwan University Library
The Chinese University of Hong Kong
The Hong Kong Institute of Education
The Hong Kong Polytechnic University
The Hong Kong University of Science and Technology Library
The University of British Colombia
The University of Texas at Austin
University of Hong Kong
University of Malaya
University of Wisconsin
Vietnamn National University - Hanoi
Vietnamn National University - Hochminh City
```
### METASÖK LATIN
```
ABES
Accademia Della Crusca
Aten University of Economics and Business Biblioteca ENEA di Bologna
Biblioteca Municipal Manuel Teixeira Gomes
Biblioteca Popular República Argentina Biblioteca Universitária João Paulo II (BUJP)
Biblitoeka de Arte, Portugal
Catalogo delle Biblioteche Liguri
Consorci de Biblioteques Universitàries de Catalunya
Greek Research And Technology Network
Harokopioa University
Inria
Ionian University
L’École normale supérieure (ENS)
Library and Archive of Galicia
Main lobrary in Kozani and Florina
National Technical University of Athens
Pedagogiska institutet
Polo SBN della Biblioteca Communale di Palermo
Ponificia Universidad Javeriana
REBIUN - samkatalog för spanska universitetsbibliotek
Technical University of Crete
Technológico de Monterrey
Technological Educational Institute of Athens
Universidad de Alcalá
Universidad de Chile
Universidad de Granada.
Universidad de los Andes
Universidad del Roasario
Universidad Nacional de Colombia
Universidad Nacional de Educación a Distancia
Universidad Santo Tomas
Universidade de Coimbra
Università degli Studi di Napoli
Università degli Studi di Napoli Federico II
Università degli studi di Padova
Università degli Studi di Palermo
Università degli Studi di Perugia
Università degli Studi di Roma 
Università degli Studi di Sassari
Università degli Studi di Verona
Università degli Studi Roma Tre
Università di Genova
Università di Siena
Università luav di Venezia
Université de Rennes
Université de Savoie
Universitéde Strasbourg
University of Aegean
Universitetet i Athen
Universitetet i Athen, Historiska Institutionen
University of Crete
University of Cyprus
University of Macedonia
University of Patras
University of the Aegean
University of Thessaly
Πανεπιστημίου Αθηνών, Universitetet i Athen
```
### METASÖK NORDEN
```
Bibliotek.dk
BIBSYS
DanBib
Det Kongelige bibliotek og Københavns Universitets Biblioteksservice
Eidfjord bibliotek
Fardanger bibliotek
Greveskogen bibliotek
Kristiansand folkebibliotek
Lollande Folkebibliotek
Melsom bibliotek
Nasjonalbiblioteket, Norge - Norsk periodikafortegnelse (Norper)
Nasjonalbiblioteket, Norge - Norwegian and Nordic index to periodical articles (Norart)
National Library of Finland
Nesodden bibliotek
Nordisk/Baltisk samkatalog för periodika (NOSP)
Overby bibliotek
Porsanger bibliotek
Rakkestad bibliotek
Ringsted Folkebibliotek
Romskog bibliotek
Solør videregående skole
Stavanger folkebibliotek
Union Catalogue of Finnish Libraries
Valer bibliotek
Vallensbæk Folkebibliotek
Vejen Folkebibliotek
```
### METASÖK MELLANEUROPA
```
Universiteit Antwerpen (ANET)
Biblioteka Nardowa
Das Hessische BibliotheksInformationsSystem HeBIS
Eesti Rahvusraamatukogu
Ege Üniversitesi
Gemeinsamer Bibliotheksverbund (GBV)
Gemeinsamen Bibliotheksverbundes
HeBIS
Bibliotheksverbunds IDS Basel Bern
Istanbul Bilgi University
Istanbul Technical University
İstanbul Bilgi Üniversitesi Koç Üniversites
Kooperativer Bibliotheksverbund Berlin-Brandenburg
Krajská knihovna Vysočiny (KKV)
LIBIS
Masaryk University, Czech Republic
Max-Planck-Gesellschaft
Magyar Országos Közös Katalógus (MOKKA)
National Library of Lithuania
National Library
National Széchényi Library
Netzwerk von Bibliotheken und Informationsstellen in der Schweiz (NEBIS)
Országos Széchényi Könyvtár
Politechnika Krakowska im. Tadeusza Kosciuszki
Sabancı Üniversitesi SKAT
Slovak National Library
Sveučilišta u Zagrebu, Filozofski fakultet
Südwestdeutschen Bibliotheksverbundes (SWB) 
Technische Universität Braunschweig
Delft University of Technology
Université Libre de Bruxelles Universitein Gent
Universiteit Antwerpen
Universiteitsbiblioteheen Gent
Universität Basel
United Nations Office at Geneva (UNOG)
Verbundkatalog Öffentlicher Bibliotheken
```
