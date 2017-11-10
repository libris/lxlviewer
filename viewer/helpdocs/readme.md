# Hjälpdokumentation

Filerna i den här mappen (``helpdocs``) utgör hjälpdokumentationen för gränssnittet. Om det i denna mappen skapas, ändras eller redigeras så kommer de ändringarna att komma in i gränssnittet.

## Egenskaper på ett avsnitt

Överst i varje dokumentationsfil finns ett par rader som definierar ett par egenskaper på dokumentet, t ex vilken kategori den tillhör och vilken titel den ska få.

    ---
    section: Sök
    title: Träfflista
    order: 1
    tags:
    - search
    ---

**Section:**  
Kategori på dokumentet. Används till exempel för att lägga dokumenten bredvid varandra i menyn.  

**Title:**  
Titel på dokumentet. Används till menyn. **Används inte till rubriker i dokumentet.**  

**Order:**  
Ordning inom kategorin i menyn. Högre siffra -> Längre ner inom kategorin.

**Tags:**  
Etiketter på dokumentet som eventuellt skulle kunna användas till sökning.  


## Innehåll

Under egenskaperna följer sedan själva innehållet i avsnittet. Man använder sig av [markdown](https://daringfireball.net/projects/markdown/) för att strukturera rubriker, länkar, bilder etc.
