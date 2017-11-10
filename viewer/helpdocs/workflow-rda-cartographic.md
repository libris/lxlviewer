---
section: Anvisningar
title: Kartor
order: 31
tags:
- editor
- rda
- workflow
- cartographic
---

# Kartor

[Extern länk till MARC21-anpassad information](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Kartor/)

**OBS! Detta arbetsflöde är under arbete**

**Element tillhörande instans/manifestation**
 
* Källa för beskrivningen 
* Titel 
* Upphov 
* Upplaga
*  Produktion/Utgivning 
* Serie 
* ISBN
*  Medietyp 
* Bärartyp 
* Omfång
* Bärande material
* Applicerat material
* Montering 
* Produktionsmetod
*  Layout
*  Mått 
* Digitala filer 

**Element tillhörande verk/uttryck:**

* Innehållstyp
* Innehållsanmärkning
* Innehållsbeskrivning
* Illustrationer
* Språk
* Färg
* Kartprojektion
* Skala
* Koordinater
* Klassifikation och ämnesord
* Sökingång på person, släkt eller institution
* Relationer till andra verk och uttryck m.m. 

**Bestånd**

---

Kartografiska resurser omfattar alla typer av dokument och föremål som avbildar hela eller delar av jorden, annan himlakropp eller en fantasivärld. Det kan t.ex. vara världskartor, stadskartor, genomskärningar, fjärranalysbilder, reliefmodeller flygnavigeringskartor, samt jord- och himmelsglober. Detta arbetsföde för katalogisering av kartor baseras på RDA och praxis som har utarbetats på KB.

I RDA finns inga definierade beskrivningsnivåer. Däremot är vissa element i den bibliografiska beskrivningen kärnelement, dvs ‘core’, medan andra är frivilliga. I RDA 0.6 specificeras vad som är kärnelement. Observera att element kan vara ‘core’ under vissa omständigheter, sk. ‘core if’ element. Skala är ett kärnelement för kartografiskt material, d.v.s. den uppgiften är obligatorisk.

Se RDA 7.25

I arbetsfödet medtas endast de för kartografiskt material mest vanliga reglerna. Tanken är att man vid behov via länkarna lätt ska hitta vidare till de mer specifika anvisningarna och reglerna i Toolkit.

## Titel och övrig titelinformation

Huvudtitel och ev. övrig titelinformation ska överföras exakt som den är skriven i den föredragna källan. Om huvudtiteln innehåller uppgift om skala ska denna medtas. I de fall titeln hämtas från annan källa än kartarket eller titelbladet ska uppgift om källa anges i en anmärkning. 
Övrig titelinformation får endast hämtas från samma källa som huvudtiteln.

Om titel saknas i resursen konstrueras en titel på svenska. I den konstruerade titeln anges alltid det geografiska områdets namn och/eller ämne som kartan behandlar.

`[Karta över Skandinavien]`

Om titel finns men uppgift saknas om vilken geografisk plats kartan avbildar eller vilket ämne kartan behandlar konstrueras en undertitel med denna information som placeras i fältet för övrig titelinformation. Denna undertitel ska klamras.

`Vegetation : [i Botswana]`

Titlar som hämtas från annan källa än den katalogiserade resursen eller som konstrueras av katalogisatören ska klamras och i en anmärkning ska källa alternativt frasen ”Titel konstruerad av katalogisatör” anges. 

Ange även alternativtitlar, parallelltitlar, uniforma titlar m.m. vid behov.

Se RDA 2.3 

## Upphov
Återge upphovsuppgiften exakt som det är skrivet i den föredragna källan i resursen.

Om fler än tre personer nämns i en enskild upphovsuppgift, och dessa har samma funktion, är det enligt RDA endast obligatoriskt att ange den först nämnda. Ta alltså med samtliga om dessa inte är fler än tre. Om det är fler än tre så ta i regel enbart med den först nämnda personen följt av frasen [och xx andra] inom hakparentes.

`Helena Rosén Andersson [och tre andra]`

Om upphovsuppgift inte förekommer på objektet men är känd anges denna inom en klammer. Om uppgiften är osäker ska uppgiften däremot anges i en anmärkning. 

Se RDA 2.4

## Upplaga
Återge upplageuppgiften så som den förekommer i resursen. Förkortningar används endast om de förekommer i källan som uppgiften hämtas från. 

