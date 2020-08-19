window.addEventListener("load", function() {
	// all tabs
    var myTabs = document.querySelectorAll("ul.nav-tabs > li");

    // click handler
    function myTabClicks(tabClickEvent) {
        // de-activate all tabs and activate clicked
		for (var i = 0; i < myTabs.length; i++) {
			myTabs[i].classList.remove("active");
        }
        var clickedTab = tabClickEvent.currentTarget;
		clickedTab.classList.add("active");
        tabClickEvent.preventDefault();

        // de-activate all panes activate current
        var myContentPanes = document.querySelectorAll(".tab-pane");
		for (i = 0; i < myContentPanes.length; i++) {
			myContentPanes[i].classList.remove("active");
        }
		var anchorReference = tabClickEvent.target;
        var activePaneId = anchorReference.getAttribute("href");
		var activePane = document.querySelector(activePaneId);
        activePane.classList.add("active");
    }
    
    // add tab click listeners
	for (i = 0; i < myTabs.length; i++) {
		myTabs[i].addEventListener("click", myTabClicks)
	}
});
