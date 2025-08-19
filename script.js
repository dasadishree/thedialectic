// hamburger menu
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');

    hamburger.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
});