Om resursen saknar en upplageuppgift men det är känt att betydliga ändringar från tidigare upplagor gjorts, kan en upplageuppgift läggas till om det är viktigt för identifikation och åtkomst. Ange då uppgiften inom klammer på huvudtitelns språk. Uteslut tryckuppgifter.

`Deuxième edition revue et augmentée`

`2. uppl.`

`[Ny upplaga]`

Se RDA 2.5

## Utgivning/Produktion 

**Opublicerad resurs**

Välj Produktion i fältmenyn vid katalogisering av handritade kartor eller annan opublicerad resurs Ange framställningsåret för opublicerat material. Om produktionsort och producent är angiven eller känd så medtas även denna information. Om uppgiften hämtas från annan källa än kartan/atlasen ska uppgiften anges inom klammer.

Om framställningsåret är osäkert utformas detta enligt instruktionerna i  RDA 1.9.2 . Observera att svenska fraser ska användas. Här är några exempel:

`[1939]`

`[1827?]`

`[1971 eller 1972]`

`[ej före 1920]`

`[ej efter 1709]`

`[ej efter 8 maj 1945]`

`[mellan 1860 och 1895?]`

Se RDA 2.7

## Utgivning
För publicerat material anges alltid utgivningsort, utgivare och utgivningsår. Om uppgiften hämtas från annan källa än kartan/atlasen, ska uppgiften anges inom klammer.  Om uppgiften är osäker avslutas denna även med ett frågetecken 

**Utgivningsort**
Ange orten så som den är skriven i källan. Ta med landskap etc. om det står i källan Om ingen utgivningsort är känd anges om möjligt land inom klammer istället. Om även den uppgiften saknas så anges ”Utgivningsort okänd” inom klammer. 

**Agent (utgivare)**
Ange utgivarens namn exakt såsom det är skrivet i källan. Om utgivaren är okänd anges ”utgivare okänd” inom klammer. 

**Utgivningsår**
Om utgivningsåret är osäkert utformas detta enligt instruktionerna i  RDA 1.9.2 . Observera att svenska fraser ska användas. Här är några exempel:

`[1939]`

`[1827?]`

`[1971 eller 1972]`

`[ej före 1920]`

`ej efter 1709]`

`[ej efter 8 maj 1945]`

`[mellan 1860 och 1895?]`

Se RDA 2.8

Om utgivningsort, utgivare och utgivningsår inte är känt anger du istället om möjligt distributionsort, distributör och distributionsår. Copyrightår anges om varken utgivningsår eller distributionsår finns. 

## Tillverkning
Här anges uppgifter om tryckeri och tryckår. Används främst för resurser som katalogiseras på NB-nivå.

Se RDA 2.10

## Serie
Om kartan/atlasen ingår i en serie ska denna anges exakt såsom den är angiven i källan
Se RDA 2.12

## ISBN
Ange ISBN om sådant finns.

## Medietyp
Medietypen beskriver det generella medium eller den generella utrustning som krävs för att använda en resurs. Omedierad betyder att ingen extra utrustning behövs.

För kartor, atlaser och jordglober, välj termen ”omedierad”. Välj ”dator” för kartor lagrade som digitala filer.

Om resursen består av mer än en medietyp är librispraxis att ange den medietyp som bäst beskriver den huvudsakliga delen av resursen.

Se RDA 3.2

## Bärartyp
Bärartyp anger fysiskt medium för lagring samt den enhet som behövs för att se, spela eller visa innehållet i resursen. Bärartyperna korrelerar till medietyperna och kan ses som underindelningar till dessa. 

