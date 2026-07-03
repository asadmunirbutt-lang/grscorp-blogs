document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var dropdown = btn.closest('.nav-dropdown');
            var wasOpen = dropdown.classList.contains('open');
            document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
                d.classList.remove('open');
            });
            if (!wasOpen) dropdown.classList.add('open');
        });
    });

    document.addEventListener('click', function () {
        document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
            d.classList.remove('open');
        });
    });

    var navToggle = document.getElementById('navToggle');
    var siteNav = document.getElementById('siteNav');
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            siteNav.classList.toggle('mobile-open');
        });
    }
});
