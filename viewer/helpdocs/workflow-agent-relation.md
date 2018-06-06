---
section: Arbetsflöden
title: Relationer till agenter, delar och verk
order: 70
tags:
- editor
---
UNDER ARBETE - UPPDATERAS KONTINUERLIGT 

## Relationer till agenter, delar och verk (7XX)

700, 710 och 711 är komplicerade fält i MARC21 som kan uttrycka olika saker om en agent, medverkande, relationer, och att en instans innehåller flera verk.

Länka i första hand till befintliga auktioriteter för personer, organisationer och möten. Om det inte finns en auktoritet så kan du skapa en auktoritet. Se hjälpen för att Skapa ny agent Person samt Organisation. Det finns även hjälp för att redigera befintliga auktoriteter.

I den första versionen av Nya Libris bör man inte länka till eller skapa verk.
Den här hjälpen visar hur man skapar relationer av olika typer. Se även hjälp för att lägga till Agenter - Personer samt Organisationer

Lägg till under **Instans av verk**

### Relationer
#### Relation uttryckt som **Funktion**

Medverkande och funktion / Medverkan



Välj **Medverkan** när en agent har en relation till det verk som beskrivs i instansen.
* Medverkan och funktion / Medverkan / Agent / Person (700 1/- ‡a)
    
    Länka till entitet.
    I undantagsfall, skapa lokal entitet och välj Person
   * Lägg till Efternamn
   
   ```Exempel: Andersson```
  
   * Förnamn
   
   ```Exempel: Frans```
   
   * Levnadsår
   
    ```Exempel: 1974-```

  * Funktion - lägg till vid **+ikonen** vid **Medverkan** (700 ‡4)
    Länka till entitet.
    
   ```Exempel: relator/trl (= översättare)```
    



#### Relation uttryckt genom **Relation** (700 ‡i)

Välj **Relation** vid **+ikonen** vid **Verk**

Välj typ **Relation** i menyn

Välj **Entitet** vid **+ikonen** vid **Relation**

Lägg till **Verk** som entitet. 
Vid **+ikonen** för **Verk** lägger man till delfält:
*  Benämning

  ```Exempel: Parafraserar```
  
 *  Har titel/ Titel / Huvudtitel
 
  ```Exempel: Pride and prejudice```
 
*  Medverkande och funktion / Primär medverkan


Välj **Primär medverkan** när en agent har en relation till verk som beskrivs som relaterat.

   * Medverkan och contribution / Primär contribution / Agent/ Person (700 1/_ ‡a  ǂd )
   
 Länka i första hand till auktoritet.
 
 ```Exempel: Austin,  Jane, 1775-1817```




#### Flera verk kopplade till instansen
 Medverkan och funktion / Primär medverkan


Välj **Primär medverkan** när agenten har relation till ett annat verk än det som beskrivs i instansen

* Har del / skapa lokal entitet - välj Verk (långt ner i listan, ge inte upp! - i senare versioner kommer vi att förenkla detta.)
  * Har titel / Huvudtitel  - skriv in titeln
  
  ```Exempel:  Mind over matter```
  
  Fler delfält att lägga till vid **+ikonen** för **Titeln** som rör titeln:
  * Specificering i form av grupptitel (700 ‡k)
  * Delbeteckning (700 ‡n)
  * Deltitel (700 ‡p)
  
  Fler delfält att lägga till vid **+ikonen** för **Verk** som rör titeln:
    * Tid för verket (700 ‡f)
    * Språk  / Benämning (700 ‡l)
    * Besättning för framförande (700 ‡m) *Under utveckling*
    * Version (700 ‡o)
    * Tonart (700 ‡r)
    * (700 ‡s) *Under utveckling*
 

  Lägg därefter till Agenten:
  * Medverkan och contribution / Primär contribution / Agent/ Person
  
  Länka i första hand. För att lägga till som lokal entitet:
  
    * Medverkan och contribution / Primär contribution / Agent/ PersonEfternamn
  ```Exempel: Roberts```
     * Medverkan och contribution / Primär contribution / Agent/ Förnamn
   ```Exempel: Nora```
 
