$('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
	template: '<div class="tooltip navbar-sidenav-tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
})

const $body = $("body");
const $mainContainer = $(".content-wrapper > .container-fluid");

$("#sidenavToggler").click(function (e) {
	e.preventDefault();

	$body.toggleClass("sidenav-toggled");

	$(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
	$(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");

	window.localStorage.setItem(
		"sidebar_state",
		isCollapsed ? "collapsed" : "expanded"
	);

	$mainContainer.toggleClass("pl-md-3", !isCollapsed);
});

$(".navbar-sidenav .nav-link-collapse").click(function (e) {
	e.preventDefault();

	$body.removeClass("sidenav-toggled");
	window.localStorage.setItem("sidebar_state", "expanded");
	$mainContainer.addClass("pl-md-3");
});

const sidebarState = window.localStorage.getItem("sidebar_state");

$body.toggleClass("sidenav-toggled", sidebarState === "collapsed");
$mainContainer.toggleClass("pl-md-3", sidebarState !== "collapsed");

// Make sure the current active menu item is visible
var activeMenuItem = $("li.active-page");
if (activeMenuItem.length > 0) {
	if (!activeMenuItem.isVisibleInViewport(75)) {
		activeMenuItem[0].scrollIntoView();
	}
}
