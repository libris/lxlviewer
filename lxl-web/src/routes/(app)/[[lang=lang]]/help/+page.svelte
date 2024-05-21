<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{getPageTitle($page.data.t('header.help'))}</title>
</svelte:head>

<article class="container-fluid my-8 max-w-3xl">
	{#if $page.data.locale === 'en'}
		<h1 class="text-6-cond-extrabold">Help</h1>
		<h2 class="text-5-cond-extrabold">How the Search Works</h2>
		<p>
			The easiest way to start searching is to enter keywords about the subject or material you are
			looking for in the search box. The search will return results for all items that contain any
			of your keywords, regardless of the combination and order in which the keywords appear.
		</p>
		<p>
			To get a more precise match, use filters to the left of the search results list or search
			codes, for example, <code>AUTHOR:Rowling</code>, <code>TITLE:"Harry Potter"</code> or
			<code>YEAR:2000</code>, and search operators, such as <code>AND</code> to include all keywords
			or <code>NOT</code> to exclude keywords.
		</p>

		<p>
			To search for phrases or word combinations, enclose the keywords in quotation marks, for
			example, <code>"seven seasick sailors"</code>.
		</p>

		<p>
			To include multiple word forms, truncate with an asterisk, for example, searching for <code
				>cultur*</code
			> will return results where the words culture, cultural, and culturally are included.
		</p>

		<h2 class="text-5-cond-extrabold">How the Search Results List Works</h2>

		<p>
			When you perform a search, a search results list automatically opens where you can find
			material matching your keywords. You can narrow down the search results using the filters to
			the left of the search results list. If there is no material matching your search, the search
			function will notify you.
		</p>
		<p>
			The search results list shows information about the title, author, publication year, language,
			and material type, along with a cover image or icon for the material type. You can access
			detailed information about the material by clicking on the title or the image/icon in the
			search results list.
		</p>
		<p>
			The search results list displays ten results per page. At the end of the ten results, there is
			pagination where you can choose to go to the next or later results page.
		</p>

		<h2 class="text-5-cond-extrabold">How the Filtering Works</h2>
		<p>Narrow down the results using the following filters:</p>
		<ul class="mb-2 list-inside list-disc">
			<li><strong>Type</strong> for material type</li>
			<li><strong>Carrier type</strong> for type of storage or playback/viewing</li>
			<li><strong>Genre/form</strong> or a description of what the object is</li>
			<li><strong>Language</strong> for the language used in the object</li>
			<li><strong>Publication year</strong> for the year the object was published</li>
			<li><strong>Library</strong> for libraries that have the object in their collections</li>
			<li>
				<strong>Bibliography</strong> for a list of material within a specific area, such as a person,
				subject, or geographical area
			</li>
			<li><strong>Subject</strong> for subject terms describing the object</li>
			<li>
				<strong>Contributor</strong> for persons or organizations that have created or contributed to
				the object
			</li>
			<li><strong>Audience</strong> for the intended audience of the object</li>
		</ul>
		<p>
			Note that not all content in Libris is described with all filter types. How material is
			described in Libris has varied over time. Therefore, you may need to perform several
			complementary searches or adjust the filtering to capture relevant objects.
		</p>
		<h2 class="text-5-cond-extrabold">How the Sorting Works</h2>
		<p>You can choose to sort the results list according to different criteria:</p>
		<ul class="mb-2 list-inside list-disc">
			<li>
				<strong>Relevance</strong>, where titles with the best match to the keywords appear first.
				This is currently the default sorting setting.
			</li>

			<li><strong>Chronologically</strong>, with the newest or oldest titles first</li>
			<li><strong>Alphabetically</strong>,with titles from the beginning or end of the alphabet</li>
			<li>
				<strong>Number of Libraries</strong>, where titles with the most holdings appear first
			</li>
		</ul>
		<h2 class="text-5-cond-extrabold">What is Displayed in a Detailed View of the Object</h2>
		<p>
			In the detailed view, detailed and descriptive information about the object is displayed,
			along with information related to it.
		</p>
		<p>
			Information that is underlined or inside a box can be clicked on. This will generate a results
			list for a person or term. By hovering the mouse over the underlined and boxed information, a
			box will appear with information about the person or term.
		</p>
		<p>
			In cases where there is an image of the object, you can click on the image to enlarge it. The
			image opens in a new window. If the image can be reused, this information is provided in the
			detailed information of the edition.
		</p>
		<p>
			Boxed sections indicate how many libraries have the object in a certain form. By clicking on
			this information, a list will open to the right of the page with information about which
			libraries have the object.
		</p>
		<p>
			<strong>Print</strong> = a printed resource<br />
			<strong>Electronic</strong> = an electronic resource<br />
			<strong>Instance</strong> = a resource where the exact type is not defined (often because the
			record has come to Libris through an automated flow)<br />
		</p>
		<p>
			If the material is published in several editions, the editions are displayed in a list with
			the newest first. By clicking on the arrow for each edition, detailed information about the
			respective edition and the libraries that have that specific edition is displayed.
		</p>
		<p>
			In some cases, there is a link to the material online. Some of these are freely available to
			everyone, while others require you to be a borrower at a library that has a license to display
			the material.
		</p>
		<p>
			By using the Copy Link to Edition function, you can copy and save a direct link to the
			edition.
		</p>
	{:else}
		<h1 class="text-6-cond-extrabold">Hjälp</h1>
		<h2 class="text-5-cond-extrabold">Hur sökningen fungerar</h2>
		<p>
			Det enklaste sättet att börja söka är att i sökrutan skriva in sökord om ämnet eller
			materialet som du letar efter. Sökning ger träff på samtliga objekt som innehåller något av
			dina sökord, oavsett i vilken kombination och ordning sökorden finns.
		</p>
		<p>
			För att få en mer exakt träff, använd filtrering till vänster om sökträfflistan eller
			sökkoder, till exempel <code>FÖRF:Rowling</code>, <code>TITEL:Harry Potter</code> eller
			<code>ÅR:2000</code>, och sökoperatorer, till exempel <code>AND</code> för att inkludera
			samtliga sökord eller <code>NOT</code> för att exkludera sökord.
		</p>

		<p>
			För att söka fraser eller ordkombinationer ska du sätta sökorden inom citationstecken, till
			exempel <code>"sju sjösjuka sjömän"</code>.
		</p>

		<p>
			För att inkludera flera ordformer trunkera med asterisk, till exempel ger sökning på <code
				>kulturarv*</code
			> träffar där orden kulturarv, kulturarvet och kulturarvsinstitutioner ingår.
		</p>

		<h2 class="text-5-cond-extrabold">Hur sökträfflistan fungerar</h2>

		<p>
			När du gör en sökning, öppnas automatiskt en sökträfflista där du hittar material som
			motsvarar dina sökord. Du kan avgränsa sökresultaten på sökträfflistan med hjälp av
			filtreringen till vänster om sökträfflistan. Om det inte finns material som motsvarar din
			sökning, meddelar sökfunktionen det.
		</p>
		<p>
			I sökträfflistan visas information om titel, upphovsperson, utgivningsår, språk och
			materialtyp tillsammans med omslagsbild eller ikon för materialtypen. Du kommer till
			materialets detaljerade uppgifter genom att klicka på rubriken eller bilden/ikonen i listan
			över sökresultat.
		</p>
		<p>
			Sökträfflistan visar tio träffar per sida. I slutet av de tio träffarna finns paginering där
			du kan välja gå vidare till nästa eller senare träffsida.
		</p>

		<h2 class="text-5-cond-extrabold">Hur filtreringen fungerar</h2>
		<p>Avgränsa träffmängden med följande filter:</p>
		<ul class="mb-2 list-inside list-disc">
			<li><strong>Typ</strong> för materialtyp</li>
			<li><strong>Bärartyp</strong> för typ för lagring eller uppspelning/visning</li>
			<li><strong>Genre/form</strong> för beskrivning av vad objektet är</li>
			<li><strong>Språk</strong> för det språk som används i objektet</li>
			<li><strong>Utgivningsår</strong> för årtalet då objektet gavs ut</li>
			<li><strong>Bibliotek</strong> för bibliotek som har objektet i sina samlingar</li>
			<li>
				<strong>Bibliografi</strong> för förteckning över material inom ett specifikt område, exempelvis
				person, ämne eller geografiskt område
			</li>
			<li><strong>Ämne</strong> för ämnesord som objektet är beskrivet med</li>
			<li>
				<strong>Medverkan</strong> för personer eller organisationer som skapat eller har bidragit till
				tillkomsten av objektet
			</li>
			<li><strong>Målgrupp</strong> för den tänkta målgruppen för objektet</li>
		</ul>
		<p>
			Observera att allt innehåll i Libris inte är beskrivet med samtliga filtertyper. Hur material
			är beskrivet i Libris har varierat över tid. Du kan därför behöva göra flera kompletterande
			sökningar eller justera filtreringen för att fånga upp relevanta objekt.
		</p>
		<h2 class="text-5-cond-extrabold">Hur sorteringen fungerar</h2>
		<p>Du kan välja att få träfflistan sorterad efter olika kriterier:</p>
		<ul class="mb-2 list-inside list-disc">
			<li>
				<strong>Relevans</strong>, där titlar med bästa matchning mot sökorden förekommer först.
				Detta är för närvarande utgångsläge för sortering./li>
			</li>
			<li><strong>Kronologiskt</strong>, med de nyaste respektive äldsta titlarna först</li>
			<li><strong>Alfabetiskt</strong> med titlarna från början eller slutet av alfabeten</li>
			<li>
				<strong>Antal bibliotek</strong> som har materialet, där titlar med flest bestånd förekommer
				först
			</li>
		</ul>
		<h2 class="text-5-cond-extrabold">Vad som visas i en detaljerad vy av objektet</h2>
		<p>
			I detaljvyn visas detaljerad och beskrivande information om objektet samt information som är
			relaterat till det.
		</p>
		<p>
			Uppgifter som är understrykta eller inuti en ruta går att klicka vidare på. Det kommer att
			generera en träfflista på en person eller term. Genom att hålla musen pekad på de understrukna
			och omkapslade uppgifter får man upp en ruta med information om personen eller termen.
		</p>
		<p>
			I de fall där det finns en bild på objektet, går det att klicka på bilden för att förstora
			den. Bilden öppnas i ett nytt fönster. Om bilden får återanvändas, finns uppgiften angiven i
			den detaljerade informationen av utgåvan.
		</p>
		<p>
			I omkapslade rutor finns angivet hur många bibliotek som har objektet i en viss form. Om du
			klickar på denna uppgift, öppnas upp en lista till höger om sidan med information om vilka
			bibliotek som har objektet.
		</p>
		<p>
			<strong>Tryck</strong> = en tryckt resurs<br />
			<strong>Elektronisk</strong> = en elektronisk resurs<br />
			<strong>Instans</strong> = en resurs där den exakta typen inte är definierad (ofta på grund av
			att posten kommit till Libris via ett maskinellt flöde)<br />
		</p>
		<p>
			Om materialet finns utgivet i flera utgåvor, visas utgåvorna i en lista med nyast först. Genom
			att klicka på pilen för varje utgåva visas detaljerad information om respektive utgåva samt de
			bibliotek som har den specifika utgåvan.
		</p>
		<p>
			I vissa fall finns det en länk till materialet online. En del av dessa är fritt tillgängliga
			för alla, för en del krävs det att man är låntagare på ett bibliotek som har licens att visa
			materialet.
		</p>
		<p>
			Genom att använda funktionen <em>Kopiera länk till utgåva</em>, kan du kopiera och spara
			direkt länk till utgåvan.
		</p>
	{/if}
</article>

<style lang="postcss">
	h2 {
		@apply mb-2 mt-6;
	}

	p {
		@apply mb-2;
	}
</style>
