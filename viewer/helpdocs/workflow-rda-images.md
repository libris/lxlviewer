---
section: Anvisningar
title: Bilder
tags:
- editor
- rda
- workflow
- images
---

#Bilder

[Extern länk till MARC21-anpassad information](http://www.kb.se/rdakatalogisering/Anvisningar/Arbetsfloden/Bilder/)

**OBS! Detta arbetsflöde är under arbete**

##Innehåll

**Element tillhörande instans/manifestation**

* Källa för beskrivningen
* Titel
* Upphov
* Upplaga
* Produktion/Utgivning
* ISBN
* Medietyp
* Bärartyp
* Omfång
* Bärande material
* Applicerat material
* Produktionsmetod
* Polaritet
* Mått

**Element tillhörande verk/uttryck:**

* Innehållstyp
* Beskrivning av motiv
* Språk
* Färg

* Klassifikation och ämnesord
* Sökingång på person, släkt eller institution
* Sökingång för verket
* Relationer till andra verk och uttryck m.m.

**Bestånd**

---

Detta arbetsflöde för bildkatalogisering baseras på RDA och praxis som har utarbetats på KB.

I RDA finns inga definierade beskrivningsnivåer. Däremot är vissa element i den bibliografiska beskrivningen kärnelement, dvs 'core', medan andra är frivilliga. I RDA 0.6. specificeras vad som är kärnelement. Observera att element kan vara 'core' under vissa omständigheter, sk. 'core if' element.
 
I arbetsflödet medtas endast de vanligaste och för bildmaterial specifika reglerna. Tanken är att man vid behov via länkarna i arbetsflödet lätt ska hitta vidare till de mer specifika anvisningarna och reglerna i Toolkit.

## Källa för beskrivningen

Börja med att bestämma om det är hela resursen som ska katalogiseras eller om det är en del av en större resurs.

Se RDA 2.1 

Välj den källa som bäst beskriver resursen. För fotografier, teckningar och tryckta bilder följs vanligen regeln RDA 2.2.2.2 och för digitala resurser som inte passar in på ovan angivna regel, se RDA 2.2.2.4. 

I övriga fall se RDA 2.2.4

## Titel
Huvudtitel och ev. undertitel ska överföras exakt så som den är skriven i den föredragna källan. Övrig titelinformation får endast hämtas från samma källa som huvudtiteln.

Om titel saknas i resursen konstrueras en kort beskrivande titel på svenska som informerar om ämne och/eller typ av bild (t.ex. porträtt, poster). Hämta uppgifterna från resursens motiv, referenslitteratur, webben eller annat håll. KB:s bildsamlingar är centrerade till tre huvudkategorier: porträtt, geografiska platser och historiska händelser.  För KB:s samlingar gäller därför vid konstruerade titlar att ett porträtt om möjligt ska ha en titel som informerar om vem som är avbildad, en bild på en byggnad ska ha en titel som informerar om bygganden och dess geografiska plats, och en bild som anknyter till en historisk händelse ska ha en titel som beskriver detta sammanhang.

`Château de Rosendal à Stockholm (Suède)`
`Porträtt föreställande Estrid Ericson`

Enligt RDA 2.2.4 ska konstruerade titlar inte anges inom hakparentes i de fall resursen normalt inte har någon titel.  KB:s praxis är därför att aldrig klamra titlar på bilder. När en titel är konstruerad av katalogisatören anges enbart i en anmärkning ”Titel konstruerad av katalogisatör”. Om titeln hämtats från annan källa än arket, titelbladet eller titelkortet anges källan i en anmärkning.  
Ange även alternativtitlar, parallelltitlar, uniforma titlar m.m. vid behov.

Se RDA 2.3


## Upphov 
Återge upphovsuppgiften exakt så som den är skriven i den föredragna källan i resursen. Lägg till ett semikolon före varje påföljande upphovsuppgift.

`dess. par Meyer ; lith. par Bayot`

`Ossian Elgström`

`N.P.`

Om fler än tre personer nämns i en enskild upphovsuppgift, och dessa har samma funktion, är det enligt RDA endast obligatoriskt att ange den först nämnda. Ta alltså med samtliga om dessa inte är fler än tre. Om det är fler än tre kan man enbart ta med den först nämnda personen följt av frasen [och xx andra] inom klammer. 
Helena Rosén Andersson [och tre andra]

Lägg vid behov till ett ord eller en kort fras inom hakparentes för att klargöra upphovsmannens roll.

`[fotograf:] Pål-Nils Nilsson`

Om upphovsuppgift inte förekommer på objektet men är känd anges denna inom en klammer. Om uppgiften är osäker ska uppgiften däremot anges i en anmärkning.

Om uppgift om skapare av bilden saknas har vi på KB som praxis att ange detta i en anmärkning. Med skapare menas den upphovsman som har det huvudsakliga upphovsansvaret. Det vill säga saknas uppgift om fotograf till ett fotografi, gravör till en gravyr, litograf till en litografi, konstnär till en teckning etc. så anges i en anmärkning ”Fotograf okänd” eller annan för bilden lämplig formulering.

`Konstnär okänd`

Se RDA 2.4

## Upplaga
Återge upplageuppgiften så som den förekommer i resursen. Förkortningar används endast om dessa förekommer i  källan som uppgiften hämtas från. 

Om det är känt att betydliga ändringar från tidigare upplagor gjorts men resursen saknar en upplageuppgift så kan en upplageuppgift läggas till om det är viktigt för identifikation och åtkomst. Ange då uppgiften inom klammer på huvudtitelns språk. Uteslut tryckuppgifter.

`Deuxième edition revue et augmentée`

`2. uppl.`

`[Ny upplaga]`

Se RDA 2.5 


## Utgivning/Produktion
Produktion (Opublicerad resurs)
Välj ”Produktion” i fältmenyn vid katalogisering av teckningar och andra opublicerade resurser. Ange framställningsåret för opublicerat material. Om produktionsort och producent är angiven eller känd så medtas även denna information. Om uppgiften hämtas från annan källa än resursen ska uppgiften anges inom klammer.

Om framställningsåret är osäkert utformas detta enligt instruktionerna i RDA 1.9.2.

Observera att svenska fraser ska användas. Här är några exempel:

`[1939]`

`[1827?]`

`[1971 eller 1972]`

`[ej före 1920]`

`[ej efter 1709]`

`[ej efter 8 maj 1945]`

`[mellan 1860 och 1895?]`

Se RDA 2.7

## Utgivning
För publicerat material anges alltid utgivningsort, utgivare och utgivningsår.  Om uppgiften hämtas från annan källa än resursen ska uppgiften anges inom klammer.  Om uppgiften är osäker avslutas denna även med ett frågetecken.

För äldre tryckta bilder är det i många fall omöjligt att skilja på utgivare och tryckare. Oftast hade tryckeriet bägge funktionerna. Om ingen annan uppgift än tryckeriet finns ska därför detta anses vara utgivare.

## Utgivningsort
Ange orten så som den är skriven i källan. Ta med landskap etc. om det står i källan. Om ingen utgivningsort är känd anges om möjligt land inom klammer istället. Om även den uppgiften saknas så anges ”Utgivningsort okänd” inom hakparentes. 

## Utgivare
Ange utgivarens namn exakt så som det är skrivet i källan. Om utgivaren är okänd anges ”utgivare okänd” inom klammer. 
Utgivningsår

Om utgivningsåret är osäkert utformas detta enligt instruktionerna i RDA 1.9.2.

Observera att svenska fraser ska användas. Här är några exempel:

`[1939]`

`[1827?]`

`[1971 eller 1972]`

`[ej före 1920]`

`[ej efter 1709]`

`[ej efter 8 maj 1945]`

`[mellan 1860 och 1895?]`

Se RDA 2.8

## Distribution, Copyright
Om utgivningsort, utgivare och utgivningsår inte är känt anger du istället om möjligt distributionsort, distributör och distributionsår. Distributionstiden anges i dessa fall dels inom klammer i elementet för utgivningstid, dels utan klammer i elementet för distributionstid.

Copyrightår anges om varken utgivningsår eller distributionsår finns. 

Se RDA 2.9, 2.11

## Tillverkning
Här anges vid behov uppgifter om tryckeri och tryckår. 

Librispraxis är att hämta uppgift om utgivningstid från tillverkningstiden när denna finns angiven i resursen och utgivningstid eller distributionstid inte kan identifieras. Tillverkningstiden anges i dessa fall dels inom klammer i elementet för utgivningstid, dels utan klammer i elementet för tillverkningstid.

Se RDA 2.10

## ISBN
Ange ISBN om sådant finns.

## Medietyp
Medietypen beskriver det generella medium eller den generella utrustning som krävs för att använda en resurs. Omedierad betyder att ingen utrustning behövs.

För tryckta bilder, skulpturer och teckningar välj termen ”omedierad”. Välj ”dator” för bilder lagrade som digitala filer och ”stereografisk” för stereobilder.

Om resursen består av mer än en medietyp är Librispraxis att ange den medietyp som bäst beskriver den huvudsakliga delen av resursen.

Se RDA 3.2

## Bärartyp
Bärartyp anger fysiskt medium för lagring samt den enhet som behövs för att se, spela eller visa innehållet i resursen. Bärartyperna korrelerar till medietyperna och kan ses som underindelningar till dessa. 
Välj bärartyp i rullgardinsmenyn under respektive medietyp För bilder in plano välj ”ark”, för planschverk välj ”volym”, för vykort välj ”kort”, och för stereofotografi välj ”stereografiskt kort”.
Om resursen har mer än en bärare anges den mest dominerande eller de mest väsentliga bärarna.
Se RDA 3.3

## Omfång
Beskriv omfång genom att ange antalet fysiska enheter tillsammans med lämplig term. Följande termer finns att välja på:

affisch
album
bild
collage
exlibris
fotografi
häfte
ikon
medalj
målning
portfölj
ritning
röntgenbild
silhuett
teckning
teknisk ritning
tryckt bild
volym
vykort
väggplansch

Om ingen av ovan nämnda termer är lämplig använd en annan koncis term. Välj då  om möjligt någon av termerna  från listan i RDA 3.4.1.3. 

Om resursen består av flera olika typer av enheter så beskriv samtliga.

Vid katalogisering av bilder på KB används den övergripande termen ”bild” endast för resurser gjorda i blandteknik. Termen ”tryckt bild” används för alla tryck, oavsett teknik. Vilken typ av tryckteknik, t.ex. etsning, litografi, offset, som använts redovisas under Produktionsmetod.

Om blyertsen är synlig i en akvarellteckning beskrivs bilden som teckning.

Om antalet enheter inte är lätt att fastställa så uppskatta antalet. I dessa fall ska ordet ”cirka” föregå uppgiften. 

`cirka 600 fotografier`

Om antalet bilder, skiljer sig från antalet ark så ange såväl antalet bilder som antalet ark. 

`1 tryckt bild på 4 ark`

`2 teckningar på 1 ark`

Om resursen utgörs av ett eller flera album, portföljer eller liknande som innehåller bilder så ange antalet enheter och helst därefter även antalet bilder. Den senare uppgiften anges inom parentes. 

`1 album (68 fotografier)`

Se RDA 3.4
 
## Bärande material
Ange resursens bärande material om detta kan anses viktigt för identifiering och urval vid sökningar. Hämta uppgiften från resursen eller annan valfri källa. Använd en eller flera termer från rullgardinsmenyn. 

Använd en annan koncis term om ingen av termerna i rullgardinsmenyn är lämplig.

På KB anger vi alltid bärande material för bilder, även då det är papper.

För fotonegativ anges det bärande materialet som glas för glasplåtar och plast för bladfilmsnegativ. Termerna acetat, cellulosanitrat, diacetat, nitrat och triacetat används i regel inte vid katalogisering av bilder på KB.

Ange när så är lämpligt detaljer för det bärande materialet. Exempel på sådan information kan vara ”Bild tryckt på grönt papper”.  Uppgiften läggs in i en anmärkning.

Se RDA 3.6

## Applicerat material
Ange i förekommande fall vilka material som konstnären tillfört på ytan. För målningar, t.ex. akvarell, penna. Det dominerande materialet anges först om resursen tillförts flera olika material. Upprepa fältet om flera termer behövs. 

Om ingen av termerna i rullgardinsmenyn är lämplig kan en annan koncis term användas.

Se RDA 3.7

## Montering
Eventuell montering anges vid behov. Använd en eller flera termer i listan över bärande material, men om ingen av dessa passar använd en annan koncis term.

Se RDA 3.8

## Layout
 Ange ”båda sidorna” om bilder finns på bägge sidor av arket/arken.

Se RDA 3.11

## Produktionsmetod
Välj produktionsmetod från rullgardinsmenyn. Det går bra att använda flera termer till samma resurs, ange i dessa fall den dominerande tekniken först.

Se RDA 3.9

## Polaritet
För fotografier anges polaritet. Välj mellan följande termer: 
positiv
negativ

Se RDA 3.14

## Mått
För tvådimensionella bilder mäts bildytans höjd x bredd, diameter etc. i cm avrundat uppåt till närmaste cm. Om man vill mäta mer noggrant så kan man även ta med en decimal. Ange vad måttet avser om annat än höjd x bredd mäts. Om arkets/arkens mått skiljer sig mycket från bildytan ska även arkets/arkens mått anges. 

`16,3  x 10,5 cm`

`7 x 5 cm oval`

`22 x 46 cm, på ark 42 x 64 cm`

När det gäller vykort mäts hela vykortets yta (KB-praxis).

Ange måtten för den fullständiga bilden följt av måtten för arken om en bild är på flera lösa ark och dessa kan fogas samman. Om det inte är möjligt att mäta bilden anges enbart arket/arkens mått. Om bilden förvaras rullad anger vi på KB även rullens längd och diameter trots att denna regel i RDA inte gäller för bilder. Om bilden är vikt tillämpar KB anvisningen för kartresurser som innebär att även det vikta måttet ska anges.

`136 x 105 cm, på ark 80 x 56 cm` 

`ark 64 x 42 cm`

`66 x 94 cm, vikt till 24 x 14 cm`

Om en serie bilder på ett ark är vikta som ett dragspel anges arkets mått följt av frasen ”vikt som dragspel” och därefter anges arkets mått när det är vikt eller det ev. omslagets mått. Detta är dock enbart en KB-praxis, enligt RDA ska denna uppgift anges i en anmärkning.
på ark 82 x 15 cm, vikt som dragspel i omslag 11 x 16 cm
För graverade bilder bör även plåtens storlek anges om plåtkanten kan urskiljas. I dessa fall ska även bildytans mått anges. 
17 x 11 cm, plåt 19 x 13 cm
Om bilden är på två ark i olika storlek så ange bägge arkens mått. Om arken är i fler än två storlekar tillämpar vi på KB anvisningarna för kartresurser, d.v.s. vi anger det största förekommande höjdmåttet och det största förekommande breddmåttet följt av formuleringen ”eller mindre”. 

`ark 40 x 30 cm och 46 x 36 cm`

`ark 60 x 46 cm eller mindre`

I de fall resursen förvaras i en förpackning kan om så önskas även måtten på förpackningen anges. 

`66 x 94 cm, vikt i omslag till 24 x 14 cm`

Bildverk beskrivs på samma sätt som andra böcker. För äldre volymer anges formatet, dvs.2:o, 4:o etc. För mer moderna volymer anges i regel enbart volymens höjd, men om volymens bredd antingen är mindre än halva höjden eller större än höjden så anges höjden x bredden.

Se RDA 3.5