Välj bärartyp i rullgardinsmenyn under respektive medietyp. För kartor in plano välj ”ark” (och för atlaser  välj ”volym”.
Om resursen har mer än en bärare anges den mest dominerande eller de mest väsentliga bärarna.
Se RDA 3.3

## Omfång
Beskriv omfång genom att ange antalet fysiska enheter och lämplig term. Följande termer finns att välja på:

>
atlas  
diagram  
fjärranalysbild  
glob  
handritad karta  
karta  
kartsektion  
perspektivbild  
profil  
reliefmodell  
sjökort  


Om ingen av ovan nämnda termer är lämplig så använd en annan koncis term. Använd då gärna termer avsedda för stillbilder eller tredimensionella former om tillämpligt. Om resursen består av flera olika typer av enheter så beskriv samtliga.

`1 sjökort`

Om antalet kartografiska enheter, skiljer sig från antalet ark, ange antalet kartografiska enheter och antalet ark.

`2 kartor på 1 ark`

Om en karta är på ett eller flera ark i två eller flera segment konstruerade så att de kan fogas samman till en eller flera kartor så anges antalet fullständiga kartor och antalet segment om alla segment är på ett enstaka ark. Om segmenten är på fler än ett ark, så ange antalet kompletta kartografiska enheter följt av antalet ark. 

`1 karta i 4 segment`

`1 karta i på 4 ark`

Ange antalet volymer och/eller sidor osv, i en atlas enligt anvisningarna i RDA.
 
`1 atlas (456 sidor)`

`1 atlas (3 volymer)`

Se RDA 3.4.2

## Bärande material
Ange resursens bärande material om detta kan anses viktigt för identifiering och urval vid sökningar. Hämta uppgiften från resursen eller annan valfri källa. Använd en eller flera termer från rullgardinsmenyn. 

Om ingen av termerna i rullgardinsmenyn är lämplig så använd en annan koncis term.

Se RDA 3.6

## Applicerat material
För handritade kartor anges vilka material som använts när kartografen ritat kartan, t.ex. penna, akvarell. Om resursen består av flera olika material så anges det dominerande materialet först. Upprepa fältet om flera termer behövs. 

Om ingen av termerna i rullgardinsmenyn är lämplig så lägg till en annan koncis term.

Se RDA 3.7

## Montering
Eventuell montering anges.  Använd en eller flera termer i rullgardinsmenyn, men om inga av dessa passar så använd en annan koncis term.

Se RDA 3.8

## Produktionsmetod
Anges främst vid katalogisering av äldre resurser. 
Välj produktionsmetod från rullgardinsmenyn. Det går bra att använda flera termer till samma resurs, ange i dessa fall den dominerande tekniken först.

Se RDA 3.9

## Layout
Använd ”motstående sidor” om kartan fortsätter i samma skala på nästa sida av arket/arken, eller om en samling av kartor vilka är på båda sidor av arket/arken beskrivs kollektivt. Om däremot samma karta återges på mer än ett språk på varje sida av arket så använd ”rygg mot rygg”.

Se RDA 3.11

## Mått
För tvådimensionella kartor anges normalt höjden x bredden i cm avrundat uppåt till närmaste cm. För äldre kartor kan måtten anges noggrannare, med en decimal, t.ex. 23,1 cm. Mät kartytan mellan begränsningslinjerna.  För glober anges diametern. Om arkets/arkens mått skiljer sig mycket från kartytan så ska även arkets/arkens mått anges.

Vid katalogisering på KB av graverade kartor anges även plåtens storlek om plåtkanten kan urskiljas.  Ingen sådan regel finns än så länge för kartor i RDA.

Om en karta är på flera ark och dessa kan fogas samman till en karta så anges måtten för den fullständiga kartan följt av måtten för arken. Om det inte är möjligt att mäta kartan, t.ex. på grund av att kartytan är oregelbunden eller begränsningslinjer saknas, anges enbart arket/arkens mått. 

Om kartan är på två ark i olika storlek ange bägge arkens mått. Om arken är i fler än två storlekar så ange endast höjdmåttet för arket som är högst och längdmåttet för arket som är längst, och därefter följt av formuleringen ” eller mindre”. 

Om kartorna är vikta ska även detta mått anges.

Om kartan förvaras rullad ska även rullens längd och diameter anges. 

Moderna atlaser beskrivs på samma sätt som andra böcker, dvs. i regel anges enbart volymens höjd. Men om volymens bredd antingen är mindre än halva höjden eller större än höjden så anges höjden x bredden.

Om resursen förvaras i en förpackning kan om så önskas även måtten på förpackningen anges. 

`136 x 105 cm, på ark 80 x 75 cm`

`50 x 64 cm,  plåt 55 x 67 cm`

`10 x 10 cm, och 9 x 8 cm, på ark 21 x 30 cm`

`ark 60 x 60 cm, eller mindre`

`66 x 94 cm, vikt i omslag till 24 x 14 cm`

För mer information se RDA 3.5

## Digitala filer
Ange vid behov uppgift angående filegenskaper och systemkrav.
Ange i förekommande fall tekniska detaljer gällande digital representation av geografisk data, t.ex. raster, vektor, pixel, polygon.

Se RDA 3.19-3.20
